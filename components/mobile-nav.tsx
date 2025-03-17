"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BookOpen, Dumbbell, Mic, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Learn & Practice",
    href: "/learn-practice",
    icon: BookOpen,
  },
  {
    name: "Memory",
    href: "/memory",
    icon: Dumbbell,
  },
  {
    name: "Speaking & Listening",
    href: "/speaking-listening",
    icon: Mic,
  },
  {
    name: "Writing Prompts",
    href: "/writing-prompts",
    icon: BookOpen,
  },
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="pr-0">
        <div className="px-7">
          <Link href="/dashboard" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold">Vocabulary</span>
          </Link>
        </div>
        <nav className="mt-8 flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center px-7 py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

