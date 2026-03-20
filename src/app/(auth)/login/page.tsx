import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
        Sign in to your account
      </h2>
      <LoginForm />
    </div>
  )
}
