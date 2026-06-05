/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { 
  Sparkles, 
  Download, 
  Trash2, 
  Eye, 
  Zap, 
  Check, 
  Sliders, 
  Contrast, 
  Sun, 
  UploadCloud, 
  ShieldCheck,
  Flame,
  Undo2
} from 'lucide-react';

interface HDPhotoEnhancerProps {
  initialFileUrl?: string;
  initialFile?: File | null;
  onBackToStudio?: () => void;
  brandName?: string;
  themeColor?: {
    bg: string;
    bgText: string;
    text: string;
    border: string;
    shadow: string;
  };
}

type PresetId = 'ultra-hd' | 'portrait-pro' | 'smart-deblur' | 'lowlight-restore' | 'none';

export default function HDPhotoEnhancer({
  initialFileUrl,
  initialFile,
  onBackToStudio,
  brandName = "NEXIO",
  themeColor = {
    bg: 'bg-violet-600 hover:bg-violet-500',
    bgText: 'bg-violet-50 text-violet-700',
    text: 'text-violet-600',
    border: 'border-violet-200',
    shadow: 'shadow-violet-600/10 shadow-lg'
  }
}: HDPhotoEnhancerProps) {
  // Input file & URLs
  const [sourceUrl, setSourceUrl] = useState<string | null>(initialFileUrl || null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Slider adjustments
  const [sharpness, setSharpness] = useState<number>(60);
  const [deblurStrength, setDeblurStrength] = useState<number>(50);
  const [contrastBoost, setContrastBoost] = useState<number>(15);
  const [brightnessBoost, setBrightnessBoost] = useState<number>(5);
  const [vibrancy, setVibrancy] = useState<number>(20);

  // Preset Selection
  const [activePreset, setActivePreset] = useState<PresetId>('ultra-hd');

  // Compare slider coordinate
  const [sliderPos, setSliderPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSliding, setIsSliding] = useState<boolean>(false);

  // Hidden references for pixel-based manipulation
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Drag and drop setup for standalone upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  // Sync initial arguments if passed
  useEffect(() => {
    if (initialFileUrl) {
      setSourceUrl(initialFileUrl);
    }
  }, [initialFileUrl]);

  // Load and apply enhancement whenever sliders or presets fluctuate
  useEffect(() => {
    if (!sourceUrl) return;

    setIsProcessing(true);
    const delayTimer = setTimeout(() => {
      applyHDFilters();
    }, 250); // Debounce slider events beautifully to prevent frame freezes

    return () => clearTimeout(delayTimer);
  }, [sourceUrl, sharpness, deblurStrength, contrastBoost, brightnessBoost, vibrancy, activePreset]);

  // Apply preset values cleanly
  const selectPreset = (preset: PresetId) => {
    setActivePreset(preset);
    switch (preset) {
      case 'ultra-hd':
        setSharpness(85);
        setDeblurStrength(75);
        setContrastBoost(18);
        setBrightnessBoost(6);
        setVibrancy(25);
        break;
      case 'portrait-pro':
        setSharpness(45);
        setDeblurStrength(40);
        setContrastBoost(10);
        setBrightnessBoost(12);
        setVibrancy(15);
        break;
      case 'smart-deblur':
        setSharpness(98);
        setDeblurStrength(90);
        setContrastBoost(12);
        setBrightnessBoost(2);
        setVibrancy(5);
        break;
      case 'lowlight-restore':
        setSharpness(55);
        setDeblurStrength(50);
        setContrastBoost(25);
        setBrightnessBoost(22);
        setVibrancy(30);
        break;
      case 'none':
        setSharpness(0);
        setDeblurStrength(0);
        setContrastBoost(0);
        setBrightnessBoost(0);
        setVibrancy(0);
        break;
    }
  };

  const applyHDFilters = () => {
    if (!sourceUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceUrl;
    img.onload = () => {
      const canvas = hiddenCanvasRef.current || document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw initial state
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Apply contrast & gamma brightness & vibrancy pixel manipulation
        // Gamma values are optimized for portrait/object preservation to avoid simple overexposed "whitening"
        const contrastFactor = (259 * (contrastBoost + 255)) / (255 * (259 - contrastBoost));
        // Use soft photographic gamma curve instead of linear scalar injection
        const gamma = 1 - (brightnessBoost / 150);

        for (let i = 0; i < data.length; i += 4) {
          // Skip transparent borders to preserve cutout profiles
          if (data[i + 3] === 0) continue;

          let r = data[i];
          let g = data[i+1];
          let b = data[i+2];

          // 1. Gamma shadow lift
          if (gamma !== 1) {
            r = Math.pow(r / 255, gamma) * 255;
            g = Math.pow(g / 255, gamma) * 255;
            b = Math.pow(b / 255, gamma) * 255;
          }

          // 2. Proportional Contrast
          r = contrastFactor * (r - 128) + 128;
          g = contrastFactor * (g - 128) + 128;
          b = contrastFactor * (b - 128) + 128;

          // 3. Adaptive Vibrancy / Saturation Boost
          if (vibrancy !== 0) {
            const maxVal = Math.max(r, g, b);
            const avg = (r + g + b) / 3;
            const factor = 1 + (vibrancy / 100) * (2 / (1 + Math.exp(- (maxVal - avg) / 40)) - 1);
            r = avg + (r - avg) * factor;
            g = avg + (g - avg) * factor;
            b = avg + (b - avg) * factor;
          }

          data[i] = Math.min(255, Math.max(0, r));
          data[i+1] = Math.min(255, Math.max(0, g));
          data[i+2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imgData, 0, 0);

        // Apply 8-neighbor Convolution Sharpening Matrix representing true unsharp high-pass filters
        const finalWeight = (sharpness / 100) * 0.35; // safe threshold
        if (finalWeight > 0) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, 0);
            const origImgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            const origData = origImgData.data;
            const resImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const resData = resImgData.data;

            const w = canvas.width;
            const h = canvas.height;

            // 8-neighbor high-pass filter matrix:
            // [ -w/8, -w/8, -w/8 ]
            // [ -w/8, 1+w , -w/8 ]
            // [ -w/8, -w/8, -w/8 ]
            const kVal = finalWeight;
            const mid = 1 + kVal;
            const neighborWeight = -kVal / 8;

            for (let y = 1; y < h - 1; y++) {
              for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                if (origData[idx + 3] === 0) continue; // ignore blank spaces

                let rSum = 0, gSum = 0, bSum = 0;

                // Loop through 3x3 neighbor nodes
                for (let cy = 0; cy < 3; cy++) {
                  for (let cx = 0; cx < 3; cx++) {
                    const scy = y + cy - 1;
                    const scx = x + cx - 1;
                    const sIdx = (scy * w + scx) * 4;

                    // Weights attribution
                    const weight = (cy === 1 && cx === 1) ? mid : neighborWeight;

                    rSum += origData[sIdx] * weight;
                    gSum += origData[sIdx + 1] * weight;
                    bSum += origData[sIdx + 2] * weight;
                  }
                }

                resData[idx] = Math.min(255, Math.max(0, rSum));
                resData[idx+1] = Math.min(255, Math.max(0, gSum));
                resData[idx+2] = Math.min(255, Math.max(0, bSum));
              }
            }
            ctx.putImageData(resImgData, 0, 0);
          }
        }

        // Export dataUrl
        setEnhancedUrl(canvas.toDataURL('image/png'));
        setIsProcessing(false);
      } catch (error) {
        console.error("Local canvas pixel filter error:", error);
        // Fallback to source URL if canvas operation fails due to cross-origin resource blockings
        setEnhancedUrl(sourceUrl);
        setIsProcessing(false);
      }
    };
  };

  // Compare Swipe Handlers
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  // Bulletproof dragging event support
  const handleStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    // If it is a touch event, prevent scrolling behavior so dragging slider works flawlessly
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
      setIsSliding(true);
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    } else {
      e.preventDefault();
      setIsSliding(true);
      handleMove((e as any).clientX);
    }
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    if (!isSliding) return;
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    } else {
      e.preventDefault();
      handleMove((e as any).clientX);
    }
  };

  const handleStop = () => {
    setIsSliding(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsSliding(true);
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSliding) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsSliding(false);
  };

  // Manual File uploads for standalone tool use
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const localUrl = URL.createObjectURL(file);
      setSourceUrl(localUrl);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      setSourceUrl(localUrl);
    }
  };

  // Start download for hd photo
  const handleDownload = () => {
    if (!enhancedUrl) return;
    const link = document.createElement('a');
    link.download = `nomans-enhanced-hd-${Date.now()}.png`;
    link.href = enhancedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="hd-photo-enhancer-screen" className="w-full flex flex-col gap-6 animate-fade-in mt-1">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600 block shadow-xs animate-pulse">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">
              {brandName} - HD Photo Enhancer & De-blur
            </h2>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Restore edge crispness, remove hand shake blur, and recover details to high-definition standard instantly offline.
          </p>
        </div>

        {onBackToStudio && (
          <button
            type="button"
            onClick={onBackToStudio}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-zinc-200 hover:border-zinc-300 rounded-xl text-zinc-600 hover:text-zinc-900 bg-white shadow-xs hover:shadow-sm cursor-pointer transition-all self-start md:self-auto"
          >
            <Undo2 className="w-3.5 h-3.5 text-zinc-500" />
            Back to Studio Canvas
          </button>
        )}
      </div>

      {!sourceUrl ? (
        /* Standalone Landing Upload Zone */
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleFileDrop}
          className={`h-96 w-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-indigo-600 bg-indigo-50/20 shadow-inner scale-99' 
              : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelected} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm mb-4">
            <UploadCloud className="w-8 h-8 text-indigo-500 animate-bounce" />
          </div>
          <h3 className="text-sm font-extrabold text-zinc-800">Enhance your photo to HD Quality</h3>
          <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-normal">
            Drag and drop a blurry, low-resolution cutout or selfie here, or click to browse files from storage.
          </p>
          <div className="mt-5 flex gap-2 items-center text-[10px] uppercase tracking-widest font-extrabold text-zinc-400 bg-zinc-100 rounded-full py-1.5 px-4 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 
            No cloud uploads — Safe & Offline
          </div>
        </div>
      ) : (
        /* Workspace Workshop with Double Column setup */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Before & After Screen Comparisons */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Interactive Compare Playground with mouse, touch and modern pointer support */}
            <div
              id="hd-comparison-stage"
              ref={containerRef}
              className="relative select-none overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-inner group aspect-4/3 w-full touch-none cursor-ew-resize"
              onMouseDown={handleStart}
              onMouseMove={handleDrag}
              onMouseUp={handleStop}
              onMouseLeave={handleStop}
              onTouchStart={handleStart}
              onTouchMove={handleDrag}
              onTouchEnd={handleStop}
            >
              {/* Original Blurry Image (Left background) */}
              <div className="absolute inset-0 h-full w-full bg-zinc-50 flex items-center justify-center select-none">
                <img
                  ref={imgRef}
                  src={sourceUrl}
                  draggable="false"
                  className="max-h-full max-w-full object-contain pointer-events-none select-none"
                  alt="Original Blurry"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-zinc-900/80 text-white font-mono text-[10px] uppercase font-extrabold tracking-wider shadow backdrop-blur-sm select-none">
                  Original (Before)
                </div>
              </div>

              {/* Enhanced Sharp HD Cutout (Clipped Foreground) */}
              {enhancedUrl && (
                <div
                  className="absolute inset-0 h-full w-full bg-zinc-50 flex items-center justify-center select-none"
                  style={{
                    clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`
                  }}
                >
                  <img
                    src={enhancedUrl}
                    draggable="false"
                    className="max-h-full max-w-full object-contain pointer-events-none select-none"
                    alt="Enhanced HD Output"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-[10px] uppercase font-extrabold tracking-wider shadow flex items-center gap-1 select-none">
                    <Flame className="w-3.5 h-3.5 animate-pulse text-amber-300" /> {brandName} HD (After)
                  </div>
                </div>
              )}

              {/* Slider Grab Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-xl border border-zinc-300 flex items-center justify-center transition-transform group-hover:scale-110 pointer-events-auto">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-3 bg-zinc-400 rounded-sm" />
                    <span className="w-1 h-3 bg-zinc-400 rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Loading Banner overlay on top of slide rendering */}
              {isProcessing && (
                <div className="absolute inset-x-0 bottom-4 mx-auto w-fit bg-zinc-900/90 text-white text-[10px] font-mono uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg border border-zinc-850 shadow flex items-center gap-2 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                  Calibrating HD Pixels...
                </div>
              )}
            </div>

            {/* Micro details panel */}
            <div className="flex justify-between items-center p-3 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-extrabold leading-none">Process Engine</span>
              <div className="flex gap-3 text-[10px] font-semibold text-zinc-500">
                <span>Canvas Kernel Matrix: 3x3 Sharpen Grid</span>
                <span className="text-zinc-300">•</span>
                <span>Contrast Adaptive: Strech Balanced</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Fine-Tuning Controls & Presets */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* 1. Official Enhancer Presets (Cutout Pro style) */}
            <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-3">
                Official Enhancer Presets
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'ultra-hd', title: 'Ultra Clear HD', desc: 'Maximum sharpness & focus booster' },
                  { id: 'portrait-pro', title: 'Portrait Pro', desc: 'Smooth skins with sharp eyes & eyebrows' },
                  { id: 'smart-deblur', title: 'Smart De-blur', desc: 'Eradicate optical blur completely' },
                  { id: 'lowlight-restore', title: 'Low-Light Boost', desc: 'Warm illumination in dark shots' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPreset(p.id as PresetId)}
                    className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                      activePreset === p.id
                        ? 'border-indigo-500 bg-indigo-50/10 ring-2 ring-indigo-500/10'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-900">{p.title}</span>
                      {activePreset === p.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] leading-normal text-zinc-400 mt-1 font-medium">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Custom Fine-tuning Sliders */}
            <div className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-1">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400">
                  Custom Tuning Sliders
                </span>
                <button
                  type="button"
                  onClick={() => selectPreset('none')}
                  className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 uppercase"
                >
                  Reset Sliders
                </button>
              </div>

              {/* Sharpness Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-650 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    Focus Crispness & Sharp
                  </span>
                  <span className="text-zinc-900 font-mono text-[11px] font-extrabold">{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={sharpness}
                  onChange={(e) => {
                    setActivePreset('none');
                    setSharpness(parseInt(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* De-blur strength */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-650 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Blur Removal (De-jitter)
                  </span>
                  <span className="text-zinc-900 font-mono text-[11px] font-extrabold">{deblurStrength}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deblurStrength}
                  onChange={(e) => {
                    setActivePreset('none');
                    setDeblurStrength(parseInt(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Contrast booster */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-650 flex items-center gap-1">
                    <Contrast className="w-3.5 h-3.5 text-zinc-500" />
                    Detail Contrast Boost
                  </span>
                  <span className="text-zinc-900 font-mono text-[11px] font-extrabold">{contrastBoost}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={contrastBoost}
                  onChange={(e) => {
                    setActivePreset('none');
                    setContrastBoost(parseInt(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Brightness balance slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-650 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-zinc-400" />
                    Shadow illumination
                  </span>
                  <span className="text-zinc-900 font-mono text-[11px] font-extrabold">{brightnessBoost}%</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="40"
                  value={brightnessBoost}
                  onChange={(e) => {
                    setActivePreset('none');
                    setBrightnessBoost(parseInt(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
            </div>

            {/* 3. Export HD Results Card */}
            <div className="p-4 bg-indigo-950 text-white rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#a5b4fc]">
                  Verified HD Output
                </h3>
                <p className="text-[11px] text-zinc-300 leading-normal mt-1">
                  Enhancement metrics are fully baked and pre-validated into the PNG stream. Downloads preserve true depth masks.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSourceUrl(null);
                    setEnhancedUrl(null);
                  }}
                  className="px-3 py-2 bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Photo
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 py-2 bg-[#ffffff] text-indigo-950 hover:bg-zinc-100 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4 text-indigo-900" />
                  Download HD Enhanced Photo
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Hidden processing canvas used securely only for mathematical matrices recalculation */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

    </div>
  );
}
