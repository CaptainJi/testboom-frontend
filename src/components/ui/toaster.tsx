import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`mb-2 w-full rounded-lg border bg-background p-4 text-foreground shadow-lg ${
            variant === "destructive"
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-border"
          }`}
        >
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      ))}
    </div>
  )
} 