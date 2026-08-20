"use client";

import {
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type {
  LanguageLink,
  StoreLink,
  StoreLocale,
} from "@/components/storefront/models";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/container";
import { Drawer } from "@/components/ui/drawer";

const copy = {
  en: {
    account: "Account",
    cart: "Cart",
    close: "Close",
    languages: "Choose language",
    menu: "Menu",
    navigation: "Main navigation",
    search: "Search",
  },
  it: {
    account: "Account",
    cart: "Carrello",
    close: "Chiudi",
    languages: "Scegli la lingua",
    menu: "Menu",
    navigation: "Navigazione principale",
    search: "Cerca",
  },
} satisfies Record<StoreLocale, Record<string, string>>;

function Brand({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Sbrilluccica — Home"
      className="group inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-4"
    >
      <span className="font-serif text-[1.55rem] leading-none tracking-[-0.045em] text-[#2b1e20] sm:text-[1.8rem]">
        Sbrilluccica
      </span>
      <Sparkles
        aria-hidden="true"
        className="text-[#b56777] transition-transform duration-300 group-hover:rotate-12 motion-reduce:transition-none"
        size={17}
        strokeWidth={1.5}
      />
    </Link>
  );
}

export function LanguageSwitcher({
  languages,
  locale,
}: {
  languages: LanguageLink[];
  locale: StoreLocale;
}) {
  return (
    <nav aria-label={copy[locale].languages} className="flex items-center gap-1">
      {languages.map((language, index) => (
        <span key={language.locale} className="flex items-center gap-1">
          {index > 0 ? <span aria-hidden="true" className="text-[#b9a5a0]">/</span> : null}
          <Link
            href={language.href}
            hrefLang={language.locale}
            aria-current={language.locale === locale ? "page" : undefined}
            className={cn(
              "rounded-sm px-1 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]",
              language.locale === locale ? "text-[#8b4255]" : "text-[#705e5b] hover:text-[#2b1e20]",
            )}
          >
            {language.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export function StoreHeader({
  accountHref,
  announcement,
  cartCount = 0,
  cartHref,
  homeHref,
  languages,
  locale,
  navLinks,
  onCartOpen,
  searchHref,
}: {
  accountHref: string;
  announcement?: string;
  cartCount?: number;
  cartHref: string;
  homeHref: string;
  languages: LanguageLink[];
  locale: StoreLocale;
  navLinks: StoreLink[];
  onCartOpen?: () => void;
  searchHref: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const labels = copy[locale];

  const cartLabel = `${labels.cart}${cartCount > 0 ? `, ${cartCount}` : ""}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#dfc9c4] bg-[#fffaf4]/95 text-[#2b1e20] backdrop-blur-md">
      {announcement ? (
        <p className="bg-[#8b4255] px-4 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white">
          {announcement}
        </p>
      ) : null}
      <Container className="flex h-[4.6rem] items-center justify-between gap-4 sm:h-20">
        <button
          type="button"
          aria-label={labels.menu}
          aria-expanded={menuOpen}
          className="grid size-11 place-items-center rounded-full hover:bg-[#f6e7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] lg:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Menu aria-hidden="true" size={21} strokeWidth={1.5} />
        </button>

        <div className="hidden min-w-0 flex-1 lg:block">
          <nav aria-label={labels.navigation}>
            <ul className="flex items-center gap-6 xl:gap-8">
              {navLinks.map((link, index) => (
                <li key={link.href} className={index > 3 ? "hidden xl:block" : undefined}>
                  <Link
                    href={link.href}
                    aria-current={link.active ? "page" : undefined}
                    className={cn(
                      "rounded-sm py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[#8b4255] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]",
                      link.active ? "text-[#8b4255]" : "text-[#2b1e20]",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="shrink-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Brand href={homeHref} />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher languages={languages} locale={locale} />
          </div>
          <Link
            href={searchHref}
            aria-label={labels.search}
            className="hidden size-11 place-items-center rounded-full hover:bg-[#f6e7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] sm:grid"
          >
            <Search aria-hidden="true" size={19} strokeWidth={1.5} />
          </Link>
          <Link
            href={accountHref}
            aria-label={labels.account}
            className="hidden size-11 place-items-center rounded-full hover:bg-[#f6e7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] md:grid"
          >
            <UserRound aria-hidden="true" size={19} strokeWidth={1.5} />
          </Link>
          {onCartOpen ? (
            <button
              type="button"
              aria-label={cartLabel}
              className="relative grid size-11 place-items-center rounded-full hover:bg-[#f6e7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
              onClick={onCartOpen}
            >
              <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.5} />
              {cartCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#8b4255] px-1 text-[0.58rem] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
          ) : (
            <Link
              href={cartHref}
              aria-label={cartLabel}
              className="relative grid size-11 place-items-center rounded-full hover:bg-[#f6e7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
            >
              <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.5} />
              {cartCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#8b4255] px-1 text-[0.58rem] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>
          )}
        </div>
      </Container>

      <Drawer
        closeLabel={labels.close}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="left"
        title={labels.menu}
        footer={<LanguageSwitcher languages={languages} locale={locale} />}
      >
        <nav aria-label={labels.navigation} className="px-5 py-4 sm:px-7">
          <ul className="divide-y divide-[#ead9d5]">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className="flex min-h-16 items-center justify-between py-3 font-serif text-3xl tracking-tight hover:text-[#8b4255] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <span aria-hidden="true" className="text-lg text-[#b56777]">↗</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <Link
              href={searchHref}
              className="flex min-h-12 items-center gap-3 rounded-full border border-[#dfc9c4] px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
              onClick={() => setMenuOpen(false)}
            >
              <Search aria-hidden="true" size={18} /> {labels.search}
            </Link>
            <Link
              href={accountHref}
              className="flex min-h-12 items-center gap-3 rounded-full border border-[#dfc9c4] px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
              onClick={() => setMenuOpen(false)}
            >
              <UserRound aria-hidden="true" size={18} /> {labels.account}
            </Link>
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
