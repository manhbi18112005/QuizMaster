"use client"

import { signIn, getProviders } from "next-auth/react"
import { useEffect, useState, Suspense, lazy } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, AlertCircle } from "lucide-react"
import { logger } from "@/packages/logger"

// Lazy load heavy icons
const Github = lazy(() => import("lucide-react").then(mod => ({ default: mod.Github })))

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

// Skeleton component for loading state
function ProviderButtonSkeleton() {
  return (
    <div className="w-full h-10 bg-muted animate-pulse rounded-md border" />
  )
}

function UserAuthForm() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    let isMounted = true

    const fetchProviders = async () => {
      try {
        setIsLoading(true)
        const res = await getProviders()
        if (isMounted) {
          setProviders(res)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load authentication providers')
          logger.error('Error fetching providers:', err)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProviders()

    return () => {
      isMounted = false
    }
  }, [])

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "github":
        return (
          <Suspense fallback={<div className="w-5 h-5 bg-muted rounded animate-pulse" />}>
            <Github className="w-5 h-5" />
          </Suspense>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ProviderButtonSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {providers &&
        Object.values(providers).map((provider) => (
          <Button
            key={provider.name}
            variant="outline"
            className="w-full"
            onClick={() => signIn(provider.id, { callbackUrl })}
          >
            <div className="flex items-center gap-2">
              {getProviderIcon(provider.id)}
              Sign in with {provider.name}
            </div>
          </Button>
        ))}
    </div>
  )
}

export default function SignInPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error === 'Configuration'
              ? 'There was a problem with the server configuration. Please try again later.'
              : error === 'AccessDenied'
                ? 'Access denied. You do not have permission to sign in.'
                : error === 'Verification'
                  ? 'The verification link was invalid or has expired.'
                  : `Authentication error: ${error}`
            }
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col space-y-2 text-center">
        <User className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      <Suspense fallback={<ProviderButtonSkeleton />}>
        <UserAuthForm />
      </Suspense>
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="hover:text-brand underline underline-offset-4 font-medium"
          >
            Sign up
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/support"
            className="hover:text-brand underline underline-offset-4"
            prefetch={false}
          >
            Need help? Visit Support Center
          </Link>
        </p>
      </div>
    </>
  )
}
