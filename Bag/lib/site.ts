export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const brand = {
  name: "VYRO",
  tagline: "CARRY YOUR WORLD.",
  positioning: "Premium design. Everyday purpose.",
  description:
    "VYRO makes thoughtfully designed everyday essentials. VYRO ONE is a minimalist everyday backpack built around a clean silhouette and practical utility.",
} as const;

export const announcement = "INTRODUCING VYRO ONE — DESIGNED FOR EVERY DAY.";

export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [{ label: "Shop", href: "/shop" }];

export const mainNav: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Our philosophy", href: "/about" },
  { label: "Support", href: "/legal#support" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Shop",
    items: [
      { label: "All bags", href: "/shop" },
      { label: "VYRO ONE", href: "/products/vyro-one" },
    ],
  },
  {
    title: "House",
    items: [
      { label: "Our philosophy", href: "/about" },
      { label: "The VYRO Letter", href: "#the-vyro-letter" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Shipping", href: "/legal#shipping" },
      { label: "Returns", href: "/legal#returns" },
      { label: "Contact", href: "/legal#contact" },
      { label: "Privacy policy", href: "/legal#privacy" },
      { label: "Terms & conditions", href: "/legal#terms" },
    ],
  },
];

export const formatPrice = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
