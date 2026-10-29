import React from 'react';
import { BAG_ASSET_PROFILES } from '../data/assetMapping';

interface HandbagVisualProps {
  slug?: string;
  name?: string;
  imageUrl?: string | null;
  selectedColorHex?: string | null;
  aspectRatio?: '4:3' | '1:1' | '16:9';
  className?: string;
}

export const HandbagVisual: React.FC<HandbagVisualProps> = ({
  slug,
  name,
  imageUrl,
  selectedColorHex,
  aspectRatio = '4:3',
  className = '',
}) => {
  const profile = slug ? BAG_ASSET_PROFILES[slug] : undefined;
  const primaryColor = selectedColorHex || profile?.primaryColor || '#241C19';
  const accentColor = profile?.accentColor || '#1A1819';
  const hardwareColor = profile?.hardwareColor || '#D4AF37';

  // If a real uploaded image URL is provided (e.g. from Supabase Storage or admin URL)
  if (imageUrl && imageUrl.trim().length > 0 && !imageUrl.startsWith('vector://')) {
    return (
      <div className={`relative overflow-hidden bg-[#F2EDE4] flex items-center justify-center p-3 ${className}`}>
        <img
          src={imageUrl}
          alt={name || profile?.name || "Boutique Handbag"}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-102"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            // Gracefully fall back to vector SVG on image load error
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Bespoke vector silhouettes tailored to each handbag model
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#EFEAE2] flex items-center justify-center p-4 select-none ${className}`}
      aria-label={name || profile?.name || "Handbag Visual Representation"}
    >
      <svg
        viewBox="0 0 400 320"
        className="w-full h-full max-h-[300px] object-contain drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle leather grain & highlights */}
          <linearGradient id={`grad-body-${slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
            <stop offset="60%" stopColor={primaryColor} stopOpacity="1" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
          </linearGradient>

          <linearGradient id={`grad-sheen-${slug}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id={`gold-metal-${slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E29D" />
            <stop offset="50%" stopColor={hardwareColor} />
            <stop offset="100%" stopColor="#9C792B" />
          </linearGradient>

          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Shadow base on studio pedestal */}
        <ellipse cx="200" cy="285" rx="140" ry="14" fill="#000000" fillOpacity="0.12" filter="blur(6px)" />

        {/* 1. Black Tote with Lavender Pouch */}
        {profile?.renderType === 'black_lavender' && (
          <g filter="url(#soft-shadow)">
            {/* Long Slim Handles */}
            <path
              d="M135 150 C 135 60, 160 30, 200 30 C 240 30, 265 60, 265 150"
              stroke="#2A282A"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M135 150 C 135 60, 160 30, 200 30 C 240 30, 265 60, 265 150"
              stroke="#555"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              fill="none"
            />

            {/* Silver Buckle Hardware on Straps */}
            <rect x="131" y="140" width="8" height="14" rx="2" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1" />
            <rect x="261" y="140" width="8" height="14" rx="2" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1" />

            {/* Wide Trapeze Tote Body */}
            <path
              d="M80 135 L105 270 Q110 278 120 278 L280 278 Q290 278 295 270 L320 135 Q322 128 314 128 L86 128 Q78 128 80 135 Z"
              fill={`url(#grad-body-${slug})`}
            />
            {/* Sheen overlay */}
            <path
              d="M80 135 L105 270 Q110 278 120 278 L280 278 Q290 278 295 270 L320 135 Q322 128 314 128 L86 128 Q78 128 80 135 Z"
              fill={`url(#grad-sheen-${slug})`}
            />

            {/* Subtle Front Panel Stitching */}
            <path d="M125 145 L140 265 M275 145 L260 265" stroke="#444" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* Accompanying Lavender Zipper Pouch Accessory */}
            <g transform="translate(240, 195) rotate(-8)">
              {/* Strap connecting pouch */}
              <path d="M25 0 Q20 -40 10 -60" stroke="#333" strokeWidth="2.5" fill="none" />
              {/* Lavender pouch body */}
              <rect x="0" y="0" width="75" height="52" rx="7" fill="#B6A6D3" stroke="#9E8DC0" strokeWidth="1.5" />
              {/* Silver top zipper & pull */}
              <line x1="5" y1="8" x2="70" y2="8" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="2 1" />
              <rect x="10" y="6" width="6" height="4" rx="1" fill="#9CA3AF" />
              {/* Subtle pouch stitching */}
              <rect x="4" y="4" width="67" height="44" rx="5" stroke="#D8CBEF" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            </g>
          </g>
        )}

        {/* 2. Cognac Tote with Gold-Tone Detail */}
        {profile?.renderType === 'cognac_gold' && (
          <g filter="url(#soft-shadow)">
            {/* Rounded double top handles */}
            <path
              d="M145 155 C 145 70, 165 42, 200 42 C 235 42, 255 70, 255 155"
              stroke="#6E3814"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            {/* Curved opening structured tote body */}
            <path
              d="M95 145 C140 130 260 130 305 145 L288 270 Q285 278 275 278 L125 278 Q115 278 112 270 Z"
              fill={`url(#grad-body-${slug})`}
            />
            <path
              d="M95 145 C140 130 260 130 305 145 L288 270 Q285 278 275 278 L125 278 Q115 278 112 270 Z"
              fill={`url(#grad-sheen-${slug})`}
            />

            {/* Pebbled texture stitch lines */}
            <path d="M125 155 C150 148 250 148 275 155" stroke="#B87333" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Prominent Polished Gold-Tone Front Ornament */}
            <g transform="translate(200, 175)">
              <circle cx="0" cy="0" r="14" fill={`url(#gold-metal-${slug})`} stroke="#E6C875" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="8" fill="none" stroke="#7A5818" strokeWidth="1.5" />
              <path d="M-4 14 L0 26 L4 14" fill={`url(#gold-metal-${slug})`} />
            </g>
          </g>
        )}

        {/* 3. Burgundy Three-Piece Handbag Set */}
        {profile?.renderType === 'burgundy_set' && (
          <g filter="url(#soft-shadow)">
            {/* Piece 1: Primary Wine Handbag */}
            <g transform="translate(15, 0)">
              {/* Top Handle */}
              <path
                d="M140 130 C140 70 160 55 185 55 C210 55 230 70 230 130"
                stroke="#4A1823"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Shoulder Strap swooping gracefully */}
              <path
                d="M115 145 C 90 200, 75 240, 85 270"
                stroke="#541B28"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Glossy Wine Handbag Body */}
              <path
                d="M110 135 L260 135 L252 265 Q250 272 240 272 L130 272 Q120 272 118 265 Z"
                fill={`url(#grad-body-${slug})`}
              />
              <path
                d="M110 135 L260 135 L252 265 Q250 272 240 272 L130 272 Q120 272 118 265 Z"
                fill={`url(#grad-sheen-${slug})`}
              />
              {/* Front flap and gold clasp */}
              <path d="M125 135 L245 135 L225 185 L145 185 Z" fill="#521927" />
              <rect x="180" y="180" width="10" height="12" rx="2" fill={`url(#gold-metal-${slug})`} />
            </g>

            {/* Piece 2: Matching Wine Envelope Clutch Pouch */}
            <g transform="translate(230, 185)">
              <rect x="0" y="0" width="95" height="65" rx="5" fill="#5A1D2B" stroke="#873549" strokeWidth="1" />
              {/* Envelope Flap */}
              <path d="M0 0 L47 38 L95 0 Z" fill="#6B2434" stroke="#873549" strokeWidth="1" />
              {/* Small Gold Snap */}
              <circle cx="47" cy="38" r="4" fill={`url(#gold-metal-${slug})`} />
            </g>

            {/* Piece 3: Matching Coordinated Card Wallet */}
            <g transform="translate(260, 230)">
              <rect x="0" y="0" width="60" height="42" rx="4" fill="#4B1622" stroke="#873549" strokeWidth="1" />
              <line x1="8" y1="12" x2="52" y2="12" stroke="#C5A059" strokeWidth="1.5" />
              <circle cx="30" cy="26" r="3" fill={`url(#gold-metal-${slug})`} />
            </g>
          </g>
        )}

        {/* 4. Tan Tote with Bow Detail */}
        {profile?.renderType === 'tan_bow' && (
          <g filter="url(#soft-shadow)">
            {/* Slim Shoulder Handles */}
            <path
              d="M140 140 C 140 55, 160 35, 200 35 C 240 35, 260 55, 260 140"
              stroke="#A8804E"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Rivets at base of handles */}
            <circle cx="140" cy="148" r="3.5" fill={`url(#gold-metal-${slug})`} />
            <circle cx="260" cy="148" r="3.5" fill={`url(#gold-metal-${slug})`} />

            {/* Tan Tote Body */}
            <path
              d="M95 130 L115 272 Q118 278 128 278 L272 278 Q282 278 285 272 L305 130 Z"
              fill={`url(#grad-body-${slug})`}
            />
            {/* Distinct Darker Base Band */}
            <path
              d="M110 240 L115 272 Q118 278 128 278 L272 278 Q282 278 285 272 L290 240 Z"
              fill="#7A5229"
            />
            {/* Gold Rivets along the band */}
            <circle cx="135" cy="245" r="2.5" fill={`url(#gold-metal-${slug})`} />
            <circle cx="175" cy="245" r="2.5" fill={`url(#gold-metal-${slug})`} />
            <circle cx="225" cy="245" r="2.5" fill={`url(#gold-metal-${slug})`} />
            <circle cx="265" cy="245" r="2.5" fill={`url(#gold-metal-${slug})`} />

            {/* Small Gold Metal Bow Emblem */}
            <g transform="translate(200, 180)">
              <ellipse cx="-8" cy="0" rx="7" ry="5" fill={`url(#gold-metal-${slug})`} />
              <ellipse cx="8" cy="0" rx="7" ry="5" fill={`url(#gold-metal-${slug})`} />
              <circle cx="0" cy="0" r="3.5" fill="#FFE8A3" />
              <path d="M-4 3 L-8 12 M4 3 L8 12" stroke={`url(#gold-metal-${slug})`} strokeWidth="2" />
            </g>
          </g>
        )}

        {/* 5. Taupe Tote with Brown Trim */}
        {profile?.renderType === 'taupe_trim' && (
          <g filter="url(#soft-shadow)">
            {/* Long Contrasting Dark Brown Handles */}
            <path
              d="M142 160 C 142 50, 165 30, 200 30 C 235 30, 258 50, 258 160"
              stroke="#3D2B1F"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />

            {/* Structured Taupe Body */}
            <path
              d="M90 135 L112 270 Q116 276 125 276 L275 276 Q284 276 288 270 L310 135 Z"
              fill={`url(#grad-body-${slug})`}
            />

            {/* Twin Vertical Dark Brown Accent Trims Running Down Front */}
            <rect x="137" y="135" width="10" height="141" fill="#4A3728" />
            <rect x="253" y="135" width="10" height="141" fill="#4A3728" />

            {/* Small Buckle Accents on Straps */}
            <rect x="136" y="160" width="12" height="14" rx="2" fill="none" stroke={`url(#gold-metal-${slug})`} strokeWidth="2.5" />
            <line x1="138" y1="167" x2="146" y2="167" stroke={`url(#gold-metal-${slug})`} strokeWidth="2" />
            
            <rect x="252" y="160" width="12" height="14" rx="2" fill="none" stroke={`url(#gold-metal-${slug})`} strokeWidth="2.5" />
            <line x1="254" y1="167" x2="262" y2="167" stroke={`url(#gold-metal-${slug})`} strokeWidth="2" />
          </g>
        )}

        {/* 6. Beige Tote with Teddy Charm */}
        {profile?.renderType === 'beige_charm' && (
          <g filter="url(#soft-shadow)">
            {/* Matching Tall Beige Handles */}
            <path
              d="M140 145 C 140 45, 165 25, 200 25 C 235 25, 260 45, 260 145"
              stroke="#C4B79F"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            {/* Gold D-Ring Fittings */}
            <ellipse cx="140" cy="148" rx="6" ry="4" fill={`url(#gold-metal-${slug})`} />
            <ellipse cx="260" cy="148" rx="6" ry="4" fill={`url(#gold-metal-${slug})`} />

            {/* Tall Elegant Beige Body */}
            <path
              d="M105 125 L120 274 Q122 280 130 280 L270 280 Q278 280 280 274 L295 125 Z"
              fill={`url(#grad-body-${slug})`}
            />

            {/* Narrow Front Fastening Strap */}
            <rect x="194" y="125" width="12" height="50" rx="3" fill="#B3A387" />
            <circle cx="200" cy="165" r="3" fill={`url(#gold-metal-${slug})`} />

            {/* Adorable Teddy Bear Charm Hanging From Handle */}
            <g transform="translate(142, 175)">
              {/* Chain */}
              <line x1="0" y1="0" x2="5" y2="20" stroke={`url(#gold-metal-${slug})`} strokeWidth="1.5" />
              <g transform="translate(5, 20)">
                {/* Bear head & ears */}
                <circle cx="-7" cy="-7" r="4.5" fill="#8C5C38" />
                <circle cx="7" cy="-7" r="4.5" fill="#8C5C38" />
                <circle cx="0" cy="0" r="10" fill="#A77248" />
                {/* Snout */}
                <ellipse cx="0" cy="2" rx="4" ry="3" fill="#D2A478" />
                <circle cx="0" cy="1" r="1.2" fill="#2E1B0E" />
                {/* Bowtie on bear */}
                <polygon points="-4,11 4,11 0,8" fill="#6D2638" />
                {/* Bear body */}
                <ellipse cx="0" cy="19" rx="8" ry="10" fill="#A77248" />
                {/* Paws */}
                <circle cx="-6" cy="26" r="3" fill="#8C5C38" />
                <circle cx="6" cy="26" r="3" fill="#8C5C38" />
              </g>
            </g>
          </g>
        )}

        {/* 7. Classic Tote Collection (or fallback) */}
        {(profile?.renderType === 'classic_pebbled' || !profile) && (
          <g filter="url(#soft-shadow)">
            {/* Slim Shoulder Handles */}
            <path
              d="M138 140 C 138 52, 162 32, 200 32 C 238 32, 262 52, 262 140"
              stroke="#2A2421"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Gold Handle Studs */}
            <circle cx="138" cy="145" r="3" fill={`url(#gold-metal-${slug})`} />
            <circle cx="262" cy="145" r="3" fill={`url(#gold-metal-${slug})`} />

            {/* Rectangular Classic Tote Body with Pebbled Look */}
            <path
              d="M95 130 L115 272 Q118 278 128 278 L272 278 Q282 278 285 272 L305 130 Z"
              fill={`url(#grad-body-${slug})`}
            />
            <path
              d="M95 130 L115 272 Q118 278 128 278 L272 278 Q282 278 285 272 L305 130 Z"
              fill={`url(#grad-sheen-${slug})`}
            />

            {/* Defined Front Panel Geometric Inset */}
            <path
              d="M130 145 L145 260 L255 260 L270 145 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

            {/* Discreet Luxury Brand Stamping */}
            <text
              x="200"
              y="185"
              textAnchor="middle"
              fill={hardwareColor}
              fontSize="7"
              fontFamily="Playfair Display, serif"
              letterSpacing="2"
              fontWeight="bold"
            >
              ESTCHAY LUX
            </text>
          </g>
        )}
      </svg>

      {/* Subtle bottom label indicator */}
      {profile?.badgeText && (
        <div className="absolute bottom-2.5 right-2.5 text-[10px] uppercase tracking-wider font-medium text-[#241C19]/70 bg-[#FFFEFC]/80 px-2 py-0.5 rounded-sm shadow-xs backdrop-blur-xs">
          {profile.badgeText}
        </div>
      )}
    </div>
  );
};
