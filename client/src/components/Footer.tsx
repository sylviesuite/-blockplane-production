import { Link } from 'wouter';
import { Github, Twitter, Linkedin, Mail, FileText, Shield, Book } from 'lucide-react';
import { APP_TITLE } from '@/const';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{APP_TITLE}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sustainable materials platform helping builders and architects make informed decisions for a greener future.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/api-docs">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    API Documentation
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/docs">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    User Guide
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/materials">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Material Database
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/analysis">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Analysis Tools
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/cookies">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/licenses">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Licenses
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {APP_TITLE}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ for a sustainable future
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
