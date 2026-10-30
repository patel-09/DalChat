import { Check } from 'lucide-react'

function StepIndicator({ steps, currentStep }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((label, index) => {
        const isDone = index < currentStep
        const isCurrent = index === currentStep

        return (
          <li
            key={label}
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
              isCurrent
                ? 'bg-yellow-400 font-semibold text-gray-900'
                : isDone
                  ? 'bg-gray-800 text-green-400'
                  : 'bg-gray-900 text-gray-500'
            }`}
          >
            {isDone ? <Check size={14} /> : <span>{index + 1}</span>}
            {label}
          </li>
        )
      })}
    </ol>
  )
}

export default StepIndicator