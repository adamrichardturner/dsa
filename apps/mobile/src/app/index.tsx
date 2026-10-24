import { Redirect } from "expo-router";
import { useSession } from "@/auth/session";

export default function Index() {
  const { user } = useSession();
  if (user === null) {
    return <Redirect href="/sign-in" />;
  }
  return <Redirect href="/(main)/course" />;
}
