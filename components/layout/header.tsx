import Link from "next/link"
import {ThemeToggle} from "@/components/theme-toggle";




import {Button} from "@/components/ui/button"
import {Sparkles} from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
            <div className="container h-14 flex items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span className="hidden font-bold sm:inline-block">OCR Schema Builder</span>
                    </Link>
                </div>
                <div className="mr-4 flex md:hidden">
                    <Link href="/" className="flex items-center">
                        <Sparkles className="h-5 w-5" />
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <nav className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/">Home</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/docs">Documentation</Link>
                        </Button>
                        <ThemeToggle />
                    </nav>
                </div>
            </div>
        </header>
    )
}