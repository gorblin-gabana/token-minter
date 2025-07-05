"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          error: "group-[.toast]:bg-orange-50 group-[.toast]:border-orange-200 group-[.toast]:text-orange-800 dark:group-[.toast]:bg-orange-950/20 dark:group-[.toast]:border-orange-800/30 dark:group-[.toast]:text-orange-200",
          success: "group-[.toast]:bg-green-50 group-[.toast]:border-green-200 group-[.toast]:text-green-800 dark:group-[.toast]:bg-green-950/30 dark:group-[.toast]:border-green-800/50 dark:group-[.toast]:text-green-200",
          warning: "group-[.toast]:bg-yellow-50 group-[.toast]:border-yellow-200 group-[.toast]:text-yellow-800 dark:group-[.toast]:bg-yellow-950/30 dark:group-[.toast]:border-yellow-800/50 dark:group-[.toast]:text-yellow-200",
          info: "group-[.toast]:bg-blue-50 group-[.toast]:border-blue-200 group-[.toast]:text-blue-800 dark:group-[.toast]:bg-blue-950/30 dark:group-[.toast]:border-blue-800/50 dark:group-[.toast]:text-blue-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
