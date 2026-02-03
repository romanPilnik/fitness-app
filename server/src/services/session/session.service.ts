import type { PaginateResult } from 'mongoose';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';
import { SessionModel } from '../../models/Session.model.js';
import { ExerciseStatsService } from '../exerciseStats/exerciseStats.service.js';
import { ProgramService } from '../program/Program.service.js';
import type {
  GetSessionsInputDTO,
  GetSessionByIdInputDTO,
  CreateSessionInputDTO,
  DeleteSessionInputDTO,
  SessionDTO,
  SessionSummaryDTO,
} from './session.dto.js';
import { mapPaginatedSessions, toSessionDTO } from './session.mapper.js';

async function getSessions(input: GetSessionsInputDTO): Promise<PaginateResult<SessionSummaryDTO>> {
  const { userId, pagination = {} } = input;

  const query = { userId, isActive: true };

  const paginateOptions = {
    page: pagination.page || 1,
    limit: pagination.limit || 20,
    select: '-__v',
    sort: { datePerformed: -1 },
    lean: true,
  };

  const result = await SessionModel.paginate(query, paginateOptions);
  return mapPaginatedSessions(result);
}

async function getSessionById(input: GetSessionByIdInputDTO): Promise<SessionDTO> {
  const { sessionId, userId } = input;

  const session = await SessionModel.findOne({
    _id: sessionId,
    userId,
    isActive: true,
  })
    .select('-__v')
    .lean();

  if (!session) {
    throw new AppError('Session not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return toSessionDTO(session);
}

async function createSession(input: CreateSessionInputDTO): Promise<SessionDTO> {
  const { userId, sessionData } = input;
  const { programId, workoutName, dayNumber, sessionStatus, exercises, sessionDuration, notes } =
    sessionData;

  const session = await SessionModel.create({
    userId,
    programId,
    workoutName,
    dayNumber,
    sessionStatus,
    exercises,
    sessionDuration,
    notes,
    datePerformed: new Date(),
    isActive: true,
  });

  const sessionDTO = toSessionDTO(session);

  await ExerciseStatsService.updateFromSession({
    userId,
    session: sessionDTO,
  });

  await ProgramService.updateProgress({
    programId,
    userId,
  });

  return sessionDTO;
}

async function deleteSession(input: DeleteSessionInputDTO): Promise<void> {
  const { sessionId, userId } = input;

  const session = await SessionModel.findOneAndUpdate(
    {
      _id: sessionId,
      userId,
      isActive: true,
    },
    { $set: { isActive: false } },
    { new: true },
  );

  if (!session) {
    throw new AppError('Session not found', 404, ERROR_CODES.NOT_FOUND);
  }
}

export const SessionService = {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
};
