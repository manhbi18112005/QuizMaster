"use client";

import Link from "next/link";

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        You&apos;re Offline
                    </h1>
                    <p className="text-gray-600">
                        QuizMaster is currently offline. Don&apos;t worry - you can still access
                        your saved quizzes and question banks!
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            What you can do offline:
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Take quizzes from your saved question banks</li>
                            <li>• Create and edit question banks</li>
                            <li>• View quiz results and statistics</li>
                            <li>• Access all previously loaded content</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            <strong>Auto-sync enabled:</strong> Your changes will be
                            automatically synced when you&apos;re back online.
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}