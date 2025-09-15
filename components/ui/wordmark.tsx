import { cn } from "@/lib/utils";
import Image from "next/image";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/alyamenacing.png"
      alt="Logo"
      width={46}
      height={24}
      className={cn("h-6 w-auto text-black dark:text-white", className)}
    />
  );
}