import { Link } from 'wouter';
import { APP_TITLE } from '@/const';

const forest = '#1a2e1f';
const cream = '#f5f2ec';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: forest }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p style={{ color: cream }} className="font-bold text-lg mb-3">{APP_TITLE}</p>
            <p style={{ color: `${cream}99` }} className="text-sm leading-relaxed">
              Sustainable materials platform helping builders and architects make informed decisions.
            </p>
          </div>

          <div>
            <p style={{ color: cream }} className="font-semibold text-sm uppercase tracking-wide mb-4">Resources</p>
            <ul className="space-y-2">
              {[
                { label: 'Material Database', href: '/materials' },
                { label: 'Analysis Tools', href: '/analysis' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Calculator', href: '/calculator' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}>
                    <span style={{ color: `${cream}99` }} className="text-sm hover:text-white cursor-pointer transition-colors">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ color: cream }} className="font-semibold text-sm uppercase tracking-wide mb-4">Legal</p>
            <ul className="space-y-2">
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}>
                    <span style={{ color: `${cream}99` }} className="text-sm hover:text-white cursor-pointer transition-colors">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTopColor: `${cream}22` }} className="pt-8 border-t">
          <p style={{ color: `${cream}66` }} className="text-sm text-center">
            © {currentYear} {APP_TITLE}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
