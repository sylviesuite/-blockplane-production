import { Link } from 'wouter';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const forest = '#1a2e1f';
const cream = '#f5f2ec';
const amber = '#c17f24';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={{ backgroundColor: forest }} className="sticky top-0 z-50 w-full">
      <div className="container flex h-14 items-center">
        <Link href="/">
          <img
            src="/assets/logo-blockplane.png"
            alt="BlockPlane"
            height="40"
            style={{ display: 'block' }}
          />
        </Link>

        <nav className="flex flex-1 items-center gap-6 text-sm">
          <Link href="/materials">
            <span style={{ color: `${cream}cc` }} className="hover:text-white cursor-pointer transition-colors">
              Materials
            </span>
          </Link>
          <Link href="/frontier">
            <span style={{ color: `${cream}cc` }} className="hover:text-white cursor-pointer transition-colors">
              Frontier
            </span>
          </Link>
          <Link href="/analysis">
            <span style={{ color: `${cream}cc` }} className="hover:text-white cursor-pointer transition-colors">
              Analysis
            </span>
          </Link>
          <Link href="/benchmark">
            <span style={{ color: `${cream}cc` }} className="hover:text-white cursor-pointer transition-colors">
              Benchmark 2000
            </span>
          </Link>
          <Link href="/how-it-works">
            <span style={{ color: `${cream}cc` }} className="hover:text-white cursor-pointer transition-colors">
              How It Works
            </span>
          </Link>
          <Link href="/calculator">
            <span style={{ color: `${cream}cc` }} className="hover:text-white cursor-pointer transition-colors">
              Calculator
            </span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/my-projects">
                <span style={{ color: `${cream}cc` }} className="hover:text-white cursor-pointer transition-colors">
                  My Projects
                </span>
              </Link>
              <button
                onClick={logout}
                style={{ color: `${cream}cc` }}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login">
              <span
                style={{ backgroundColor: amber, color: '#fff' }}
                className="flex items-center gap-1 px-4 py-1.5 rounded text-sm font-medium cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
