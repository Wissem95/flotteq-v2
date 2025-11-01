import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((stepLabel, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-flotteq-blue text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-flotteq-blue' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {stepLabel}
                </p>
              </div>

              {/* Connector Line */}
              {stepNumber < totalSteps && (
                <div className="flex-1 h-0.5 mx-4">
                  <div
                    className={`h-full transition-all ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
