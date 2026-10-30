function CheckboxField({ label, error, ...inputProps }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          {...inputProps}
          className="mt-1 h-4 w-4 shrink-0 accent-yellow-400"
        />
        <span className="text-sm text-gray-300">{label}</span>
      </label>
      {error && <p className="mt-1 text-sm text-red-400">{error.message}</p>}
    </div>
  )
}

export default CheckboxField