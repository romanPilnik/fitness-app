/**
 * System/catalog exercises (no owner) are visible to everyone.
 * User-owned exercises are visible only to that user.
 */
export function isExerciseVisibleToUser(
  createdByUserId: string | null,
  viewerUserId: string,
): boolean {
  return createdByUserId === null || createdByUserId === viewerUserId;
}
