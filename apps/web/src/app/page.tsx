import { redirect } from "next/navigation";
import { getServerAuthSession } from "../../lib/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/sign-in");
  }
}
