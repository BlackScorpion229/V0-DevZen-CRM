"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isClickable = onStepClick && stepNumber <= currentStep

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary bg-primary/10",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                  isClickable && "cursor-pointer hover:border-primary/50",
                )}
                onClick={() => isClickable && onStepClick(stepNumber)}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={cn("text-sm font-medium", isCurrent && "text-primary")}>{step.title}</p>
                {step.description && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-all duration-200",
                  stepNumber < currentStep ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
