import { Link } from 'wouter';

const forest = '#1a2e1f';
const cream = '#f5f2ec';

export default function MinimalFooter() {
  return (
    <footer style={{ backgroundColor: forest }}>
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p style={{ color: `${cream}66` }}>
            © {new Date().getFullYear()} BlockPlane. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy">
              <span style={{ color: `${cream}99` }} className="hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </Link>
            <Link href="/terms">
              <span style={{ color: `${cream}99` }} className="hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
