import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { apiOrigin, mobileRedirect } from "@/api/config";
import { request } from "@/api/client";
import { REDEEM_OAUTH_CODE, SIGN_IN_WITH_APPLE } from "@/api/operations";
import { readAuthPayload } from "@/auth/session";
import type { AuthPayload, OauthProvider } from "@/api/types";

export const appleSignInOffered = Platform.OS === "ios" || Platform.OS === "android";

const codedError = (caught: unknown): string | null => {
  if (typeof caught !== "object" || caught === null || !("code" in caught)) {
    return null;
  }
  if (typeof caught.code !== "string") {
    return null;
  }
  return caught.code;
};

WebBrowser.maybeCompleteAuthSession();

const queryValue = (url: string, key: string): string | null => {
  const query = url.split("?")[1] ?? "";
  const params = new URLSearchParams(query);
  const value = params.get(key);
  if (value === null || value.length === 0) {
    return null;
  }
  return value;
};

export const oauthErrorCopy = (code: string): string => {
  if (code === "access_denied") {
    return "Sign-in was cancelled.";
  }
  if (code === "expired") {
    return "That sign-in link expired. Try again.";
  }
  if (code === "unavailable") {
    return "That sign-in provider is not available right now.";
  }
  if (code === "email") {
    return "The provider did not share a verified email address. Allow email access and try again.";
  }
  if (code === "conflict") {
    return "Those email addresses belong to more than one account, so this sign-in was not linked.";
  }
  if (code === "linked") {
    return "This email is already linked to a different account at that provider.";
  }
  return "Could not finish signing in. Try again.";
};

export const redeemBrowserSignIn = async (provider: OauthProvider): Promise<AuthPayload> => {
  const result = await WebBrowser.openAuthSessionAsync(
    `${apiOrigin}/auth/${provider}?client=mobile&returnTo=/course`,
    mobileRedirect,
  );
  if (result.type !== "success") {
    throw new Error("Sign-in was cancelled.");
  }
  const error = queryValue(result.url, "error");
  if (error !== null) {
    throw new Error(oauthErrorCopy(error));
  }
  const code = queryValue(result.url, "code");
  if (code === null) {
    throw new Error("Could not finish signing in. Try again.");
  }
  const data = await request<{ redeemOAuthCode: unknown }>(REDEEM_OAUTH_CODE, { code }, null);
  const payload = readAuthPayload(data.redeemOAuthCode);
  if (payload === null) {
    throw new Error("Could not finish signing in. Try again.");
  }
  return payload;
};

const appleName = (credential: AppleAuthentication.AppleAuthenticationCredential): string | null => {
  const given = credential.fullName?.givenName ?? "";
  const family = credential.fullName?.familyName ?? "";
  const name = `${given} ${family}`.trim();
  if (name.length === 0) {
    return null;
  }
  return name;
};

export const signInWithAppleNative = async (): Promise<AuthPayload> => {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      nonce: hashedNonce,
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (caught) {
    const code = codedError(caught);
    if (code === "ERR_REQUEST_CANCELED") {
      throw new Error("Sign-in was cancelled.");
    }
    if (code === "ERR_UNAVAILABLE") {
      throw new Error("Sign in with Apple needs a development build of the app.");
    }
    if (caught instanceof Error) {
      throw caught;
    }
    throw new Error("Could not finish Apple sign-in. Try again.");
  }
  if (credential.identityToken === null || credential.identityToken.length === 0) {
    throw new Error("Could not finish Apple sign-in. Try again.");
  }
  const data = await request<{ signInWithApple: unknown }>(
    SIGN_IN_WITH_APPLE,
    {
      identityToken: credential.identityToken,
      nonce: rawNonce,
      name: appleName(credential),
    },
    null,
  );
  const payload = readAuthPayload(data.signInWithApple);
  if (payload === null) {
    throw new Error("Could not finish Apple sign-in. Try again.");
  }
  return payload;
};

export const appleUsesNative = async (): Promise<boolean> => {
  if (Platform.OS !== "ios") {
    return false;
  }
  return AppleAuthentication.isAvailableAsync();
};

export const signInWithProvider = async (provider: OauthProvider): Promise<AuthPayload> => {
  if (provider !== "apple" || Platform.OS !== "ios") {
    return redeemBrowserSignIn(provider);
  }
  const native = await appleUsesNative();
  if (!native) {
    throw new Error("Sign in with Apple needs a development build of the app.");
  }
  return signInWithAppleNative();
};
