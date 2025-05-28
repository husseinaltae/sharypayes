import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex flex-col min-w-64 max-w-64 mx-auto" dir="rtl">
      <h1 className="text-2xl font-medium">تسجيل الدخول</h1>
      <p className="text-sm text-foreground">
        لا تملك حسابًا؟{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          إنشاء حساب
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">كلمة المرور</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            هل نسيت كلمة المرور؟
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="كلمة المرور الخاصة بك"
          required
        />
        <SubmitButton pendingText="جارٍ تسجيل الدخول..." formAction={signInAction}>
          تسجيل الدخول
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
