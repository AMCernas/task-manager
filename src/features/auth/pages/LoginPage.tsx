import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const { signIn, user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      navigate('/board', { replace: true })
    }
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const { error: authError } = await signIn(email, password)
    
    setIsSubmitting(false)
    
    if (authError) {
      const message = authError.message.toLowerCase()
      if (message.includes('invalid') || message.includes('credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (message.includes('rate')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else if (message.includes('user not found')) {
        setError('No account found with this email.')
      } else {
        setError('Failed to sign in. Please try again.')
      }
    } else {
      navigate('/board', { replace: true })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-[#E9E8E6]">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-[#1A1A1A] mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#37352F] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-white border border-[#E9E8E6] rounded-md text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#37352F] focus:ring-opacity-20"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#37352F] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-white border border-[#E9E8E6] rounded-md text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#37352F] focus:ring-opacity-20"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#37352F] text-white rounded-md font-medium hover:bg-[#1A1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#37352F] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
