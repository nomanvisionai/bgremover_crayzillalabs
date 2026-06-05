/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppStatus = 'idle' | 'processing' | 'done' | 'error';

export type BgType = 'transparent' | 'color' | 'image';

export interface BackgroundPreset {
  id: string;
  name: string;
  url: string;
  category: 'studio' | 'home' | 'nature' | 'abstract';
}

export interface ColorPreset {
  name: string;
  value: string;
}

export interface ForegroundTransform {
  scale: number;
  offsetX: number; // percentage
  offsetY: number; // percentage
  rotate: number; // degrees
  brightness: number; // 0-200
  contrast: number; // 0-200
  saturation: number; // 0-200
}

export interface ShadowSettings {
  type: 'none' | 'drop' | 'floor' | 'glow';
  blur: number; // px
  offsetY: number; // px
  offsetX: number; // px
  opacity: number; // 0-1
  color: string;
}

export interface ProcessedImage {
  id: string;
  name: string;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  processedUrl: string; // transparent png url from @imgly
  rawProcessedUrl?: string; // original unmodified cutout from ML model
  maskUrl?: string; // the original mask url (optional)
  bgType: BgType;
  bgColor: string;
  bgImageUrl?: string;
  customBgFileUrl?: string; // if user uploads their own background
  transform: ForegroundTransform;
  shadow: ShadowSettings;
}

export interface GeminiSuggestion {
  subjectType: string;
  suggestedColors: string[];
  suggestedBackgroundTheme: string;
  marketingContext: string;
  altText: string;
}
