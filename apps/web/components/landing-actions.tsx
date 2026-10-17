"use client";

import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const actionClass = "h-12 min-w-40 px-6 text-base";

export function LandingCloseCopy() {
  const { ready, user } = useAuth();
  const signedIn = ready && user !== null;

  if (signedIn) {
    return (
      <>
        <h2
          id="signup"
          className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl"
        >
          The course is open.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75">
          Pick up the lesson you left. Your code and progress are already on the account.
        </p>
      </>
    );
  }

  return (
    <>
      <h2
        id="signup"
        className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl"
      >
        Sign up. The whole course is yours.
      </h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75">
        Week one is a single pass over an array. The rest of the month builds on it. Nineteen
        lessons, the editor, the tests, and your progress. Nothing to pay for.
      </p>
    </>
  );
}

export function LandingActions({ tone = "default" }: { readonly tone?: "default" | "inverse" }) {
  const { ready, user } = useAuth();
  const inverse = tone === "inverse";

  if (!ready) {
    return <div className="h-12" aria-hidden />;
  }

  if (user !== null) {
    return (
      <Link
        href="/course"
        className={cn(
          buttonVariants({ size: "lg" }),
          actionClass,
          inverse && "bg-background text-foreground hover:bg-background/90",
        )}
      >
        Go to Course
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/sign-up"
        className={cn(
          buttonVariants({ size: "lg" }),
          actionClass,
          inverse && "bg-background text-foreground hover:bg-background/90",
        )}
      >
        Sign up
      </Link>
      <Link
        href="/sign-in"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          actionClass,
          inverse &&
            "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:border-primary-foreground/40 dark:bg-transparent dark:hover:bg-primary-foreground/10",
        )}
      >
        Sign in
      </Link>
    </>
  );
}
