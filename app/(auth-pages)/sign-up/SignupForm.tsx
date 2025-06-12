'use client';

import { useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/signUpAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

interface Office {
  id: string;
  name: string;
}

export default function SignupForm({ offices }: { offices: Office[] }) {
  const [role, setRole] = useState("user");

  return (
    <form
      dir="rtl"
      className="max-w-md mx-auto p-6 border rounded-lg shadow space-y-4 bg-white"
      action={async (formData) => {
        const result = await signUpAction(formData);
        if (result.error) {
          console.error(result.error);
        }
      }}
    >
      <h2 className="text-xl font-bold text-center">إنشاء حساب جديد</h2>

      <div>
        <Label htmlFor="first_name">الاسم الأول</Label>
        <Input name="first_name" id="first_name" required />
      </div>

      <div>
        <Label htmlFor="last_name">اسم العائلة</Label>
        <Input name="last_name" id="last_name" required />
      </div>

      <div>
        <Label htmlFor="id_number">الرقم الوظيفي</Label>
        <Input name="id_number" id="id_number" required />
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input name="email" id="email" type="email" required />
      </div>

      <div>
        <Label htmlFor="mobile">رقم الهاتف</Label>
        <Input name="mobile" id="mobile" required />
      </div>

      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input name="password" id="password" type="password" required />
      </div>

      <div>
        <Label htmlFor="role">الدور</Label>
        <select
          name="role"
          id="role"
          required
          className="w-full p-2 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">مستخدم</option>
          <option value="admin">مدير</option>
        </select>
      </div>

      <div>
        <Label htmlFor="office_id">الدائرة</Label>
        <select
          name="office_id"
          id="office_id"
          required
          className="w-full p-2 border rounded"
        >
          <option value="">-- اختر الدائرة --</option>
          {offices.map((office) => (
            <option key={office.id} value={office.id}>
              {office.name}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton className="w-full">تسجيل</SubmitButton>

      <p className="text-sm text-center text-gray-600">
        لديك حساب؟{" "}
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
