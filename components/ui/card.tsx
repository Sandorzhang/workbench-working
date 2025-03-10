import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-gray-100/70",
        "shadow backdrop-blur-sm backdrop-filter",
        "transition-all duration-300 ease-in-out",
        "hover:shadow-md hover:border-gray-200/80",
        "dark:border-gray-800/70 dark:hover:border-gray-700/80",
        "bg-gradient-to-b from-white/50 to-white",
        "dark:from-gray-900/50 dark:to-gray-900",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-2 px-6 pt-6",
        "border-b border-gray-100/60 dark:border-gray-800/60",
        "pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        "bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700",
        "dark:from-gray-100 dark:to-gray-300",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-muted-foreground text-sm mt-1",
        "text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-6 py-4",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 py-4 mt-auto",
        "border-t border-gray-100/60 dark:border-gray-800/60",
        "bg-gray-50/50 dark:bg-gray-800/50",
        "rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
