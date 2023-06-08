export interface QuizSession {
  id: string;
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
  isFinished: boolean;
}

export interface QuizSessionCreateObject {
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
}
