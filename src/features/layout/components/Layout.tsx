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

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-background/50">
      <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link 
            to="/board" 
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-foreground tracking-tight">TaskFlow</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors duration-200">
            <div className="w-7 h-7 rounded-full bg-terracotta flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">{getInitials(user?.email)}</span>
            </div>
            <span className="text-sm text-muted-foreground max-w-[150px] truncate">{user?.email}</span>
          </div>
          
          <button
            onClick={() => signOut()}
            className="p-2.5 rounded-lg hover:bg-secondary transition-all duration-200 text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
