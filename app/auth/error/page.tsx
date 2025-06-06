"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to access this resource.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") as keyof typeof errorMessages

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
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
    </div>
  )
}
