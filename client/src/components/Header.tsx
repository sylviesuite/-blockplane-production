import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, Database, FileText, BarChart3, Moon, Sun } from 'lucide-react';
import { APP_TITLE } from '@/const';
import { useTheme } from '@/contexts/ThemeContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();
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
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleTheme()}
          className="ml-auto"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
