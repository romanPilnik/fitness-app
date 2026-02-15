const userProgramService = require('../services/program/userProgram.service');
const { sendSuccess } = require('../utils/response');

const getPrograms = async (req, res) => {
  const programs = await userProgramService.getPrograms(req.user._id, req.query);
  return sendSuccess(res, programs, 200, 'Programs retrieved');
};

const createFromTemplate = async (req, res) => {
  const { templateId, startDate, customizations } = req.body;

  const program = await userProgramService.createFromTemplate({
    userId: req.user._id,
    templateId,
    startDate,
    customizations,
  });

  return sendSuccess(res, program, 201, 'Program created from template');
};

const createCustomProgram = async (req, res) => {
  const program = await userProgramService.createCustomUserProgram({
    userId: req.user._id,
    ...req.body,
  });

  return sendSuccess(res, program, 201, 'Custom program created');
};

const getActiveProgram = async (req, res) => {
  const program = await userProgramService.getActiveProgram(req.user._id);
  return sendSuccess(res, program, 200, 'Active program retrieved');
};

const getProgramById = async (req, res) => {
  const program = await userProgramService.getProgramById(req.params.id, req.user._id);
  return sendSuccess(res, program, 200, 'Program retrieved');
};

const updateProgramById = async (req, res) => {
  const program = await userProgramService.updateProgramById(req.params.id, req.user._id, req.body);
  return sendSuccess(res, program, 200, 'Program updated');
};

const deleteProgramById = async (req, res) => {
  await userProgramService.deleteProgramById(req.params.id, req.user._id);
  return sendSuccess(res, null, 204);
};

module.exports = {
  getPrograms,
  createFromTemplate,
  createCustomProgram,
  getActiveProgram,
  getProgramById,
  updateProgramById,
  deleteProgramById,
};
