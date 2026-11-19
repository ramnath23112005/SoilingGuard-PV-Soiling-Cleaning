/* VYRO — structured content types.
   All product attributes are editable data. Attributes that are not yet
   verified (fabric, care, final pricing) are either null or flagged draft
   and must not be rendered as factual claims. */

export type ProductStatus = 'available' | 'coming-soon' | 'sold-out'

export type PricingStatus = 'draft' | 'final'

/** Tones drive the temporary placeholder artwork until real photography lands. */
export type GarmentTone = 'black' | 'bone' | 'charcoal' | 'olive' | 'stone'

export type SceneKind = 'campaign' | 'product' | 'detail' | 'lifestyle' | 'editorial'

export type SceneView = 'front' | 'back' | 'detail' | 'onmodel' | 'portrait' | 'full'

/** Reference to an image. When `src` is set, the real photograph renders;
    the SVG placeholder fields remain as the art-direction spec and fallback. */
export interface SceneImageRef {
  kind: SceneKind
  view: SceneView
  tone: GarmentTone
  alt: string
  focus?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  /** Print treatment shown on graphic studies. */
  graphic?: 'mark' | 'study-01' | 'study-02'
  /** Path to a real photograph (public/images). Falls back to the SVG scene if missing. */
  src?: string
}

export interface ProductColorOption {
  name: string
  hex: string
  tone: GarmentTone
}

export interface ProductSizeOption {
  label: string
  available: boolean
  /** Shown when a size is unavailable. e.g. "Restocking with Drop 002" */
  note?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: 'essentials' | 'graphic-studies'
  description: string
  /** Price in INR. Draft values until the brand confirms final pricing. */
  price: number
  pricingStatus: PricingStatus
  compareAtPrice?: number
  colors: ProductColorOption[]
  sizes: ProductSizeOption[]
  availability: ProductStatus
  availabilityNote?: string
  /** Editable fit copy — update once fit is locked with production samples. */
  fit: string
  /** Only publish when verified. */
  fabric: string | null
  /** Only publish when verified. */
  care: string | null
  images: SceneImageRef[]
  tags: string[]
}

export interface CollectionTile {
  id: string
  title: string
  blurb: string
  href: string
  image: SceneImageRef
}

export interface LookbookEntry {
  id: string
  title: string
  caption: string
  image: SceneImageRef
  /** Span behaviour in the editorial grid */
  ratio: 'tall' | 'wide' | 'square'
  href: string
}

export interface SizeChartRow {
  size: string
  /** Garment measurements in centimetres */
  chest: number
  length: number
  shoulder: number
  sleeve: number
}

export interface SizeGuideData {
  /** Draft measurements — confirm against production samples before launch. */
  status: PricingStatus
  unit: 'cm'
  measurementType: 'garment'
  rows: SizeChartRow[]
  notes: string[]
}
