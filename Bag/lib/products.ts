export type ProductImage = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  position?: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  swatch: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  href: string;
  price: number;
  colour: string;
  description: string;
  longDescription: string;
  variants: ProductVariant[];
  images: ProductImage[];
  specs: { label: string; value: string }[];
  note: string;
};

export const PRODUCT_IMAGES = {
  hero: { src: "/images/hero.jpg", width: 1600, height: 2400 },
  front: { src: "/images/product-front.jpg", width: 1500, height: 2250 },
  angle: { src: "/images/product-angle.jpg", width: 1500, height: 2250 },
  back: { src: "/images/product-back.jpg", width: 1500, height: 2250 },
  bench: { src: "/images/product-bench.jpg", width: 1500, height: 2005 },
  context: { src: "/images/product-context.jpg", width: 1600, height: 2133 },
  plinth: { src: "/images/product-plinth.jpg", width: 1800, height: 1200 },
  detailTop: { src: "/images/detail-zipper.jpg", width: 800, height: 365 },
  detailBuckle: { src: "/images/detail-buckles.jpg", width: 560, height: 360 },
  detailFabric: { src: "/images/detail-fabric.jpg", width: 600, height: 330 },
  detailPocket: { src: "/images/detail-pocket.jpg", width: 520, height: 700 },
  commute: { src: "/images/lifestyle-commute.jpg", width: 1500, height: 2250 },
  bridge: { src: "/images/lifestyle-bridge.jpg", width: 1500, height: 2250 },
  footbridge: { src: "/images/lifestyle-footbridge.jpg", width: 1500, height: 2250 },
} as const;

export const vyroOne: Product = {
  id: "vyro-one",
  slug: "vyro-one",
  name: "VYRO ONE",
  subtitle: "Everyday Backpack",
  href: "/products/vyro-one",
  price: 1299,
  colour: "Carbon Black",
  description:
    "A minimalist everyday backpack designed around a clean silhouette and practical utility.",
  longDescription:
    "VYRO ONE carries the things a day asks for — a laptop, notebooks, layers, a bottle — without announcing itself. The silhouette stays quiet, the proportions stay deliberate, and everything unnecessary was left out.",
  variants: [{ id: "carbon-black", name: "Carbon Black", swatch: "#1c1c1a" }],
  images: [
    {
      src: "/images/product-front.jpg",
      alt: "VYRO ONE everyday backpack photographed from the front on a quiet city street",
      caption: "Front",
      width: 1500,
      height: 2250,
    },
    {
      src: "/images/hero.jpg",
      alt: "VYRO ONE backpack at a three-quarter angle resting on a weathered plinth",
      caption: "Three-quarter",
      width: 1600,
      height: 2400,
    },
    {
      src: "/images/product-angle.jpg",
      alt: "VYRO ONE backpack in side profile on a plinth beside a shopfront",
      caption: "Side profile",
      width: 1500,
      height: 2250,
    },
    {
      src: "/images/product-back.jpg",
      alt: "VYRO ONE backpack worn on the back, showing the shoulder straps and rear panel",
      caption: "Back panel",
      width: 1500,
      height: 2250,
    },
    {
      src: "/images/detail-pocket.jpg",
      alt: "Close-up of the side pocket of the VYRO ONE holding a bottle",
      caption: "Side pocket",
      width: 520,
      height: 700,
    },
    {
      src: "/images/detail-fabric.jpg",
      alt: "Macro photograph of the woven fabric and stitching on the VYRO ONE flap",
      caption: "Fabric",
      width: 600,
      height: 330,
    },
    {
      src: "/images/detail-buckles.jpg",
      alt: "Macro photograph of the webbing and buckle hardware on the VYRO ONE",
      caption: "Hardware",
      width: 560,
      height: 360,
    },
    {
      src: "/images/detail-zipper.jpg",
      alt: "Close-up of the top handle and flap construction of the VYRO ONE",
      caption: "Construction",
      width: 800,
      height: 365,
    },
  ],
  specs: [
    { label: "Capacity", value: "Approx. 20–22 litres" },
    { label: "Dimensions", value: "Approx. 44 × 30 × 14 cm" },
    { label: "Laptop compartment", value: "Fits selected laptop sizes — sizes to be confirmed" },
    { label: "Material", value: "Durable polyester shell, padded shoulder straps" },
    { label: "Storage", value: "Main compartment with everyday storage pockets" },
    { label: "Colour", value: "Carbon Black" },
    { label: "Price", value: "₹1,299" },
  ],
  note:
    "Figures shown are provisional and will be confirmed after final production samples are inspected.",
};

export const products: Product[] = [vyroOne];

export const getProduct = (slug: string): Product | undefined =>
  products.find((product) => product.slug === slug);
