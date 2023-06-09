export interface QuizSession {
  id: string;
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
  isFinished: boolean;
}

export interface QuizSessionWithQuiz {
  id: string;
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
  isFinished: boolean;
  quizes: {
    name: string;
  };
}

export interface QuizSessionCreateObject {
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
}
