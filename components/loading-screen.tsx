interface LoadingScreenProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
}

export default function LoadingScreen({ message = "Loading...", ...props }: LoadingScreenProps) {
    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900" 
            {...props}
        >
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-b-primary mb-4" />
            <div className="text-center text-base text-foreground px-4">
                {message}
            </div>
        </div>
    )
}