import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RegisterPage() {
  const { signUp, user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      navigate('/board', { replace: true })
    }
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setIsSubmitting(false)
      return
    }
    
    const { error: authError } = await signUp(email, password)
    
    setIsSubmitting(false)
    
    if (authError) {
      const message = authError.message.toLowerCase()
      if (message.includes('already') || message.includes('exists') || message.includes('registered')) {
        setError('An account with this email already exists.')
      } else if (message.includes('rate') || message.includes('429')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else if (message.includes('weak') || message.includes('password')) {
        setError('Password is too weak. Please use a stronger password.')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } else {
      setSuccess(true)
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
          <h1 className="font-display text-3xl text-[#1A1A1A] mb-2">Create account</h1>
          <p className="text-muted-foreground text-sm">Get started with Task Manager</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-md">
            <p className="text-sm text-green-700">Account created! Redirecting to login...</p>
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
              minLength={6}
              className="w-full px-3 py-2 bg-white border border-[#E9E8E6] rounded-md text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#37352F] focus:ring-opacity-20"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-muted-foreground">Must be at least 6 characters</p>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#37352F] text-white rounded-md font-medium hover:bg-[#1A1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-[#37352F] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
