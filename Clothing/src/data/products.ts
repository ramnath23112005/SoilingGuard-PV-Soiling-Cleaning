import type { Product, SizeGuideData } from './types'

/* Drop 001 catalogue.
   Prices are draft configuration values, flagged via pricingStatus.
   Fabric and care stay null until verified — they are not rendered as claims.
   Photography: free-licence Pexels stand-in shots (cropped WebP in
   public/images) until the brand shoot is delivered. The SVG scenes remain
   the fallback wherever a src is missing. */

const standardSizes = [
  { label: 'S', available: true },
  { label: 'M', available: true },
  { label: 'L', available: true },
  { label: 'XL', available: true },
  { label: 'XXL', available: true },
]

export const products: Product[] = [
  {
    id: 'vyro-essential-tee-black',
    slug: 'essential-tee-black',
    name: 'VYRO Essential Tee — Black',
    category: 'essentials',
    description:
      'The core of the wardrobe. A clean, oversized tee with a boxy body, dropped shoulder and a ribbed neck that holds its shape. Designed to be worn daily and layered without thought.',
    price: 2190,
    pricingStatus: 'draft',
    colors: [
      { name: 'Black', hex: '#151515', tone: 'black' },
    ],
    sizes: standardSizes.map((s) => ({ ...s })),
    availability: 'available',
    fit: 'Relaxed, oversized cut with a dropped shoulder. Size down for a regular fit.',
    fabric: null,
    care: null,
    images: [
      {
        kind: 'product',
        view: 'front',
        tone: 'black',
        src: '/images/tee-black-model.webp',
        alt: 'Model wearing the black oversized tee against a white wall',
      },
      {
        kind: 'product',
        view: 'back',
        tone: 'black',
        src: '/images/tee-black-studio.webp',
        alt: 'Studio portrait of the black tee against a dark backdrop',
        focus: 'top',
      },
      {
        kind: 'product',
        view: 'onmodel',
        tone: 'black',
        src: '/images/tee-black-street.webp',
        alt: 'Black oversized tee styled on the street with black trousers',
        focus: 'top',
      },
      {
        kind: 'detail',
        view: 'detail',
        tone: 'black',
        src: '/images/fabric-detail.webp',
        alt: 'Close-up of cotton jersey texture and folds',
      },
    ],
    tags: ['oversized tee', 'black', 'essential', 'streetwear'],
  },
  {
    id: 'vyro-essential-tee-bone',
    slug: 'essential-tee-bone',
    name: 'VYRO Essential Tee — Bone',
    category: 'essentials',
    description:
      'The same block in a warm off-white. Bone reads quieter than optical white and works against both dark and light layers. Cut oversized, finished with a clean hem.',
    price: 2190,
    pricingStatus: 'draft',
    colors: [
      { name: 'Bone', hex: '#E4DDCD', tone: 'bone' },
    ],
    sizes: [
      { label: 'S', available: true },
      { label: 'M', available: true },
      { label: 'L', available: true },
      { label: 'XL', available: false, note: 'Restocking with Drop 002' },
      { label: 'XXL', available: true },
    ],
    availability: 'available',
    fit: 'Relaxed, oversized cut with a dropped shoulder. Size down for a regular fit.',
    fabric: null,
    care: null,
    images: [
      {
        kind: 'product',
        view: 'front',
        tone: 'bone',
        src: '/images/tee-bone-front.webp',
        alt: 'Model wearing the bone oversized tee, front view on white',
      },
      {
        kind: 'product',
        view: 'back',
        tone: 'bone',
        src: '/images/tee-bone-back.webp',
        alt: 'Back view of the bone oversized tee on model',
      },
      {
        kind: 'product',
        view: 'onmodel',
        tone: 'bone',
        src: '/images/tee-bone-studio.webp',
        alt: 'Bone tee styled in a studio with relaxed trousers',
        focus: 'top',
      },
      {
        kind: 'detail',
        view: 'detail',
        tone: 'bone',
        src: '/images/tee-bone-detail.webp',
        alt: 'Close-up of the bone tee neckline and sleeve in natural light',
      },
    ],
    tags: ['oversized tee', 'bone', 'essential', 'off-white'],
  },
  {
    id: 'vyro-essential-tee-charcoal',
    slug: 'essential-tee-charcoal',
    name: 'VYRO Essential Tee — Charcoal',
    category: 'essentials',
    description:
      'A washed charcoal that sits between black and grey. Same oversized block, same restrained finish — built for the days when black is too much and light is too little.',
    price: 2190,
    pricingStatus: 'draft',
    colors: [
      { name: 'Charcoal', hex: '#3C3B39', tone: 'charcoal' },
    ],
    sizes: [
      { label: 'S', available: false, note: 'Not produced in this colourway' },
      { label: 'M', available: true },
      { label: 'L', available: true },
      { label: 'XL', available: true },
      { label: 'XXL', available: true },
    ],
    availability: 'available',
    fit: 'Relaxed, oversized cut with a dropped shoulder. Size down for a regular fit.',
    fabric: null,
    care: null,
    images: [
      {
        kind: 'product',
        view: 'front',
        tone: 'charcoal',
        src: '/images/tee-charcoal-studio.webp',
        alt: 'Model wearing the charcoal tee in a dark studio portrait',
        focus: 'top',
      },
      {
        kind: 'product',
        view: 'onmodel',
        tone: 'charcoal',
        src: '/images/tee-charcoal-moody.webp',
        alt: 'Charcoal tee worn on model against a grey studio backdrop',
        focus: 'top',
      },
      {
        kind: 'detail',
        view: 'detail',
        tone: 'charcoal',
        src: '/images/fabric-detail.webp',
        alt: 'Close-up of cotton jersey texture and folds',
      },
    ],
    tags: ['oversized tee', 'charcoal', 'essential', 'grey'],
  },
  {
    id: 'vyro-graphic-tee-01',
    slug: 'graphic-tee-concept-01',
    name: 'VYRO Graphic Tee — Concept 01',
    category: 'graphic-studies',
    description:
      'The first graphic study. A restrained front mark on the essential oversized block — small enough to live with, considered enough to notice. Part of Drop 001.',
    price: 2590,
    pricingStatus: 'draft',
    colors: [
      { name: 'Bone', hex: '#E4DDCD', tone: 'bone' },
      { name: 'Black', hex: '#151515', tone: 'black' },
    ],
    sizes: standardSizes.map((s) => ({ ...s })),
    availability: 'coming-soon',
    availabilityNote: 'Releasing with Drop 001. Join the list for first access.',
    fit: 'Relaxed, oversized cut with a dropped shoulder. Size down for a regular fit.',
    fabric: null,
    care: null,
    images: [
      {
        kind: 'product',
        view: 'front',
        tone: 'bone',
        graphic: 'study-01',
        src: '/images/tee-bone-front.webp',
        alt: 'Bone tee front view — graphic placement mock on the essential block',
      },
      {
        kind: 'product',
        view: 'back',
        tone: 'bone',
        graphic: 'mark',
        src: '/images/tee-graphic-back.webp',
        alt: 'Back view of a bone tee with a large tonal graphic print',
        focus: 'top',
      },
      {
        kind: 'detail',
        view: 'detail',
        tone: 'bone',
        graphic: 'study-01',
        src: '/images/tee-bone-detail.webp',
        alt: 'Close-up of the bone tee neckline and sleeve in natural light',
      },
      {
        kind: 'campaign',
        view: 'onmodel',
        tone: 'bone',
        src: '/images/lookbook-back.webp',
        alt: 'Bone tee worn against a marble wall, back view',
        focus: 'top',
      },
    ],
    tags: ['graphic tee', 'print', 'limited', 'bone'],
  },
  {
    id: 'vyro-graphic-tee-02',
    slug: 'graphic-tee-concept-02',
    name: 'VYRO Graphic Tee — Concept 02',
    category: 'graphic-studies',
    description:
      'The second study, darker. A larger back graphic with a quiet front mark, printed on the same oversized block. Limited run for Drop 001.',
    price: 2590,
    pricingStatus: 'draft',
    colors: [
      { name: 'Black', hex: '#151515', tone: 'black' },
      { name: 'Olive', hex: '#77745E', tone: 'olive' },
    ],
    sizes: standardSizes.map((s) => ({ ...s })),
    availability: 'coming-soon',
    availabilityNote: 'Releasing with Drop 001. Join the list for first access.',
    fit: 'Relaxed, oversized cut with a dropped shoulder. Size down for a regular fit.',
    fabric: null,
    care: null,
    images: [
      {
        kind: 'product',
        view: 'back',
        tone: 'black',
        graphic: 'study-02',
        src: '/images/tee-graphic-street.webp',
        alt: 'Back view of the black graphic tee worn on the street',
        focus: 'top',
      },
      {
        kind: 'product',
        view: 'front',
        tone: 'black',
        graphic: 'mark',
        src: '/images/tee-black-street.webp',
        alt: 'Black oversized tee styled on the street with black trousers',
        focus: 'top',
      },
      {
        kind: 'campaign',
        view: 'onmodel',
        tone: 'olive',
        src: '/images/tee-black-studio.webp',
        alt: 'Studio portrait of the black tee against a dark backdrop',
        focus: 'top',
      },
    ],
    tags: ['graphic tee', 'print', 'limited', 'olive'],
  },
]

/* Draft garment measurements (cm). Confirm against production samples and
   flip status to 'final' before launch. */
export const sizeGuide: SizeGuideData = {
  status: 'draft',
  unit: 'cm',
  measurementType: 'garment',
  rows: [
    { size: 'S', chest: 112, length: 70, shoulder: 52, sleeve: 22 },
    { size: 'M', chest: 118, length: 72, shoulder: 55, sleeve: 23 },
    { size: 'L', chest: 124, length: 74, shoulder: 58, sleeve: 24 },
    { size: 'XL', chest: 130, length: 76, shoulder: 61, sleeve: 25 },
    { size: 'XXL', chest: 136, length: 78, shoulder: 64, sleeve: 26 },
  ],
  notes: [
    'Garment measurements, laid flat, in centimetres.',
    'Tolerance of ±1cm is normal across production runs.',
    'Compare against a tee you already own rather than your body measurements.',
  ],
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category,
  )
  const others = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category !== product.category,
  )
  return [...sameCategory, ...others].slice(0, count)
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return products.filter((product) => {
    const haystack = [product.name, product.description, product.category, ...product.tags]
      .join(' ')
      .toLowerCase()
    return q.split(/\s+/).every((token) => haystack.includes(token))
  })
}

export const categoryLabels: Record<Product['category'], string> = {
  essentials: 'Essentials',
  'graphic-studies': 'Graphic Studies',
}
