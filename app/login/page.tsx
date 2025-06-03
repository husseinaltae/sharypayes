// ✅ app/login/page.tsx (Server Component)
import Login from "./login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  return <Login searchParams={searchParams} />;
}
