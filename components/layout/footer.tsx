import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t py-5 bg-background">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-10 md:flex-row">
                <p className="text-center text-xs text-muted-foreground md:text-left">
                    Built with{" "}
                    <a
                        href="https://nextjs.org"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        Next.js
                    </a>{" "}
                    and{" "}
                    <a
                        href="https://ui.shadcn.com"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        shadcn/ui
                    </a>
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <Link href="/privacy" className="underline underline-offset-4">
                        Privacy
                    </Link>
                    <Link href="/terms" className="underline underline-offset-4">
                        Terms
                    </Link>
                    <Link href="/contact" className="underline underline-offset-4">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    )
}