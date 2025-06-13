import Link from "next/link";

export function Footer() {
  return (
    <footer className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
          Made with ❤️ by{" "}
          <Link
            href="https://github.com/manhbi18112005/QuizMaster"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            No Name Studio
          </Link>
          . Open source under the{" "}
          <Link
            href="https://opensource.org/licenses/GPL-3.0"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GPL-3.0 License
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
