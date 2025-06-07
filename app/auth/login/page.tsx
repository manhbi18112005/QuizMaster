import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h3 className="text-center text-xl font-semibold">
        Log in to your QuizMaster account
      </h3>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm font-medium text-neutral-500">
        Don&apos;t have an account?&nbsp;
        <Link
          href="/auth/signup"
          className="font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
        >
          Sign up
        </Link>
      </p>

      <div className="mt-12 w-full">
      </div>
    </div>
  );
}