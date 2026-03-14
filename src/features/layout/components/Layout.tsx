import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LogOut, CheckSquare } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

function getInitials(email: string | undefined): string {
  if (!email) return '?'
  const name = email.split('@')[0]
  return name.slice(0, 2).toUpperCase()
}

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-terracotta focus:text-white focus:rounded-lg focus:font-medium"
    >
      Skip to main content
    </a>
  )
}

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-background/50">
      <SkipLink />
      <header 
        className="h-16 bg-white/80 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-50"
        role="banner"
      >
        <div className="flex items-center gap-4">
          <Link 
            to="/board" 
            className="flex items-center gap-3 group"
            aria-label="TaskFlow - Go to board"
          >
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <CheckSquare className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-lg text-foreground tracking-tight">TaskFlow</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors duration-200">
            <div 
              className="w-7 h-7 rounded-full bg-terracotta flex items-center justify-center shadow-sm"
              aria-hidden="true"
            >
              <span className="text-xs font-bold text-white">{getInitials(user?.email)}</span>
            </div>
            <span className="text-sm text-muted-foreground max-w-[150px] truncate">{user?.email}</span>
          </div>
          
          <button
            onClick={() => signOut()}
            className="p-2.5 rounded-lg hover:bg-secondary transition-all duration-200 text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>
      
      <main 
        id="main-content" 
        className="p-6"
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
    </div>
  )
}
