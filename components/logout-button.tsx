"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    >
      تسجيل الخروج
    </button>
  );
}
