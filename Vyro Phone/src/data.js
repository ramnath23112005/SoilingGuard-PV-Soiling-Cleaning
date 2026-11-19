/* -- data.js — VYRO clothing catalog -- */
const u = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const FALLBACK_IMG = u('1521572163474-6864f9cf17ab');

export const CATEGORIES = [
  { id: 'women',       name: 'Women',       img: u('1515886657613-9f3515b0c78f', 500) },
  { id: 'men',         name: 'Men',         img: u('1552374196-1ab2a1c593e8', 500) },
  { id: 'shoes',       name: 'Shoes',       img: u('1549298916-b41d501d3772', 500) },
  { id: 'accessories', name: 'Accessories', img: u('1611652022419-a9419f74343d', 500) }
];

const APPAREL = ['XS', 'S', 'M', 'L', 'XL'];
const SHOES = ['38', '39', '40', '41', '42', '43'];
const ONE = ['One size'];

const BLACK = { name: 'Black', hex: '#1f1f1f' };
const WHITE = { name: 'White', hex: '#f4f2ee' };

export const products = [
  /* ---- Women ---- */
  {
    id: 'floral-wrap-dress', name: 'Floral Wrap Dress', group: 'women', category: 'Dress',
    price: 68, oldPrice: 95, rating: 4.7, reviews: 128, tags: ['new', 'bestseller'],
    colors: [{ name: 'Blush', hex: '#e8b4b8' }, BLACK], sizes: APPAREL,
    img: u('1595777457583-95e059d581b8'),
    desc: 'A breezy wrap silhouette in soft floral print. Cut to skim the waist and flow with every step — your go-to for brunches, dates, and warm evenings.',
    details: ['100% viscose, breathable weave', 'Adjustable waist tie', 'Midi length', 'Machine wash cold']
  },
  {
    id: 'satin-slip-dress', name: 'Satin Slip Dress', group: 'women', category: 'Dress',
    price: 89, oldPrice: null, rating: 4.6, reviews: 86, tags: ['new'],
    colors: [{ name: 'Champagne', hex: '#d9c3a3' }, BLACK], sizes: APPAREL,
    img: u('1539008835657-9e8e9680c956'),
    desc: 'Liquid satin with a subtle sheen. Bias-cut for a flawless drape — layer it under a blazer or wear it solo after dark.',
    details: ['Satin-finish polyester', 'Adjustable straps', 'Concealed side zip', 'Dry clean recommended']
  },
  {
    id: 'ribbed-knit-sweater', name: 'Ribbed Knit Sweater', group: 'women', category: 'Top',
    price: 59, oldPrice: 79, rating: 4.8, reviews: 212, tags: ['bestseller', 'sale'],
    colors: [{ name: 'Cream', hex: '#efe6d8' }, { name: 'Camel', hex: '#c8a98a' }], sizes: APPAREL,
    img: u('1576566588028-4147f3842f27'),
    desc: 'Cloud-soft ribbed knit with a relaxed shoulder and snug cuffs. The sweater you will live in from October to March.',
    details: ['Wool-cotton blend', 'Ribbed texture throughout', 'Relaxed fit', 'Hand wash cold']
  },
  {
    id: 'essential-white-tee', name: 'Essential White Tee', group: 'women', category: 'Top',
    price: 29, oldPrice: null, rating: 4.5, reviews: 430, tags: ['bestseller'],
    colors: [WHITE, BLACK], sizes: APPAREL,
    img: u('1521572163474-6864f9cf17ab'),
    desc: 'The perfect white tee does exist. Mid-weight organic cotton with a clean crew neck and just-right structure.',
    details: ['200gsm organic cotton', 'Pre-shrunk', 'Reinforced neckline', 'Machine wash']
  },
  {
    id: 'high-waist-jeans', name: 'High-Waist Straight Jeans', group: 'women', category: 'Jeans',
    price: 79, oldPrice: 99, rating: 4.6, reviews: 189, tags: ['sale'],
    colors: [{ name: 'Indigo', hex: '#3b4a6b' }, BLACK], sizes: APPAREL,
    img: u('1542272604-787c3835535d'),
    desc: 'Vintage-inspired straight leg in rigid-look stretch denim. Sits high on the waist, falls clean to the ankle.',
    details: ['98% cotton, 2% elastane', 'High rise', 'Five-pocket styling', 'Wash inside out cold']
  },
  {
    id: 'linen-blazer', name: 'Linen Blend Blazer', group: 'women', category: 'Jacket',
    price: 89, oldPrice: 120, rating: 4.7, reviews: 94, tags: ['sale'],
    colors: [{ name: 'Beige', hex: '#d9cbb3' }, { name: 'Navy', hex: '#2c3550' }], sizes: APPAREL,
    img: u('1591047139829-d91aecb6caea'),
    desc: 'Unstructured linen-blend blazer that works over tees and slip dresses alike. Lightly padded shoulder, single-button close.',
    details: ['Linen-cotton blend', 'Fully lined sleeves', 'Two flap pockets', 'Dry clean']
  },
  {
    id: 'cropped-denim-jacket', name: 'Cropped Denim Jacket', group: 'women', category: 'Jacket',
    price: 95, oldPrice: null, rating: 4.4, reviews: 67, tags: ['new'],
    colors: [{ name: 'Light Wash', hex: '#9db4c8' }], sizes: APPAREL,
    img: u('1608234808654-2a8875faa7fd'),
    desc: 'Cropped hits right at the waist. Light-wash rigid denim with contrast stitching and shacket-style oversized fit.',
    details: ['100% cotton denim', 'Oversized fit', 'Button front', 'Wash with like colours']
  },
  {
    id: 'pleated-midi-skirt', name: 'Pleated Midi Skirt', group: 'women', category: 'Skirt',
    price: 62, oldPrice: null, rating: 4.5, reviews: 52, tags: ['new'],
    colors: [BLACK, { name: 'Olive', hex: '#6b6b4a' }], sizes: APPAREL,
    img: u('1583496661160-fb5886a0aaaa'),
    desc: 'Sharp knife pleats with a fluid swing. Elastic-back waist for comfort that never shows.',
    details: ['Pleated polyester crepe', 'Elastic back waist', 'Midi length', 'Hand wash']
  },

  /* ---- Men ---- */
  {
    id: 'oxford-button-down', name: 'Oxford Button-Down', group: 'men', category: 'Shirt',
    price: 58, oldPrice: 75, rating: 4.7, reviews: 156, tags: ['bestseller', 'sale'],
    colors: [WHITE, { name: 'Sky', hex: '#bcd4e6' }], sizes: APPAREL,
    img: u('1596755094514-f87e34085b2c'),
    desc: 'A proper oxford — soft yet substantial, with a button-down collar that behaves tucked or untucked.',
    details: ['Oxford-weave cotton', 'Button-down collar', 'Curved hem', 'Machine wash warm']
  },
  {
    id: 'striped-cotton-shirt', name: 'Striped Cotton Shirt', group: 'men', category: 'Shirt',
    price: 52, oldPrice: null, rating: 4.5, reviews: 88, tags: [],
    colors: [{ name: 'Blue Stripe', hex: '#7a9cc6' }], sizes: APPAREL,
    img: u('1598033129183-c4f50c736f10'),
    desc: 'Classic nautical stripes on crisp cotton. Cut regular through the body with a clean point collar.',
    details: ['100% cotton poplin', 'Regular fit', 'Single chest pocket', 'Machine wash']
  },
  {
    id: 'essential-crew-tee', name: 'Essential Crew Tee', group: 'men', category: 'T-Shirt',
    price: 25, oldPrice: null, rating: 4.6, reviews: 512, tags: ['bestseller'],
    colors: [WHITE, BLACK, { name: 'Heather', hex: '#b0b0b0' }], sizes: APPAREL,
    img: u('1618354691373-d851c5c3a990'),
    desc: 'Heavyweight 220gsm cotton with a structured collar that will not warp. Built to outlast the trend cycle.',
    details: ['220gsm combed cotton', 'Shoulder-to-shoulder tape', 'Pre-shrunk', 'Machine wash']
  },
  {
    id: 'vintage-graphic-tee', name: 'Vintage Graphic Tee', group: 'men', category: 'T-Shirt',
    price: 32, oldPrice: null, rating: 4.4, reviews: 143, tags: ['new'],
    colors: [BLACK], sizes: APPAREL,
    img: u('1503341504253-dff4815485f1'),
    desc: 'Hand-screened vintage wash tee with a cracked-ink graphic. Each piece fades uniquely with wear.',
    details: ['Garment-dyed cotton', 'Puff-print graphic', 'Boxy fit', 'Wash inside out cold']
  },
  {
    id: 'slim-fit-jeans', name: 'Slim Fit Jeans', group: 'men', category: 'Jeans',
    price: 69, oldPrice: 89, rating: 4.6, reviews: 201, tags: ['sale'],
    colors: [{ name: 'Dark Wash', hex: '#2f3d52' }, BLACK], sizes: APPAREL,
    img: u('1541099649105-f69ad21f3246'),
    desc: 'Tapered through the thigh and knee with just enough stretch. Dark indigo finish dresses up or down.',
    details: ['99% cotton, 1% elastane', 'Mid rise', 'Zip fly', 'Wash cold, hang dry']
  },
  {
    id: 'denim-trucker-jacket', name: 'Denim Trucker Jacket', group: 'men', category: 'Jacket',
    price: 110, oldPrice: null, rating: 4.7, reviews: 76, tags: [],
    colors: [{ name: 'Mid Blue', hex: '#6f87a3' }], sizes: APPAREL,
    img: u('1544022613-e87ca75a784a'),
    desc: 'The trucker, done right. Mid-weight denim, point collar, chest flap pockets — broken-in from day one.',
    details: ['12oz cotton denim', 'Button front and cuffs', 'Two chest pockets', 'Wash sparingly']
  },
  {
    id: 'cozy-pullover-hoodie', name: 'Cozy Pullover Hoodie', group: 'men', category: 'Hoodie',
    price: 64, oldPrice: null, rating: 4.8, reviews: 267, tags: ['bestseller'],
    colors: [{ name: 'Grey', hex: '#9a9a9a' }, { name: 'Navy', hex: '#2c3550' }], sizes: APPAREL,
    img: u('1578681994506-b8f463449011'),
    desc: 'Heavyweight fleece with a double-layer hood and kangaroo pocket. The off-duty uniform.',
    details: ['400gsm brushed fleece', 'Double-layer hood', 'Ribbed cuffs and hem', 'Machine wash cold']
  },

  /* ---- Shoes ---- */
  {
    id: 'cloud-runner-sneakers', name: 'Cloud Runner Sneakers', group: 'shoes', category: 'Sneakers',
    price: 120, oldPrice: 150, rating: 4.7, reviews: 322, tags: ['bestseller', 'sale'],
    colors: [WHITE, { name: 'Grey', hex: '#c9c9c9' }], sizes: SHOES,
    img: u('1549298916-b41d501d3772'),
    desc: 'Featherlight knit upper on a responsive foam sole. From morning runs to all-day errands.',
    details: ['Breathable knit upper', 'Responsive foam midsole', 'Rubber grip outsole', 'True to size']
  },
  {
    id: 'court-classic-sneakers', name: 'Court Classic Sneakers', group: 'shoes', category: 'Sneakers',
    price: 95, oldPrice: null, rating: 4.5, reviews: 198, tags: [],
    colors: [WHITE, { name: 'Navy', hex: '#2c3550' }], sizes: SHOES,
    img: u('1560769629-975ec94e6a86'),
    desc: 'Clean court silhouette in smooth leather with a vulcanised sole. Pairs with everything.',
    details: ['Full-grain leather upper', 'Vulcanised rubber sole', 'Cushioned insole', 'True to size']
  },
  {
    id: 'strappy-block-heels', name: 'Strappy Block Heels', group: 'shoes', category: 'Heels',
    price: 79, oldPrice: 99, rating: 4.4, reviews: 87, tags: ['sale'],
    colors: [{ name: 'Nude', hex: '#dcc3ab' }, BLACK], sizes: SHOES,
    img: u('1543163521-1bf539c55dd2'),
    desc: 'Walk-all-day block heel with interlocking straps. The date-night heel that will not slow you down.',
    details: ['70mm block heel', 'Padded footbed', 'Ankle strap buckle', 'True to size']
  },
  {
    id: 'leather-chelsea-boots', name: 'Leather Chelsea Boots', group: 'shoes', category: 'Boots',
    price: 160, oldPrice: null, rating: 4.8, reviews: 112, tags: [],
    colors: [{ name: 'Brown', hex: '#6b4a32' }, BLACK], sizes: SHOES,
    img: u('1520639888713-7851133b1ed0'),
    desc: 'Blake-stitched Chelsea boots in oiled leather with elastic side gores and a leather sole.',
    details: ['Oiled full-grain leather', 'Elastic side gores', 'Leather sole with rubber insert', 'Half sizes up']
  },

  /* ---- Accessories ---- */
  {
    id: 'minimal-gold-watch', name: 'Minimal Gold Watch', group: 'accessories', category: 'Watch',
    price: 129, oldPrice: 160, rating: 4.8, reviews: 174, tags: ['bestseller', 'sale'],
    colors: [{ name: 'Gold', hex: '#d4af37' }], sizes: ONE,
    img: u('1523170335258-f5ed11844a49'),
    desc: 'Slim gold-tone case, sunray dial, and a mesh bracelet that slips under any cuff.',
    details: ['36mm stainless case', 'Japanese quartz movement', '5ATM water resistant', '2-year warranty']
  },
  {
    id: 'leather-tote-bag', name: 'Leather Tote Bag', group: 'accessories', category: 'Bag',
    price: 129, oldPrice: null, rating: 4.6, reviews: 145, tags: [],
    colors: [{ name: 'Tan', hex: '#b98d62' }, BLACK], sizes: ONE,
    img: u('1584916201218-f4242ceb4809'),
    desc: 'Structured vegetable-tanned leather tote with a laptop sleeve and magnetic closure. Work to weekend.',
    details: ['Vegetable-tanned leather', 'Fits 14" laptop', 'Magnetic top closure', 'Interior zip pocket']
  },
  {
    id: 'quilted-shoulder-bag', name: 'Quilted Shoulder Bag', group: 'accessories', category: 'Bag',
    price: 98, oldPrice: 130, rating: 4.5, reviews: 92, tags: ['new', 'sale'],
    colors: [BLACK, { name: 'Red', hex: '#a63a3a' }], sizes: ONE,
    img: u('1590874103328-eac38a683ce7'),
    desc: 'Diamond-quilted flap bag with a chain strap that converts to a double strap. Evening-ready.',
    details: ['Quilted vegan leather', 'Chain-and-leather strap', 'Flap magnetic closure', 'Adjustable strap']
  },
  {
    id: 'crossbody-sling-bag', name: 'Crossbody Sling Bag', group: 'accessories', category: 'Bag',
    price: 75, oldPrice: null, rating: 4.5, reviews: 108, tags: ['new'],
    colors: [BLACK, { name: 'Olive', hex: '#6b6b4a' }], sizes: ONE,
    img: u('1548036328-c9fa89d128fa'),
    desc: 'Hands-free sling in water-resistant nylon with a hidden anti-theft pocket. Festival to flight.',
    details: ['Water-resistant nylon', 'Hidden back pocket', 'Adjustable strap', 'YKK zippers']
  },
  {
    id: 'gold-hoop-earrings', name: 'Gold Hoop Earrings', group: 'accessories', category: 'Jewelry',
    price: 45, oldPrice: null, rating: 4.7, reviews: 210, tags: ['bestseller'],
    colors: [{ name: 'Gold', hex: '#d4af37' }], sizes: ONE,
    img: u('1535632066927-ab7c9ab60908'),
    desc: 'Everyday 25mm hoops in 14k gold vermeil. Lightweight, hypoallergenic, never take them off.',
    details: ['14k gold vermeil', 'Hypoallergenic post', '25mm diameter', 'Gift box included']
  },
  {
    id: 'pearl-pendant-necklace', name: 'Pearl Pendant Necklace', group: 'accessories', category: 'Jewelry',
    price: 58, oldPrice: 75, rating: 4.6, reviews: 134, tags: ['sale'],
    colors: [{ name: 'Pearl', hex: '#f0ece4' }], sizes: ONE,
    img: u('1599643478518-a784e5dc4c8f'),
    desc: 'A single freshwater pearl on a fine gold-filled chain. Quiet luxury for every neckline.',
    details: ['Freshwater pearl', '14k gold-filled chain', '16" + 2" extender', 'Tarnish resistant']
  },
  {
    id: 'classic-baseball-cap', name: 'Classic Baseball Cap', group: 'accessories', category: 'Cap',
    price: 35, oldPrice: null, rating: 4.5, reviews: 167, tags: [],
    colors: [BLACK, { name: 'Beige', hex: '#d9cbb3' }], sizes: ONE,
    img: u('1588850561407-ed78c282e89b'),
    desc: 'Unstructured six-panel cap in brushed cotton with a curved brim and adjustable strap.',
    details: ['Brushed cotton twill', 'Unstructured crown', 'Adjustable metal buckle', 'One size fits most']
  }
];

export const getProduct = id => products.find(p => p.id === id);

export const PROMOS = {
  WELCOME10: { pct: 10, label: '10% off' },
  SAVE15:    { pct: 15, label: '15% off' },
  VIP20:     { pct: 20, minSubtotal: 200, label: '20% off orders $200+' }
};

export const SHIPPING_METHODS = {
  standard: { label: 'Standard', note: '4–7 business days', cost: 5.95, freeOver: 75 },
  express:  { label: 'Express',  note: '1–2 business days', cost: 14.95, freeOver: null }
};

export const TAX_RATE = 0.08;
