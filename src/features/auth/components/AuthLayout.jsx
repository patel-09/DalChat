function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/60 border border-gray-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-yellow-400">{title}</h1>
        <p className="mt-2 text-gray-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout