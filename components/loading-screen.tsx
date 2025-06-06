interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = "Loading...", ...props }: LoadingScreenProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center" {...props}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <div className="text-center text-sm text-muted-foreground">{message}</div>
        </div>
    )
}