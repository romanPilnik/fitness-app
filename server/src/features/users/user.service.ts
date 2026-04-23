import { NotFoundError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import type { PatchAiPreferencesDTO, UpdateUserDTO } from "./user.dtos";
import { prisma } from "@/lib/prisma";
import type { UserModel } from "@/generated/prisma/models";
import {
  mergeAiUserPreferencesPatch,
  normalizeAiUserPreferences,
  type AiUserPreferences,
} from "@/validations/aiUserPreferences.js";

async function updateUser(input: UpdateUserDTO): Promise<UserModel> {
  const { id, name, units, weekStartsOn } = input;

  return prisma.user.update({
    where: { id },
    data: { name, units, weekStartsOn },
  });
}

async function getNormalizedAiPreferencesForUser(userId: string): Promise<AiUserPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiConfig: true },
  });
  if (!user) {
    throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
  }
  return normalizeAiUserPreferences(user.aiConfig);
}

async function patchAiPreferences(input: PatchAiPreferencesDTO): Promise<AiUserPreferences> {
  const { id, patch } = input;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { aiConfig: true },
  });
  if (!user) {
    throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
  }
  const current = normalizeAiUserPreferences(user.aiConfig);
  const merged = mergeAiUserPreferencesPatch(current, patch);
  await prisma.user.update({
    where: { id },
    data: { aiConfig: merged },
  });
  return merged;
}

export const UserService = {
  updateUser,
  getNormalizedAiPreferencesForUser,
  patchAiPreferences,
};
