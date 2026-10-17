import { AuthForm } from "@/components/auth-form";

export default async function SignInPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly reset?: string }>;
}) {
  const params = await searchParams;
  const notice =
    params.reset === "done" ? "Your password is updated. Sign in with the new one." : null;
  return <AuthForm mode="sign-in" notice={notice} />;
}
