import { type AnswerData, QuestionType } from "@/types/question";
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
import type { ImageOrPattern } from "@/types/test";
import { ResultType } from "@/types/testResult";

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
export const createTable = sqliteTableCreator((name) => `test-thing_${name}`);

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
  tests: many(tests),
  sessions: many(testSessions),
  results: many(testResults),
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

export const tests = createTable(
  "tests",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name", { length: 255 }).notNull(),
    slug: text("slug", { length: 255 }).notNull(),
    description: text("description", { length: 4096 }),
    imageOrPattern: text("image_or_pattern", { mode: "json" })
      .notNull()
      .$type<ImageOrPattern>(),
    questionsCount: int("questions_count").notNull(),
    autoScore: int("auto_score_enabled", { mode: "boolean" })
      .notNull()
      .default(false),
    minimumCorrectAnswers: int("minimum_correct_answers").notNull(),
    timeInMinutes: int("time_in_minutes"),
    attempts: int("attempts"),
    createdAt: timestamps.createdAt,
    deletedAt: timestamps.deletedAt,
  },
  (test) => [uniqueIndex("test_slug_unique_idx").on(test.slug)]
);

export const testsRelations = relations(tests, ({ one, many }) => ({
  sessions: many(testSessions),
  results: many(testResults),
  questions: many(questions),
  author: one(users, {
    fields: [tests.authorId],
    references: [users.id],
  }),
}));

export const testSessions = createTable("test_sessions", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  testId: text("test_id", { length: 255 })
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: int("expires_at", { mode: "timestamp" }),
  createdAt: timestamps.createdAt,
});

export const testSessionsRelations = relations(testSessions, ({ one }) => ({
  user: one(users, {
    fields: [testSessions.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [testSessions.testId],
    references: [tests.id],
  }),
  result: one(testResults),
}));

export const testResults = createTable("test_results", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  testId: text("test_id", { length: 255 })
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  testSessionId: text("test_session_id", { length: 255 })
    .notNull()
    .references(() => testSessions.id, { onDelete: "cascade" }),
  resultType: text("result_type", {
    length: 255,
    enum: [ResultType.Passed, ResultType.Failed, ResultType.Pending],
  })
    .notNull()
    .default(ResultType.Pending)
    .$type<ResultType>(),
  suggestedResultType: text("result_type", {
    length: 255,
    enum: [ResultType.Passed, ResultType.Failed],
  })
    .notNull()
    .$type<ResultType>(),
  countCorrect: int("count_correct").notNull(),
  countIncorrect: int("count_incorrect").notNull(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const testResultsRelations = relations(testResults, ({ one, many }) => ({
  user: one(users, {
    fields: [testResults.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [testResults.testId],
    references: [tests.id],
  }),
  session: one(testSessions, {
    fields: [testResults.testSessionId],
    references: [testSessions.id],
  }),
  answers: many(questionAnswers),
}));

export const questions = createTable("questions", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  testId: text("test_id", { length: 255 })
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  questionType: text("question_type", {
    length: 255,
    enum: [QuestionType.SingleVariant, QuestionType.MultipleVariants],
  })
    .notNull()
    .$type<QuestionType>(),
  name: text("name", { length: 1024 }).notNull(),
  description: text("description", { length: 4096 }),
  image: text("image", { length: 255 }),
  answers: text("answers_json", {
    mode: "json",
  })
    .notNull()
    .$type<AnswerData>(),
  createdAt: timestamps.createdAt,
});

export const questionsRelations = relations(questions, ({ one }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
  }),
}));

export const questionAnswers = createTable("question_answers", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: text("user_id", { length: 255 }).notNull(),
  testResultId: text("test_result_id", { length: 255 })
    .notNull()
    .references(() => testResults.id, { onDelete: "cascade" }),
  questionType: text("question_type", {
    length: 255,
    enum: [QuestionType.SingleVariant, QuestionType.MultipleVariants],
  })
    .notNull()
    .$type<QuestionType>(),
  name: text("name", { length: 1024 }).notNull(),
  description: text("description", { length: 4096 }),
  image: text("image", { length: 255 }),
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
  answers: text("answers_json", { mode: "json" })
    .notNull()
    .$type<DetailedAnswerData[]>(),
});

export const questionAnswersRelations = relations(
  questionAnswers,
  ({ one }) => ({
    user: one(users, {
      fields: [questionAnswers.userId],
      references: [users.id],
    }),
    result: one(testResults, {
      fields: [questionAnswers.testResultId],
      references: [testResults.id],
    }),
  })
);
