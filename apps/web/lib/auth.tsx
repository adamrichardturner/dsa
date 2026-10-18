"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";
import { isRecord } from "./guards";
import { ME_QUERY } from "./operations";
import type { OauthProvider, User } from "./types";

const tokenKey = "kiln.token";
const userKey = "kiln.user";

export const graphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export const apiOrigin = graphqlUrl.replace(/\/graphql\/?$/, "");

const isProvider = (value: string): value is OauthProvider =>
  value === "google" || value === "github";

const readProviders = (value: unknown): readonly OauthProvider[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const providers: OauthProvider[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !isProvider(item) || providers.includes(item)) {
      continue;
    }
    providers.push(item);
  }
  return providers;
};

const isUserRecord = (
  value: unknown,
): value is {
  id: string;
  email: string;
  name: string;
  avatarUrl?: unknown;
  hasPassword?: unknown;
  providers?: unknown;
  isAdmin?: unknown;
  auditMode?: unknown;
} => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.name === "string"
  );
};

const toUser = (value: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: unknown;
  hasPassword?: unknown;
  providers?: unknown;
  isAdmin?: unknown;
  auditMode?: unknown;
}): User => {
  const avatarUrl = value.avatarUrl;
  const trimmed = typeof avatarUrl === "string" ? avatarUrl.trim() : "";
  return {
    id: value.id,
    email: value.email,
    name: value.name,
    avatarUrl: trimmed.length === 0 ? null : trimmed,
    hasPassword: typeof value.hasPassword === "boolean" ? value.hasPassword : true,
    providers: readProviders(value.providers),
    isAdmin: value.isAdmin === true,
    auditMode: value.auditMode === true,
  };
};

const readStoredUser = (raw: string | null): User | null => {
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isUserRecord(parsed)) {
      return null;
    }
    return toUser(parsed);
  } catch {
    return null;
  }
};

interface AuthContextValue {
  readonly ready: boolean;
  readonly settled: boolean;
  readonly token: string | null;
  readonly user: User | null;
  readonly signIn: (token: string, user: User) => void;
  readonly updateUser: (user: User) => void;
  readonly signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
};

export const useRequireUser = (): AuthContextValue => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.ready && auth.user === null) {
      router.replace("/sign-in");
    }
  }, [auth.ready, auth.user, router]);

  return auth;
};

export const useRequireAdmin = (): AuthContextValue => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.ready || !auth.settled) {
      return;
    }
    if (auth.user === null) {
      router.replace("/sign-in");
      return;
    }
    if (!auth.user.isAdmin) {
      router.replace("/");
    }
  }, [auth.ready, auth.settled, auth.user, router]);

  return auth;
};

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(tokenKey);
    const storedUser = readStoredUser(window.localStorage.getItem(userKey));
    if (storedToken !== null && storedUser !== null) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setReady(true);
    if (storedToken === null || storedUser === null) {
      setSettled(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || token === null) {
      return;
    }

    const controller = new AbortController();

    void fetch(graphqlUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: ME_QUERY,
      }),
    })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!isRecord(body) || !isRecord(body.data)) {
          return;
        }
        if (body.data.me === null) {
          window.localStorage.removeItem(tokenKey);
          window.localStorage.removeItem(userKey);
          setToken(null);
          setUser(null);
          return;
        }
        if (isUserRecord(body.data.me)) {
          const next = toUser(body.data.me);
          setUser(next);
          window.localStorage.setItem(userKey, JSON.stringify(next));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (controller.signal.aborted) {
          return;
        }
        setSettled(true);
      });

    return () => {
      controller.abort();
    };
  }, [ready, token]);

  const client = useMemo(
    () =>
      new Client({
        url: graphqlUrl,
        exchanges: [cacheExchange, fetchExchange],
        fetchOptions: () => {
          if (token === null) {
            return {};
          }
          return {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        },
      }),
    [token],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      settled,
      token,
      user,
      signIn: (nextToken, nextUser) => {
        const stored = toUser(nextUser);
        window.localStorage.setItem(tokenKey, nextToken);
        window.localStorage.setItem(userKey, JSON.stringify(stored));
        setToken(nextToken);
        setUser(stored);
        setSettled(true);
      },
      updateUser: (nextUser) => {
        const stored = toUser(nextUser);
        window.localStorage.setItem(userKey, JSON.stringify(stored));
        setUser(stored);
      },
      signOut: () => {
        window.localStorage.removeItem(tokenKey);
        window.localStorage.removeItem(userKey);
        setToken(null);
        setUser(null);
        setSettled(true);
      },
    }),
    [ready, settled, token, user],
  );

  return (
    <AuthContext.Provider value={value}>
      <Provider value={client}>{children}</Provider>
    </AuthContext.Provider>
  );
}
