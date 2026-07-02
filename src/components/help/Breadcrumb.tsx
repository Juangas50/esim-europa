"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const locale = useLocale();

  return (
    <nav className="mb-8 sm:mb-12">
      <div className="flex items-center gap-2 text-sm text-[var(--color-ink-2)]">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={`/${locale}${item.href}`}
                className="text-[var(--color-gold)] hover:text-[var(--color-navy)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--color-navy)] font-semibold">
                {item.label}
              </span>
            )}

            {index < items.length - 1 && (
              <span className="text-[var(--color-ink-2)]">/</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
