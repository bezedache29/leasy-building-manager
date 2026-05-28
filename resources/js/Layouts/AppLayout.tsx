import { PropsWithChildren, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

type NavItem = {
  label: string;
  href: string;
};

export default function AppLayout({ children }: PropsWithChildren) {
  const { url } = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'Dashboard', href: route('dashboard') },
      { label: 'Biens', href: route('properties.index') },
      { label: 'Locataires', href: route('tenants.index') },

      // TODO À activer quand tu crées les pages :
      // { label: "Baux", href: route("leases.index") },
      // { label: "États des lieux", href: route("inventories.index") },
      // { label: "Charges", href: route("charges.index") },
      // { label: "Quittances", href: route("rent-receipts.index") },

      { label: 'Profil', href: route('profile.edit') },
    ],
    []
  );

  const isActive = (href: string) => {
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
        <div className="mx-auto flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-app px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-surface-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>

            <Link href={route('dashboard')} className="font-semibold">
              Leasy
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-3 md:flex">
              {navItems
                .filter((i) => i.label !== 'Profil')
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'rounded-md px-3 py-2 text-sm cursor-pointer transition-colors',
                      isActive(item.href) ? 'bg-surface-2 font-medium' : 'hover:bg-surface-2',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link
              href={route('profile.edit')}
              className="rounded-md border border-app px-3 py-2 text-sm cursor-pointer transition-colors bg-outline"
            >
              Profil
            </Link>

            <Link
              href={route('logout')}
              method="post"
              as="button"
              className="rounded-md bg-primary-500 px-3 py-2 text-sm text-white cursor-pointer transition-colors duration-150"
            >
              Déconnexion
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-app bg-surface md:hidden">
            <div className="mx-auto max-w-7xl px-4 py-3">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'rounded-md px-3 py-2 text-sm cursor-pointer transition-colors',
                      isActive(item.href) ? 'bg-surface-2 font-medium' : 'hover:bg-surface-2',
                    ].join(' ')}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="mx-auto w-full p-4 sm:p-6 lg:px-8 xl:px-12">{children}</main>
    </div>
  );
}
