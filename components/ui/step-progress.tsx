import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  label: string
  description?: string
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div
              key={step.label}
              className={cn(
                "flex items-center",
                !isLast && "flex-1"
              )}
            >
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : isCurrent
                        ? "border-[hsl(var(--primary))] bg-background text-[hsl(var(--primary))]"
                        : "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
                    isCompleted ? "bg-[hsl(var(--primary))]" : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
