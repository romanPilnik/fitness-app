import { SessionStatuses } from "@/generated/prisma/enums.js";

import type { AiUserPreferences } from "./aiPreferences.js";
import { preferencesToPromptSection } from "./aiPreferences.js";
import { formatWeightForPrompt } from "./formatWeights.js";
import type {
  BuildUserPromptInput,
  ExerciseContextRow,
  ProgramTargetsRow,
  ProgramWorkoutHistorySession,
} from "./progressionPromptTypes.js";

const HISTORY_LIMIT = 5;

export function buildUserPrompt(input: BuildUserPromptInput, preferences: AiUserPreferences): string {
  const sections: string[] = [];

  sections.push(preferencesToPromptSection(preferences));
  sections.push("", "## Workout context", workoutContextLines(input).join("\n"));
  sections.push("", "## Exercise metadata (this session's lifts)", formatExerciseContexts(input.exerciseContexts));
  sections.push("", "## Targets used for planning this session", formatTargetsSection(input));
  sections.push("", "## Performance: session just completed", formatCompletedSession(input));
  sections.push("", "## Recent history for this workout (newest first)", formatHistory(input));
  if (input.historyTrendSummary !== undefined && input.historyTrendSummary !== null) {
    const trimmed = input.historyTrendSummary.trim();
    if (trimmed.length > 0) {
      sections.push("", "## Trend and hit/miss summary", trimmed);
    }
  }

  return sections.join("\n");
}

function workoutContextLines(input: BuildUserPromptInput): string[] {
  const lines: string[] = [];
  if (input.programWorkoutName !== undefined) {
    lines.push(`- Workout name: ${input.programWorkoutName}`);
  }
  if (input.programWorkoutDayNumber !== undefined) {
    lines.push(`- Day number in program: ${String(input.programWorkoutDayNumber)}`);
  }
  lines.push(`- Session id (trigger): ${input.completedSession.sessionId}`);
  lines.push(`- Date performed: ${input.completedSession.datePerformed}`);
  lines.push(`- Session status: ${input.completedSession.sessionStatus}`);
  return lines;
}

function formatExerciseContexts(rows: ExerciseContextRow[]): string {
  if (rows.length === 0) {
    return "(none)";
  }
  const ordered = [...rows].sort((a, b) => a.order - b.order);
  const blocks = ordered.map((ex) => {
    const secondary =
      ex.secondaryMuscles.length > 0 ? ex.secondaryMuscles.join(", ") : "(none)";
    return [
      `### Order ${String(ex.order)} — ${ex.name} (\`exerciseId\`: ${ex.exerciseId})`,
      `- Category: ${ex.category}`,
      `- Equipment: ${ex.equipment}`,
      `- Movement pattern: ${ex.movementPattern}`,
      `- Primary muscle: ${ex.primaryMuscle}`,
      `- Secondary muscles: ${secondary}`,
    ].join("\n");
  });
  return blocks.join("\n\n");
}

function formatTargetsSection(input: BuildUserPromptInput): string {
  const { units, programWorkoutTargets, previousGeneratedTargets } = input;
  const lines: string[] = [];

  lines.push("### Program baseline targets (from the user's program template)");
  if (programWorkoutTargets.length === 0) {
    lines.push("(none)");
  } else {
    for (const row of [...programWorkoutTargets].sort((a, b) => a.order - b.order)) {
      lines.push(formatProgramTargetLine(row, units));
    }
  }

  if (previousGeneratedTargets !== null && previousGeneratedTargets.length > 0) {
    lines.push("", "### Previous AI-generated targets (if the user was following these)");
    for (const row of [...previousGeneratedTargets].sort((a, b) => a.order - b.order)) {
      lines.push(
        `- Order ${String(row.order)} — exercise \`${row.exerciseId}\`: ${String(row.targetSets)} sets, RIR ${row.targetRir === null ? "n/a" : String(row.targetRir)}`,
      );
      if (row.notes) {
        lines.push(`  - Notes: ${row.notes}`);
      }
      for (const s of row.sets.sort((a, b) => a.setNumber - b.setNumber)) {
        lines.push(
          `  - Set ${String(s.setNumber)}: ${formatWeightForPrompt(s.targetWeightKg, units)} × ${String(s.targetReps)} reps, RIR ${s.targetRir === null ? "n/a" : String(s.targetRir)}`,
        );
      }
    }
  } else {
    lines.push("", "(No prior AI-generated targets — user likely followed program baseline or manual adjustments.)");
  }

  return lines.join("\n");
}

function formatProgramTargetLine(row: ProgramTargetsRow, units: BuildUserPromptInput["units"]): string {
  const parts = [
    `- Order ${String(row.order)} — exercise \`${row.exerciseId}\`: ${String(row.targetSets)} sets`,
  ];
  if (row.targetWeightKg !== null) {
    parts.push(`target weight ${formatWeightForPrompt(row.targetWeightKg, units)}`);
  }
  if (row.targetTotalReps !== null) {
    parts.push(`target total reps ${String(row.targetTotalReps)}`);
  }
  if (row.targetTopSetReps !== null) {
    parts.push(`target top-set reps ${String(row.targetTopSetReps)}`);
  }
  if (row.targetRir !== null) {
    parts.push(`target RIR ${String(row.targetRir)}`);
  }
  if (row.notes) {
    parts.push(`notes: ${row.notes}`);
  }
  return parts.join(", ") + ".";
}

function formatCompletedSession(input: BuildUserPromptInput): string {
  const { units, completedSession } = input;
  const lines: string[] = [
    `Session \`${completedSession.sessionId}\` — ${completedSession.datePerformed} — status: ${completedSession.sessionStatus}`,
    "",
  ];

  for (const ex of completedSession.exercises.sort((a, b) => a.order - b.order)) {
    lines.push(`### Exercise order ${String(ex.order)} (\`${ex.exerciseId}\`)`);
    lines.push(
      `Prescribed going in: ${String(ex.targetSets)} sets` +
        (ex.targetWeightKg !== null ? `, target ${formatWeightForPrompt(ex.targetWeightKg, units)}` : "") +
        (ex.targetRir !== null ? `, target RIR ${String(ex.targetRir)}` : "") +
        ".",
    );
    for (const s of ex.sets.sort((a, b) => a.setNumber - b.setNumber)) {
      lines.push(
        `- Set ${String(s.setNumber)}: ${formatWeightForPrompt(s.weightKg, units)} × ${String(s.reps)} reps @ RIR ${String(s.rir)}${s.setCompleted ? "" : " (incomplete)"}`,
      );
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function formatHistory(input: BuildUserPromptInput): string {
  const selected = selectHistorySessions(input.historySessions);
  if (selected.length === 0) {
    return "No prior completed or partial sessions for this workout (or none passed in).";
  }

  const lines: string[] = [];
  const { units } = input;

  for (const session of selected) {
    lines.push(`### Session \`${session.sessionId}\` — ${session.datePerformed} — ${session.sessionStatus}`);
    for (const ex of session.exercises.sort((a, b) => a.order - b.order)) {
      lines.push(`- Exercise order ${String(ex.order)} (\`${ex.exerciseId}\`):`);
      for (const s of ex.sets.sort((a, b) => a.setNumber - b.setNumber)) {
        lines.push(
          `  - Set ${String(s.setNumber)}: ${formatWeightForPrompt(s.weightKg, units)} × ${String(s.reps)} reps @ RIR ${String(s.rir)}`,
        );
      }
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

export function selectHistorySessions(
  sessions: ProgramWorkoutHistorySession[],
): ProgramWorkoutHistorySession[] {
  const allowed = new Set<SessionStatuses>([SessionStatuses.completed, SessionStatuses.partially]);
  return sessions
    .filter((s) => allowed.has(s.sessionStatus))
    .sort((a, b) => Date.parse(b.datePerformed) - Date.parse(a.datePerformed))
    .slice(0, HISTORY_LIMIT);
}
