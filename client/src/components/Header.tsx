import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, Database, FileText, BarChart3, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import { APP_TITLE } from '@/const';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/">
          <Button variant="ghost" className="mr-6 flex items-center space-x-2 px-2">
            <span className="font-bold text-xl">{APP_TITLE}</span>
          </Button>
        </Link>

        <nav className="flex flex-1 items-center space-x-1 text-sm font-medium">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>

          <Link href="/materials">
            <Button variant="ghost" size="sm" className="gap-2">
              <Database className="h-4 w-4" />
              Materials
            </Button>
          </Link>

          <Link href="/api-docs">
            <Button variant="ghost" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              API Docs
            </Button>
          </Link>

          <Link href="/analysis">
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis
            </Button>
          </Link>

          <Link href="/assistant">
            <Button variant="outline" size="sm" className="gap-2 ml-2">
              Ask AI
            </Button>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[160px]">
                {user.name ?? user.email}
              </span>
              <Button variant="ghost" size="sm" className="gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}

          {toggleTheme && (
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
