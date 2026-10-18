import { Effect } from "effect";
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { Auth } from "../domain/auth.js";
import { Admin } from "../domain/admin.js";
import { OAuth } from "../domain/oauth.js";
import { Catalog } from "../domain/catalog.js";
import { Insights } from "../domain/insights.js";
import { runSnippet } from "../domain/runner.js";
import { Solutions } from "../domain/solutions.js";
import { execute } from "./execute.js";

export interface GraphQLContext {
  readonly token: string | null;
}

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    avatarUrl: { type: GraphQLString },
    hasPassword: { type: new GraphQLNonNull(GraphQLBoolean) },
    providers: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    isAdmin: { type: new GraphQLNonNull(GraphQLBoolean) },
    auditMode: { type: new GraphQLNonNull(GraphQLBoolean) },
    onboardingCompleted: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});

const AuthPayloadType = new GraphQLObjectType({
  name: "AuthPayload",
  fields: {
    token: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: new GraphQLNonNull(UserType) },
  },
});

const LessonSummaryType = new GraphQLObjectType({
  name: "LessonSummary",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    slug: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    summary: { type: new GraphQLNonNull(GraphQLString) },
    estimatedMinutes: { type: new GraphQLNonNull(GraphQLInt) },
    completed: { type: new GraphQLNonNull(GraphQLBoolean) },
    skipped: { type: new GraphQLNonNull(GraphQLBoolean) },
    available: { type: new GraphQLNonNull(GraphQLBoolean) },
    stars: { type: new GraphQLNonNull(GraphQLInt) },
    maxStars: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const ModuleType = new GraphQLObjectType({
  name: "Module",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    summary: { type: new GraphQLNonNull(GraphQLString) },
    weekNumber: { type: new GraphQLNonNull(GraphQLInt) },
    lessons: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(LessonSummaryType))) },
  },
});

const ExampleType = new GraphQLObjectType({
  name: "Example",
  fields: {
    call: { type: new GraphQLNonNull(GraphQLString) },
    output: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const ProblemType = new GraphQLObjectType({
  name: "Problem",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    promptMd: { type: new GraphQLNonNull(GraphQLString) },
    starterCode: { type: new GraphQLNonNull(GraphQLString) },
    difficulty: { type: new GraphQLNonNull(GraphQLString) },
    topic: { type: new GraphQLNonNull(GraphQLString) },
    examples: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ExampleType))) },
    bestStars: { type: new GraphQLNonNull(GraphQLInt) },
    solved: { type: new GraphQLNonNull(GraphQLBoolean) },
    attempts: { type: new GraphQLNonNull(GraphQLInt) },
    failedAttempts: { type: new GraphQLNonNull(GraphQLInt) },
    passingCode: { type: GraphQLString },
    latestCode: { type: GraphQLString },
  },
});

const LessonType = new GraphQLObjectType({
  name: "Lesson",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    slug: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    summary: { type: new GraphQLNonNull(GraphQLString) },
    contentMd: { type: new GraphQLNonNull(GraphQLString) },
    estimatedMinutes: { type: new GraphQLNonNull(GraphQLInt) },
    weekNumber: { type: new GraphQLNonNull(GraphQLInt) },
    moduleTitle: { type: new GraphQLNonNull(GraphQLString) },
    completed: { type: new GraphQLNonNull(GraphQLBoolean) },
    skipped: { type: new GraphQLNonNull(GraphQLBoolean) },
    previousSlug: { type: GraphQLString },
    nextSlug: { type: GraphQLString },
    nextAvailable: { type: new GraphQLNonNull(GraphQLBoolean) },
    problems: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProblemType))) },
  },
});

const TestResultType = new GraphQLObjectType({
  name: "TestResult",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    passed: { type: new GraphQLNonNull(GraphQLBoolean) },
    expected: { type: new GraphQLNonNull(GraphQLString) },
    received: { type: new GraphQLNonNull(GraphQLString) },
    error: { type: GraphQLString },
  },
});

const RunLineType = new GraphQLObjectType({
  name: "RunLine",
  fields: {
    kind: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const CodeRunType = new GraphQLObjectType({
  name: "CodeRun",
  fields: {
    lines: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RunLineType))) },
  },
});

const SubmissionType = new GraphQLObjectType({
  name: "Submission",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    passed: { type: new GraphQLNonNull(GraphQLBoolean) },
    stars: { type: new GraphQLNonNull(GraphQLInt) },
    testsPassed: { type: new GraphQLNonNull(GraphQLInt) },
    testsTotal: { type: new GraphQLNonNull(GraphQLInt) },
    feedback: { type: new GraphQLNonNull(GraphQLString) },
    results: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TestResultType))) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const TopicStatType = new GraphQLObjectType({
  name: "TopicStat",
  fields: {
    topic: { type: new GraphQLNonNull(GraphQLString) },
    solved: { type: new GraphQLNonNull(GraphQLInt) },
    total: { type: new GraphQLNonNull(GraphQLInt) },
    attempted: { type: new GraphQLNonNull(GraphQLInt) },
    stars: { type: new GraphQLNonNull(GraphQLInt) },
    maxStars: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const SkippedLessonType = new GraphQLObjectType({
  name: "SkippedLesson",
  fields: {
    slug: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const AnalyticsType = new GraphQLObjectType({
  name: "Analytics",
  fields: {
    lessonsCompleted: { type: new GraphQLNonNull(GraphQLInt) },
    lessonsTotal: { type: new GraphQLNonNull(GraphQLInt) },
    problemsSolved: { type: new GraphQLNonNull(GraphQLInt) },
    problemsTotal: { type: new GraphQLNonNull(GraphQLInt) },
    stars: { type: new GraphQLNonNull(GraphQLInt) },
    maxStars: { type: new GraphQLNonNull(GraphQLInt) },
    attempts: { type: new GraphQLNonNull(GraphQLInt) },
    passRate: { type: new GraphQLNonNull(GraphQLFloat) },
    topics: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TopicStatType))) },
    focusAreas: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    summary: { type: new GraphQLNonNull(GraphQLString) },
    lessonsSkipped: { type: new GraphQLNonNull(GraphQLInt) },
    skippedLessons: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SkippedLessonType))),
    },
  },
});

const SkipResultType = new GraphQLObjectType({
  name: "SkipResult",
  fields: {
    slug: { type: new GraphQLNonNull(GraphQLString) },
    skipped: { type: new GraphQLNonNull(GraphQLBoolean) },
    nextSlug: { type: GraphQLString },
    nextAvailable: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});

const AdminDayPointType = new GraphQLObjectType({
  name: "AdminDayPoint",
  fields: {
    day: { type: new GraphQLNonNull(GraphQLString) },
    signups: { type: new GraphQLNonNull(GraphQLInt) },
    submissions: { type: new GraphQLNonNull(GraphQLInt) },
    passes: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const AdminAuthSliceType = new GraphQLObjectType({
  name: "AdminAuthSlice",
  fields: {
    method: { type: new GraphQLNonNull(GraphQLString) },
    label: { type: new GraphQLNonNull(GraphQLString) },
    count: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const AdminTopicStatType = new GraphQLObjectType({
  name: "AdminTopicStat",
  fields: {
    topic: { type: new GraphQLNonNull(GraphQLString) },
    problems: { type: new GraphQLNonNull(GraphQLInt) },
    attempters: { type: new GraphQLNonNull(GraphQLInt) },
    solvers: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const AdminProgressBucketType = new GraphQLObjectType({
  name: "AdminProgressBucket",
  fields: {
    label: { type: new GraphQLNonNull(GraphQLString) },
    count: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const AdminUserTopicType = new GraphQLObjectType({
  name: "AdminUserTopic",
  fields: {
    topic: { type: new GraphQLNonNull(GraphQLString) },
    solved: { type: new GraphQLNonNull(GraphQLInt) },
    total: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const AdminUserType = new GraphQLObjectType({
  name: "AdminUser",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    avatarUrl: { type: GraphQLString },
    hasPassword: { type: new GraphQLNonNull(GraphQLBoolean) },
    providers: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    lastActiveAt: { type: GraphQLString },
    lessonsCompleted: { type: new GraphQLNonNull(GraphQLInt) },
    lessonsTotal: { type: new GraphQLNonNull(GraphQLInt) },
    problemsSolved: { type: new GraphQLNonNull(GraphQLInt) },
    problemsTotal: { type: new GraphQLNonNull(GraphQLInt) },
    stars: { type: new GraphQLNonNull(GraphQLInt) },
    maxStars: { type: new GraphQLNonNull(GraphQLInt) },
    attempts: { type: new GraphQLNonNull(GraphQLInt) },
    passes: { type: new GraphQLNonNull(GraphQLInt) },
    passRate: { type: new GraphQLNonNull(GraphQLFloat) },
    deletable: { type: new GraphQLNonNull(GraphQLBoolean) },
    topics: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AdminUserTopicType))) },
  },
});

const AdminOverviewType = new GraphQLObjectType({
  name: "AdminOverview",
  fields: {
    usersTotal: { type: new GraphQLNonNull(GraphQLInt) },
    activeLast7Days: { type: new GraphQLNonNull(GraphQLInt) },
    activeLast30Days: { type: new GraphQLNonNull(GraphQLInt) },
    signupsLast7Days: { type: new GraphQLNonNull(GraphQLInt) },
    signupsLast30Days: { type: new GraphQLNonNull(GraphQLInt) },
    submissionsTotal: { type: new GraphQLNonNull(GraphQLInt) },
    passesTotal: { type: new GraphQLNonNull(GraphQLInt) },
    passRate: { type: new GraphQLNonNull(GraphQLFloat) },
    lessonsCompletedAverage: { type: new GraphQLNonNull(GraphQLFloat) },
    problemsSolvedAverage: { type: new GraphQLNonNull(GraphQLFloat) },
    series: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AdminDayPointType))) },
    authMethods: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AdminAuthSliceType))) },
    topics: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AdminTopicStatType))) },
    progress: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AdminProgressBucketType))),
    },
    users: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AdminUserType))) },
  },
});

const requireString = (value: unknown, message: string): string => {
  if (typeof value !== "string") {
    throw new Error(message);
  }
  return value;
};

const requireBoolean = (value: unknown, message: string): boolean => {
  if (typeof value !== "boolean") {
    throw new Error(message);
  }
  return value;
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      oauthProviders: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
        resolve: (_parent, _args, context: GraphQLContext) =>
          execute(
            context.token,
            OAuth.use((oauth) => Effect.succeed(oauth.providers)),
          ),
      },
      me: {
        type: UserType,
        resolve: (_parent, _args, context: GraphQLContext) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              return yield* auth.currentUser.pipe(
                Effect.catchTag("Unauthorized", () => Effect.succeed(null)),
              );
            }),
          ),
      },
      modules: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ModuleType))),
        resolve: (_parent, _args, context: GraphQLContext) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              const catalog = yield* Catalog;
              const user = yield* auth.currentUser;
              return yield* catalog.listModules(user.id);
            }),
          ),
      },
      lesson: {
        type: LessonType,
        args: {
          slug: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_parent, args: { slug?: unknown }, context: GraphQLContext) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              const catalog = yield* Catalog;
              const user = yield* auth.currentUser;
              return yield* catalog.getLesson(user.id, requireString(args.slug, "Missing lesson."));
            }),
          ),
      },
      analytics: {
        type: new GraphQLNonNull(AnalyticsType),
        resolve: (_parent, _args, context: GraphQLContext) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              const insights = yield* Insights;
              const user = yield* auth.currentUser;
              return yield* insights.forUser(user.id);
            }),
          ),
      },
      adminOverview: {
        type: new GraphQLNonNull(AdminOverviewType),
        resolve: (_parent, _args, context: GraphQLContext) =>
          execute(
            context.token,
            Admin.use((admin) => admin.overview()),
          ),
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      signUp: {
        type: new GraphQLNonNull(AuthPayloadType),
        args: {
          email: { type: new GraphQLNonNull(GraphQLString) },
          name: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (
          _parent,
          args: { email?: unknown; name?: unknown; password?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Auth.use((auth) =>
              auth.signUp({
                email: requireString(args.email, "Email is required."),
                name: requireString(args.name, "Name is required."),
                password: requireString(args.password, "Password is required."),
              }),
            ),
          ),
      },
      signIn: {
        type: new GraphQLNonNull(AuthPayloadType),
        args: {
          email: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (
          _parent,
          args: { email?: unknown; password?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Auth.use((auth) =>
              auth.signIn({
                email: requireString(args.email, "Email is required."),
                password: requireString(args.password, "Password is required."),
              }),
            ),
          ),
      },
      redeemOAuthCode: {
        type: new GraphQLNonNull(AuthPayloadType),
        args: {
          code: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_parent, args: { code?: unknown }, context: GraphQLContext) =>
          execute(
            context.token,
            OAuth.use((oauth) => oauth.redeem(requireString(args.code, "Missing sign-in code."))),
          ),
      },
      signOut: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: (_parent, _args, context: GraphQLContext) =>
          execute(
            context.token,
            Auth.use((auth) => auth.signOut),
          ),
      },
      completeOnboarding: {
        type: new GraphQLNonNull(UserType),
        resolve: (_parent, _args, context: GraphQLContext) =>
          execute(
            context.token,
            Auth.use((auth) => auth.completeOnboarding),
          ),
      },
      setAuditMode: {
        type: new GraphQLNonNull(UserType),
        args: {
          enabled: { type: new GraphQLNonNull(GraphQLBoolean) },
        },
        resolve: (_parent, args: { enabled?: unknown }, context: GraphQLContext) =>
          execute(
            context.token,
            Auth.use((auth) => auth.setAuditMode(requireBoolean(args.enabled, "Missing audit mode."))),
          ),
      },
      updateProfile: {
        type: new GraphQLNonNull(UserType),
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
          avatarUrl: { type: GraphQLString },
        },
        resolve: (
          _parent,
          args: { name?: unknown; email?: unknown; avatarUrl?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Auth.use((auth) =>
              auth.updateProfile({
                name: requireString(args.name, "Name is required."),
                email: requireString(args.email, "Email is required."),
                avatarUrl: typeof args.avatarUrl === "string" ? args.avatarUrl : null,
              }),
            ),
          ),
      },
      changePassword: {
        type: new GraphQLNonNull(GraphQLBoolean),
        args: {
          currentPassword: { type: new GraphQLNonNull(GraphQLString) },
          nextPassword: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (
          _parent,
          args: { currentPassword?: unknown; nextPassword?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Auth.use((auth) =>
              auth.changePassword({
                currentPassword: requireString(args.currentPassword, "Password is required."),
                nextPassword: requireString(args.nextPassword, "Password is required."),
              }),
            ),
          ),
      },
      requestPasswordReset: {
        type: new GraphQLNonNull(GraphQLBoolean),
        args: {
          email: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_parent, args: { email?: unknown }, context: GraphQLContext) =>
          execute(
            context.token,
            Auth.use((auth) =>
              auth.requestPasswordReset(requireString(args.email, "Email is required.")),
            ),
          ),
      },
      resetPassword: {
        type: new GraphQLNonNull(GraphQLBoolean),
        args: {
          token: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (
          _parent,
          args: { token?: unknown; password?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Auth.use((auth) =>
              auth.resetPassword({
                token: requireString(args.token, "That reset link is invalid or has expired."),
                password: requireString(args.password, "Password is required."),
              }),
            ),
          ),
      },
      deleteAccount: {
        type: new GraphQLNonNull(GraphQLBoolean),
        args: {
          password: { type: GraphQLString },
          confirmation: { type: GraphQLString },
        },
        resolve: (
          _parent,
          args: { password?: unknown; confirmation?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Auth.use((auth) =>
              auth.deleteAccount({
                password: typeof args.password === "string" ? args.password : null,
                confirmation: typeof args.confirmation === "string" ? args.confirmation : null,
              }),
            ),
          ),
      },
      adminDeleteAccount: {
        type: new GraphQLNonNull(GraphQLBoolean),
        args: {
          userId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: (_parent, args: { userId?: unknown }, context: GraphQLContext) =>
          execute(
            context.token,
            Admin.use((admin) =>
              admin.deleteAccount(requireString(args.userId, "That account does not exist.")),
            ),
          ),
      },
      saveProgress: {
        type: new GraphQLNonNull(GraphQLBoolean),
        args: {
          problemId: { type: new GraphQLNonNull(GraphQLID) },
          code: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (
          _parent,
          args: { problemId?: unknown; code?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              const catalog = yield* Catalog;
              const solutions = yield* Solutions;
              const user = yield* auth.currentUser;
              const problemId = requireString(args.problemId, "Missing exercise.");
              yield* catalog.assertProblemOpen(user.id, problemId);
              return yield* solutions.saveDraft(
                user.id,
                problemId,
                requireString(args.code, "Missing solution."),
              );
            }),
          ),
      },
      submitSolution: {
        type: new GraphQLNonNull(SubmissionType),
        args: {
          problemId: { type: new GraphQLNonNull(GraphQLID) },
          code: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (
          _parent,
          args: { problemId?: unknown; code?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              const catalog = yield* Catalog;
              const solutions = yield* Solutions;
              const user = yield* auth.currentUser;
              const problemId = requireString(args.problemId, "Missing exercise.");
              yield* catalog.assertProblemOpen(user.id, problemId);
              return yield* solutions.submit(
                user.id,
                problemId,
                requireString(args.code, "Missing solution."),
              );
            }),
          ),
      },
      runCode: {
        type: new GraphQLNonNull(CodeRunType),
        args: {
          problemId: { type: new GraphQLNonNull(GraphQLID) },
          code: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (
          _parent,
          args: { problemId?: unknown; code?: unknown },
          context: GraphQLContext,
        ) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              const catalog = yield* Catalog;
              const solutions = yield* Solutions;
              const user = yield* auth.currentUser;
              const problemId = requireString(args.problemId, "Missing exercise.");
              yield* catalog.assertProblemOpen(user.id, problemId);
              return yield* solutions.run(
                problemId,
                requireString(args.code, "Missing solution."),
              );
            }),
          ),
      },
      skipLesson: {
        type: new GraphQLNonNull(SkipResultType),
        args: {
          slug: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_parent, args: { slug?: unknown }, context: GraphQLContext) =>
          execute(
            context.token,
            Effect.gen(function* () {
              const auth = yield* Auth;
              const catalog = yield* Catalog;
              const user = yield* auth.currentUser;
              return yield* catalog.skipLesson(
                user.id,
                requireString(args.slug, "Missing lesson."),
              );
            }),
          ),
      },
      runSnippet: {
        type: new GraphQLNonNull(CodeRunType),
        args: {
          code: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_parent, args: { code?: unknown }) => ({
          lines: runSnippet(requireString(args.code, "Missing code.")),
        }),
      },
    },
  }),
});
