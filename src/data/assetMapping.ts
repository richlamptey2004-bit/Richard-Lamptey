/**
 * ESTCHAY LUX LADY’S BAGS - Product Asset Mapping & Visual Representations
 * 
 * Provides reference styling, color palettes, and bespoke SVG vector silhouettes
 * matching each bag's shape, handles, hardware, and specific accessories
 * (e.g. lavender pouch, gold ornament, 3-piece set, bow detail, teddy charm).
 * 
 * Allows admin upload overrides from Supabase Storage or custom URLs.
 */

export interface BagAssetProfile {
  id: string;
  slug: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  hardwareColor: string;
  badgeText?: string;
  renderType: 'black_lavender' | 'cognac_gold' | 'burgundy_set' | 'tan_bow' | 'taupe_trim' | 'beige_charm' | 'classic_pebbled';
  descriptionNotes: string;
}

export const BAG_ASSET_PROFILES: Record<string, BagAssetProfile> = {
  'black-tote-with-lavender-pouch': {
    id: '22222222-2222-2222-2222-222222222201',
    slug: 'black-tote-with-lavender-pouch',
    name: 'Black Tote with Lavender Pouch',
    primaryColor: '#1A1819',
    accentColor: '#B6A6D3', // Lavender pouch
    hardwareColor: '#D1D5DB', // Silver-tone
    renderType: 'black_lavender',
    descriptionNotes: 'Wide black structured tote with long handles, silver buckles, and accompanying lavender zip pouch.',
  },
  'cognac-tote-with-gold-tone-detail': {
    id: '22222222-2222-2222-2222-222222222202',
    slug: 'cognac-tote-with-gold-tone-detail',
    name: 'Cognac Tote with Gold-Tone Detail',
    primaryColor: '#8C4F27', // Cognac brown
    accentColor: '#6B3818',
    hardwareColor: '#D4AF37', // Polished gold-tone
    renderType: 'cognac_gold',
    descriptionNotes: 'Structured cognac tote with rounded handles, curved opening, and prominent gold ornament.',
  },
  'burgundy-three-piece-handbag-set': {
    id: '22222222-2222-2222-2222-222222222203',
    slug: 'burgundy-three-piece-handbag-set',
    name: 'Burgundy Three-Piece Handbag Set',
    primaryColor: '#6D2638', // Glossy wine
    accentColor: '#521927',
    hardwareColor: '#C5A059', // Muted gold
    badgeText: '3-Piece Set',
    renderType: 'burgundy_set',
    descriptionNotes: 'Glossy wine handbag with top handles and strap, paired with envelope clutch and wallet.',
  },
  'tan-tote-with-bow-detail': {
    id: '22222222-2222-2222-2222-222222222204',
    slug: 'tan-tote-with-bow-detail',
    name: 'Tan Tote with Bow Detail',
    primaryColor: '#C49B66', // Tan
    accentColor: '#7A5229', // Darker base band
    hardwareColor: '#D4AF37', // Gold bow and rivets
    renderType: 'tan_bow',
    descriptionNotes: 'Tan tote with slim handles, darker base band, gold rivets, and delicate bow emblem.',
  },
  'taupe-tote-with-brown-trim': {
    id: '22222222-2222-2222-2222-222222222205',
    slug: 'taupe-tote-with-brown-trim',
    name: 'Taupe Tote with Brown Trim',
    primaryColor: '#A79E94', // Soft taupe
    accentColor: '#4A3728', // Dark brown trim and handles
    hardwareColor: '#C5A059',
    renderType: 'taupe_trim',
    descriptionNotes: 'Structured taupe tote with long dark brown handles, vertical trims and small buckle accents.',
  },
  'beige-tote-with-teddy-charm': {
    id: '22222222-2222-2222-2222-222222222206',
    slug: 'beige-tote-with-teddy-charm',
    name: 'Beige Tote with Teddy Charm',
    primaryColor: '#E4DAC6', // Tall beige
    accentColor: '#C5B59C',
    hardwareColor: '#D4AF37', // Gold fittings
    badgeText: 'With Teddy Charm',
    renderType: 'beige_charm',
    descriptionNotes: 'Tall beige tote with matching handles, gold fittings, narrow front strap, and cute teddy charm.',
  },
  'classic-tote-collection': {
    id: '22222222-2222-2222-2222-222222222207',
    slug: 'classic-tote-collection',
    name: 'Classic Tote Collection',
    primaryColor: '#2D5A43', // Green default, available in Blue, Brown, Wine, Black
    accentColor: '#1F3E2E',
    hardwareColor: '#C5A059',
    badgeText: '5 Signature Colours',
    renderType: 'classic_pebbled',
    descriptionNotes: 'Rectangular tote with pebbled finish, slim shoulder handles, and defined front panel.',
  },
};
