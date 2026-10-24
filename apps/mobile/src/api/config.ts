export const graphqlUrl =
  process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? "https://datastructuresandalgorithms.com";

export const apiOrigin = graphqlUrl.replace(/\/graphql\/?$/, "");

export const mobileRedirect = "dsa://auth/callback";
