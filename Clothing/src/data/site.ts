/* Central site configuration.
   Everything repeated across the interface lives here. */

import type { CollectionTile, LookbookEntry, SceneImageRef } from './types'

export const site = {
  name: 'VYRO',
  wordmark: 'VYRO',
  tagline: 'Independent streetwear. Considered essentials. Your point of view.',
  campaignLine: 'Less Noise. More Identity.',
  market: 'India',
  currency: 'INR',
  /* Configurable top strip. Set enabled: false to hide. */
  announcement: {
    enabled: true,
    text: 'THE FIRST DROP — COMING SOON',
  },
  /* Placeholder contact channel — replace with the verified brand inbox. */
  contactEmail: 'hello@vyro.in',
  /* Add verified handles here; unverified socials are never rendered as links. */
  social: [] as { label: string; href: string }[],
  socialPending: ['Instagram'],
} as const

export const nav = [
  { label: 'Shop', href: '/shop' },
  { label: 'New Drop', href: '/shop?category=essentials' },
  { label: 'Essentials', href: '/shop?category=essentials' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'Our Story', href: '/our-story' },
] as const

export const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Essentials', href: '/shop?category=essentials' },
    { label: 'Graphic Studies', href: '/shop?category=graphic-studies' },
    { label: 'Lookbook', href: '/lookbook' },
  ],
  support: [
    { label: 'Size Guide', href: '/policies/size-guide' },
    { label: 'Shipping', href: '/policies/shipping' },
    { label: 'Returns & Exchanges', href: '/policies/returns' },
    { label: 'Contact', href: '/policies/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms & Conditions', href: '/policies/terms' },
  ],
  brand: [
    { label: 'Our Story', href: '/our-story' },
  ],
} as const

/* Honest service strip — only claims that can be substantiated.
   Shipping thresholds, return windows and payment claims are intentionally
   omitted until store policies are configured. */
export const serviceStrip = [
  {
    label: 'Shipping',
    detail: 'Policy page',
    href: '/policies/shipping',
  },
  {
    label: 'Returns & Exchanges',
    detail: 'Policy page',
    href: '/policies/returns',
  },
  {
    label: 'Size & Fit Support',
    detail: 'Size guide',
    href: '/policies/size-guide',
  },
  {
    label: 'Contact',
    detail: site.contactEmail,
    href: '/policies/contact',
  },
] as const

export const homeContent = {
  hero: {
    eyebrow: 'VYRO / DROP 001',
    headline: 'Made to Stand Apart.',
    body: 'Everyday essentials. Considered fits. A different point of view.',
    primaryCta: { label: 'SHOP THE DROP', href: '/shop' },
    secondaryCta: { label: 'EXPLORE THE LOOKBOOK', href: '/lookbook' },
    utility: 'NEW SEASON / 001',
    image: {
      kind: 'campaign',
      view: 'full',
      tone: 'black',
      src: '/images/campaign-hero.webp',
      alt: 'Model in a white tee and black overalls crossing a city street',
      focus: 'center',
    } satisfies SceneImageRef,
  },
  values: [
    {
      label: 'CONSIDERED FIT',
      body: 'Proportions edited until they feel inevitable — oversized where it matters, precise everywhere else.',
    },
    {
      label: 'EVERYDAY UNIFORM',
      body: 'Pieces built to be worn on repeat, alone or layered, across seasons.',
    },
    {
      label: 'LIMITED PERSPECTIVE',
      body: 'Small, focused drops. Nothing extra, nothing borrowed.',
    },
  ],
  collection: {
    label: 'THE COLLECTION / 001',
    headline: 'Your Everyday, Reconsidered.',
    body: 'A focused selection of essentials designed to work together.',
  },
  featured: {
    label: 'THE FIRST DROP',
    headline: 'Pieces Worth Keeping.',
    body: 'Meet the essentials that define VYRO.',
  },
  campaign: {
    headline: 'Not here to fit in.',
    body: 'An expression of your own uniform.',
    cta: { label: 'DISCOVER VYRO', href: '/our-story' },
    image: {
      kind: 'campaign',
      view: 'onmodel',
      tone: 'charcoal',
      src: '/images/campaign-street.webp',
      alt: 'Model in a black tee and bucket hat walking a city street',
      focus: 'center',
    } satisfies SceneImageRef,
  },
  story: {
    label: 'THE VYRO POINT OF VIEW',
    headline: 'Less Noise. More Identity.',
    body: 'VYRO is built around the pieces you return to. Thoughtful silhouettes, restrained design, and room to make every look your own.',
    cta: { label: 'READ OUR STORY', href: '/our-story' },
    image: {
      kind: 'editorial',
      view: 'full',
      tone: 'bone',
      src: '/images/story-studio.webp',
      alt: 'Model in a bone tee seated in a studio with soft lighting',
      focus: 'center',
    } satisfies SceneImageRef,
  },
  lookbook: {
    title: 'Outside the Frame.',
    body: 'Three studies from the first drop — fit, fabric, and the city it was made for.',
  },
  newsletter: {
    headline: 'Be There From The Beginning.',
    body: 'Get first access to new drops, early releases, and what’s next at VYRO.',
    cta: 'GET EARLY ACCESS',
    note: 'No noise. Just the important things.',
    placeholder: 'Your email address',
  },
} as const

export const collections: CollectionTile[] = [
  {
    id: 'essentials',
    title: 'ESSENTIALS',
    blurb: 'Minimal, solid-colour oversized T-shirts.',
    href: '/shop?category=essentials',
    image: {
      kind: 'product',
      view: 'onmodel',
      tone: 'black',
      src: '/images/tee-black-model.webp',
      alt: 'Model wearing the black oversized essentials tee',
      focus: 'top',
    },
  },
  {
    id: 'graphic-studies',
    title: 'GRAPHIC STUDIES',
    blurb: 'Original graphic-led streetwear.',
    href: '/shop?category=graphic-studies',
    image: {
      kind: 'product',
      view: 'front',
      tone: 'bone',
      src: '/images/tee-graphic-back.webp',
      alt: 'Back view of a bone tee with a large tonal graphic print',
      focus: 'center',
    },
  },
  {
    id: 'lookbook',
    title: 'THE LOOKBOOK',
    blurb: 'Editorial styling and campaign imagery.',
    href: '/lookbook',
    image: {
      kind: 'lifestyle',
      view: 'full',
      tone: 'stone',
      src: '/images/lookbook-back.webp',
      alt: 'Bone tee worn against a marble wall, back view',
      focus: 'center',
    },
  },
]

export const lookbookEntries: LookbookEntry[] = [
  {
    id: 'frame-01',
    title: 'Full Study',
    caption: 'Full-body portrait — oversized tee, relaxed trouser.',
    image: {
      kind: 'editorial',
      view: 'full',
      tone: 'black',
      src: '/images/tee-black-model.webp',
      alt: 'Full-length portrait in the black oversized tee against a white wall',
      focus: 'center',
    },
    ratio: 'tall',
    href: '/lookbook#frame-01',
  },
  {
    id: 'frame-02',
    title: 'In Detail',
    caption: 'Neck rib, shoulder seam, hem stitch.',
    image: {
      kind: 'detail',
      view: 'detail',
      tone: 'bone',
      src: '/images/fabric-detail.webp',
      alt: 'Close-up of white cotton jersey texture and folds',
      focus: 'center',
    },
    ratio: 'square',
    href: '/lookbook#frame-02',
  },
  {
    id: 'frame-03',
    title: 'On The Street',
    caption: 'Candid movement, architectural backdrop.',
    image: {
      kind: 'lifestyle',
      view: 'full',
      tone: 'charcoal',
      src: '/images/campaign-street.webp',
      alt: 'Model in a black tee walking a city street past parked cars',
      focus: 'left',
    },
    ratio: 'wide',
    href: '/lookbook#frame-03',
  },
  {
    id: 'frame-04',
    title: 'Bone Study',
    caption: 'On-model fit — oversized block, dropped shoulder.',
    image: {
      kind: 'editorial',
      view: 'onmodel',
      tone: 'bone',
      src: '/images/tee-bone-studio.webp',
      alt: 'Bone tee styled in a studio with relaxed trousers',
      focus: 'top',
    },
    ratio: 'tall',
    href: '/lookbook#frame-04',
  },
  {
    id: 'frame-05',
    title: 'Print Study',
    caption: 'Graphic placement, neckline and collar rib.',
    image: {
      kind: 'detail',
      view: 'detail',
      tone: 'black',
      graphic: 'study-02',
      src: '/images/tee-graphic-street.webp',
      alt: 'Back view of a black graphic tee worn on the street',
      focus: 'center',
    },
    ratio: 'square',
    href: '/lookbook#frame-05',
  },
]

export const policies: Record<
  string,
  { title: string; intro: string; sections: { heading: string; body: string }[] }
> = {
  shipping: {
    title: 'Shipping',
    intro:
      'Shipping rates, delivery estimates and serviceable pincodes will be published here once the logistics partner and store policies are finalised.',
    sections: [
      {
        heading: 'Before launch',
        body: 'No shipping promises are made on this site yet. Rates, timelines and coverage will be added only after they are confirmed operationally.',
      },
      {
        heading: 'Order updates',
        body: 'Drop 001 shipping information will be shared with newsletter subscribers and published on this page at the same time.',
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    intro:
      'Our returns and exchange window is being finalised. The policy below will be replaced with the confirmed terms before the store accepts orders.',
    sections: [
      {
        heading: 'Before launch',
        body: 'Return windows, condition requirements and exchange processes will be listed here once approved. Nothing on this page should be treated as a current policy.',
      },
      {
        heading: 'Size exchanges',
        body: 'A size-exchange process for Drop 001 will be published alongside the shipping policy.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro:
      'This page will carry the full privacy policy once legal review is complete. The summary below describes the current behaviour of this website.',
    sections: [
      {
        heading: 'What this site stores',
        body: 'Your shopping bag and saved items are stored in your own browser (local storage) and are not sent to a server. Clearing your browser data removes them.',
      },
      {
        heading: 'Email',
        body: 'The newsletter form does not submit to any service yet. No email addresses are transmitted or stored by this site in its current state.',
      },
      {
        heading: 'What will change',
        body: 'When analytics, email or payment providers are connected, this policy will list them by name along with the data they process.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro:
      'Full terms of sale and site use are pending legal review. This page will be replaced with the approved terms before any transaction is accepted.',
    sections: [
      {
        heading: 'Catalogue status',
        body: 'Product listings, prices and availability on this site are pre-launch configuration. Prices are marked as draft and are not an offer to sell.',
      },
      {
        heading: 'Orders',
        body: 'Checkout is not connected. No orders can currently be placed or fulfilled through this website.',
      },
    ],
  },
  'size-guide': {
    title: 'Size Guide',
    intro:
      'VYRO uses an oversized, relaxed block across Drop 001. Measurements below are garment measurements in centimetres and are marked draft until confirmed against production samples.',
    sections: [
      {
        heading: 'How to measure',
        body: 'Lay the garment flat. Chest is measured 2cm below the armhole, seam to seam. Length is measured from the high point of the shoulder to the hem. Shoulder is seam to seam across the back. Sleeve is from the shoulder seam to the cuff edge.',
      },
      {
        heading: 'Body vs garment',
        body: 'These are garment measurements, not body measurements. Because the block is oversized, garment chest measurements sit well above typical body chest sizes — compare against a tee you already own rather than your body.',
      },
      {
        heading: 'Fit support',
        body: 'If you are between sizes and prefer a less oversized fit, size down. For fit questions before the drop, contact us and include your usual size and the product you are considering.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'Questions about the drop, sizing or collaborations — write to us.',
    sections: [
      {
        heading: 'Email',
        body: 'hello@vyro.in — this is a placeholder address in the pre-launch configuration and will be updated to the verified brand inbox before launch.',
      },
      {
        heading: 'Response times',
        body: 'No response-time promise is made before the store is staffed for support.',
      },
    ],
  },
}
