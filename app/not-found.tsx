"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { gsap } from "gsap";

const NotFound = () => {
    const navigationOptions = [
        { href: "/", label: "🏠 Home" },
        { href: "/", label: "📝 Quizzes" },
        { href: "/?create=true", label: "🎯 Create Quiz" }
    ];

    const floatingElements = [
        { emoji: "🎪", size: "text-4xl", position: "top-20 left-10", animation: "animate-float" },
        { emoji: "🎨", size: "text-3xl", position: "top-32 right-16", animation: "animate-float-delayed" },
        { emoji: "🎭", size: "text-3xl", position: "bottom-20 left-16", animation: "animate-float" },
        { emoji: "🎪", size: "text-4xl", position: "bottom-32 right-12", animation: "animate-float-delayed" }
    ];

    useEffect(() => {
        // Initialize GSAP animations for floating elements
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((el, index) => {
            gsap.to(el, {
                y: -20,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: index * 0.5
            });
        });
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-pink-400/20 to-red-600/20 blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/10 to-cyan-600/10 blur-2xl animate-ping"></div>
            </div>

            <div className="relative mx-auto flex h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
                <div className="relative mb-8">
                    <p
                        className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-bounce select-none"
                        data-testid="error-code"
                        style={{
                            animation: "bounce 2s infinite, glitch 3s infinite",
                        }}
                    >
                        404
                    </p>
                    <p
                        className="absolute inset-0 text-8xl font-black text-red-500/30 animate-pulse"
                        style={{
                            animation: "glitch-shadow 3s infinite",
                            transform: "translate(2px, 2px)",
                        }}
                    >
                        404
                    </p>
                </div>

                {/* Animated content */}
                <div className="space-y-6 animate-fade-in-up">
                    <h1
                        className="text-4xl font-bold text-zinc-900 dark:text-white animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Oops! Page Not Found
                    </h1>

                    <p
                        className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto animate-fade-in-up"
                        data-testid="error-message"
                        style={{ animationDelay: "0.4s" }}
                    >
                        The page you&apos;re looking for seems to have vanished into the
                        digital void. Don&apos;t worry, even the best explorers get lost
                        sometimes!
                    </p>

                    <div
                        className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in-up"
                        style={{ animationDelay: "0.6s" }}
                    >
                        {navigationOptions.map((option, index) => (
                            <Link key={index} href={option.href}>
                                <span className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                                    {option.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    <Link href={"/"} className="inline-block mt-8">
                        <Button
                            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 animate-fade-in-up group"
                            style={{ animationDelay: "0.8s" }}
                        >
                            <span className="flex items-center gap-2">
                                <span className="transform group-hover:-translate-x-1 transition-transform duration-200">
                                    🚀
                                </span>
                                Take Me Home
                                <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                                    ✨
                                </span>
                            </span>
                        </Button>
                    </Link>
                </div>

                {/* Floating elements with GSAP animation */}
                {floatingElements.map((element, index) => (
                    <div key={index} className={`absolute ${element.position} ${element.size} floating-element`}>
                        {element.emoji}
                    </div>
                ))}
            </div>

            {/* Alyakuru character */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 z-10">
                <div className="relative animate-float-gentle">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-400/20 to-blue-400/20 rounded-full blur-xl scale-150 animate-pulse"></div>
                    <Image
                        src="/images/alyakuru.png" // Update this path to your actual image
                        alt="Alyakuru character"
                        width={120}
                        height={120}
                        className="relative z-10 drop-shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                        priority
                        unoptimized
                    />
                    {/* Speech bubble */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-800 px-3 py-2 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 animate-fade-in-up opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                            Lost? I&apos;ll help you find your way! 🌟
                        </p>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-zinc-800"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                  from {
                    opacity: 0;
                    transform: translateY(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                @keyframes glitch {
                  0%,
                  100% {
                    transform: translate(0);
                  }
                  10% {
                    transform: translate(-2px, -1px);
                  }
                  20% {
                    transform: translate(2px, 1px);
                  }
                  30% {
                    transform: translate(-1px, 2px);
                  }
                  40% {
                    transform: translate(1px, -1px);
                  }
                  50% {
                    transform: translate(-1px, 1px);
                  }
                  60% {
                    transform: translate(2px, -2px);
                  }
                  70% {
                    transform: translate(-2px, 2px);
                  }
                  80% {
                    transform: translate(1px, -1px);
                  }
                  90% {
                    transform: translate(-1px, 1px);
                  }
                }

                @keyframes glitch-shadow {
                  0%,
                  100% {
                    transform: translate(2px, 2px);
                    opacity: 0.3;
                  }
                  25% {
                    transform: translate(-2px, 2px);
                    opacity: 0.5;
                  }
                  50% {
                    transform: translate(2px, -2px);
                    opacity: 0.3;
                  }
                  75% {
                    transform: translate(-2px, -2px);
                    opacity: 0.5;
                  }
                }

                @keyframes float {
                  0%,
                  100% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-20px);
                  }
                }

                @keyframes float-delayed {
                  0%,
                  100% {
                    transform: translateY(-10px);
                  }
                  50% {
                    transform: translateY(-30px);
                  }
                }

                @keyframes float-gentle {
                  0%,
                  100% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-10px);
                  }
                }
              `}</style>
        </div>
    );
};

export default NotFound;