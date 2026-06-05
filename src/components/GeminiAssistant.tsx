/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Clipboard, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { GeminiSuggestion } from '../types';

interface GeminiAssistantProps {
  imageFile: File | null;
  onApplyColor: (color: string) => void;
  onApplyBackdrop: (themeUrl: string) => void;
  brandName?: string;
}

// Map output backdrop theme name to actual Unsplash preset image URL
const THEME_MAP: { [key: string]: string } = {
  'Marble Plate': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80',
  'Concrete Spotlight': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  'Golden Beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'Summer Forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80',
  'Wooden Deck': 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop&q=80',
  'Modern Space': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
  'Iridescent Waves': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'Cyberpunk Black': 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
};

export default function GeminiAssistant({
  imageFile,
  onApplyColor,
  onApplyBackdrop,
  brandName,
}: GeminiAssistantProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<GeminiSuggestion | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (imageFile) {
      analyzeImage(imageFile);
    } else {
      setSuggestion(null);
    }
  }, [imageFile]);

  const analyzeImage = (file: File) => {
    setLoading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const result = reader.result;
        if (!result || typeof result !== 'string') {
          throw new Error('Could not parse image data correctly.');
        }
        const splitted = result.split(',');
        if (splitted.length < 2) {
          throw new Error('Invalid image data URL format.');
        }
        const base64String = splitted[1];
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: base64String,
            mimeType: file.type,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to communicate with Art Director model.');
        }

        const data: GeminiSuggestion = await res.json();
        setSuggestion(data);
      } catch (err: any) {
        console.error('Error analyzing image:', err);
        setErrorMsg(err.message || 'Unable to connect to Art Director server.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Error reading selected picture file bytes.');
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleCopyAltText = () => {
    if (!suggestion) return;
    navigator.clipboard.writeText(suggestion.altText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div id="gemini-assistant-loading" className="rounded-2xl border border-zinc-200 bg-zinc-50/30 p-5 flex items-center gap-4 animate-pulse">
        <div className="p-3 rounded-full bg-zinc-100/50">
          <Sparkles className="w-5 h-5 text-zinc-900" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            {brandName || "My Studio"} Design AI Active
          </h4>
          <p className="text-xs text-zinc-500 truncate font-mono">
            Evaluating subject silhouette & stylistic values...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div id="gemini-assistant-error" className="rounded-2xl border border-rose-100 bg-rose-50/20 p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <div>
            <span className="text-xs font-semibold text-rose-800 block">Art Director Analysis Unavailable</span>
            <span className="text-[10px] text-zinc-500 font-mono block">{errorMsg}</span>
          </div>
        </div>
        <button
          id="assistant-retry-btn"
          onClick={() => imageFile && analyzeImage(imageFile)}
          className="p-2 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors"
          title="Retry Analysis"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
        </button>
      </div>
    );
  }

  if (!suggestion) return null;

  const resolvedBackdropUrl = THEME_MAP[suggestion.suggestedBackgroundTheme];

  return (
    <div id="gemini-assistant-card" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 text-zinc-800 animate-slide-up">
      {/* Header */}
      <div id="assistant-header" className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-black p-1.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 leading-none font-sans">
              {brandName || "My Studio"} AI Stylist Suggestion
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">Smart Color Palette Director</span>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-900 uppercase">
          {suggestion.subjectType}
        </span>
      </div>

      {/* Palette and Backdrop buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Colors */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">
            Complementary Studio Backdrops
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {suggestion.suggestedColors.map((hex) => (
              <button
                key={hex}
                id={`assistant-apply-color-${hex}`}
                onClick={() => onApplyColor(hex)}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-zinc-200 hover:border-black rounded-lg text-xs font-semibold cursor-pointer shadow-sm shadow-zinc-100/50 hover:shadow-zinc-250 active:scale-95 transition-all text-zinc-700"
              >
                <span className="w-3 h-3 rounded-full border border-zinc-100" style={{ backgroundColor: hex }} />
                <span>Apply {hex}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Backdrop Photo */}
        {resolvedBackdropUrl && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">
              Suggested Photo Setting
            </span>
            <button
              id="assistant-apply-setting"
              onClick={() => onApplyBackdrop(resolvedBackdropUrl)}
              className="group flex items-center gap-2 w-full p-2 bg-white border border-zinc-200 hover:border-black rounded-xl text-left transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-100">
                <img src={resolvedBackdropUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Suggested Theme Preset" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-zinc-900 block leading-none mb-1">
                  RECOMMENDED
                </span>
                <span className="text-xs font-bold text-zinc-800 block truncate leading-tight">
                  {suggestion.suggestedBackgroundTheme}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Director Notes */}
      <div className="bg-zinc-50/50 rounded-xl p-3 border border-zinc-100 space-y-1">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-normal block">
          AI Stylist Suggestions & Insights
        </span>
        <p className="text-xs text-zinc-650 leading-relaxed font-sans font-medium">
          {suggestion.marketingContext}
        </p>
      </div>

      {/* Alt description */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-normal block mb-1">
            SEO Accessibility Description (Alt Text)
          </span>
          <p className="text-xs text-zinc-500 leading-normal italic line-clamp-2">
            "{suggestion.altText}"
          </p>
        </div>
        <button
          id="assistant-copy-alt"
          type="button"
          onClick={handleCopyAltText}
          className="shrink-0 p-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-800 transition-colors shadow-sm active:scale-95 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}
