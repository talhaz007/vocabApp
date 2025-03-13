"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-2 lg:space-x-3 overflow-x-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center whitespace-nowrap text-xs sm:text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="mr-1 h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

