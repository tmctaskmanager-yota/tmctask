
export type TaskDifficulty = 1 | 2 | 3 | 4 | 5;

export enum TaskStatus {
  PLANNED = 'PLANNED',
  DOING = 'DOING',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  dueDate?: number; // Added: Deadline timestamp
}

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface RankingData {
  memberId: string;
  memberName: string;
  totalScore: number;
  completedTasksCount: number;
  avatar: string;
}
