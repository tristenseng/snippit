import { auth } from "@/lib/auth"
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper"

export default async function SetPasswordLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <SessionProviderWrapper session={session}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        {children}
      </div>
    </SessionProviderWrapper>
  )
}
