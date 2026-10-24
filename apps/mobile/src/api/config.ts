const readGraphqlUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL;
  const url = configuredUrl?.trim() ?? "";
  if (url.length === 0) {
    throw new Error(
      "EXPO_PUBLIC_GRAPHQL_URL is required. Set it in .env.local for local development, or in the EAS environment for this build profile.",
    );
  }
  return url;
};

export const graphqlUrl = readGraphqlUrl();

export const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? "https://datastructuresandalgorithms.com";

export const apiOrigin = graphqlUrl.replace(/\/graphql\/?$/, "");

export const mobileRedirect = "dsa://auth/callback";
