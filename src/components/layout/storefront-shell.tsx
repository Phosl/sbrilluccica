"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { CartDrawer } from "@/components/storefront/cart";
import { StoreFooter } from "@/components/storefront/footer";
import { StoreHeader } from "@/components/storefront/header";
import { CommerceProvider, useCommerce } from "@/components/providers/commerce-provider";
import { NewsletterSignup } from "@/components/providers/newsletter-signup";
import type { Locale } from "@/lib/domain";
import { getCopy } from "@/lib/i18n/copy";
import { localizedPath } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/site";

function currentPathWithoutLocale(pathname: string): string {
  const path = pathname.replace(/^\/(?:it|en)(?=\/|$)/, "");
  return path || "/";
}

function Chrome({
  children,
  demoMode,
  locale,
}: {
  children: ReactNode;
  demoMode: boolean;
  locale: Locale;
}) {
  const pathname = usePathname();
  const [cartOpenedOnPath, setCartOpenedOnPath] = useState<string | null>(null);
  const cartOpen = cartOpenedOnPath === pathname;
  const { cart, removeItem, setQuantity } = useCommerce();
  const copy = getCopy(locale);
  const currentPath = currentPathWithoutLocale(pathname);
  const path = (value: string) => localizedPath(locale, value);

  const navLinks = [
    { href: path("/shop?sort=new"), label: copy.nav.newArrivals },
    { href: path("/shop"), label: copy.nav.shop, active: currentPath === "/shop" },
    { href: path("/category/collane-artigianali-etniche"), label: copy.nav.collections },
    { href: path("/our-story"), label: copy.nav.story, active: currentPath === "/our-story" },
    { href: path("/contact"), label: copy.nav.contact, active: currentPath === "/contact" },
  ];

  const footerGroups = [
    {
      title: copy.footer.shop,
      links: [
        { href: path("/shop"), label: copy.nav.shop },
        { href: path("/shop?sort=new"), label: copy.nav.newArrivals },
        { href: path("/wishlist"), label: copy.nav.wishlist },
      ],
    },
    {
      title: copy.footer.help,
      links: [
        { href: path("/contact"), label: copy.footer.contact },
        { href: path("/shipping-policy"), label: copy.footer.shipping },
        { href: path("/refund-policy"), label: copy.footer.returns },
      ],
    },
    {
      title: locale === "it" ? "Informazioni" : "Information",
      links: [
        { href: path("/terms-conditions"), label: copy.footer.terms },
        { href: path("/privacy-policy"), label: copy.footer.privacy },
        { href: path("/accessibility-statement"), label: copy.footer.accessibility },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        {locale === "it" ? "Vai al contenuto" : "Skip to content"}
      </a>
      <div className="sticky top-0 z-50">
        <StoreHeader
          accountHref={path("/account")}
          announcement={copy.announcement}
          cartCount={cart.itemCount}
          cartHref={path("/cart")}
          homeHref={path("/")}
          languages={[
            { href: localizedPath("it", currentPath), label: "IT", locale: "it" },
            { href: localizedPath("en", currentPath), label: "EN", locale: "en" },
          ]}
          locale={locale}
          navLinks={navLinks}
          onCartOpen={() => setCartOpenedOnPath(pathname)}
          searchHref={path("/shop?focus=search")}
        />
      </div>

      <div className="flex flex-1 flex-col">{children}</div>

      <NewsletterSignup locale={locale} />
      <StoreFooter
        brandStatement={
          locale === "it"
            ? "Gioielli nati dall’incontro tra il gusto di Gaia, i viaggi in Asia e il sapere di artigiani indiani."
            : "Jewellery born from Gaia’s eye, travels through Asia and the skill of Indian artisans."
        }
        email={siteConfig.supportEmail}
        groups={footerGroups}
        instagramHref={siteConfig.instagram}
        legalNote={
          demoMode
            ? locale === "it"
              ? "Pre-produzione · dati e checkout in modalità mock"
              : "Pre-production · mock data and checkout"
            : copy.footer.copyright
        }
        locale={locale}
      />

      <CartDrawer
        actions={{ onQuantityChange: setQuantity, onRemove: removeItem }}
        cart={cart}
        cartHref={path("/cart")}
        checkoutHref={path("/checkout")}
        hrefForItem={(item) => path(`/product-page/${item.productSlug}`)}
        locale={locale}
        onClose={() => setCartOpenedOnPath(null)}
        open={cartOpen}
        shippingMessage={
          locale === "it"
            ? "Costi e tempi vengono calcolati per la destinazione al checkout."
            : "Costs and timing are calculated for your destination at checkout."
        }
        shopHref={path("/shop")}
      />
    </div>
  );
}

export function StorefrontShell({
  children,
  demoMode,
  locale,
}: {
  children: ReactNode;
  demoMode: boolean;
  locale: Locale;
}) {
  return (
    <CommerceProvider locale={locale}>
      <Chrome demoMode={demoMode} locale={locale}>
        {children}
      </Chrome>
    </CommerceProvider>
  );
}
