const userFields = `
  id
  email
  name
  avatarUrl
  hasPassword
  providers
  isAdmin
  auditMode
  onboardingCompleted
`;

export const ME_QUERY = `
  query Me {
    me {${userFields}}
  }
`;

export const OAUTH_PROVIDERS = `
  query OauthProviders {
    oauthProviders
  }
`;

export const MODULES_QUERY = `
  query Modules {
    modules {
      id
      title
      summary
      weekNumber
      lessons {
        id
        slug
        title
        summary
        estimatedMinutes
        completed
        skipped
        available
      }
    }
  }
`;

export const LESSON_QUERY = `
  query Lesson($slug: String!) {
    lesson(slug: $slug) {
      id
      slug
      title
      summary
      contentMd
      bitesizeMd
      estimatedMinutes
      weekNumber
      moduleTitle
      completed
      skipped
      previousSlug
      nextSlug
      nextAvailable
      problems {
        id
        title
        promptMd
        starterCode
        difficulty
        topic
        solved
        attempts
        failedAttempts
        passingCode
        latestCode
        examples {
          call
          output
        }
      }
    }
  }
`;

export const ANALYTICS_QUERY = `
  query Analytics {
    analytics {
      lessonsCompleted
      lessonsTotal
      problemsSolved
      problemsTotal
      attempts
      passRate
      streak
      activeDays
      focusAreas
      summary
      lessonsSkipped
      skippedLessons {
        slug
        title
      }
      topics {
        topic
        solved
        total
        attempted
      }
      activity {
        day
        submissions
        passes
      }
      difficulties {
        difficulty
        label
        solved
        total
      }
      lessons {
        slug
        title
        weekNumber
        moduleTitle
        solved
        total
        skipped
      }
      improvements {
        kind
        title
        detail
        href
      }
    }
  }
`;

export const SIGN_UP = `
  mutation SignUp($email: String!, $name: String!, $password: String!) {
    signUp(email: $email, name: $name, password: $password) {
      token
      user {${userFields}}
    }
  }
`;

export const SIGN_IN = `
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {${userFields}}
    }
  }
`;

export const REDEEM_OAUTH_CODE = `
  mutation RedeemOAuthCode($code: String!) {
    redeemOAuthCode(code: $code) {
      token
      user {${userFields}}
    }
  }
`;

export const COMPLETE_ONBOARDING = `
  mutation CompleteOnboarding {
    completeOnboarding {${userFields}}
  }
`;

export const SET_AUDIT_MODE = `
  mutation SetAuditMode($enabled: Boolean!) {
    setAuditMode(enabled: $enabled) {${userFields}}
  }
`;

export const UPDATE_PROFILE = `
  mutation UpdateProfile($name: String!, $email: String!, $avatarUrl: String) {
    updateProfile(name: $name, email: $email, avatarUrl: $avatarUrl) {${userFields}}
  }
`;

export const CHANGE_PASSWORD = `
  mutation ChangePassword($currentPassword: String!, $nextPassword: String!) {
    changePassword(currentPassword: $currentPassword, nextPassword: $nextPassword)
  }
`;

export const DELETE_ACCOUNT = `
  mutation DeleteAccount($password: String, $confirmation: String) {
    deleteAccount(password: $password, confirmation: $confirmation)
  }
`;

export const REQUEST_PASSWORD_RESET = `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = `
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`;

export const SIGN_OUT = `
  mutation SignOut {
    signOut
  }
`;

export const RUN_SNIPPET = `
  mutation RunSnippet($code: String!) {
    runSnippet(code: $code) {
      lines {
        kind
        text
      }
    }
  }
`;

export const RUN_CODE = `
  mutation RunCode($problemId: ID!, $code: String!) {
    runCode(problemId: $problemId, code: $code) {
      lines {
        kind
        text
      }
    }
  }
`;

export const SKIP_LESSON = `
  mutation SkipLesson($slug: String!) {
    skipLesson(slug: $slug) {
      slug
      skipped
      nextSlug
      nextAvailable
    }
  }
`;

export const SAVE_PROGRESS = `
  mutation SaveProgress($problemId: ID!, $code: String!) {
    saveProgress(problemId: $problemId, code: $code)
  }
`;

export const SUBMIT_SOLUTION = `
  mutation Submit($problemId: ID!, $code: String!) {
    submitSolution(problemId: $problemId, code: $code) {
      id
      passed
      testsPassed
      testsTotal
      feedback
      createdAt
      results {
        name
        passed
        input
        expected
        received
        error
      }
    }
  }
`;

export const ADMIN_OVERVIEW = `
  query AdminOverview {
    adminOverview {
      usersTotal
      activeLast7Days
      activeLast30Days
      signupsLast7Days
      signupsLast30Days
      submissionsTotal
      passesTotal
      passRate
      lessonsCompletedAverage
      problemsSolvedAverage
      series {
        day
        signups
        submissions
        passes
      }
      authMethods {
        method
        label
        count
      }
      topics {
        topic
        problems
        attempters
        solvers
      }
      progress {
        label
        count
      }
      users {
        id
        email
        name
        avatarUrl
        hasPassword
        providers
        createdAt
        lastActiveAt
        lessonsCompleted
        lessonsTotal
        problemsSolved
        problemsTotal
        attempts
        passes
        passRate
        deletable
        topics {
          topic
          solved
          total
        }
      }
    }
  }
`;

export const ADMIN_DELETE_ACCOUNT = `
  mutation AdminDeleteAccount($userId: ID!) {
    adminDeleteAccount(userId: $userId)
  }
`;
