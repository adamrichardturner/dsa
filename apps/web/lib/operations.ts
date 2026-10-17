const userFields = `
  id
  email
  name
  avatarUrl
  hasPassword
  providers
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
        available
        stars
        maxStars
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
      estimatedMinutes
      weekNumber
      moduleTitle
      completed
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
        bestStars
        solved
        attempts
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
      stars
      maxStars
      attempts
      passRate
      focusAreas
      summary
      topics {
        topic
        solved
        total
        attempted
        stars
        maxStars
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

export const SIGN_OUT = `
  mutation SignOut {
    signOut
  }
`;

export const SUBMIT_SOLUTION = `
  mutation Submit($problemId: ID!, $code: String!) {
    submitSolution(problemId: $problemId, code: $code) {
      id
      passed
      stars
      testsPassed
      testsTotal
      feedback
      createdAt
      results {
        name
        passed
        expected
        received
        error
      }
    }
  }
`;
