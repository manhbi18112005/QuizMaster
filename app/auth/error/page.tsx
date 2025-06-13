import { constructMetadata } from "@/lib/metadata";
import { WEBAPP_URL } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

export const metadata = constructMetadata({
  title: `Authentication Error`,
  canonicalUrl: `${WEBAPP_URL}/auth/error`,
  noIndex: true,
});

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to access this resource.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
};

async function AuthErrorContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error as keyof typeof errorMessages;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle>Authentication Error</CardTitle>
        <CardDescription>
          {errorMessages[error] || errorMessages.Default}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/auth/login">
            Try Again
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/">
            Go Home
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent searchParams={searchParams} />
    </Suspense>
  );
}
