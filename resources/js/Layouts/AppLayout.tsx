import { PropsWithChildren, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

type NavItem = {
  label: string;
  href: string;
};

export default function AppLayout({ children }: PropsWithChildren) {
  const { url } = usePage();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'Dashboard', href: route('dashboard') },
      // À activer plus tard quand tu auras les pages/routes :
      // { label: "Biens", href: route("properties.index") },
      // { label: "Baux", href: route("leases.index") },
      // { label: "États des lieux", href: route("inventories.index") },
      // { label: "Charges", href: route("charges.index") },
      { label: 'Profil', href: route('profile.edit') },
    ],
    []
  );

  const isActive = (href: string) => {
    // Inertia expose url sans le domaine (ex: "/dashboard")
    try {
      const u = new URL(href, window.location.origin);
      return url === u.pathname;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-app text-app">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-app bg-surface">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-app px-3 py-2 text-sm hover:bg-hover md:hidden"
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <Link href={route('dashboard')} className="font-semibold">
              Leasy
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={route('profile.edit')}
              className="rounded-md border border-app px-3 py-2 bg-secondary text-sm cursor-pointer transition-colors duration-150"
            >
              Profil
            </Link>

            <Link
              href={route('logout')}
              method="post"
              as="button"
              className="rounded-md bg-primary px-3 py-2 text-sm text-white cursor-pointer transition-colors duration-150"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 md:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden border-r border-app bg-surface md:block">
          <nav className="p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'block rounded-md px-3 py-2 text-sm',
                    isActive(item.href) ? 'bg-surface-2 font-medium' : 'hover:bg-hover',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Sidebar (mobile drawer simple) */}
        {isOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
            <div className="fixed left-0 top-14 z-50 h-[calc(100vh-56px)] w-72 border-r border-app bg-surface p-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'block rounded-md px-3 py-2 text-sm',
                      isActive(item.href) ? 'bg-surface-2 font-medium' : 'hover:bg-hover',
                    ].join(' ')}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
