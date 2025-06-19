"use client";

import LoginForm from "@/components/auth/login-form";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-center text-xl font-semibold">
        {t('auth.welcome')}
      </h3>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm font-medium text-neutral-500">
        {t('auth.dont_have_account')}
        <Link
          href="/auth/signup"
          className="font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
        >
          {t('auth.sign_up')}
        </Link>
      </p>

      <div className="mt-12 w-full">
      </div>
    </div>
  );
}