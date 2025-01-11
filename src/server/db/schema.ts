import {
  QuestionComplexity,
  type QuestionData,
  QuestionType,
} from "@/types/question";
import { AnswerType, type DetailedAnswerData } from "@/types/questionAnswer";
import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  real,
  sqliteTableCreator,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sqlNow } from "./utils";

const timestamps = {
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .default(sqlNow()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sqlNow())
    .$onUpdate(() => sqlNow()),
  deletedAt: int("deleted_at", { mode: "timestamp" }),
} as const;

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `step-quiz_${name}`);

export const users = createTable(
  "user",
  {
    id: text("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("full_name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    emailVerified: int("emailVerified", { mode: "boolean" }).notNull(),
    image: text("image"),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
    deletedAt: timestamps.deletedAt,
    isAdmin: int("is_admin", { mode: "boolean" }).notNull().default(false),
  },
  (user) => [uniqueIndex("user_unique_email_idx").on(sql`lower(${user.email})`)]
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  quizzes: many(quizzes),
  sessions: many(quizSessions),
  results: many(quizResults),
}));

export const accounts = createTable("account", {
  id: text("id", { length: 255 }).primaryKey(),
  accountId: text("accountId", { length: 255 }).notNull(),
  providerId: text("providerId", { length: 255 }).notNull(),
  userId: text("userId", { length: 255 })
    .notNull()
    .references(() => users.id),
  accessToken: text("accessToken", { length: 255 }),
  refreshToken: text("refreshToken", { length: 255 }),
  idToken: text("idToken", { length: 255 }),
  accessTokenExpiresAt: int("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: int("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope", { length: 255 }),
  password: text("password", { length: 255 }),
  createdAt: int("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: int("updatedAt", { mode: "timestamp" }).notNull(),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: int("expiresAt", { mode: "timestamp" }).notNull(),
    token: text("token").notNull(),
    createdAt: int("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
  },
  (session) => [
    uniqueIndex("session_unique_token_idx").on(session.token),
    index("session_userId_idx").on(session.userId),
  ]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verifications = createTable("verification", {
  id: text("id", { length: 255 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: int("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: int("createdAt", { mode: "timestamp" }),
  updatedAt: int("updatedAt", { mode: "timestamp" }),
});

export const rateLimit = createTable("rate_limit", {
  key: text("key", { length: 255 }).primaryKey(),
  count: int("count").notNull(),
  lastRequest: int("last_request").notNull(),
});

export const quizzes = createTable(
  "quizzes",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug", { length: 255 }).notNull(),
    name: text("name", { length: 255 }).notNull(),
    description: text("name", { length: 4096 }),
    authorId: text("author_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    time: int("time"),
    questionsCount: int("questions_count").notNull(),
    minimumScore: int("minimun_score").notNull(),
    maximumScore: int("maximum_score").notNull(),
    attempts: int("attempts"),
    createdAt: timestamps.createdAt,
    deletedAt: timestamps.deletedAt,
  },
  (quiz) => [uniqueIndex("quiz_slug_unique_idx").on(quiz.slug)]
);

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  sessions: many(quizSessions),
  results: many(quizResults),
  questions: many(questions),
  author: one(users, {
    fields: [quizzes.authorId],
    references: [users.id],
  }),
}));

export const quizSessions = createTable("quiz_sessions", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id", { length: 255 })
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: int("expires_at", { mode: "timestamp" }),
  createdAt: timestamps.createdAt,
});

export const quizSessionsRelations = relations(quizSessions, ({ one }) => ({
  user: one(users, {
    fields: [quizSessions.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizSessions.quizId],
    references: [quizzes.id],
  }),
  result: one(quizResults),
}));

export const quizResults = createTable("quiz_results", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quizId: text("quiz_id", { length: 255 })
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  quizSessionId: text("quiz_session_id", { length: 255 })
    .notNull()
    .references(() => quizSessions.id, { onDelete: "cascade" }),
  countCorrect: int("count_correct").notNull(),
  countPartiallyCorrect: int("count_partially_correct").notNull(),
  countIncorrect: int("count_incorrect").notNull(),
  score: real("score").notNull(),
  maxScore: int("max_score").notNull(),
  createdAt: timestamps.createdAt,
});

export const quizResultsRelations = relations(quizResults, ({ one, many }) => ({
  user: one(users, {
    fields: [quizResults.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizResults.quizId],
    references: [quizzes.id],
  }),
  session: one(quizSessions, {
    fields: [quizResults.quizSessionId],
    references: [quizSessions.id],
  }),
  answers: many(questionAnswers),
}));

export const questions = createTable("questions", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id", { length: 255 })
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  questionType: text("question_type", {
    length: 255,
    enum: [QuestionType.SingleVariant, QuestionType.MultipleVariants],
  })
    .notNull()
    .$type<QuestionType>(),
  complexity: text("complexity", {
    length: 255,
    enum: [
      QuestionComplexity.Low,
      QuestionComplexity.Medium,
      QuestionComplexity.High,
    ],
  })
    .notNull()
    .$type<QuestionComplexity>(),
  questionData: text("question_data_json", {
    mode: "json",
  })
    .notNull()
    .$type<QuestionData>(),
  createdAt: timestamps.createdAt,
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  answers: many(questionAnswers),
}));

export const questionAnswers = createTable("question_answers", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id", { length: 255 })
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  quizResultId: text("quiz_result_id", { length: 255 })
    .notNull()
    .references(() => quizResults.id, { onDelete: "cascade" }),
  answerType: text("answer_type", {
    length: 255,
    enum: [
      AnswerType.Correct,
      AnswerType.PartiallyCorrect,
      AnswerType.Incorrect,
    ],
  })
    .notNull()
    .$type<AnswerType>(),
  answerData: text("answer_data", { mode: "json" })
    .notNull()
    .$type<DetailedAnswerData[]>(),
  score: real("score").notNull(),
});

export const questionAnswersRelations = relations(
  questionAnswers,
  ({ one }) => ({
    user: one(users, {
      fields: [questionAnswers.userId],
      references: [users.id],
    }),
    question: one(questions, {
      fields: [questionAnswers.questionId],
      references: [questions.id],
    }),
    result: one(quizResults, {
      fields: [questionAnswers.quizResultId],
      references: [quizResults.id],
    }),
  })
);
