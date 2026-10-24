export const courseAccessOpen = (user: {
  readonly emailVerified: boolean;
  readonly providers: readonly unknown[];
}): boolean => {
  if (user.emailVerified) {
    return true;
  }
  if (user.providers.length > 0) {
    return true;
  }
  return false;
};
