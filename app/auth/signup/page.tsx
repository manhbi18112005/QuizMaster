import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <h3 className="text-center text-xl font-semibold">
        Sign up for a QuizMaster account
      </h3>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm font-medium text-neutral-500">
        Already have an account?&nbsp;
        <Link
          href="/auth/login"
          className="font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
        >
          Log in
        </Link>
      </p>

      <div className="mt-12 w-full">
      </div>
    </div>
  );
}