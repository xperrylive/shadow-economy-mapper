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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-primary-600 whitespace-nowrap">
                ShadowEcon
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Business selector + User */}
            <div className="flex items-center gap-4">
              {/* Business Selector */}
              {businesses.length > 0 && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setBizDropdown(!bizDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    <span className="max-w-[150px] truncate">{currentBusiness?.name ?? 'Select'}</span>
                    <ChevronDown size={14} />
                  </button>
                  {bizDropdown && (
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border py-1 z-40">
                      {businesses.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { setCurrentBusiness(b); setBizDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            b.id === currentBusiness?.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          }`}
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
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
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
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg ${
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
