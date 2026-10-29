function TextField({ label, error, ...inputProps }) {
  return (
    <div>
      <label
        htmlFor={inputProps.name}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      <input
        id={inputProps.name}
        {...inputProps}
        className={`mt-1 w-full rounded-lg bg-gray-900 border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-700 focus:ring-yellow-400'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error.message}</p>}
    </div>
  )
}

export default TextField