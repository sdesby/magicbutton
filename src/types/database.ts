export type CreativityChallenge = {
  ID: string;
  Day: number;
  'Title FR': string;
  'Title ENG': string;
  'Description FR': string;
  'Description ENG': string;
  Difficulty: number;
  Level: string;
  'Program name FR': string;
  'Program name ENG': string;
  Category: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  challenge_id: string;
  completed: boolean;
  completion_date: string | null;
  notes: string | null;
};

export type LocalizedCreativityChallenge = {
  id: string;
  day: number;
  title: string;
  description: string;
  difficulty: number;
  level: string;
  programName: string;
  category: string;
  completed: boolean;
  completionDate: string | null;
};
