import { Link } from 'react-router-dom';
import { Globe, Phone, Mail, Building2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-ai-card/30 py-12 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              <span className="text-ai-accent">Himato</span>
            </h3>
            <p className="text-ai-muted mb-4 leading-relaxed">
              Your AI-powered travel planner for Sikkim. Discover hidden gems and plan the perfect Himalayan adventure.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-ai-muted hover:text-ai-accent transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/reach_us"
                  className="text-ai-muted hover:text-ai-accent transition-colors"
                >
                  Reach Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-ai-muted hover:text-ai-accent transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-ai-muted">
                <Globe className="w-5 h-5 text-ai-accent flex-shrink-0" />
                <span>www.himato.in</span>
              </li>
              <li className="flex items-center gap-3 text-ai-muted">
                <Phone className="w-5 h-5 text-ai-accent flex-shrink-0" />
                <span>+91 9733814168</span>
              </li>
              <li className="flex items-center gap-3 text-ai-muted">
                <Mail className="w-5 h-5 text-ai-accent flex-shrink-0" />
                <span>hello@himato.in</span>
              </li>
              <li className="flex items-center gap-3 text-ai-muted">
                <Building2 className="w-5 h-5 text-ai-accent flex-shrink-0" />
                <span>Waglogy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-ai-muted text-sm">
            © {new Date().getFullYear()} Waglogy. All rights reserved.
          </p>
          <p className="text-ai-muted text-sm mt-1 opacity-75">
            Himato by Waglogy
          </p>
        </div>
      </div>
    </footer>
  );
};




