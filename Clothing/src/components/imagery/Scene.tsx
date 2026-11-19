import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/utils'
import type { GarmentTone, SceneKind, SceneView } from '../../data/types'

/* -------------------------------------------------------------------------- */
/*  Temporary placeholder artwork.                                            */
/*  Art-directed SVG stand-ins for the campaign and product photography        */
/*  shoots. They state the intended crop, tone and composition, and are        */
/*  replaced by real AVIF/WebP assets when delivered.                          */
/* -------------------------------------------------------------------------- */

interface TonePalette {
  cloth: string
  clothShade: string
  clothLine: string
  contrast: 'light' | 'dark'
}

const TONES: Record<GarmentTone, TonePalette> = {
  black: { cloth: '#1B1B1B', clothShade: '#0E0E0E', clothLine: '#333333', contrast: 'dark' },
  bone: { cloth: '#E7E0D0', clothShade: '#D2C9B4', clothLine: '#BDB39C', contrast: 'light' },
  charcoal: { cloth: '#45443F', clothShade: '#34332F', clothLine: '#5A5952', contrast: 'dark' },
  olive: { cloth: '#7A7760', clothShade: '#63604D', clothLine: '#8F8C74', contrast: 'dark' },
  stone: { cloth: '#B9B2A4', clothShade: '#A39C8D', clothLine: '#8E8779', contrast: 'light' },
}

const SKIN = ['#C39A79', '#A97B5B', '#8D6248', '#D2AE90']

function hashTone(tone: GarmentTone, view: string): number {
  const source = `${tone}:${view}`
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 997
  }
  return hash
}

export interface SceneImageProps {
  kind: SceneKind
  view?: SceneView
  tone?: GarmentTone
  alt: string
  focus?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  graphic?: 'mark' | 'study-01' | 'study-02'
  /** Real photograph path. When set it renders instead of the SVG stand-in. */
  src?: string
  /** Wide editorial framing for full-bleed banners. */
  frame?: 'auto' | 'wide'
  className?: string
  style?: CSSProperties
  loading?: 'lazy' | 'eager'
  /** Hide the small "placeholder" corner mark in dense UI (thumbnails). */
  showMark?: boolean
}

const FOCUS_POSITION: Record<string, string> = {
  center: '50% 50%',
  top: '50% 22%',
  bottom: '50% 78%',
  left: '22% 50%',
  right: '78% 50%',
}

export function SceneImage({
  kind,
  view = 'full',
  tone = 'bone',
  alt,
  focus = 'center',
  graphic,
  src,
  frame = 'auto',
  className,
  style,
  loading = 'lazy',
  showMark = true,
}: SceneImageProps) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '')
  const palette = TONES[tone]
  const skin = SKIN[hashTone(tone, view) % SKIN.length]

  if (src && !photoFailed) {
    return (
      <div className={cn('relative overflow-hidden bg-stone', className)} style={style}>
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setPhotoFailed(true)}
          className="h-full w-full object-cover"
          style={{ objectPosition: FOCUS_POSITION[focus] ?? FOCUS_POSITION.center }}
        />
      </div>
    )
  }

  const { viewBox, content } = composeScene({
    kind,
    view,
    tone,
    palette,
    skin,
    graphic,
    uid,
    focus,
    frame,
  })

  return (
    <div
      className={cn('relative overflow-hidden bg-stone', className)}
      style={style}
      data-loading={loading}
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={alt}
        className="h-full w-full"
      >
        <SceneDefs uid={uid} palette={palette} />
        {content}
        <rect
          width="100%"
          height="100%"
          fill={`url(#grain-${uid})`}
          opacity={kind === 'detail' ? 0.09 : 0.15}
          style={{ mixBlendMode: 'multiply' }}
        />
        <rect width="100%" height="100%" fill={`url(#vignette-${uid})`} />
      </svg>
      {showMark ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-3 label-xs bg-ivory/75 px-1.5 py-1 text-ink/45"
        >
          Placeholder
        </span>
      ) : null}
    </div>
  )
}

/* ---------------------------------- defs --------------------------------- */

function SceneDefs({ uid, palette }: { uid: string; palette: TonePalette }) {
  return (
    <defs>
      <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves={2} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <filter id={`blur-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
      <radialGradient id={`vignette-${uid}`} cx="50%" cy="46%" r="80%">
        <stop offset="58%" stopColor="#151515" stopOpacity="0" />
        <stop offset="100%" stopColor="#151515" stopOpacity="0.13" />
      </radialGradient>
      <linearGradient id={`wall-${uid}`} x1="0" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="#F1EDE4" />
        <stop offset="100%" stopColor="#E2DCCF" />
      </linearGradient>
      <linearGradient id={`studio-${uid}`} x1="0.12" y1="0" x2="0.88" y2="1">
        <stop offset="0%" stopColor="#F8F5EF" />
        <stop offset="100%" stopColor="#EAE4D8" />
      </linearGradient>
      <linearGradient id={`light-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
        <stop offset="62%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EFEAE1" />
        <stop offset="100%" stopColor="#E0D9CC" />
      </linearGradient>
      <linearGradient id={`cloth-${uid}`} x1="0.12" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stopColor={palette.cloth} />
        <stop offset="100%" stopColor={palette.clothShade} />
      </linearGradient>
      <pattern id={`weave-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill={palette.cloth} />
        <path d="M0 4H8M4 0V8" stroke={palette.clothLine} strokeWidth="0.7" opacity="0.55" />
        <circle cx="2" cy="2" r="0.55" fill={palette.clothLine} opacity="0.35" />
        <circle cx="6" cy="6" r="0.55" fill={palette.clothLine} opacity="0.28" />
      </pattern>
    </defs>
  )
}

/* --------------------------------- scenes -------------------------------- */

interface ComposedScene {
  viewBox: string
  content: ReactNode
}

type Focus = 'center' | 'top' | 'bottom' | 'left' | 'right'

function composeScene(args: {
  kind: SceneKind
  view: SceneView
  tone: GarmentTone
  palette: TonePalette
  skin: string
  graphic?: 'mark' | 'study-01' | 'study-02'
  uid: string
  focus: Focus
  frame: 'auto' | 'wide'
}): ComposedScene {
  const { kind, view, uid, focus, frame } = args

  if (kind === 'detail' || (kind === 'product' && view === 'detail')) {
    return {
      viewBox: '0 0 800 1000',
      content: <DetailScene uid={uid} palette={args.palette} graphic={args.graphic} />,
    }
  }

  if (kind === 'lifestyle') {
    return {
      viewBox: '0 0 1600 900',
      content: <LifestyleScene uid={uid} tone={args.tone} skin={args.skin} />,
    }
  }

  if (frame === 'wide') {
    return {
      viewBox: '0 0 1600 700',
      content: (
        <WideFigureScene
          uid={uid}
          tone={args.tone}
          skin={args.skin}
          variant={kind === 'editorial' ? 'wall' : 'urban'}
        />
      ),
    }
  }

  if (kind === 'product') {
    if (view === 'onmodel' || view === 'portrait') {
      return {
        viewBox: cropFor(view, focus),
        content: <FigureScene uid={uid} tone={args.tone} skin={args.skin} variant="studio" />,
      }
    }
    return {
      viewBox: '0 0 800 1000',
      content: <FlatTeeScene uid={uid} tone={args.tone} view={view} graphic={args.graphic} />,
    }
  }

  return {
    viewBox: cropFor(view, focus),
    content: (
      <FigureScene
        uid={uid}
        tone={args.tone}
        skin={args.skin}
        variant={kind === 'editorial' ? 'wall' : 'urban'}
        view={view}
      />
    ),
  }
}

/** Crop windows into the shared 800×1000 figure stage, nudged by focus. */
function cropFor(view: SceneView, focus: Focus): string {
  const crops: Record<SceneView, [number, number, number, number]> = {
    portrait: [248, 56, 304, 400],
    onmodel: [216, 64, 368, 470],
    detail: [300, 170, 200, 250],
    front: [0, 0, 800, 1000],
    back: [0, 0, 800, 1000],
    full: [0, 0, 800, 1000],
  }
  const [x, y, w, h] = crops[view] ?? crops.full
  const nudge = 40
  const shiftX = focus === 'left' ? nudge : focus === 'right' ? -nudge : 0
  const shiftY = focus === 'top' ? nudge : focus === 'bottom' ? -nudge : 0
  return `${x + shiftX} ${y + shiftY} ${w} ${h}`
}

/* ------------------------------- flat tee -------------------------------- */

const TEE_PATH = `M 262 252
  Q 400 284 538 252
  L 588 264
  L 674 322
  L 656 428
  L 562 402
  L 570 646
  Q 400 664 230 646
  L 238 402
  L 144 428
  L 126 322
  L 212 264
  Z`

function FlatTeeScene({
  uid,
  tone,
  view,
  graphic,
}: {
  uid: string
  tone: GarmentTone
  view: SceneView
  graphic?: 'mark' | 'study-01' | 'study-02'
}) {
  const palette = TONES[tone]
  const isBack = view === 'back'
  const printInk = palette.contrast === 'dark' ? '#E7E0D0' : '#151515'

  return (
    <>
      <rect width="800" height="1000" fill={`url(#studio-${uid})`} />
      <rect width="800" height="1000" fill={`url(#light-${uid})`} />
      <path d="M0 742H800" stroke="#D8D1C2" strokeWidth="1.5" />
      <ellipse cx="400" cy="748" rx="230" ry="16" fill="#151515" opacity="0.07" filter={`url(#blur-${uid})`} />

      <g>
        {/* body */}
        <path d={TEE_PATH} fill={`url(#cloth-${uid})`} />
        {/* shading — light from upper left */}
        <path
          d="M400 276 L538 252 L588 264 L674 322 L656 428 L562 402 L570 646 Q470 658 400 660 Z"
          fill={palette.clothShade}
          opacity="0.32"
        />
        {/* drape */}
        <path d="M312 330 Q318 470 310 610" stroke={palette.clothLine} strokeWidth="1.8" fill="none" opacity="0.3" />
        <path d="M486 330 Q480 480 490 616" stroke={palette.clothLine} strokeWidth="1.8" fill="none" opacity="0.22" />
        <path d="M400 348 Q404 500 398 624" stroke={palette.clothLine} strokeWidth="1.2" fill="none" opacity="0.14" />
        {/* collar rib */}
        <path d="M262 252 Q400 284 538 252" fill="none" stroke={palette.clothLine} strokeWidth="10" strokeLinecap="round" opacity="0.92" />
        <path d="M272 264 Q400 294 528 264" fill="none" stroke={palette.clothShade} strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
        {/* sleeve seams */}
        <path d="M214 288 L232 400" stroke={palette.clothLine} strokeWidth="1.6" opacity="0.4" />
        <path d="M586 288 L568 400" stroke={palette.clothLine} strokeWidth="1.6" opacity="0.32" />
        {/* stitching */}
        <path d="M150 414 Q200 396 236 408" fill="none" stroke={palette.clothLine} strokeWidth="1.8" strokeDasharray="7 7" opacity="0.75" />
        <path d="M564 408 Q600 396 650 414" fill="none" stroke={palette.clothLine} strokeWidth="1.8" strokeDasharray="7 7" opacity="0.6" />
        <path d="M242 632 Q400 650 558 632" fill="none" stroke={palette.clothLine} strokeWidth="1.8" strokeDasharray="7 7" opacity="0.65" />
        {/* side vents */}
        <path d="M230 616 V646" stroke={palette.clothShade} strokeWidth="3" opacity="0.7" />
        <path d="M570 616 V646" stroke={palette.clothShade} strokeWidth="3" opacity="0.7" />
      </g>

      {/* print treatments */}
      {isBack ? (
        graphic === 'study-02' ? (
          <g opacity="0.94">
            <circle cx="400" cy="430" r="104" fill="none" stroke={printInk} strokeWidth="3" />
            <circle cx="400" cy="430" r="74" fill="none" stroke={printInk} strokeWidth="1.2" opacity="0.75" />
            <path d="M400 326V534M296 430H504" stroke={printInk} strokeWidth="1.2" opacity="0.5" />
            <text
              x="400"
              y="580"
              textAnchor="middle"
              fontSize="26"
              letterSpacing="11"
              fill={printInk}
              fontFamily="Inter Variable, Inter, sans-serif"
              fontWeight="600"
              opacity="0.9"
            >
              VYRO
            </text>
          </g>
        ) : graphic === 'mark' || graphic === 'study-01' ? (
          <text
            x="400"
            y="330"
            textAnchor="middle"
            fontSize="20"
            letterSpacing="9"
            fill={printInk}
            opacity="0.65"
            fontFamily="Inter Variable, Inter, sans-serif"
            fontWeight="600"
          >
            VYRO
          </text>
        ) : null
      ) : graphic === 'mark' || graphic === 'study-01' ? (
        <g opacity="0.94">
          <rect x="362" y="416" width="76" height="76" fill="none" stroke={printInk} strokeWidth="2.6" />
          <text
            x="400"
            y="466"
            textAnchor="middle"
            fontSize="30"
            fontWeight="600"
            fill={printInk}
            fontFamily="Inter Variable, Inter, sans-serif"
          >
            V
          </text>
          <text
            x="400"
            y="524"
            textAnchor="middle"
            fontSize="14"
            letterSpacing="7"
            fill={printInk}
            opacity="0.75"
            fontFamily="Inter Variable, Inter, sans-serif"
          >
            VYRO
          </text>
        </g>
      ) : null}

      <text
        x="732"
        y="920"
        textAnchor="end"
        fontSize="13"
        letterSpacing="4"
        fill="#77736D"
        fontFamily="Inter Variable, Inter, sans-serif"
      >
        {isBack ? 'BACK' : 'FRONT'}
      </text>
    </>
  )
}

/* -------------------------------- figure --------------------------------- */

/** Shared figure body — used by the portrait stage and the wide banner stage. */
function FigureBody({
  uid,
  palette,
  skin,
  trouser,
  scale = 1,
}: {
  uid: string
  palette: TonePalette
  skin: string
  trouser: string
  scale?: number
}) {
  return (
    <g transform={scale === 1 ? undefined : `translate(${400 - 400 * scale} ${812 - 812 * scale}) scale(${scale})`}>
      {/* cast shadow */}
      <ellipse cx="404" cy="812" rx="170" ry="20" fill="#151515" opacity="0.17" filter={`url(#blur-${uid})`} />

      {/* legs — straight, slight stance */}
      <path d="M312 470 L398 500 L392 802 L318 802 Z" fill={trouser} />
      <path d="M402 500 L490 470 L486 802 L410 802 Z" fill={trouser} opacity="0.9" />
      <path d="M330 560 L336 760" stroke="#FFFFFF" strokeOpacity="0.05" strokeWidth="12" />
      <path d="M462 560 L456 760" stroke="#FFFFFF" strokeOpacity="0.04" strokeWidth="12" />
      {/* shoes */}
      <path d="M312 794 L394 794 L400 824 Q350 836 300 824 Z" fill="#141414" />
      <path d="M408 794 L490 794 L502 824 Q450 836 404 824 Z" fill="#0D0D0D" />

      {/* tee — oversized, mid-hip length */}
      <path
        d="M312 206
           Q400 230 488 206
           L528 218
           L588 268
           L568 372
           L508 352
           L516 472
           Q400 488 284 472
           L292 352
           L232 372
           L212 268
           L272 218
           Z"
        fill={`url(#cloth-${uid})`}
      />
      <path
        d="M400 230 L488 206 L528 218 L588 268 L568 372 L508 352 L516 472 Q458 480 400 482 Z"
        fill={palette.clothShade}
        opacity="0.3"
      />
      <path d="M334 280 Q340 370 334 452" stroke={palette.clothLine} strokeWidth="1.8" fill="none" opacity="0.28" />
      <path d="M462 280 Q458 374 466 456" stroke={palette.clothLine} strokeWidth="1.8" fill="none" opacity="0.2" />
      <path d="M312 206 Q400 230 488 206" fill="none" stroke={palette.clothLine} strokeWidth="9" strokeLinecap="round" opacity="0.88" />

      {/* arms */}
      <path d="M248 356 C236 400 234 440 244 476" stroke={skin} strokeWidth="36" strokeLinecap="round" fill="none" />
      <path d="M552 356 C564 400 566 440 556 476" stroke={skin} strokeWidth="36" strokeLinecap="round" fill="none" />
      <ellipse cx="246" cy="486" rx="17" ry="20" fill={skin} />
      <ellipse cx="554" cy="486" rx="17" ry="20" fill={skin} />

      {/* head + neck */}
      <rect x="384" y="168" width="32" height="44" rx="15" fill={skin} />
      <ellipse cx="400" cy="124" rx="41" ry="51" fill={skin} />
      <path d="M359 114 Q364 66 400 64 Q438 64 442 114 Q432 92 400 90 Q368 92 359 114 Z" fill="#1B1613" />
      <path d="M442 114 Q452 144 438 162" stroke="#1B1613" strokeWidth="9" strokeLinecap="round" fill="none" />
    </g>
  )
}

function FigureScene({
  uid,
  tone,
  skin,
  variant,
  view,
}: {
  uid: string
  tone: GarmentTone
  skin: string
  variant: 'studio' | 'urban' | 'wall'
  view?: SceneView
}) {
  const palette = TONES[tone]
  const trouser = tone === 'black' || tone === 'charcoal' ? '#2C2B28' : '#3A3833'

  return (
    <>
      {variant === 'studio' ? (
        <>
          <rect width="800" height="1000" fill={`url(#studio-${uid})`} />
          <rect width="800" height="1000" fill={`url(#light-${uid})`} />
          <path d="M0 812H800" stroke="#D9D2C3" strokeWidth="1.5" />
        </>
      ) : variant === 'wall' ? (
        <>
          <rect width="800" height="1000" fill={`url(#wall-${uid})`} />
          <rect x="40" y="0" width="14" height="1000" fill="#151515" opacity="0.05" />
          <rect x="712" y="0" width="88" height="1000" fill="#151515" opacity="0.06" />
          <rect x="86" y="180" width="104" height="286" fill="#EFE9DE" opacity="0.55" />
          <rect x="86" y="180" width="104" height="286" fill="none" stroke="#151515" strokeOpacity="0.1" strokeWidth="2" />
          <path d="M0 812H800" stroke="#CAC2B2" strokeWidth="2" />
        </>
      ) : (
        <>
          <rect width="800" height="1000" fill={`url(#wall-${uid})`} />
          <rect x="0" y="0" width="286" height="1000" fill="#151515" opacity="0.06" />
          <rect x="656" y="0" width="144" height="1000" fill="#0E0E0E" opacity="0.1" />
          <rect x="104" y="170" width="112" height="290" fill="#EDE7DC" opacity="0.5" />
          <rect x="104" y="170" width="112" height="290" fill="none" stroke="#151515" strokeOpacity="0.1" strokeWidth="2" />
          <path d="M0 812H800" stroke="#BDB5A5" strokeWidth="2" />
          <rect x="0" y="812" width="800" height="188" fill="#CFC7B6" opacity="0.45" />
        </>
      )}

      <FigureBody uid={uid} palette={palette} skin={skin} trouser={trouser} />

      <rect width="800" height="1000" fill={`url(#light-${uid})`} opacity="0.45" style={{ mixBlendMode: 'soft-light' }} />

      {view === 'back' ? (
        <text
          x="400"
          y="266"
          textAnchor="middle"
          fontSize="18"
          letterSpacing="8"
          fill={palette.contrast === 'dark' ? '#E7E0D0' : '#151515'}
          opacity="0.45"
          fontFamily="Inter Variable, Inter, sans-serif"
        >
          VYRO
        </text>
      ) : null}
    </>
  )
}

/* ------------------------------ wide figure ------------------------------ */

/** Wide stage for full-bleed banners: figure right of centre, architecture left. */
function WideFigureScene({
  uid,
  tone,
  skin,
  variant,
}: {
  uid: string
  tone: GarmentTone
  skin: string
  variant: 'urban' | 'wall'
}) {
  const palette = TONES[tone]
  const trouser = tone === 'black' || tone === 'charcoal' ? '#2C2B28' : '#3A3833'

  return (
    <>
      <rect width="1600" height="700" fill={`url(#wall-${uid})`} />
      {/* architecture */}
      <rect x="0" y="0" width="1600" height="700" fill={`url(#light-${uid})`} />
      <rect x="88" y="0" width="26" height="700" fill="#151515" opacity="0.06" />
      <rect x="120" y="90" width="300" height="430" fill="#EFE9DE" opacity="0.6" />
      <rect x="120" y="90" width="300" height="430" fill="none" stroke="#151515" strokeOpacity="0.1" strokeWidth="2" />
      <path d="M120 305H420" stroke="#151515" strokeOpacity="0.08" strokeWidth="2" />
      {variant === 'urban' ? (
        <>
          <rect x="470" y="0" width="150" height="700" fill="#151515" opacity="0.07" />
          <rect x="1180" y="0" width="420" height="700" fill="#0E0E0E" opacity="0.12" />
          <rect x="1240" y="120" width="240" height="380" fill="#E8E1D5" opacity="0.35" />
        </>
      ) : (
        <>
          <rect x="1320" y="0" width="280" height="700" fill="#151515" opacity="0.08" />
          <rect x="520" y="140" width="200" height="360" fill="#F1EBE0" opacity="0.45" />
        </>
      )}
      <path d="M0 566H1600" stroke="#BEB6A6" strokeWidth="2" />
      <rect x="0" y="566" width="1600" height="134" fill="#CFC7B6" opacity="0.4" />

      <g transform="translate(905 70) scale(0.64)">
        <FigureBody uid={uid} palette={palette} skin={skin} trouser={trouser} />
      </g>

      <rect width="1600" height="700" fill={`url(#light-${uid})`} opacity="0.35" />
      <text
        x="1540"
        y="660"
        textAnchor="end"
        fontSize="13"
        letterSpacing="4"
        fill="#77736D"
        opacity="0.8"
        fontFamily="Inter Variable, Inter, sans-serif"
      >
        CAMPAIGN FRAME
      </text>
    </>
  )
}

/* -------------------------------- detail --------------------------------- */

function DetailScene({
  uid,
  palette,
  graphic,
}: {
  uid: string
  palette: TonePalette
  graphic?: 'mark' | 'study-01' | 'study-02'
}) {
  const printInk = palette.contrast === 'dark' ? '#E7E0D0' : '#151515'
  return (
    <>
      <rect width="800" height="1000" fill={`url(#weave-${uid})`} />
      {/* soft fold shadow across the fabric */}
      <path d="M-20 520 Q400 430 820 560 L820 1020 L-20 1020 Z" fill={palette.clothShade} opacity="0.35" />
      {/* collar band */}
      <path d="M-20 190 Q400 296 820 130 L820 -20 L-20 -20 Z" fill={palette.cloth} />
      <path d="M-20 190 Q400 296 820 130" fill="none" stroke={palette.clothLine} strokeWidth="7" />
      <path d="M-20 222 Q400 328 820 162" fill="none" stroke={palette.clothLine} strokeWidth="2" strokeDasharray="10 9" opacity="0.85" />
      {/* shoulder seam, lower right */}
      <path d="M-20 780 Q360 660 820 840 L820 1020 L-20 1020 Z" fill={palette.cloth} opacity="0.95" />
      <path d="M-20 780 Q360 660 820 840" fill="none" stroke={palette.clothLine} strokeWidth="5" />
      <path d="M-20 804 Q360 684 820 864" fill="none" stroke={palette.clothLine} strokeWidth="2" strokeDasharray="11 10" opacity="0.9" />
      <path d="M-20 760 Q360 640 820 820" fill="none" stroke={palette.clothLine} strokeWidth="2" strokeDasharray="11 10" opacity="0.65" />
      {/* print placement */}
      <g opacity="0.92">
        <rect
          x="470"
          y="360"
          width="220"
          height={graphic === 'study-01' || graphic === 'study-02' ? '220' : '180'}
          fill="none"
          stroke={printInk}
          strokeWidth="4"
        />
        {graphic === 'study-01' || graphic === 'study-02' ? (
          <path d="M470 470H690M580 360V580" stroke={printInk} strokeWidth="2" opacity="0.6" />
        ) : (
          <text
            x="580"
            y="475"
            textAnchor="middle"
            fontSize="64"
            fontWeight="600"
            fill={printInk}
            fontFamily="Inter Variable, Inter, sans-serif"
          >
            V
          </text>
        )}
      </g>
      <rect width="800" height="1000" fill={`url(#light-${uid})`} opacity="0.5" />
      <text
        x="40"
        y="950"
        fontSize="13"
        letterSpacing="4"
        fill={palette.contrast === 'dark' ? '#F5F2EC' : '#77736D'}
        fontFamily="Inter Variable, Inter, sans-serif"
      >
        FABRIC / STITCH DETAIL
      </text>
    </>
  )
}

/* ------------------------------- lifestyle -------------------------------- */

function LifestyleScene({ uid, tone, skin }: { uid: string; tone: GarmentTone; skin: string }) {
  const palette = TONES[tone]
  const trouser = tone === 'black' || tone === 'charcoal' ? '#2C2B28' : '#3A3833'

  return (
    <>
      <rect width="1600" height="900" fill={`url(#sky-${uid})`} />
      {/* skyline blocks */}
      <rect x="0" y="140" width="330" height="560" fill="#C8C0B1" />
      <rect x="330" y="60" width="250" height="640" fill="#B7AF9F" />
      <rect x="580" y="200" width="300" height="500" fill="#CFC8B9" />
      <rect x="880" y="90" width="220" height="610" fill="#AEA696" />
      <rect x="1100" y="220" width="280" height="480" fill="#C4BCAC" />
      <rect x="1380" y="120" width="220" height="580" fill="#B3AB9B" />
      {/* windows */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 2 }).map((__, col) => (
          <rect
            key={`w1-${row}-${col}`}
            x={60 + col * 130}
            y={200 + row * 84}
            width="76"
            height="58"
            fill="#8F8878"
            opacity="0.5"
          />
        )),
      )}
      {Array.from({ length: 6 }).map((_, row) => (
        <rect key={`w2-${row}`} x="372" y={110 + row * 90} width="166" height="56" fill="#87806F" opacity="0.45" />
      ))}
      {Array.from({ length: 4 }).map((_, row) => (
        <rect key={`w3-${row}`} x="620" y={250 + row * 96} width="220" height="64" fill="#968F7E" opacity="0.4" />
      ))}
      {Array.from({ length: 5 }).map((_, row) => (
        <rect key={`w4-${row}`} x="1140" y={260 + row * 82} width="200" height="52" fill="#8F8878" opacity="0.38" />
      ))}
      {/* pavement */}
      <rect x="0" y="700" width="1600" height="200" fill="#D2CABA" />
      <path d="M0 700H1600" stroke="#B9B1A0" strokeWidth="3" />
      <path d="M140 780 H1460" stroke="#B9B1A0" strokeWidth="2" strokeDasharray="34 26" opacity="0.7" />

      {/* walking figure */}
      <g transform="translate(430 66) scale(0.72)">
        <FigureBody uid={uid} palette={palette} skin={skin} trouser={trouser} />
      </g>

      <rect width="1600" height="900" fill={`url(#light-${uid})`} opacity="0.4" />
      <text
        x="1540"
        y="860"
        textAnchor="end"
        fontSize="13"
        letterSpacing="4"
        fill="#77736D"
        fontFamily="Inter Variable, Inter, sans-serif"
      >
        STREET STUDY
      </text>
    </>
  )
}
