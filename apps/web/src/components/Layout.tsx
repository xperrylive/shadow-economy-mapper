import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import {
  LayoutDashboard,
  Upload,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Lock,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/ledger', label: 'Ledger', icon: BookOpen },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { currentBusiness, businesses, setCurrentBusiness } = useBusiness();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bizDropdown, setBizDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-xl font-bold text-primary-600 whitespace-nowrap"
                aria-label="Shadow Economy Mapper Home"
              >
                <Shield size={24} className="text-primary-600" />
                <span>ShadowEcon</span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition min-h-[44px] ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Business selector + User */}
            <div className="flex items-center gap-4">
              {/* Trust Signal - Security Badge */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                <Lock size={12} className="text-green-600" />
                <span className="text-green-700 font-medium">Secure</span>
              </div>

              {/* Business Selector */}
              {businesses.length > 0 && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setBizDropdown(!bizDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 transition min-h-[44px]"
                    aria-label="Select business"
                    aria-expanded={bizDropdown}
                    aria-haspopup="true"
                  >
                    <span className="max-w-[150px] truncate">{currentBusiness?.name ?? 'Select'}</span>
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                  {bizDropdown && (
                    <div 
                      className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border py-1 z-40"
                      role="menu"
                    >
                      {businesses.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { setCurrentBusiness(b); setBizDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 min-h-[44px] ${
                            b.id === currentBusiness?.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          }`}
                          role="menuitem"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <span className="text-sm text-gray-500 hidden sm:inline">{user?.email}</span>

              <button
                onClick={signOut}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition min-h-[44px] px-2"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1 bg-white">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
            {businesses.length > 1 && (
              <div className="pt-2 border-t mt-2">
                <p className="text-xs text-gray-400 px-3 mb-1">Switch Business</p>
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setCurrentBusiness(b); setMobileOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg min-h-[44px] ${
                      b.id === currentBusiness?.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary-600" />
              <span>© 2026 Shadow Economy Mapper. Your data is encrypted and secure.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary-600 transition">Privacy Policy</a>
              <a href="#" className="hover:text-primary-600 transition">Terms of Service</a>
              <a href="#" className="hover:text-primary-600 transition">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
