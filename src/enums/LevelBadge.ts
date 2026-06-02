export const LevelBadge = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
} as const;

export type LevelBadge = typeof LevelBadge[keyof typeof LevelBadge];