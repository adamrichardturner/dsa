import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { request } from "@/api/client";
import { ME_QUERY, SIGN_OUT } from "@/api/operations";
import type { AuthPayload, User } from "@/api/types";

const tokenKey = "dsa.token";

interface SessionValue {
  readonly ready: boolean;
  readonly token: string | null;
  readonly user: User | null;
  readonly accept: (payload: AuthPayload) => Promise<void>;
  readonly updateUser: (user: User) => void;
  readonly signOut: () => Promise<void>;
  readonly reload: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

const isProvider = (value: string): value is User["providers"][number] => {
  return value === "google" || value === "github" || value === "apple";
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const readUser = (value: unknown): User | null => {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.id !== "string" || typeof value.email !== "string" || typeof value.name !== "string") {
    return null;
  }
  const providers: User["providers"][number][] = [];
  if (Array.isArray(value.providers)) {
    for (const item of value.providers) {
      if (typeof item === "string" && isProvider(item) && !providers.includes(item)) {
        providers.push(item);
      }
    }
  }
  return {
    id: value.id,
    email: value.email,
    name: value.name,
    avatarUrl: typeof value.avatarUrl === "string" ? value.avatarUrl : null,
    hasPassword: value.hasPassword === true,
    providers,
    isAdmin: value.isAdmin === true,
    auditMode: value.auditMode === true,
    onboardingCompleted: value.onboardingCompleted === true,
    emailVerified: value.emailVerified === true,
  };
};

export const readAuthPayload = (value: unknown): AuthPayload | null => {
  if (!isRecord(value) || typeof value.token !== "string") {
    return null;
  }
  const user = readUser(value.user);
  if (user === null) {
    return null;
  }
  return { token: value.token, user };
};

export function SessionProvider({ children }: { readonly children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const accept = useCallback(async (payload: AuthPayload) => {
    await SecureStore.setItemAsync(tokenKey, payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const clear = useCallback(async () => {
    await SecureStore.deleteItemAsync(tokenKey);
    setToken(null);
    setUser(null);
  }, []);

  const reload = useCallback(async () => {
    const stored = token ?? (await SecureStore.getItemAsync(tokenKey));
    if (stored === null || stored.length === 0) {
      setToken(null);
      setUser(null);
      return;
    }
    try {
      const data = await request<{ me: unknown }>(ME_QUERY, null, stored);
      const next = readUser(data.me);
      if (next === null) {
        await clear();
        return;
      }
      setToken(stored);
      setUser(next);
    } catch {
      await clear();
    }
  }, [clear, token]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const stored = await SecureStore.getItemAsync(tokenKey);
      if (!active) {
        return;
      }
      if (stored === null || stored.length === 0) {
        setReady(true);
        return;
      }
      try {
        const data = await request<{ me: unknown }>(ME_QUERY, null, stored);
        const next = readUser(data.me);
        if (!active) {
          return;
        }
        if (next === null) {
          await SecureStore.deleteItemAsync(tokenKey);
          setReady(true);
          return;
        }
        setToken(stored);
        setUser(next);
      } catch {
        if (active) {
          await SecureStore.deleteItemAsync(tokenKey);
        }
      }
      if (active) {
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    if (token !== null) {
      try {
        await request(SIGN_OUT, null, token);
      } catch {
        // The local session still has to go.
      }
    }
    await clear();
  }, [clear, token]);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      token,
      user,
      accept,
      updateUser: setUser,
      signOut,
      reload,
    }),
    [accept, ready, reload, signOut, token, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = (): SessionValue => {
  const value = useContext(SessionContext);
  if (value === null) {
    throw new Error("SessionProvider is missing.");
  }
  return value;
};
