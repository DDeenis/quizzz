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
  primaryKey,
  real,
  sqliteTableCreator,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";
import { sqlNow } from "./utils";

const timestamps = {
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .default(sqlNow()),
  updatedAt: int("deleted_at", { mode: "timestamp" })
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
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("full_name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    emailVerified: int("email_verified", {
      mode: "timestamp",
    }).default(sql`(unixepoch())`),
    createdAt: timestamps.createdAt,
    deletedAt: timestamps.deletedAt,
    image: text("image", { length: 255 }),
    isAdmin: int("is_admin", { mode: "boolean" }).notNull().default(false),
  },
  (user) => ({
    emailIdx: uniqueIndex("user_unique_email_idx").on(user.email),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  quizes: many(quizes),
  sessions: many(quizSessions),
  results: many(quizResults),
}));

export const accounts = createTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const quizes = createTable("quizes", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull(),
  description: text("name", { length: 4096 }),
  authorId: text("author_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  time: int("time").notNull(),
  questionsCount: int("questions_count").notNull(),
  minimumScore: int("minimun_score").notNull(),
  maximumScore: int("maximum_score").notNull(),
  attempts: int("attempts"),
  createdAt: timestamps.createdAt,
  deletedAt: timestamps.deletedAt,
});

export const quizesRelations = relations(quizes, ({ one, many }) => ({
  sessions: many(quizSessions),
  results: many(quizResults),
  questions: many(questions),
  author: one(users, {
    fields: [quizes.authorId],
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
    .references(() => quizes.id, { onDelete: "cascade" }),
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: int("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: timestamps.createdAt,
});

export const quizSessionsRelations = relations(quizSessions, ({ one }) => ({
  user: one(users, {
    fields: [quizSessions.userId],
    references: [users.id],
  }),
  quiz: one(quizes, {
    fields: [quizSessions.quizId],
    references: [quizes.id],
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
    .references(() => quizes.id, { onDelete: "cascade" }),
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
  quiz: one(quizes, {
    fields: [quizResults.quizId],
    references: [quizes.id],
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
    .references(() => quizes.id, { onDelete: "cascade" }),
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
  quiz: one(quizes, {
    fields: [questions.quizId],
    references: [quizes.id],
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
