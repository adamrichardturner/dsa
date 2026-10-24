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
  emailVerified
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
        examples { call output }
        gap {
          parts { kind text gapId }
          chips { id text }
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
      lessonsSkipped
      summary
      skippedLessons { slug title }
      topics { topic solved total attempted }
    }
  }
`;

export const SIGN_UP = `
  mutation SignUp($email: String!, $name: String!, $password: String!) {
    signUp(email: $email, name: $name, password: $password) { email }
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

export const SIGN_IN_WITH_APPLE = `
  mutation SignInWithApple($identityToken: String!, $nonce: String!, $name: String) {
    signInWithApple(identityToken: $identityToken, nonce: $nonce, name: $name) {
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

export const SIGN_OUT = `
  mutation SignOut { signOut }
`;

export const VERIFY_EMAIL = `
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      token
      user {${userFields}}
    }
  }
`;

export const RESEND_VERIFICATION = `
  mutation ResendVerification($email: String!) {
    resendVerificationEmail(email: $email)
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

export const SUBMIT_GAP = `
  mutation SubmitGap($problemId: ID!, $fillsJson: String!) {
    submitGap(problemId: $problemId, fillsJson: $fillsJson) {
      passed
      gaps { gapId correct }
      submission { passed feedback testsPassed testsTotal }
    }
  }
`;

export const SOLUTION_GUIDE = `
  query SolutionGuide($problemId: ID!) {
    solutionGuide(problemId: $problemId) {
      code
      reveals { gapId text }
      blocks { kind text items chart }
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

export const RUN_SNIPPET = `
  mutation RunSnippet($code: String!) {
    runSnippet(code: $code) {
      lines { kind text }
    }
  }
`;
