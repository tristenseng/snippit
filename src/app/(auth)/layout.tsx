export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            Snippit
          </h1>
          <p className="mt-2 text-sm text-stone-500 tracking-wide">
            Cannabis performance tracking
          </p>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.07)] sm:rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  )
}
