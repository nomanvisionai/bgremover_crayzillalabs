/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Palette, 
  RotateCw, 
  Maximize, 
  Settings2, 
  Layout, 
  Sun, 
  Contrast, 
  Sparkle, 
  Sliders, 
  Download, 
  Upload, 
  GripHorizontal, 
  LayoutGrid, 
  Activity,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Eraser,
  Pipette
} from 'lucide-react';
import { 
  BgType, 
  ForegroundTransform, 
  ShadowSettings, 
  ColorPreset, 
  BackgroundPreset 
} from '../types';

interface StudioControlsProps {
  bgType: BgType;
  bgColor: string;
  bgImageUrl: string;
  transform: ForegroundTransform;
  shadow: ShadowSettings;
  onBgTypeChange: (type: BgType) => void;
  onBgColorChange: (color: string) => void;
  onBgImageUrlChange: (url: string) => void;
  onTransformChange: (transform: ForegroundTransform) => void;
  onShadowChange: (shadow: ShadowSettings) => void;
  onUploadCustomBg: (file: File) => void;
  onReset: () => void;
  edgeTrim: number;
  setEdgeTrim: (val: number) => void;
  alphaThreshold: number;
  setAlphaThreshold: (val: number) => void;
  colorPresets?: ColorPreset[];
  bgRemoveMethod: 'ai' | 'chroma-key';
  setBgRemoveMethod: (method: 'ai' | 'chroma-key') => void;
  chromaKeyColor: string;
  setChromaKeyColor: (color: string) => void;
  chromaKeyTolerance: number;
  setChromaKeyTolerance: (val: number) => void;
  chromaKeyFeather: number;
  setChromaKeyFeather: (val: number) => void;
  isPickingColor: boolean;
  setIsPickingColor: (val: boolean) => void;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'White', value: '#ffffff' },
  { name: 'Studio Grey', value: '#f4f4f5' },
  { name: 'Sleek Dark', value: '#18181b' },
  { name: 'Warm Peach', value: '#ffe4e6' },
  { name: 'Soft Mint', value: '#ecfdf5' },
  { name: 'Lavender', value: '#faf5ff' },
  { name: 'Tech Blue', value: '#eff6ff' },
  { name: 'Sunny Yellow', value: '#fefce8' },
];

const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'marble', name: 'Marble Plate', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80', category: 'studio' },
  { id: 'stone-stage', name: 'Concrete Spotlight', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80', category: 'studio' },
  { id: 'sunset-beach', name: 'Golden Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', category: 'nature' },
  { id: 'leaf-shadows', name: 'Summer Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80', category: 'nature' },
  { id: 'wooden-deck', name: 'Acoustic Desk', url: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop&q=80', category: 'home' },
  { id: 'cosmic-mesh', name: 'Modern Space', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80', category: 'abstract' },
  { id: 'iridescent', name: 'Iridescent Waves', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', category: 'abstract' },
  { id: 'dark-cyber', name: 'Cyberpunk Black', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80', category: 'abstract' },
];

type TabId = 'background' | 'foreground' | 'shadow';

export default function StudioControls({
  bgType,
  bgColor,
  bgImageUrl,
  transform,
  shadow,
  onBgTypeChange,
  onBgColorChange,
  onBgImageUrlChange,
  onTransformChange,
  onShadowChange,
  onUploadCustomBg,
  onReset,
  edgeTrim,
  setEdgeTrim,
  alphaThreshold,
  setAlphaThreshold,
  colorPresets,
  bgRemoveMethod,
  setBgRemoveMethod,
  chromaKeyColor,
  setChromaKeyColor,
  chromaKeyTolerance,
  setChromaKeyTolerance,
  chromaKeyFeather,
  setChromaKeyFeather,
  isPickingColor,
  setIsPickingColor,
}: StudioControlsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('background');
  const [activeCategory, setActiveCategory] = useState<'all' | 'studio' | 'home' | 'nature' | 'abstract'>('all');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<{
    position: boolean;
    lighting: boolean;
    edges: boolean;
  }>({
    position: false,
    lighting: false,
    edges: true, // Keep edges open by default so the user can easily see and adjust it immediately!
  });

  const toggleSection = (section: 'position' | 'lighting' | 'edges') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const updateTransform = (key: keyof ForegroundTransform, value: number) => {
    onTransformChange({
      ...transform,
      [key]: value,
    });
  };

  const updateShadow = (key: keyof ShadowSettings, value: any) => {
    onShadowChange({
      ...shadow,
      [key]: value,
    });
  };

  const handleCustomBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomBg(e.target.files[0]);
    }
  };

  const filteredPresets = activeCategory === 'all' 
    ? BACKGROUND_PRESETS 
    : BACKGROUND_PRESETS.filter(p => p.category === activeCategory);

  return (
    <div id="studio-controls-panel" className="flex flex-col h-full bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden text-zinc-800">
      {/* Tab Selectors */}
      <div className="flex border-b border-zinc-150 bg-zinc-50/50 p-1 gap-1">
        <button
          id="tab-back"
          onClick={() => setActiveTab('background')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'background'
              ? 'bg-white text-zinc-900 border border-zinc-200/50 shadow-sm font-extrabold'
              : 'text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Backdrop
        </button>
        <button
          id="tab-fore"
          onClick={() => setActiveTab('foreground')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'foreground'
              ? 'bg-white text-zinc-900 border border-zinc-200/50 shadow-sm font-extrabold'
              : 'text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Subject
        </button>
        <button
          id="tab-shad"
          onClick={() => setActiveTab('shadow')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'shadow'
              ? 'bg-white text-zinc-900 border border-zinc-200/50 shadow-sm font-extrabold'
              : 'text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5 rotate-45" />
          Shadow & Fit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[460px] md:max-h-none">
        {/* ================= BACKGROUND TAB ================= */}
        {activeTab === 'background' && (
          <div className="space-y-5 animate-fade-in">
            {/* Background Selector Types */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                Canvas Backdrop Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="bg-type-trans"
                  onClick={() => onBgTypeChange('transparent')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all ${
                    bgType === 'transparent'
                      ? 'border-black bg-zinc-50 text-black font-extrabold'
                      : 'border-zinc-100 hover:border-zinc-200 text-zinc-500'
                  }`}
                >
                  <div className="w-6 h-6 rounded border border-zinc-200 mb-1 flex items-center justify-center" style={{
                    backgroundPosition: '0 0, 4px 4px',
                    backgroundSize: '8px 8px',
                    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, white 25%, white 75%, #e5e7eb 75%, #e5e7eb)'
                  }} />
                  <span className="text-[10px] font-semibold">Transparent</span>
                </button>
                <button
                  id="bg-type-col"
                  onClick={() => onBgTypeChange('color')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all ${
                    bgType === 'color'
                      ? 'border-black bg-zinc-50 text-black font-extrabold'
                      : 'border-zinc-100 hover:border-zinc-200 text-zinc-500'
                  }`}
                >
                  <div className="w-6 h-6 rounded border border-zinc-200 mb-1" style={{ backgroundColor: bgColor || '#f4f4f5' }} />
                  <span className="text-[10px] font-semibold">Solid Color</span>
                </button>
                <button
                  id="bg-type-img"
                  onClick={() => onBgTypeChange('image')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all ${
                    bgType === 'image'
                      ? 'border-black bg-zinc-50 text-black font-extrabold'
                      : 'border-zinc-100 hover:border-zinc-200 text-zinc-500'
                  }`}
                >
                  <div className="w-6 h-6 rounded border border-zinc-200 mb-1 overflow-hidden">
                    <img src={bgImageUrl || BACKGROUND_PRESETS[0].url} className="w-full h-full object-cover" alt="Background Type" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-semibold">Photo Backdrop</span>
                </button>
              </div>
            </div>

            {/* Solid Color Customizer */}
            {bgType === 'color' && (
              <div className="space-y-3 animate-slide-up">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Preset Colors
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(colorPresets || COLOR_PRESETS).map((p) => (
                      <button
                        key={p.name}
                        id={`color-preset-${p.name}`}
                        onClick={() => onBgColorChange(p.value)}
                        className={`group relative flex h-9 w-full items-center justify-center rounded-lg border border-zinc-200 shadow-sm transition-transform active:scale-95 ${
                          bgColor === p.value ? 'ring-2 ring-black ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: p.value }}
                        title={p.name}
                      >
                        {bgColor === p.value && (
                          <span className={`w-2 h-2 rounded-full ${p.value === '#ffffff' || p.value === '#f4f4f5' ? 'bg-zinc-800' : 'bg-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Picker */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-zinc-600">Custom Hex Code</span>
                    <input
                      id="custom-color-input"
                      type="text"
                      value={bgColor}
                      onChange={(e) => onBgColorChange(e.target.value)}
                      placeholder="#ffffff"
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 font-mono text-xs focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="shrink-0 pt-5">
                    <input
                      id="color-picker"
                      type="color"
                      value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : '#ffffff'}
                      onChange={(e) => onBgColorChange(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded border border-zinc-200 p-0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photo Backdrop Customizer */}
            {bgType === 'image' && (
              <div className="space-y-3 animate-slide-up">
                {/* Photo Preset Tabs */}
                <div className="flex flex-wrap gap-1 border-b border-zinc-100 pb-2">
                  {(['all', 'studio', 'home', 'nature', 'abstract'] as const).map((cat) => (
                    <button
                      key={cat}
                      id={`preset-cat-${cat}`}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                        activeCategory === cat
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid of Background Presets */}
                <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      id={`bg-preset-${preset.id}`}
                      onClick={() => onBgImageUrlChange(preset.url)}
                      className={`group relative h-16 rounded-lg overflow-hidden border-2 text-left transition-all ${
                        bgImageUrl === preset.url
                          ? 'border-black shadow-sm'
                          : 'border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      <img src={preset.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" alt={preset.name} referrerPolicy="no-referrer" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                        <span className="text-[10px] font-bold text-white block truncate leading-none">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Upload Custom Background File */}
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Or Upload Custom Backdrop
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCustomBgChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    id="cb-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-zinc-300 rounded-xl hover:border-zinc-900 hover:bg-zinc-50 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-all pointer-events-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose background photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SUBJECT TAB ================= */}
        {activeTab === 'foreground' && (
          <div className="space-y-3.5 animate-fade-in text-zinc-900 pb-2">
            {/* Background Removal Choice Area */}
            <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-xl space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1.5">
                  Cutout Extraction Method (ব্যাকগ্রাউন্ড কাটা পদ্ধতি)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBgRemoveMethod('ai')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border-2 text-center transition-all cursor-pointer ${
                      bgRemoveMethod === 'ai'
                        ? 'border-black bg-white text-black font-extrabold shadow-sm'
                        : 'border-zinc-200/50 hover:border-zinc-300 text-zinc-500 bg-transparent'
                    }`}
                  >
                    <Sparkle className={`w-4 h-4 mb-1 ${bgRemoveMethod === 'ai' ? 'text-amber-500' : 'text-zinc-400'}`} />
                    <span className="text-[11px] font-bold">AI Auto-Cut</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 font-medium">এআই দিয়ে অটো রিমুভ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBgRemoveMethod('chroma-key')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border-2 text-center transition-all cursor-pointer ${
                      bgRemoveMethod === 'chroma-key'
                        ? 'border-emerald-600 bg-white text-emerald-950 font-extrabold shadow-sm'
                        : 'border-zinc-200/50 hover:border-zinc-300 text-zinc-500 bg-transparent'
                    }`}
                  >
                    <Eraser className={`w-4 h-4 mb-1 ${bgRemoveMethod === 'chroma-key' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                    <span className="text-[11px] font-bold">Magic Keyer</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 font-medium">ম্যাজিক কালার ইরেজার</span>
                  </button>
                </div>
              </div>

              {/* Conditional parameters when chroma-key / Magic Keyer is enabled */}
              {bgRemoveMethod === 'chroma-key' && (
                <div className="pt-2 border-t border-zinc-200/60 space-y-3 animate-slide-up">
                  {/* Selected target color picker & eyedropper */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                      <span>Target Background Color (যে রঙটি মুছবেন):</span>
                      <span className="text-zinc-400 text-[10px] font-medium">(Click / Enter HEX)</span>
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {/* Interactive Dropper Button */}
                      <button
                        type="button"
                        onClick={() => setIsPickingColor(!isPickingColor)}
                        className={`px-3 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isPickingColor 
                            ? 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse' 
                            : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                        title="Click to activate Eyedropper, then tap on the picture."
                      >
                        <Pipette className={`w-3.5 h-3.5 ${isPickingColor ? 'text-rose-500' : 'text-zinc-500'}`} />
                        {isPickingColor ? 'Picking... (ছবিতে ক্লিক করুন)' : 'Eyedropper (ছবি থেকে রঙ নিন)'}
                      </button>

                      {/* Manual color swatch input */}
                      <input
                        type="color"
                        value={chromaKeyColor}
                        onChange={(e) => setChromaKeyColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 p-0 overflow-hidden shrink-0"
                      />

                      {/* HEX Code input field */}
                      <input
                        type="text"
                        value={chromaKeyColor}
                        onChange={(e) => setChromaKeyColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 font-mono text-xs focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Tolerance Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-655">
                        Color Similarity Tolerance (রঙের ব্যাপ্তি / মিল)
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {chromaKeyTolerance}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="1"
                      value={chromaKeyTolerance}
                      onChange={(e) => setChromaKeyTolerance(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <span className="text-[10px] text-zinc-500 leading-normal block mt-1.5">
                      এটি বাড়ালে টার্গেট রঙের কাছাকাছি অন্যান্য বৈচিত্র্যপূর্ণ অংশগুলোও মুছে যাবে। (Increase to erase color range gradients)
                    </span>
                  </div>

                  {/* Feathering Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-655">
                        Feather / Smooth Borders (নরম ধার / ফেদার)
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {chromaKeyFeather} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={chromaKeyFeather}
                      onChange={(e) => setChromaKeyFeather(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <span className="text-[10px] text-zinc-500 leading-normal block mt-1.5">
                      ছবির কিনারা মসৃণ ও ব্লেন্ড করার জন্য বর্ডারগুলোকে নরম বা ফেদার করে দেয়। (Increase to anti-alias borders smoothly)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Size & Placement Accordion */}
            <div className="border border-zinc-200/60 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('position')}
                className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 transition-colors border-b border-zinc-100 text-left font-extrabold text-zinc-700 text-[10px] uppercase tracking-wider cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5 text-zinc-800">
                  <Maximize className="w-3.5 h-3.5 text-zinc-650" />
                  Scale & Workspace Fit
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold lowercase">
                    {Math.round(transform.scale * 100)}% scale
                  </span>
                  {expandedSections.position ? (
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </div>
              </button>

              {expandedSections.position && (
                <div className="p-4 space-y-4 bg-white animate-fade-in">
                  {/* Subject Size Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-650">
                        Label Scale
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {Math.round(transform.scale * 100)}%
                      </span>
                    </div>
                    <input
                      id="scale-slider"
                      type="range"
                      min="0.2"
                      max="1.8"
                      step="0.02"
                      value={transform.scale}
                      onChange={(e) => updateTransform('scale', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Subject X offset */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-650">
                        Horizontal Offset
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {transform.offsetX}%
                      </span>
                    </div>
                    <input
                      id="offset-x-slider"
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={transform.offsetX}
                      onChange={(e) => updateTransform('offsetX', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Subject Y offset */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-650">
                        Vertical Offset
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {transform.offsetY}%
                      </span>
                    </div>
                    <input
                      id="offset-y-slider"
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={transform.offsetY}
                      onChange={(e) => updateTransform('offsetY', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Subject Rotation */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-650 flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Rotation Angle
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {transform.rotate}°
                      </span>
                    </div>
                    <input
                      id="rotate-slider"
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={transform.rotate}
                      onChange={(e) => updateTransform('rotate', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Color & Lighting Blending Accordion */}
            <div className="border border-zinc-200/60 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('lighting')}
                className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 transition-colors border-b border-zinc-100 text-left font-extrabold text-zinc-700 text-[10px] uppercase tracking-wider cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5 text-zinc-800">
                  <Sun className="w-3.5 h-3.5 text-zinc-655" />
                  Color Blending & Light
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold lowercase">
                    {transform.brightness}% brightness
                  </span>
                  {expandedSections.lighting ? (
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </div>
              </button>

              {expandedSections.lighting && (
                <div className="p-4 space-y-4 bg-white animate-fade-in">
                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-650 flex items-center gap-1">
                        Brightness
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {transform.brightness}%
                      </span>
                    </div>
                    <input
                      id="brightness-slider"
                      type="range"
                      min="50"
                      max="150"
                      step="1"
                      value={transform.brightness}
                      onChange={(e) => updateTransform('brightness', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-650 flex items-center gap-1">
                        Contrast
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {transform.contrast}%
                      </span>
                    </div>
                    <input
                      id="contrast-slider"
                      type="range"
                      min="50"
                      max="150"
                      step="1"
                      value={transform.contrast}
                      onChange={(e) => updateTransform('contrast', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-650">
                        Saturation
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {transform.saturation}%
                      </span>
                    </div>
                    <input
                      id="saturation-slider"
                      type="range"
                      min="0"
                      max="200"
                      step="2"
                      value={transform.saturation}
                      onChange={(e) => updateTransform('saturation', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Edge Cleansing and Halo Removers Accordion */}
            <div className="border border-zinc-200/60 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('edges')}
                className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 transition-colors border-b border-zinc-100 text-left font-extrabold text-zinc-700 text-[10px] uppercase tracking-wider cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5 text-zinc-800">
                  <Sparkle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Edge Cleansing & Halos
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    {edgeTrim}px trim
                  </span>
                  {expandedSections.edges ? (
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </div>
              </button>

              {expandedSections.edges && (
                <div className="p-4 space-y-4 bg-white animate-fade-in">
                  {/* Alpha Threshold */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-655 flex items-center gap-1">
                        Background Cutoff (Alpha / ব্যাকগ্রাউন্ড ছাঁটাই)
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {alphaThreshold}
                      </span>
                    </div>
                    <input
                      id="threshold-slider"
                      type="range"
                      min="5"
                      max="220"
                      step="5"
                      value={alphaThreshold}
                      onChange={(e) => setAlphaThreshold(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <span className="text-[10px] text-zinc-500 font-medium block mt-1.5 leading-normal">
                      এটি বাড়ালে ছবির চারপাশে লেগে থাকা ঝাপসা অংশ বা অতিরিক্ত ব্যাকগ্রাউন্ড রিমুভ হয়ে যাবে। (Increase to dissolve remaining halos)
                    </span>
                  </div>

                  {/* Edge Trim */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-655 flex items-center gap-1">
                        Edge Shrink (Erosion / ছবির ধার কাটা)
                      </span>
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {edgeTrim} px
                      </span>
                    </div>
                    <input
                      id="trim-slider"
                      type="range"
                      min="0"
                      max="6"
                      step="1"
                      value={edgeTrim}
                      onChange={(e) => setEdgeTrim(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <span className="text-[10px] text-zinc-500 font-medium block mt-1.5 leading-normal">
                      ছবির চারপাশের বর্ডার সামান্য কুঁচকে/কেটে ফেলার মাধ্যমে লেগে থাকা রঙ বা ব্যাকগ্রাউন্ডের কিনারা নিখুঁত রিমুভ করে। (Erase outer borders)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SHADOWS TAB ================= */}
        {activeTab === 'shadow' && (
          <div className="space-y-4 animate-fade-in">
            {/* Quick Fit layout actions */}
            <div>
              <span className="text-xs font-semibold text-zinc-500 block mb-2">Subject Layout Align</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Left', ox: -30, oy: 0 },
                  { label: 'Center', ox: 0, oy: 0 },
                  { label: 'Right', ox: 30, oy: 0 },
                  { label: 'Bottom', ox: 0, oy: 30 },
                  { label: 'Top', ox: 0, oy: -30 },
                  { label: 'Corner', ox: -30, oy: 30 },
                ].map((pos) => (
                  <button
                    key={pos.label}
                    id={`layout-align-${pos.label}`}
                    onClick={() => {
                      onTransformChange({
                        ...transform,
                        offsetX: pos.ox,
                        offsetY: pos.oy,
                      });
                    }}
                    className="py-1.5 px-2.5 rounded-lg border border-zinc-200 hover:border-black hover:bg-zinc-50 text-[10px] font-bold text-zinc-650 hover:text-black transition-all duration-150"
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Subject Shadow Style
              </label>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { id: 'none', name: 'No Shadow' },
                  { id: 'drop', name: 'Product Drop' },
                  { id: 'floor', name: 'Floor Shadow' },
                  { id: 'glow', name: 'Neon Glow' },
                ].map((s) => (
                  <button
                    key={s.id}
                    id={`shadow-style-${s.id}`}
                    onClick={() => updateShadow('type', s.id)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      shadow.type === s.id
                        ? 'border-black bg-zinc-50 text-black font-extrabold'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-500'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {shadow.type !== 'none' && (
                <div className="space-y-3 animate-slide-up">
                  {/* Shadow Opacity */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-600">Shadow Opacity</span>
                      <span className="text-xs font-bold font-mono text-zinc-500">
                        {Math.round(shadow.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      id="sha-opacity-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={shadow.opacity}
                      onChange={(e) => updateShadow('opacity', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Shadow Blur */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-600">Shadow Blur</span>
                      <span className="text-xs font-bold font-mono text-zinc-500">
                        {shadow.blur}px
                      </span>
                    </div>
                    <input
                      id="sha-blur-slider"
                      type="range"
                      min="0"
                      max="60"
                      step="2"
                      value={shadow.blur}
                      onChange={(e) => updateShadow('blur', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* Offset Y (not for floor shadow, which sits below the subject automatically) */}
                  {shadow.type !== 'floor' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-zinc-600">Offset Y</span>
                        <span className="text-xs font-bold font-mono text-zinc-500">
                          {shadow.offsetY}px
                        </span>
                      </div>
                      <input
                        id="sha-offset-y-slider"
                        type="range"
                        min="-50"
                        max="50"
                        step="2"
                        value={shadow.offsetY}
                        onChange={(e) => updateShadow('offsetY', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  )}

                  {/* Offset X (not for floor shadow) */}
                  {shadow.type !== 'floor' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-zinc-600">Offset X</span>
                        <span className="text-xs font-bold font-mono text-zinc-500">
                          {shadow.offsetX}px
                        </span>
                      </div>
                      <input
                        id="sha-offset-x-slider"
                        type="range"
                        min="-55"
                        max="55"
                        step="2"
                        value={shadow.offsetX}
                        onChange={(e) => updateShadow('offsetX', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  )}

                  {/* Shadow Color */}
                  <div>
                    <span className="text-xs font-semibold text-zinc-600 block mb-1">Shadow Tint</span>
                    <div className="flex items-center gap-2">
                      {['#000000', '#18181b', '#312e81', '#1e1b4b', '#4c0519'].map((col) => (
                        <button
                          key={col}
                          id={`shadow-color-btn-${col}`}
                          onClick={() => updateShadow('color', col)}
                          className={`w-6 h-6 rounded-full border border-zinc-200 transition-transform ${
                            shadow.color === col ? 'ring-2 ring-black ring-offset-1 scale-105' : ''
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Reset Button */}
      <div id="controls-footer" className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center shrink-0">
        <button
          id="control-reset-btn"
          onClick={() => {
            if (confirmReset) {
              onReset();
              setConfirmReset(false);
            } else {
              setConfirmReset(true);
              setTimeout(() => {
                setConfirmReset(false);
              }, 3000);
            }
          }}
          className={`text-xs font-bold transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${
            confirmReset 
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 animate-pulse' 
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          {confirmReset ? 'Tap again to reset all' : 'Reset adjustments'}
        </button>
        <span className="text-[10px] font-mono text-zinc-400">
          Background Remix Suite v1.5
        </span>
      </div>
    </div>
  );
}
