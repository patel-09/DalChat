import { useRef } from 'react'

function OtpInput({ value, onChange, disabled, hasError }) {
  const inputsRef = useRef([])
  const length = value.length

  function focusBox(index) {
    inputsRef.current[index]?.focus()
  }

  function handleChange(index, event) {
    // Keep only digits, and only the last one typed
    const digit = event.target.value.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[index] = digit
    onChange(next)

    if (digit && index < length - 1) {
      focusBox(index + 1)
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      event.preventDefault()
      const next = [...value]
      next[index - 1] = ''
      onChange(next)
      focusBox(index - 1)
    }
    if (event.key === 'ArrowLeft' && index > 0) focusBox(index - 1)
    if (event.key === 'ArrowRight' && index < length - 1) focusBox(index + 1)
  }

  function handlePaste(event) {
    event.preventDefault()
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)
    if (!pasted) return

    const next = Array.from({ length }, (_, i) => pasted[i] ?? '')
    onChange(next)
    focusBox(Math.min(pasted.length, length) - 1)
  }

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={index === 0}
          aria-label={`Digit ${index + 1}`}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className={`h-14 w-12 rounded-lg border bg-gray-900 text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 disabled:opacity-60 ${
            hasError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-700 focus:ring-yellow-400'
          }`}
        />
      ))}
    </div>
  )
}

export default OtpInput