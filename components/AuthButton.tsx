"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthButton() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  if (!user) {
    // Not signed in => show Sign In button linking to sign-in page
    return (
      <Link
        href="/sign-in"
        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        تسجيل الدخول
      </Link>
    );
  }

  // Signed in => show Sign Out button
  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    >
      تسجيل الخروج
    </button>
  );
}
