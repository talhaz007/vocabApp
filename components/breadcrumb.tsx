import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbProps {
  items: {
    label: string
    href: string
    active?: boolean
  }[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="flex items-center hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            <Link
              href={item.href}
              className={cn("hover:text-primary transition-colors", item.active ? "font-medium text-foreground" : "")}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

