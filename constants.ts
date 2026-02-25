
import { AspectRatio, ImageSize, ImageStyle, ImageStyleCategory } from './types';

export const ASPECT_RATIOS: { value: AspectRatio; label: string; iconClass: string }[] = [
  { value: '9:16', label: 'Portrait', iconClass: 'aspect-[9/16]' },
  { value: '2:3', label: 'Classic V', iconClass: 'aspect-[2/3]' },
  { value: '3:4', label: 'Vertical', iconClass: 'aspect-[3/4]' },
  { value: '4:5', label: 'Social', iconClass: 'aspect-[4/5]' },
  { value: '1:1', label: 'Square', iconClass: 'aspect-square' },
  { value: '5:4', label: 'Medium', iconClass: 'aspect-[5/4]' },
  { value: '4:3', label: 'Standard', iconClass: 'aspect-[4/3]' },
  { value: '3:2', label: 'Classic H', iconClass: 'aspect-[3/2]' },
  { value: '16:9', label: 'Widescreen', iconClass: 'aspect-video' },
  { value: '21:9', label: 'Cinematic', iconClass: 'aspect-[21/9]' },
];

export const IMAGE_SIZES: ImageSize[] = ['1K', '2K', '4K'];

export const STYLE_CATEGORIES: { id: ImageStyleCategory; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Photo', label: 'Photo' },
  { id: 'Classic', label: 'Classic' },
  { id: 'Digital', label: 'Digital' },
  { id: 'Stylized', label: 'Stylized' },
  { id: 'Craft', label: 'Craft' },
  { id: 'Design', label: 'Design' },
];

// Mapping styles to categories for filtering
export const STYLES_BY_CATEGORY: Record<ImageStyleCategory, ImageStyle[]> = {
  'Photo': ['Photorealistic', 'Cinematic', 'Film Noir', 'Vintage Polaroid', 'Macro', 'Long Exposure', 'Double Exposure', 'Tilt-Shift', 'Knolling'],
  'Classic': ['Oil Painting', 'Watercolor', 'Pencil Sketch', 'Ukiyo-e', 'Ink Wash', 'Impressionism', 'Mosaic', 'Pastel', 'Art Nouveau', 'Baroque', 'Art Deco'],
  'Digital': ['Anime', '3D Render', 'Cyberpunk', 'Pixel Art', 'Low Poly', 'Vaporwave', 'Isometric', 'Vector Art', 'Glitch Art', 'Manga', 'Chibi'],
  'Stylized': ['Surrealism', 'Pop Art', 'Psychedelic', 'Gothic', 'Steampunk', 'Comic Book', 'Fantasy Art', 'Stained Glass', 'Graffiti'],
  'Craft': ['Claymation', 'Origami', 'Knitted', 'Paper Cutout', 'Wood Carving', 'Porcelain', 'Embroidery', 'Crystal'],
  'Design': ['Blueprint', 'Sticker', 'Doodle', 'Neon', 'Flat Design', 'Miniature'],
  'All': [] // Populated dynamically below
};

// Flatten all styles for the 'All' category (excluding None, which is handled separately or first)
const allStyles = [
  ...STYLES_BY_CATEGORY['Photo'],
  ...STYLES_BY_CATEGORY['Classic'],
  ...STYLES_BY_CATEGORY['Digital'],
  ...STYLES_BY_CATEGORY['Stylized'],
  ...STYLES_BY_CATEGORY['Craft'],
  ...STYLES_BY_CATEGORY['Design']
];

STYLES_BY_CATEGORY['All'] = ['None', ...allStyles];
