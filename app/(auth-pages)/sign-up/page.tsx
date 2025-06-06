import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4" dir="rtl">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form dir="rtl" className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">إنشاء حساب</h1>
        <p className="text-sm text text-foreground">
          لديك حساب بالفعل؟{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            تسجيل الدخول
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="جاري إنشاء الحساب...">
            إنشاء الحساب
          </SubmitButton>

        </div>
      </form>

    </>
  );
}
