/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Download, 
  SlidersHorizontal, 
  Edit3, 
  Upload, 
  Undo, 
  Image as ImageIcon,
  CheckCircle, 
  Layout, 
  ChevronRight, 
  Scissors, 
  Eye, 
  FileImage,
  Layers,
  Sparkle,
  Lock,
  LogOut,
  Activity,
  Database,
  Code,
  Key,
  Plus,
  Minus,
  RotateCw,
  Menu,
  X,
  MessageSquare,
  Send,
  Bot,
  HelpCircle,
  User,
  Shield,
  Save,
  AlertTriangle
} from 'lucide-react';
// @ts-ignore
import * as imglyRemoveBackground from '@imgly/background-removal';
// @ts-ignore
import { removeBackground as namedRemoveBackground } from '@imgly/background-removal';

const getRemoveBackgroundFunction = () => {
  if (typeof namedRemoveBackground === 'function') {
    return namedRemoveBackground;
  }
  if (imglyRemoveBackground && typeof imglyRemoveBackground.removeBackground === 'function') {
    return imglyRemoveBackground.removeBackground;
  }
  const anyImgly = imglyRemoveBackground as any;
  if (anyImgly && anyImgly.default) {
    if (typeof anyImgly.default === 'function') {
      return anyImgly.default;
    }
    if (typeof anyImgly.default.removeBackground === 'function') {
      return anyImgly.default.removeBackground;
    }
  }
  if (typeof imglyRemoveBackground === 'function') {
    return imglyRemoveBackground;
  }
  return namedRemoveBackground;
};

const removeBackground: any = getRemoveBackgroundFunction();


import { 
  AppStatus, 
  BgType, 
  ForegroundTransform, 
  ShadowSettings, 
  ProcessedImage 
} from './types';

import ImageDropzone from './components/ImageDropzone';
import CompareSlider from './components/CompareSlider';
import StudioControls from './components/StudioControls';
import GeminiAssistant from './components/GeminiAssistant';
import HDPhotoEnhancer from './components/HDPhotoEnhancer';

const DEFAULT_TRANSFORM: ForegroundTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotate: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

const DEFAULT_SHADOW: ShadowSettings = {
  type: 'none',
  blur: 16,
  offsetY: 10,
  offsetX: 0,
  opacity: 0.4,
  color: '#000000',
};

const getColorClasses = (color: string) => {
  switch (color) {
    case 'emerald':
      return {
        bg: 'bg-emerald-600 hover:bg-emerald-500',
        bgText: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-600',
        accentText: 'text-emerald-700',
        border: 'border-emerald-200',
        ring: 'ring-emerald-500/20',
        shadow: 'shadow-emerald-600/10 shadow-lg',
        label: 'Emerald Theme'
      };
    case 'sky':
      return {
        bg: 'bg-sky-600 hover:bg-sky-500',
        bgText: 'bg-sky-50 text-sky-700',
        text: 'text-sky-600',
        accentText: 'text-sky-700',
        border: 'border-sky-200',
        ring: 'ring-sky-500/20',
        shadow: 'shadow-sky-600/10 shadow-lg',
        label: 'Sky Theme'
      };
    case 'rose':
      return {
        bg: 'bg-rose-600 hover:bg-rose-500',
        bgText: 'bg-rose-50 text-rose-700',
        text: 'text-rose-600',
        accentText: 'text-rose-700',
        border: 'border-rose-200',
        ring: 'ring-rose-500/20',
        shadow: 'shadow-rose-600/10 shadow-lg',
        label: 'Rose Theme'
      };
    case 'amber':
      return {
        bg: 'bg-amber-600 hover:bg-amber-500',
        bgText: 'bg-amber-50 text-amber-700',
        text: 'text-amber-600',
        accentText: 'text-amber-700',
        border: 'border-amber-200',
        ring: 'ring-amber-500/20',
        shadow: 'shadow-amber-600/10 shadow-lg',
        label: 'Amber Theme'
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-600 hover:bg-indigo-500',
        bgText: 'bg-[#e0e7ff] text-[#4338ca]',
        text: 'text-[#6366f1]',
        accentText: 'text-[#4338ca]',
        border: 'border-[#c7d2fe]',
        ring: 'ring-indigo-500/20',
        shadow: 'shadow-[#6366f1]/10 shadow-lg',
        label: 'Indigo Theme'
      };
    case 'violet':
    default:
      return {
        bg: 'bg-violet-600 hover:bg-violet-500',
        bgText: 'bg-violet-50 text-violet-700',
        text: 'text-violet-600',
        accentText: 'text-violet-700',
        border: 'border-violet-200',
        ring: 'ring-violet-500/20',
        shadow: 'shadow-violet-600/10 shadow-lg',
        label: 'Violet Theme'
      };
  }
};

export default function App() {
  // App primary states
  const [status, setStatus] = useState<AppStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Active loaded image details
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageObject, setImageObject] = useState<ProcessedImage | null>(null);

  // Layout mode controls
  const [viewMode, setViewMode] = useState<'remix' | 'compare'>('remix');
  const [showManualEditor, setShowManualEditor] = useState<boolean>(false);

  // User customizable branding & theme preferences loaded from localStorage
  const [brandName, setBrandName] = useState<string>(() => {
    return localStorage.getItem('app-brand-name') || "Noman's Studio";
  });
  const [creatorCredit, setCreatorCredit] = useState<string>(() => {
    return localStorage.getItem('app-creator-credit') || "Custom Crafted by Noman";
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('app-accent-color') || "violet";
  });

  // Upgraded Full User Panel customization state variables controlled by Admin panel
  const [defaultProcessingMode, setDefaultProcessingMode] = useState<'ultra-fast' | 'high-quality'>(() => {
    return (localStorage.getItem('app-default-processing-mode') as 'ultra-fast' | 'high-quality') || 'high-quality';
  });
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState<number>(() => {
    return parseInt(localStorage.getItem('app-max-upload') || '15', 10);
  });
  const [defaultBgColor, setDefaultBgColor] = useState<string>(() => {
    return localStorage.getItem('app-default-bgcolor') || '#ffffff';
  });
  const [enableDownloadWatermark, setEnableDownloadWatermark] = useState<boolean>(() => {
    return localStorage.getItem('app-enable-watermark') === 'true';
  });
  const [enabledPresets, setEnabledPresets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('app-enabled-presets');
      return stored ? JSON.parse(stored) : ['original', 'bd-passport', 'bd-stamp', 'us-passport', 'custom'];
    } catch {
      return ['original', 'bd-passport', 'bd-stamp', 'us-passport', 'custom'];
    }
  });
  const [colorPresets, setColorPresets] = useState<Array<{ name: string; value: string }>>(() => {
    try {
      const stored = localStorage.getItem('app-color-presets');
      return stored ? JSON.parse(stored) : [
        { name: 'White', value: '#ffffff' },
        { name: 'Studio Grey', value: '#f4f4f5' },
        { name: 'Sleek Dark', value: '#18181b' },
        { name: 'Warm Peach', value: '#ffe4e6' },
        { name: 'Soft Mint', value: '#ecfdf5' },
        { name: 'Lavender', value: '#faf5ff' },
        { name: 'Tech Blue', value: '#eff6ff' },
        { name: 'Sunny Yellow', value: '#fefce8' },
      ];
    } catch {
      return [
        { name: 'White', value: '#ffffff' },
        { name: 'Studio Grey', value: '#f4f4f5' },
        { name: 'Sleek Dark', value: '#18181b' },
        { name: 'Warm Peach', value: '#ffe4e6' },
        { name: 'Soft Mint', value: '#ecfdf5' },
        { name: 'Lavender', value: '#faf5ff' },
        { name: 'Tech Blue', value: '#eff6ff' },
        { name: 'Sunny Yellow', value: '#fefce8' },
      ];
    }
  });

  // Dual Confirmation dialogue states
  const [isConfirmingSave, setIsConfirmingSave] = useState<boolean>(false);
  const [showSaveSuccessToast, setShowSaveSuccessToast] = useState<boolean>(false);

  // Temporary container storing edited form configs before clicking the Save Button
  const [tempSettings, setTempSettings] = useState(() => {
    return {
      brandName: localStorage.getItem('app-brand-name') || "Noman's Studio",
      creatorCredit: localStorage.getItem('app-creator-credit') || "Custom Crafted by Noman",
      accentColor: localStorage.getItem('app-accent-color') || "violet",
      adminUsername: localStorage.getItem('app-admin-username') || 'admin',
      adminActualPasscode: localStorage.getItem('app-admin-passcode') || '1234',
      defaultProcessingMode: (localStorage.getItem('app-default-processing-mode') as 'ultra-fast' | 'high-quality') || 'high-quality',
      maxUploadSizeMb: parseInt(localStorage.getItem('app-max-upload') || '15', 10),
      defaultBgColor: localStorage.getItem('app-default-bgcolor') || '#ffffff',
      enableDownloadWatermark: localStorage.getItem('app-enable-watermark') === 'true',
      enabledPresets: (() => {
        try {
          const stored = localStorage.getItem('app-enabled-presets');
          return stored ? JSON.parse(stored) : ['original', 'bd-passport', 'bd-stamp', 'us-passport', 'custom'];
        } catch {
          return ['original', 'bd-passport', 'bd-stamp', 'us-passport', 'custom'];
        }
      })() as string[],
      colorPresets: (() => {
        try {
          const stored = localStorage.getItem('app-color-presets');
          return stored ? JSON.parse(stored) : [
            { name: 'White', value: '#ffffff' },
            { name: 'Studio Grey', value: '#f4f4f5' },
            { name: 'Sleek Dark', value: '#18181b' },
            { name: 'Warm Peach', value: '#ffe4e6' },
            { name: 'Soft Mint', value: '#ecfdf5' },
            { name: 'Lavender', value: '#faf5ff' },
            { name: 'Tech Blue', value: '#eff6ff' },
            { name: 'Sunny Yellow', value: '#fefce8' },
          ];
        } catch {
          return [
            { name: 'White', value: '#ffffff' },
            { name: 'Studio Grey', value: '#f4f4f5' },
            { name: 'Sleek Dark', value: '#18181b' },
            { name: 'Warm Peach', value: '#ffe4e6' },
            { name: 'Soft Mint', value: '#ecfdf5' },
            { name: 'Lavender', value: '#faf5ff' },
            { name: 'Tech Blue', value: '#eff6ff' },
            { name: 'Sunny Yellow', value: '#fefce8' },
          ];
        }
      })() as Array<{ name: string; value: string }>
    };
  });
  
  // App separation modes & authentication states
  const [adminUsername, setAdminUsername] = useState<string>(() => {
    return localStorage.getItem('app-admin-username') || 'admin';
  });
  const [appMode, setAppMode] = useState<'user' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('app-admin-authenticated') === 'true';
  });
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminActualPasscode, setAdminActualPasscode] = useState<string>(() => {
    return localStorage.getItem('app-admin-passcode') || '1234';
  });
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
  const [adminErrorMessage, setAdminErrorMessage] = useState<string>('');
  const [activeAdminTab, setActiveAdminTab] = useState<'settings' | 'developer'>('settings');

  // Backdrop color preset inputs
  const [newPresetColorName, setNewPresetColorName] = useState<string>('');
  const [newPresetColorHex, setNewPresetColorHex] = useState<string>('#3b82f6');

  // Photo size presets and output crop configurations
  const [selectedSizePreset, setSelectedSizePreset] = useState<'original' | 'bd-passport' | 'bd-stamp' | 'us-passport' | 'custom'>('original');
  const [customWidth, setCustomWidth] = useState<number>(600);
  const [customHeight, setCustomHeight] = useState<number>(600);
  const [customUnit, setCustomUnit] = useState<'px' | 'mm'>('px');

  // Interactive precision cutout edge cleaners
  const [edgeTrim, setEdgeTrim] = useState<number>(0);
  const [alphaThreshold, setAlphaThreshold] = useState<number>(35);

  // Magic Color Eraser / Chroma Keying options
  const [bgRemoveMethod, setBgRemoveMethod] = useState<'ai' | 'chroma-key'>('ai');
  const [chromaKeyColor, setChromaKeyColor] = useState<string>('#ffffff');
  const [chromaKeyTolerance, setChromaKeyTolerance] = useState<number>(30);
  const [chromaKeyFeather, setChromaKeyFeather] = useState<number>(10);
  const [isPickingColor, setIsPickingColor] = useState<boolean>(false);

  // Responsive sliding features sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeAppSection, setActiveAppSection] = useState<'studio' | 'enhancer'>('studio');

  // Background removal speed/quality profile config
  const [processingMode, setProcessingMode] = useState<'ultra-fast' | 'high-quality'>(() => {
    return (localStorage.getItem('app-default-processing-mode') as 'ultra-fast' | 'high-quality') || 'high-quality';
  });

  // Drag-and-drop interactive state values for subject adjustments
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  // Help Desk and Secret Admin States
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState<boolean>(false);
  const [helpDeskInput, setHelpDeskInput] = useState<string>('');
  const [helpDeskPasswordInput, setHelpDeskPasswordInput] = useState<string>('');
  const [showHelpDeskPassword, setShowHelpDeskPassword] = useState<boolean>(false);
  const [helpDeskError, setHelpDeskError] = useState<string>('');
  const [helpDeskMessages, setHelpDeskMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; isPasswordPrompt?: boolean; id: string }>>([
    {
      id: 'init-1',
      sender: 'bot',
      text: "আসসালামু আলাইকুম ও স্বাগতম! আমি এই অ্যাপের সাপোর্ট রোবট। আপনাকে কীভাবে সাহায্য করতে পারি? নিচের যেকোনো প্রশ্ন সিলেক্ট করতে পারেন বা সরাসরি মেসেজ বক্সে জিজ্ঞেস করতে পারেন।"
    }
  ]);
  const [isSidebarSupportChatOpen, setIsSidebarSupportChatOpen] = useState<boolean>(false);
  const helpDeskMessagesEndRef = useRef<HTMLDivElement>(null);

  const lastFilterRequestId = useRef(0);

  const applyEdgeRefinementAndKeying = (
    rawUrl: string,
    trimAmount: number,
    cutoff: number,
    method: 'ai' | 'chroma-key',
    keyColorHex: string,
    tolerance: number,
    feather: number
  ) => {
    const reqId = ++lastFilterRequestId.current;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (reqId !== lastFilterRequestId.current) return;
      
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      
      // If method is chroma-key, remove target color with tolerance and feather
      if (method === 'chroma-key') {
        const hex = keyColorHex.replace('#', '');
        const targetR = parseInt(hex.substring(0, 2), 16) || 0;
        const targetG = parseInt(hex.substring(2, 4), 16) || 0;
        const targetB = parseInt(hex.substring(4, 6), 16) || 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a === 0) continue;
          
          const diffR = r - targetR;
          const diffG = g - targetG;
          const diffB = b - targetB;
          const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);
          
          if (dist < tolerance) {
            data[i + 3] = 0;
          } else if (dist < tolerance + feather && feather > 0) {
            const ratio = (dist - tolerance) / feather;
            data[i + 3] = Math.min(a, Math.floor(ratio * 255));
          }
        }
      }
      
      // 1. Alpha Threshold Cutoff (to remove faint background halos / semi-transparent outer noise)
      if (cutoff > 0) {
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < cutoff) {
            data[i + 3] = 0;
          }
        }
      }
      
      // 2. Edge Erosion / Shrinking (to trim away outermost border pixels containing background bleed)
      if (trimAmount > 0) {
        let currentAlpha = new Uint8ClampedArray(w * h);
        for (let i = 0; i < w * h; i++) {
          currentAlpha[i] = data[i * 4 + 3];
        }
        
        for (let t = 0; t < trimAmount; t++) {
          const nextAlpha = new Uint8ClampedArray(currentAlpha);
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const idx = y * w + x;
              if (currentAlpha[idx] > 0) {
                // If any adjacent neighbor is fully transparent, erase this boundary pixel
                if (currentAlpha[idx - 1] === 0 || 
                    currentAlpha[idx + 1] === 0 || 
                    currentAlpha[idx - w] === 0 || 
                    currentAlpha[idx + w] === 0) {
                  nextAlpha[idx] = 0;
                }
              }
            }
          }
          currentAlpha = nextAlpha;
        }
        
        for (let i = 0; i < w * h; i++) {
          data[i * 4 + 3] = currentAlpha[i];
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      // Draw or output URL
      const refinedUrl = canvas.toDataURL('image/png');
      
      setImageObject(prev => {
        if (!prev) return null;
        if (prev.processedUrl === refinedUrl) return prev;
        return {
          ...prev,
          processedUrl: refinedUrl
        };
      });
    };
    img.onerror = () => {
      console.warn('Could not load original image for edge refinement.');
    };
    img.src = rawUrl;
  };

  useEffect(() => {
    if (imageObject) {
      const sourceUrl = bgRemoveMethod === 'chroma-key' 
        ? imageObject.originalUrl 
        : (imageObject.rawProcessedUrl || imageObject.processedUrl);
      
      if (sourceUrl) {
        applyEdgeRefinementAndKeying(
          sourceUrl,
          edgeTrim,
          alphaThreshold,
          bgRemoveMethod,
          chromaKeyColor,
          chromaKeyTolerance,
          chromaKeyFeather
        );
      }
    }
  }, [
    imageObject?.rawProcessedUrl,
    imageObject?.originalUrl,
    edgeTrim,
    alphaThreshold,
    bgRemoveMethod,
    chromaKeyColor,
    chromaKeyTolerance,
    chromaKeyFeather
  ]);

  useEffect(() => {
    if (isSidebarSupportChatOpen) {
      setTimeout(() => {
        helpDeskMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [helpDeskMessages, isSidebarSupportChatOpen]);

  const handleUpdateBrand = (name: string) => {
    setBrandName(name);
    localStorage.setItem('app-brand-name', name);
  };

  const handleUpdateCredit = (credit: string) => {
    setCreatorCredit(credit);
    localStorage.setItem('app-creator-credit', credit);
  };

  const handleUpdateAccentColor = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('app-accent-color', color);
  };

  const handleVerifyPasscode = () => {
    if (adminPasscodeInput === adminActualPasscode) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('app-admin-authenticated', 'true');
      setAppMode('admin');
      setShowPasscodeModal(false);
      setAdminErrorMessage('');
      setAdminPasscodeInput('');
    } else {
      setAdminErrorMessage('Incorrect Passcode. Access Denied!');
    }
  };

  const handleUpdateUsername = (newUser: string) => {
    setAdminUsername(newUser);
    localStorage.setItem('app-admin-username', newUser);
  };

  const handleUpdatePasscode = (newPass: string) => {
    setAdminActualPasscode(newPass);
    localStorage.setItem('app-admin-passcode', newPass);
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.setItem('app-admin-authenticated', 'false');
    setAppMode('user');
  };

  const handleHelpDeskSend = (msgText?: string) => {
    const textToSend = msgText !== undefined ? msgText : helpDeskInput;
    if (!textToSend.trim()) return;

    // Add user message via functional state update to guarantee correctness
    const userMsgId = 'user-' + Date.now();
    setHelpDeskMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user' as const, text: textToSend }
    ]);

    if (msgText === undefined) {
      setHelpDeskInput('');
    }

    // Process Bot Response
    setTimeout(() => {
      const lowerText = textToSend.toLowerCase().trim();
      const botMsgId = 'bot-' + Date.now();
      let botText = '';
      let isPrompt = false;

      // Special secret username verification matching the adminUsername state
      const currentAdminUsername = (adminUsername || 'admin').toLowerCase().trim();
      if (lowerText === currentAdminUsername) {
        botText = "🔑 Administrator status recognized! Please enter your administrative PIN passcode below to authenticate and unlock hidden settings:";
        isPrompt = true;
        setShowHelpDeskPassword(true);
      } else if (lowerText.includes('background') || lowerText.includes('রিমুভ') || lowerText.includes('ব্যাকগ্রাউন্ড') || lowerText.includes('remove') || lowerText.includes('মুছব')) {
        botText = "👉 ছবি আপলোড করলেই আমাদের রিমুভাল মডেল স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ড সরিয়ে দেবে এবং চমৎকার পারফেক্ট কাটআউট তৈরি করবে! আপনি 'Remix' এবং 'Compare' মোড দিয়ে কাজ যাচাই করতে পারবেন।";
      } else if (lowerText.includes('hd') || lowerText.includes('enhancer') || lowerText.includes('ঝাপসা') || lowerText.includes('স্পষ্ট') || lowerText.includes('পরিষ্কার')) {
        botText = "👉 মেনু বার থেকে 'Pro Photo HD Enhancer' অপশনটি চালু করুন। এটি আপনার অস্পষ্ট, ঘোলা বা জুম করা বা কম রেজোলিউশনের ছবির ডিটেইলস বাড়িয়ে একদম চোখধাঁধানো ক্রিস্টাল ক্লিয়ার এইচডি (Ultra detailed) করে তুলতে সাহায্য করে।";
      } else if (lowerText.includes('resize') || lowerText.includes('সাইজ') || lowerText.includes('ক্রপ') || lowerText.includes('crop') || lowerText.includes('passport') || lowerText.includes('পাসপোর্ট')) {
        botText = "👉 আমাদের স্টুডিও প্যানেলে আপনি 'BD Passport', 'BD Stamp', 'US Passport' অথবা নিজস্ব কাস্টম পরিমাপে (Pixels বা Millimeters) ছবি ক্রপ করে কাস্টমাইজ করতে পারবেন। এক্সপোর্ট করার সময় এগুলো যথাযথ সাইজে তৈরি হবে।";
      } else if (lowerText.includes('offline') || lowerText.includes('privacy') || lowerText.includes('নিরাপত্তা') || lowerText.includes('অফলাইন') || lowerText.includes('সার্ভার') || lowerText.includes('সুরক্ষা')) {
        botText = "👉 আমাদের ইমেজ প্রসেসিং সিস্টেমটি সম্পূর্ণ ব্রাউজার-ভিত্তিক অফলাইন প্রযুক্তিতে চলে। আপনার কোনো ছবি কোনো সার্ভার বা ইন্টারনেটে পাঠানো হয় না। আপনার ছবির শতভাগ নিরাপত্তা আমাদের প্রথম অগ্রাধিকার!";
      } else {
        botText = "আমি আপনার প্রশ্নটি বুঝতে পারিনি। যেকোনো ফিচার সম্পর্কে জানতে নিচের টপিকগুলো ক্লিক করতে পারেন, অথবা চাইলে কাঙ্খিত প্রশ্নের কি-ওয়ার্ডটি টাইপ করতে পারেন।";
      }

      setHelpDeskMessages(prev => [
        ...prev,
        { id: botMsgId, sender: 'bot' as const, text: botText, isPasswordPrompt: isPrompt }
      ]);
    }, 600);
  };

  const handleHelpDeskPasswordVerify = () => {
    if (helpDeskPasswordInput === adminActualPasscode) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('app-admin-authenticated', 'true');
      setAppMode('admin');
      
      const successId = 'bot-success-' + Date.now();
      setHelpDeskMessages(prev => [
        ...prev,
        { 
          id: successId, 
          sender: 'bot', 
          text: `🎉 অভিনন্দন! অ্যাডমিন প্যানেল সফলভাবে আনলক হয়েছে। আপনাকে এডমিন ব্রান্ডিং ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...` 
        }
      ]);
      setHelpDeskPasswordInput('');
      setShowHelpDeskPassword(false);
      setHelpDeskError('');
      
      setTimeout(() => {
        setIsHelpDeskOpen(false);
        setIsSidebarOpen(false);
      }, 1500);
    } else {
      setHelpDeskError('ভুল পাসকোড! পুনরায় সঠিক পাসকোড দিয়ে চেষ্টা করুন।');
    }
  };

  const theme = getColorClasses(accentColor);

  // History list of files previously uploaded in session
  const [batchQueue, setBatchQueue] = useState<Array<{ file: File; thumbUrl: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to load, scale and normalize image types to standard PNG
  const normalizeAndScaleImage = (file: File): Promise<{ blob: Blob; dimensions: { width: number; height: number } }> => {
    return new Promise((resolve, reject) => {
      const originalUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        // Define maximum image resolution cap (e.g., 2048px maximum on longest side)
        // Helps to dramatically speed up background removal as well as preventing Web Worker out-of-memory crashes
        const maxDim = processingMode === 'ultra-fast' ? 1024 : 2048;
        let targetWidth = width;
        let targetHeight = height;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            targetWidth = maxDim;
            targetHeight = Math.round((height * maxDim) / width);
          } else {
            targetHeight = maxDim;
            targetWidth = Math.round((width * maxDim) / height);
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(originalUrl);
          resolve({ blob: file, dimensions: { width, height } });
          return;
        }
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(originalUrl);
          if (blob) {
            resolve({ blob, dimensions: { width: targetWidth, height: targetHeight } });
          } else {
            resolve({ blob: file, dimensions: { width, height } });
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(originalUrl);
        reject(new Error('The source image could not be decoded. Please make sure the file is a valid, uncorrupted image.'));
      };
      
      img.src = originalUrl;
    });
  };

  // Initialize and run the automated background remover model on file selection
  const handleImageUploaded = async (file: File) => {
    // Validate file size limit as configured by the Administrator
    const sizeLimitBytes = maxUploadSizeMb * 1024 * 1024;
    if (file.size > sizeLimitBytes) {
      setSelectedFile(null);
      setStatus('error');
      setErrorDetails(`ফাইলের সাইজ বেশি বড়! অ্যাডমিন লিমিট অনুযায়ী সর্বোচ্চ ${maxUploadSizeMb} MB আকারের ফাইল আপলোড করা যাবে। অনুগ্রহ করে ছোট বা কম রেজোলিউশনের ছবি সিলেক্ট করুন। (File size exceeds the administrator limit of ${maxUploadSizeMb} MB)`);
      return;
    }

    setSelectedFile(file);
    setStatus('processing');
    setProgress(0);
    setProgressText('Booting segmentation models...');
    setErrorDetails('');

    try {
      setProgressText('Decoding & normalizing image formats...');
      const { blob: normalizedBlob, dimensions } = await normalizeAndScaleImage(file);
      const originalUrl = URL.createObjectURL(normalizedBlob);

      // Form template model loading configs
      const config: any = {
        model: processingMode === 'ultra-fast' ? 'small' : 'medium',
        progress: (key, current, total) => {
          const percent = (current / total) * 100;
          setProgress(percent);
          // Clean model filename for visual feedback
          const modelName = key.replace('models/', '').replace('_model', '').toUpperCase();
          setProgressText(`Separating subject: Downloading ${modelName}...`);
        },
      };

      // Invoke the client-side Web Worker model
      const resultBlob = await removeBackground(normalizedBlob, config);
      const processedUrl = URL.createObjectURL(resultBlob);

      // Initialize the rich composite object matching initial configs
      setEdgeTrim(0);
      setAlphaThreshold(35);
      
      setImageObject({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        originalUrl,
        originalWidth: dimensions.width,
        originalHeight: dimensions.height,
        processedUrl,
        rawProcessedUrl: processedUrl,
        bgType: 'transparent',
        bgColor: defaultBgColor,
        transform: { ...DEFAULT_TRANSFORM },
        shadow: { ...DEFAULT_SHADOW },
      });

      // Append to the list of processed items
      const thumbUrl = URL.createObjectURL(normalizedBlob);
      setBatchQueue(prev => [...prev, { file, thumbUrl }]);

      setStatus('done');
      setViewMode('remix'); // Show visual studio stage immediately
    } catch (err: any) {
      console.error('Model processing caught error:', err);
      setStatus('error');
      setErrorDetails(err.message || 'Error occurred downloading files or loading machine learning layers.');
    }
  };

  // Change composite adjustments safely

  const handleBgColorChange = (color: string) => {
    if (imageObject) {
      setImageObject({ ...imageObject, bgColor: color });
      setViewMode('remix'); // Auto keyframe to editing preview
    }
  };

  const handleBgImageUrlChange = (url: string) => {
    if (imageObject) {
      setImageObject({ 
        ...imageObject, 
        bgImageUrl: url,
        customBgFileUrl: undefined // Clear other custom image backdrops
      });
      setViewMode('remix'); // Auto keyframe to editing preview
    }
  };

  const handleTransformChange = (transform: ForegroundTransform) => {
    if (imageObject) {
      setImageObject({ ...imageObject, transform });
      setViewMode('remix'); // Auto keyframe to editing preview
    }
  };

  const handleShadowChange = (shadow: ShadowSettings) => {
    if (imageObject) {
      setImageObject({ ...imageObject, shadow });
      setViewMode('remix'); // Auto keyframe to editing preview
    }
  };

  const handleBgTypeChange = (type: BgType) => {
    if (imageObject) {
      setImageObject({ ...imageObject, bgType: type });
      setViewMode('remix'); // Auto keyframe to editing preview
    }
  };

  const handleUploadCustomBg = (file: File) => {
    if (imageObject) {
      const bgUrl = URL.createObjectURL(file);
      setImageObject({
        ...imageObject,
        bgType: 'image',
        customBgFileUrl: bgUrl,
        bgImageUrl: bgUrl,
      });
      setViewMode('remix'); // Auto keyframe to editing preview
    }
  };

  // Direct Drag support on stage elements
  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageObject) return;
    setViewMode('remix');
    
    if (isPickingColor) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        
        const stageRatio = rect.width / rect.height;
        const imgRatio = imgW / imgH;
        
        let renderW = rect.width;
        let renderH = rect.height;
        let renderX = 0;
        let renderY = 0;
        
        if (imgRatio > stageRatio) {
          renderH = rect.width / imgRatio;
          renderY = (rect.height - renderH) / 2;
        } else {
          renderW = rect.height * imgRatio;
          renderX = (rect.width - renderW) / 2;
        }
        
        ctx.drawImage(img, renderX, renderY, renderW, renderH);
        
        try {
          const pixel = ctx.getImageData(Math.floor(clickX), Math.floor(clickY), 1, 1).data;
          const r = pixel[0];
          const g = pixel[1];
          const b = pixel[2];
          const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          setChromaKeyColor(hex);
          setIsPickingColor(false);
        } catch (err) {
          console.error('Error reading pixel data:', err);
          setIsPickingColor(false);
        }
      };
      img.src = imageObject.originalUrl;
      return;
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartOffset({ 
      offsetX: imageObject.transform.offsetX, 
      offsetY: imageObject.transform.offsetY 
    });
    // Lock pointers strictly
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !imageObject) return;
    
    // Safety check: if mouse button was released outside the window/stage, cancel drag
    if (e.buttons === 0) {
      setIsDragging(false);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // Convert pixel offset to percentage scales relative to box dimensions
    const percentX = (dx / rect.width) * 100;
    const percentY = (dy / rect.height) * 100;

    // Expand panning boundary coordinates limits to prevent getting stuck
    const newOffsetX = Math.min(Math.max(Math.round(startOffset.offsetX + percentX), -1000), 1000);
    const newOffsetY = Math.min(Math.max(Math.round(startOffset.offsetY + percentY), -1000), 1000);

    // Apply fast snappy state refresh
    setImageObject({
      ...imageObject,
      transform: {
        ...imageObject.transform,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      }
    });
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleManualMaskSaved = (refinedPngUrl: string) => {
    if (imageObject) {
      setImageObject({
        ...imageObject,
        processedUrl: refinedPngUrl, // Swap processed result with manually drawn PNG
      });
    }
    setShowManualEditor(false);
  };

  const handleResetSettings = () => {
    if (imageObject) {
      setImageObject({
        ...imageObject,
        bgType: 'transparent',
        bgColor: '#ffffff',
        bgImageUrl: undefined,
        customBgFileUrl: undefined,
        transform: { ...DEFAULT_TRANSFORM },
        shadow: { ...DEFAULT_SHADOW },
      });
    }
  };

  const handleClearApp = () => {
    setSelectedFile(null);
    setImageObject(null);
    setStatus('idle');
    setProgress(0);
    setErrorDetails('');
  };

  // Retrieve active selector aspect ratio for live workspace preview
  const getSelectedAspectRatio = (): number => {
    if (!imageObject) return 4 / 3;
    if (selectedSizePreset === 'original') {
      return (imageObject.originalWidth || 4) / (imageObject.originalHeight || 3);
    }
    if (selectedSizePreset === 'bd-passport') {
      return 4 / 5; // 40mm x 50mm
    }
    if (selectedSizePreset === 'bd-stamp') {
      return 4 / 5; // 20mm x 25mm
    }
    if (selectedSizePreset === 'us-passport') {
      return 1 / 1; // 2" x 2" (51mm x 51mm)
    }
    if (selectedSizePreset === 'custom') {
      const w = customWidth || 1;
      const h = customHeight || 1;
      return w / h;
    }
    return 4 / 3;
  };

  // Convert logical presets/dimensions to canvas output resolution
  const getOutputDimensionsInPixels = (): { width: number; height: number } => {
    if (!imageObject) return { width: 1200, height: 900 };
    
    if (selectedSizePreset === 'original') {
      return {
        width: imageObject.originalWidth || 1200,
        height: imageObject.originalHeight || 900
      };
    }
    if (selectedSizePreset === 'bd-passport') {
      return { width: 600, height: 750 }; // 4:5 AR high res (perfect for submittals & print specs in BD)
    }
    if (selectedSizePreset === 'bd-stamp') {
      return { width: 300, height: 375 }; // 4:5 AR Stamp Size (20x25mm equivalent at 300 DPI)
    }
    if (selectedSizePreset === 'us-passport') {
      return { width: 600, height: 600 }; // 1:1 US Visa official DS-160 upload specs
    }
    if (selectedSizePreset === 'custom') {
      const w = customWidth || 600;
      const h = customHeight || 600;
      if (customUnit === 'mm') {
        // High quality print conversion factor (300 DPI: 1 mm = 11.811 pixels)
        return {
          width: Math.round(w * 11.811),
          height: Math.round(h * 11.811)
        };
      }
      return { width: w, height: h };
    }
    
    return { width: 1200, height: 900 };
  };

  // Compile final compositions onto client-side Canvas and trigger native browser downloads
  const compileAndDownload = () => {
    if (!imageObject) return;

    setStatus('processing');
    setProgressText('Structuring high-res design export canvas...');
    setProgress(30);

    const canvas = document.createElement('canvas');
    const { width, height } = getOutputDimensionsInPixels();
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setStatus('done');
      return;
    }

    // Helper: Hex to RGBA formatting for drop-shadow rendering
    const hexToRGBAString = (hex: string, opacity: number) => {
      let cleanHex = hex.replace('#', '');
      if (cleanHex.length === 3) {
        cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
      }
      const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
      const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
      const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const drawSubjectOnCanvas = () => {
      ctx.save();

      // Assemble Floor ambient shadow if configured
      if (imageObject.shadow.type === 'floor') {
        ctx.save();
        const centerX = width / 2 + (imageObject.transform.offsetX / 100) * width;
        const centerY = height / 2 + (imageObject.transform.offsetY / 100) * height;

        // Position shadow exactly below model/subject feet
        const radiusX = (width * 0.35) * imageObject.transform.scale;
        const radiusY = (height * 0.04) * imageObject.transform.scale;
        const shadowOffsetY = (height * 0.44) * imageObject.transform.scale;

        ctx.translate(centerX, centerY + shadowOffsetY);

        ctx.beginPath();
        ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.fillStyle = hexToRGBAString(imageObject.shadow.color, imageObject.shadow.opacity);
        ctx.filter = `blur(${imageObject.shadow.blur}px)`;
        ctx.fill();
        ctx.restore();
      }

      // Subject coordinates translation
      const subjX = width / 2 + (imageObject.transform.offsetX / 100) * width;
      const subjY = height / 2 + (imageObject.transform.offsetY / 100) * height;

      ctx.translate(subjX, subjY);
      ctx.rotate((imageObject.transform.rotate * Math.PI) / 180);

      // Subject loaded Image
      const subjectImg = new Image();
      subjectImg.crossOrigin = 'anonymous';
      subjectImg.onload = () => {
        // Calculate base fit size corresponding to the absolute w-full h-full object-contain workspace layout
        const maxBoxW = width;
        const maxBoxH = height;
        const scaleFit = Math.min(maxBoxW / subjectImg.width, maxBoxH / subjectImg.height);
        
        const sw = subjectImg.width * scaleFit * imageObject.transform.scale;
        const sh = subjectImg.height * scaleFit * imageObject.transform.scale;

        // Build core visual canvas filters
        let filterChain = `brightness(${imageObject.transform.brightness}%) contrast(${imageObject.transform.contrast}%) saturate(${imageObject.transform.saturation}%)`;
        
        if (imageObject.shadow.type === 'drop') {
          filterChain += ` drop-shadow(${imageObject.shadow.offsetX}px ${imageObject.shadow.offsetY}px ${imageObject.shadow.blur}px ${imageObject.shadow.color})`;
        } else if (imageObject.shadow.type === 'glow') {
          filterChain += ` drop-shadow(0 0 ${imageObject.shadow.blur}px ${imageObject.shadow.color})`;
        }

        ctx.filter = filterChain;

        // Draw image aligned to transform center
        ctx.drawImage(subjectImg, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();

        // Draw branded watermark label if configured in Admin panel
        if (enableDownloadWatermark) {
          ctx.save();
          ctx.font = 'bold 11px "Inter", sans-serif';
          const watermarkText = `© ${brandName}`;
          const textMetrics = ctx.measureText(watermarkText);
          const textWidth = textMetrics.width;
          
          // Render subtle pill background
          ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(width - textWidth - 25, height - 28, textWidth + 14, 18, 5);
            ctx.fill();
          } else {
            ctx.fillRect(width - textWidth - 25, height - 28, textWidth + 14, 18);
          }
          
          ctx.fillStyle = '#ffffff';
          ctx.fillText(watermarkText, width - textWidth - 18, height - 15);
          ctx.restore();
        }

        setProgress(100);
        setProgressText('Ready!');

        // Canvas conversion directly to user download link
        const dataUrl = canvas.toDataURL('image/png');
        const trigger = document.createElement('a');
        const cleanName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        let fileSuffix = 'remixed';
        if (selectedSizePreset === 'bd-passport') fileSuffix = 'bd_passport';
        else if (selectedSizePreset === 'bd-stamp') fileSuffix = 'bd_stamp';
        else if (selectedSizePreset === 'us-passport') fileSuffix = 'us_passport';
        else if (selectedSizePreset === 'custom') fileSuffix = `custom_${width}x${height}`;
        
        trigger.download = `${cleanName || 'my_studio'}_${fileSuffix}_${Date.now()}.png`;
        trigger.href = dataUrl;
        trigger.click();

        setStatus('done');
      };
      
      subjectImg.onerror = () => {
        // Fallback draw on resource block errors
        ctx.restore();
        setStatus('done');
      };
      subjectImg.src = imageObject.processedUrl;
    };

    // Draw background layer based on settings
    if (imageObject.bgType === 'color') {
      ctx.fillStyle = imageObject.bgColor;
      ctx.fillRect(0, 0, width, height);
      drawSubjectOnCanvas();
    } else if (imageObject.bgType === 'image' && imageObject.bgImageUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => {
        // Fit background cover-style
        const bgScale = Math.max(width / bgImg.width, height / bgImg.height);
        const bgW = bgImg.width * bgScale;
        const bgH = bgImg.height * bgScale;
        ctx.drawImage(bgImg, (width - bgW) / 2, (height - bgH) / 2, bgW, bgH);
        drawSubjectOnCanvas();
      };
      bgImg.onerror = () => {
        // Paint gray solid fallback on image load security errors
        ctx.fillStyle = '#f4f4f5';
        ctx.fillRect(0, 0, width, height);
        drawSubjectOnCanvas();
      };
      bgImg.src = imageObject.bgImageUrl;
    } else {
      // Clear transparency cutout (no backdrop)
      drawSubjectOnCanvas();
    }
  };

  // Convert Hex values cleanly to RGBA for inline CSS filter support
  const hexToRGBA = (hex: string, alpha: number) => {
    let raw = hex.replace('#', '');
    if (raw.length === 3) {
      raw = raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2];
    }
    const r = parseInt(raw.substring(0, 2), 16) || 0;
    const g = parseInt(raw.substring(2, 4), 16) || 0;
    const b = parseInt(raw.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (appMode === 'admin') {
    return (
      <div id="admin-dashboard-frame" className="min-h-screen flex flex-col bg-zinc-900 font-sans text-zinc-200 selection:bg-zinc-800 selection:text-white">
        {/* Admin Navigation Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center justify-center rounded-xl p-2 text-white transition-all duration-300 ${theme.bg} ${theme.shadow}`}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
                {brandName} <span className="inline-flex items-center rounded-md bg-zinc-800 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-zinc-400 tracking-wider">ADMIN PANEL</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wide">Configure customized branding, telemetry logs & export codes</p>
            </div>
          </div>

          <button
            onClick={handleLogoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 rounded-xl text-xs font-semibold text-zinc-350 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin Mode</span>
          </button>
        </header>

        {/* Dashboard Grid Content */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-6">
          
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
            <div className="p-3.5 bg-zinc-950/35 rounded-2xl border border-zinc-800/80 text-center mb-2">
              <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase block mb-1 font-mono">Authentication Success</span>
              <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-500/20 inline-block uppercase tracking-wider">Verified Administrator</span>
            </div>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeAdminTab === 'settings' ? `${theme.bg} text-white shadow` : 'text-zinc-450 bg-transparent hover:bg-zinc-800/50 hover:text-white'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Branding Control Hub</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('developer')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeAdminTab === 'developer' ? `${theme.bg} text-white shadow` : 'text-zinc-450 bg-transparent hover:bg-zinc-800/50 hover:text-white'}`}
            >
              <Code className="w-4 h-4" />
              <span>ZIP Export & Codebase</span>
            </button>
          </aside>

          {/* Active Tab Panel */}
          <div className="flex-1 min-w-0 bg-zinc-955/40 rounded-2xl border border-zinc-800/80 p-6 shadow-xl flex flex-col gap-6 bg-zinc-950/30">
            {activeAdminTab === 'settings' && (() => {
              const hasUnsavedChanges = 
                brandName !== tempSettings.brandName ||
                creatorCredit !== tempSettings.creatorCredit ||
                accentColor !== tempSettings.accentColor ||
                adminUsername !== tempSettings.adminUsername ||
                adminActualPasscode !== tempSettings.adminActualPasscode ||
                defaultProcessingMode !== tempSettings.defaultProcessingMode ||
                maxUploadSizeMb !== tempSettings.maxUploadSizeMb ||
                defaultBgColor !== tempSettings.defaultBgColor ||
                enableDownloadWatermark !== tempSettings.enableDownloadWatermark ||
                JSON.stringify([...enabledPresets].sort()) !== JSON.stringify([...tempSettings.enabledPresets].sort()) ||
                JSON.stringify(colorPresets) !== JSON.stringify(tempSettings.colorPresets);

              const handleApplySavedSettings = () => {
                // Persist securely to localStorage & sync live states
                setBrandName(tempSettings.brandName);
                localStorage.setItem('app-brand-name', tempSettings.brandName);

                setCreatorCredit(tempSettings.creatorCredit);
                localStorage.setItem('app-creator-credit', tempSettings.creatorCredit);

                setAccentColor(tempSettings.accentColor);
                localStorage.setItem('app-accent-color', tempSettings.accentColor);

                setAdminUsername(tempSettings.adminUsername);
                localStorage.setItem('app-admin-username', tempSettings.adminUsername);

                setAdminActualPasscode(tempSettings.adminActualPasscode);
                localStorage.setItem('app-admin-passcode', tempSettings.adminActualPasscode);

                setDefaultProcessingMode(tempSettings.defaultProcessingMode);
                localStorage.setItem('app-default-processing-mode', tempSettings.defaultProcessingMode);

                setMaxUploadSizeMb(tempSettings.maxUploadSizeMb);
                localStorage.setItem('app-max-upload', tempSettings.maxUploadSizeMb.toString());

                setDefaultBgColor(tempSettings.defaultBgColor);
                localStorage.setItem('app-default-bgcolor', tempSettings.defaultBgColor);

                setEnableDownloadWatermark(tempSettings.enableDownloadWatermark);
                localStorage.setItem('app-enable-watermark', tempSettings.enableDownloadWatermark ? 'true' : 'false');

                setEnabledPresets(tempSettings.enabledPresets);
                localStorage.setItem('app-enabled-presets', JSON.stringify(tempSettings.enabledPresets));

                setColorPresets(tempSettings.colorPresets);
                localStorage.setItem('app-color-presets', JSON.stringify(tempSettings.colorPresets));

                setIsConfirmingSave(false);
                setShowSaveSuccessToast(true);
                setTimeout(() => {
                  setShowSaveSuccessToast(false);
                }, 4000);
              };

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/80">
                    <div>
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <span>White-Label Core Controls & Studio Customization</span>
                      </h2>
                      <p className="text-xs text-zinc-400 font-medium">Configure global app labels, layout dimensions, limits, credits, themes, and watermarks.</p>
                    </div>
                    <div>
                      {hasUnsavedChanges ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-400/20 animate-pulse">
                          ● Unsaved Changes Detected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-400/20">
                          ✓ System Live & Synchronized
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    {/* Brand Name Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Studio / Brand Name (অ্যাপের নাম)</label>
                      <input
                        type="text"
                        value={tempSettings.brandName}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, brandName: e.target.value }))}
                        placeholder="E.g., Noman's Studio"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner focus:outline-none focus:border-zinc-700 font-medium"
                      />
                      <p className="text-[10px] text-zinc-500">Will update the main header title, suggestions panel, and export download files.</p>
                    </div>

                    {/* Creator Credit Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Developer Credit Line (ক্রেডিট টেক্সট)</label>
                      <input
                        type="text"
                        value={tempSettings.creatorCredit}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, creatorCredit: e.target.value }))}
                        placeholder="E.g., Crafted by Noman"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner focus:outline-none focus:border-zinc-700 font-medium"
                      />
                      <p className="text-[10px] text-zinc-500">Updates credits text in the upper navigation header and site footer blocks.</p>
                    </div>

                    {/* Active Scheme Accent Color Selection */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Active UI Theme Accent Color Scheme (রঙ হাইলাইট)</label>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {[
                          { id: 'violet', label: 'Violet (Default)', bg: 'bg-violet-600' },
                          { id: 'indigo', label: 'Indigo Purple', bg: 'bg-indigo-600' },
                          { id: 'sky', label: 'Sky Blue Highlight', bg: 'bg-sky-500' },
                          { id: 'emerald', label: 'Emerald Green Scheme', bg: 'bg-emerald-600' },
                          { id: 'amber', label: 'Amber Gold Scheme', bg: 'bg-amber-500' },
                          { id: 'rose', label: 'Rose Pink Theme', bg: 'bg-rose-500' },
                        ].map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setTempSettings(prev => ({ ...prev, accentColor: col.id }))}
                            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-extrabold transition-all cursor-pointer ${tempSettings.accentColor === col.id ? 'bg-zinc-850 border-zinc-700 text-white ring-2 ring-white/10' : 'bg-transparent border-zinc-800 hover:border-zinc-750 text-zinc-450 hover:text-zinc-300'}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${col.bg}`} />
                            <span>{col.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default Processing Mode Settings */}
                    <div className="space-y-2 md:col-span-2 pt-2 border-t border-zinc-800/40">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Default AI Segmentation Efficiency (ডিফল্ট প্রসেসিং মোড)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setTempSettings(prev => ({ ...prev, defaultProcessingMode: 'ultra-fast' }))}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${tempSettings.defaultProcessingMode === 'ultra-fast' ? 'border-zinc-300 bg-zinc-800 text-white shadow-md' : 'border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-750'}`}
                        >
                          <span className="text-xs font-bold font-sans">Ultra-Fast Mode (Small AI Model)</span>
                          <span className="text-[10px] text-zinc-500 leading-normal font-sans">Slices images locally in ~1.5s using a compact ML dataset. Optimized for fast/mobile users.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTempSettings(prev => ({ ...prev, defaultProcessingMode: 'high-quality' }))}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${tempSettings.defaultProcessingMode === 'high-quality' ? 'border-zinc-300 bg-zinc-800 text-white shadow-md' : 'border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-750'}`}
                        >
                          <span className="text-xs font-bold font-sans">High-Quality Mode (Medium AI Model)</span>
                          <span className="text-[10px] text-zinc-500 leading-normal font-sans">Uses detailed segmentation masks to accurately retain wisps of hair, clothing, and lens edges.</span>
                        </button>
                      </div>
                    </div>

                    {/* Maximum Allowed Upload File Size Custom Slider */}
                    <div className="space-y-1.5 md:col-span-1 pt-2">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Maximum Allowed Upload Size (সর্বোচ্চ ফাইল সাইজ লিমিট)</label>
                      <div className="flex items-center gap-3 bg-zinc-950/25 p-3 rounded-xl border border-zinc-800/85">
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={tempSettings.maxUploadSizeMb}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, maxUploadSizeMb: parseInt(e.target.value, 10) }))}
                          className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-100"
                        />
                        <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl font-mono text-xs font-bold text-emerald-400 shrink-0">{tempSettings.maxUploadSizeMb} MB</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">Provides physical guardrails, shielding clients from browser crash errors.</p>
                    </div>

                    {/* Default solid color backdrop HEX picker */}
                    <div className="space-y-1.5 md:col-span-1 pt-2">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide font-sans">Default Backdrop Color Swatch (ডিফল্ট ব্যাকগ্রাউন্ড কালার)</label>
                      <div className="flex items-center gap-2 bg-zinc-950/25 p-3 rounded-xl border border-zinc-800/85">
                        <input
                          type="color"
                          value={tempSettings.defaultBgColor}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultBgColor: e.target.value }))}
                          className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 cursor-pointer overflow-hidden p-0 block"
                        />
                        <input
                          type="text"
                          value={tempSettings.defaultBgColor}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultBgColor: e.target.value }))}
                          placeholder="#ffffff"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-200 focus:outline-none focus:border-zinc-700 w-full"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">This HEX color swatch fills the portrait background on standard image drops.</p>
                    </div>

                    {/* Subtle download branding watermark inside Canvas */}
                    <div className="space-y-2 md:col-span-2 pt-2 border-t border-zinc-800/40">
                      <div className="flex items-center justify-between p-4 bg-zinc-950/25 border border-zinc-800/80 rounded-xl">
                        <div>
                          <span className="block text-xs font-bold text-zinc-200">Enable Subtle Download Watermark (কনভার্ট করা ছবিতে ওয়াটারমার্ক)</span>
                          <span className="text-[10px] text-zinc-500 block mt-1 leading-normal">Embeds a discrete, elegant copyright overlay badge (`© {tempSettings.brandName}`) on the bottom right corner of downloaded images.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTempSettings(prev => ({ ...prev, enableDownloadWatermark: !prev.enableDownloadWatermark }))}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none shrink-0 ${tempSettings.enableDownloadWatermark ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${tempSettings.enableDownloadWatermark ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Toggle Allowed sizes and custom preset shortcuts */}
                    <div className="space-y-2 md:col-span-2 pt-2 border-t border-zinc-800/40">
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Enabled Sizing Presets for Users (অনুমোদিত ছবির মাপসমূহ)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {[
                          { id: 'original', label: 'Original AR' },
                          { id: 'bd-passport', label: 'BD Passport' },
                          { id: 'bd-stamp', label: 'BD Stamp' },
                          { id: 'us-passport', label: 'US Visa 1:1' },
                          { id: 'custom', label: 'Custom Manual' }
                        ].map((item) => {
                          const isChecked = tempSettings.enabledPresets.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setTempSettings(prev => {
                                  const exists = prev.enabledPresets.includes(item.id);
                                  const updated = exists 
                                    ? prev.enabledPresets.filter(x => x !== item.id) 
                                    : [...prev.enabledPresets, item.id];
                                  return { ...prev, enabledPresets: updated };
                                });
                              }}
                              className={`p-2.5 rounded-xl border text-center text-[10px] font-black transition-all cursor-pointer ${isChecked ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'border-zinc-800 bg-zinc-950/20 text-zinc-500 hover:border-zinc-750'}`}
                            >
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-zinc-500">Toggle which crop sizing filters are active inside the user control deck. Disabled presets will be completely hidden from view.</p>
                    </div>

                    {/* Backdrop Solid Color Presets Manager */}
                    <div className="space-y-3 md:col-span-2 pt-4 border-t border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <ImageIcon className={`w-4 h-4 text-emerald-400`} />
                        <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wide">
                          Backdrop Preset Colors (প্যানেলের ব্যাকগ্রাউন্ড কালারসমূহ)
                        </label>
                      </div>
                      
                      <div className="bg-zinc-950/25 border border-zinc-800/80 rounded-xl p-4 space-y-4 font-sans">
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                          নিচের প্রিসেটগুলো ব্যবহারকারী প্যানেলের Backdrop ট্যাবে দেখতে পাবে। আপনি নতুন প্রিসেট যুক্ত করতে পারেন, অপ্রয়োজনীয়টি ডিলিট করতে পারেন, এবং Arrow দিয়ে সাজানোর ক্রম পরিবর্তন (sort/re-arrange) করতে পারেন।
                        </p>

                        {/* Presets List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {tempSettings.colorPresets.map((preset, index) => (
                            <div 
                              key={`${preset.name}-${preset.value}-${index}`}
                              className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl"
                            >
                              <div className="flex items-center gap-2.5">
                                <div 
                                  className="w-5 h-5 rounded-md border border-zinc-700/60 shadow-sm shrink-0" 
                                  style={{ backgroundColor: preset.value }}
                                />
                                <div className="space-y-0.5">
                                  <span className="text-xs font-bold text-zinc-200 block truncate max-w-[120px]">
                                    {preset.name}
                                  </span>
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold block">
                                    {preset.value.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Move Up */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === 0) return;
                                    setTempSettings(prev => {
                                      const list = [...prev.colorPresets];
                                      const temp = list[index];
                                      list[index] = list[index - 1];
                                      list[index - 1] = temp;
                                      return { ...prev, colorPresets: list };
                                    });
                                  }}
                                  disabled={index === 0}
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-zinc-850 border border-zinc-800 text-zinc-300 transition-all ${
                                    index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-800 hover:text-white cursor-pointer'
                                  }`}
                                  title="উপরে সাজান"
                                >
                                  ↑
                                </button>

                                {/* Move Down */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === tempSettings.colorPresets.length - 1) return;
                                    setTempSettings(prev => {
                                      const list = [...prev.colorPresets];
                                      const temp = list[index];
                                      list[index] = list[index + 1];
                                      list[index + 1] = temp;
                                      return { ...prev, colorPresets: list };
                                    });
                                  }}
                                  disabled={index === tempSettings.colorPresets.length - 1}
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-zinc-850 border border-zinc-800 text-zinc-300 transition-all ${
                                    index === tempSettings.colorPresets.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-800 hover:text-white cursor-pointer'
                                  }`}
                                  title="নিচে সাজান"
                                >
                                  ↓
                                </button>

                                {/* Delete Preset */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTempSettings(prev => {
                                      const list = prev.colorPresets.filter((_, idx) => idx !== index);
                                      return { ...prev, colorPresets: list };
                                    });
                                  }}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add New Preset inline fields */}
                        <div className="pt-3 border-t border-zinc-800/60">
                          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">নতুন প্রিসেট যোগ করুন (+ Add New Preset)</span>
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <div className="flex-1 space-y-1">
                              <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">রঙের নাম (E.g. Hot Pink)</span>
                              <input 
                                type="text"
                                placeholder="যেমন: Classic White, Neon Pink"
                                value={newPresetColorName}
                                onChange={(e) => setNewPresetColorName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 shadow-inner focus:outline-none focus:border-zinc-700 font-medium"
                              />
                            </div>
                            <div className="shrink-0 space-y-1">
                              <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">হেক্স কালার কোড (Hex Code)</span>
                              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                                <input 
                                  type="color"
                                  value={newPresetColorHex}
                                  onChange={(e) => setNewPresetColorHex(e.target.value)}
                                  className="w-6 h-6 border-0 bg-transparent cursor-pointer shrink-0"
                                />
                                <input 
                                  type="text"
                                  placeholder="#ffffff"
                                  value={newPresetColorHex}
                                  onChange={(e) => {
                                    let val = e.target.value;
                                    if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                                    setNewPresetColorHex(val);
                                  }}
                                  className="w-16 bg-transparent border-0 text-xs text-zinc-100 font-mono focus:outline-none text-center"
                                />
                              </div>
                            </div>
                            <div className="shrink-0 flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newPresetColorName.trim()) return;
                                  let hex = newPresetColorHex.trim();
                                  if (!hex.startsWith('#')) hex = '#' + hex;
                                  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;

                                  setTempSettings(prev => {
                                    const exists = prev.colorPresets.some(p => p.value.toLowerCase() === hex.toLowerCase());
                                    if (exists) return prev;
                                    return {
                                      ...prev,
                                      colorPresets: [...prev.colorPresets, { name: newPresetColorName.trim(), value: hex.toLowerCase() }]
                                    };
                                  });
                                  setNewPresetColorName('');
                                }}
                                disabled={!newPresetColorName.trim()}
                                className={`w-full sm:w-auto h-9 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all text-white ${
                                  newPresetColorName.trim()
                                    ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-md'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-750'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>যুক্ত করুন</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upgraded Credentials Customization Block */}
                    <div className="md:col-span-2 pt-4 border-t border-zinc-800/40 space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Security & Administrator Access Credentials</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Administrator Username</label>
                          <input
                            type="text"
                            value={tempSettings.adminUsername}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, adminUsername: e.target.value }))}
                            placeholder="Default: admin"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 shadow-inner focus:outline-none focus:border-zinc-700 font-mono font-bold"
                          />
                          <p className="text-[10px] text-zinc-500">Only typing this precise string exactly inside the Support Desk chat logs triggers the admin pass gate.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Administrator Passcode PIN</label>
                          <input
                            type="text"
                            value={tempSettings.adminActualPasscode}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, adminActualPasscode: e.target.value }))}
                            placeholder="Default: 1234"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 shadow-inner focus:outline-none focus:border-zinc-700 font-mono font-bold"
                          />
                          <p className="text-[10px] text-zinc-500">Passcode PIN required to verify administrative status during login dialogues.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explicit Save and Exit Buttons with Custom alerts */}
                  <div className="pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center bg-zinc-950/40 p-4.5 rounded-2xl gap-4 border border-zinc-800">
                    <div className="space-y-1 pr-4 text-center sm:text-left">
                      <p className="text-xs font-extrabold text-white">Configured Settings Control Block</p>
                      <p className="text-[10px] text-zinc-500 font-mono">100% production-ready offline persistence layer</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                      {/* Explicit Save settings Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (hasUnsavedChanges) {
                            setIsConfirmingSave(true);
                          }
                        }}
                        disabled={!hasUnsavedChanges}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 ${hasUnsavedChanges ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 cursor-pointer shadow-emerald-500/10 focus:ring-emerald-500' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'}`}
                      >
                        <Save className="w-4 h-4" />
                        <span>পরিবর্তনগুলো সংরক্ষণ করুন (Save Configuration)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAppMode('user')}
                        className={`w-full sm:w-auto px-4.5 py-2.5 text-xs font-bold text-zinc-350 bg-zinc-800 hover:bg-zinc-750 hover:text-white rounded-xl cursor-pointer transition-all border border-zinc-700/60`}
                      >
                        Studio প্যানেলে ফিরুন →
                      </button>
                    </div>
                  </div>

                  {/* HTML Embedded Confirmation Permission Modal overlay */}
                  {isConfirmingSave && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
                      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative animate-scale-up text-left space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shrink-0">
                            <AlertTriangle className="w-6 h-6 animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest block font-mono">Double-Verification Consent</span>
                            <h3 className="text-base font-extrabold text-white mt-1">অ্যাডমিন কনফিগারেশন পরিবর্তন নিশ্চিত করুন?</h3>
                            <h4 className="text-xs text-zinc-400 mt-1">Are you sure you want to save and apply these changes to the user dashboard?</h4>
                          </div>
                        </div>

                        {/* Summary of modifications */}
                        <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4.5 space-y-3 font-mono text-[11px] text-zinc-400 max-h-52 overflow-y-auto">
                          <p className="text-zinc-500 font-sans font-bold text-[10px] uppercase tracking-wide border-b border-zinc-800 pb-1">Comparison Audit Details:</p>
                          {brandName !== tempSettings.brandName && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">AppName:</span> <span className="text-red-400 shrink-0 select-none mr-1">"{brandName}"</span> ➔ <span className="text-emerald-400 shrink-0 select-none">"{tempSettings.brandName}"</span></p>
                          )}
                          {creatorCredit !== tempSettings.creatorCredit && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">Credits:</span> <span className="text-red-400 shrink-0 select-none mr-1">"{creatorCredit}"</span> ➔ <span className="text-emerald-400 shrink-0 select-none">"{tempSettings.creatorCredit}"</span></p>
                          )}
                          {accentColor !== tempSettings.accentColor && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">Accent:</span> <span className="text-zinc-500 shrink-0 mr-1">{accentColor}</span> ➔ <span className="text-emerald-400 shrink-0">{tempSettings.accentColor}</span></p>
                          )}
                          {defaultProcessingMode !== tempSettings.defaultProcessingMode && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">AI Engine:</span> <span className="text-zinc-500 shrink-0 mr-1">{defaultProcessingMode}</span> ➔ <span className="text-emerald-400 shrink-0">{tempSettings.defaultProcessingMode}</span></p>
                          )}
                          {maxUploadSizeMb !== tempSettings.maxUploadSizeMb && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">Max File Size:</span> <span className="text-zinc-500 shrink-0 mr-1">{maxUploadSizeMb} MB</span> ➔ <span className="text-emerald-400 shrink-0">{tempSettings.maxUploadSizeMb} MB</span></p>
                          )}
                          {defaultBgColor !== tempSettings.defaultBgColor && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">Default Backdrop:</span> <span className="text-zinc-500 shrink-0 mr-1">{defaultBgColor}</span> ➔ <span className="text-emerald-400 shrink-0">{tempSettings.defaultBgColor}</span></p>
                          )}
                          {enableDownloadWatermark !== tempSettings.enableDownloadWatermark && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">Watermark:</span> <span className="text-zinc-500 shrink-0 mr-1">{enableDownloadWatermark ? 'Yes' : 'No'}</span> ➔ <span className="text-emerald-400 shrink-0">{tempSettings.enableDownloadWatermark ? 'Yes' : 'No'}</span></p>
                          )}
                          {JSON.stringify([...enabledPresets].sort()) !== JSON.stringify([...tempSettings.enabledPresets].sort()) && (
                            <p className="leading-relaxed flex flex-col bg-zinc-950 p-2 rounded gap-1"><span className="text-zinc-500">Crop Presets Modified:</span> <span className="text-xs text-zinc-300">Live active formats count: {tempSettings.enabledPresets.length} items</span></p>
                          )}
                          {JSON.stringify(colorPresets) !== JSON.stringify(tempSettings.colorPresets) && (
                            <p className="leading-relaxed flex flex-col bg-zinc-950 p-2 rounded gap-1"><span className="text-zinc-500">Preset Colors Modified:</span> <span className="text-xs text-zinc-300">নতুন প্রিসেট সংখ্যা: {tempSettings.colorPresets.length}টি কালার</span></p>
                          )}
                          {adminUsername !== tempSettings.adminUsername && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">Admin Username:</span> <span className="text-zinc-500 shrink-0 mr-1">{adminUsername}</span> ➔ <span className="text-emerald-400 shrink-0">{tempSettings.adminUsername}</span></p>
                          )}
                          {adminActualPasscode !== tempSettings.adminActualPasscode && (
                            <p className="leading-relaxed flex items-center justify-between"><span className="text-zinc-500">Admin Password:</span> <span className="text-zinc-500 shrink-0 mr-1">****</span> ➔ <span className="text-emerald-400 shrink-0">{tempSettings.adminActualPasscode}</span></p>
                          )}
                        </div>

                        <div className="bg-amber-500/5 text-amber-400 p-4 border border-amber-500/10 rounded-2xl text-xs leading-relaxed font-semibold">
                          📌 সংরক্ষিত হওয়ার সাথে সাথে সমস্ত পরিবর্তনগুলো ব্যবহারকারী প্যানেলে সরাসরি কার্যকর হবে। অনুগ্রহ করে রিফ্রেশ ছাড়া পরিবর্তনগুলো যাচাই করতে পারবেন।
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleApplySavedSettings}
                            className="flex-1 px-5 py-3 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer shadow transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>হ্যাঁ, নিশ্চিতভাবে সংরক্ষণ করুন (Confirm Save)</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setIsConfirmingSave(false)}
                            className="px-5 py-3 text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-750 rounded-xl cursor-pointer transition-all focus:outline-none"
                          >
                            বাতিল (Cancel)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Toast Dialogue Alert Banner */}
                  {showSaveSuccessToast && (
                    <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in font-sans leading-normal">
                      <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-white">সফলভাবে সংরক্ষিত করা হয়েছে!</p>
                        <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Admin presets successfully broadcasted</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {activeAdminTab === 'developer' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-white">Project ZIP Export & Hosting Tutorial</h2>
                  <p className="text-xs text-zinc-400 font-semibold">Learn how to export this applet, host it under your domain, and download the full codebase code.</p>
                </div>

                <div className="bg-amber-950/30 border border-amber-900/35 text-amber-300 p-4 rounded-xl text-xs leading-relaxed space-y-1.5 font-medium">
                  <p className="font-extrabold text-amber-400 text-sm">📥 Complete Guidelines to Download ZIP File:</p>
                  <p>1. Look at the upper-right corner of the **Google AI Studio** workspace window.</p>
                  <p>2. Locate the **Settings Icon (Gear wheel)** or look for the context menu option.</p>
                  <p>3. Select **Export to ZIP** or link with a personal **GitHub repository** to download all code files securely.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-zinc-400" />
                    How to Setup your Static App
                  </h3>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3.5 text-zinc-350">
                    <p>Once downloaded, your clean codebase runs completely offline with client-side scripts inside any hosting target:</p>
                    <div className="space-y-3 pl-3 border-l-2 border-zinc-800">
                      <div>
                        <span className="font-bold text-white text-xs block">1. Run locally</span>
                        <code className="text-[11px] block bg-black border border-zinc-800 px-2.5 py-1.5 rounded font-mono text-emerald-400 mt-1 font-semibold">npm install && npm run dev</code>
                      </div>
                      <div>
                        <span className="font-bold text-zinc-300 text-xs block">2. Self Host (Netlify / Vercel)</span>
                        <p className="text-[11px] text-zinc-400 mt-1">Push zip contents into a GitHub repo, connect to Netlify or Vercel, and click deploy! Set the build output directory as <code className="font-mono text-white bg-zinc-850 px-1 rounded">dist</code>. All branded configurations will be retained permanently!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setAppMode('user')}
                    className={`px-4 py-2 text-xs font-bold text-white rounded-xl cursor-pointer ${theme.bg} shadow`}
                  >
                    Return to Studio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main-application-frame" className="min-h-screen flex flex-col bg-zinc-50/50 font-sans text-zinc-800 selection:bg-zinc-100 selection:text-zinc-900">
      
      {/* Sliding Menu drawer popup overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in cursor-pointer"
        />
      )}

      {/* Slide-out Sidebar drawer container listing functions underneath each other */}
      <aside
        id="side-drawer-navigation"
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-zinc-200 shadow-2xl z-50 transform transition-transform duration-350 ease-out flex flex-col justify-between ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Menu Drawer Header */}
          <div className="p-5 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <span className={`p-1.5 rounded-lg text-white ${theme.bg} ${theme.shadow}`}>
                <Scissors className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black text-zinc-900 tracking-tight uppercase block leading-none">{brandName}</span>
                <span className="text-[9px] text-zinc-400 font-mono tracking-wide mt-1 block">Workspace Studio Suite</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Menu Drawer Items listing vertically stacked block choices */}
          <div className="p-4 space-y-2.5">
            <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase block px-2 pb-1 font-mono">
              Select Studio Function
            </span>

            {/* Function 1: Isolate Cutout Studio */}
            <button
              onClick={() => {
                setActiveAppSection('studio');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all hover:bg-zinc-50 cursor-pointer ${
                activeAppSection === 'studio' && appMode === 'user'
                  ? 'border-l-4 border-violet-600 bg-violet-50/10 shadow-xs'
                  : 'border-l-4 border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${activeAppSection === 'studio' && appMode === 'user' ? 'bg-violet-100 text-violet-700' : 'bg-zinc-100 text-zinc-500'}`}>
                <Scissors className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-zinc-900 block leading-none">Background Remover</span>
                <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal">Isolate subjects, remove masks, and replace studio backdrop canvas layers</p>
              </div>
            </button>

            {/* Function 2: Photo Enhance & HD Quality De-blur */}
            <button
              onClick={() => {
                setActiveAppSection('enhancer');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all hover:bg-zinc-50 cursor-pointer ${
                activeAppSection === 'enhancer' && appMode === 'user'
                  ? 'border-l-4 border-indigo-600 bg-indigo-50/10 shadow-xs'
                  : 'border-l-4 border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${activeAppSection === 'enhancer' && appMode === 'user' ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-zinc-100 text-zinc-500'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-[#f97316] flex items-center gap-1 leading-none">
                  Pro Photo HD Enhancer <span className="text-[8px] bg-amber-100 text-amber-700 rounded px-1 tracking-tight">HD PRO</span>
                </span>
                <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal">Remove motion blur, sharpen lens outlines, and convert low-res images into HD results</p>
              </div>
            </button>

            {/* Support Box Section Embedded Directly Inside sliding sidebar */}
            <div className="border-t border-zinc-200 mt-4 pt-3 flex flex-col min-h-0">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase block px-2 pb-1.5 font-mono">
                সাপোর্ট ও যোগাযোগ
              </span>
              
              {!isSidebarSupportChatOpen ? (
                /* Professional Round Bubble Button with 7/24 Badge */
                <div className="flex justify-center py-3">
                  <button
                    type="button"
                    onClick={() => setIsSidebarSupportChatOpen(true)}
                    className="group relative flex flex-col items-center justify-center w-20 h-20 rounded-full border border-zinc-250 bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {/* Glowing active pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping duration-1000 opacity-60 pointer-events-none" />

                    {/* 7/24 badge custom floating element */}
                    <span className="absolute -top-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-[8px] font-black leading-none text-white shadow-xs animate-bounce flex items-center gap-0.5">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      7/24
                    </span>

                    {/* Symmetrical support bot icon */}
                    <div className={`p-2.5 rounded-full text-white ${theme.bg} shadow-xs`}>
                      <Bot className="w-4 h-4" />
                    </div>

                    {/* Tiny responsive label below bubble */}
                    <span className="text-[8px] font-black text-zinc-600 tracking-wide mt-1 uppercase leading-none group-hover:text-zinc-900">
                      সাপোর্ট বক্স
                    </span>
                  </button>
                </div>
              ) : (
                /* Support Chat Container (Collapsible) */
                <div className="border border-zinc-200 rounded-xl bg-zinc-50/50 flex flex-col overflow-hidden max-h-[290px] min-h-[240px] animate-fade-in">
                  {/* Chat window Header */}
                  <div className={`p-2.5 text-white flex items-center justify-between shrink-0 ${theme.bg}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[10px] font-black tracking-tight">সাপোর্ট বক্স</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-[8px] font-black text-emerald-300 animate-pulse">
                        ● 7/24
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSidebarSupportChatOpen(false)}
                        className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-0.5 rounded cursor-pointer transition-colors"
                        title="সাপোর্ট বক্স বন্ধ করুন"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Messages scrollarea with auto scroll ref anchor */}
                  <div className="flex-1 p-2 overflow-y-auto space-y-2 bg-white/80 text-[10px] select-text">
                    {helpDeskMessages.map((msg, idx) => (
                      <div 
                        key={msg.id || idx} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[90%] rounded-xl px-2.5 py-1.5 leading-relaxed shadow-xs ${
                            msg.sender === 'user' 
                              ? `${theme.bg} text-white rounded-tr-none font-medium` 
                              : 'bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>
                          
                          {/* Inline passcode verify form inside message box, checks against custom password state */}
                          {msg.isPasswordPrompt && showHelpDeskPassword && (
                            <div className="mt-2 p-2 bg-white border border-zinc-250 rounded-lg space-y-1.5">
                              <input
                                type="password"
                                placeholder="অ্যাডমিন পিন দিন..."
                                value={helpDeskPasswordInput}
                                onChange={(e) => setHelpDeskPasswordInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleHelpDeskPasswordVerify();
                                }}
                                className="w-full text-zinc-900 bg-zinc-50 border border-zinc-200 px-2 py-1 text-[10px] font-mono rounded focus:outline-none focus:border-zinc-400"
                                autoFocus
                              />
                              {helpDeskError && (
                                <p className="text-[9px] font-bold text-rose-600 leading-none">{helpDeskError}</p>
                              )}
                              <button
                                type="button"
                                onClick={handleHelpDeskPasswordVerify}
                                className={`w-full py-1 text-[9px] font-black text-white rounded transition-all cursor-pointer ${theme.bg}`}
                              >
                                প্যানেল আনলক করুন
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={helpDeskMessagesEndRef} />
                  </div>

                  {/* Suggested Question FAQ Pill triggers inside sidebar Support Box */}
                  <div className="p-1 px-1.5 border-t border-zinc-150 bg-zinc-100/60 flex flex-wrap gap-1 select-none shrink-0 overflow-y-auto max-h-[80px]">
                    <button
                      type="button"
                      onClick={() => handleHelpDeskSend("ছবি থেকে ব্যাকগ্রাউন্ড মুছব কীভাবে?")}
                      className="text-[8px] font-bold text-zinc-650 hover:text-zinc-900 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      ✂️ ব্যাকগ্রাউন্ড সরাবো কীভাবে?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHelpDeskSend("HD Enhancer কিভাবে কাজ করে?")}
                      className="text-[8px] font-bold text-zinc-650 hover:text-zinc-900 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      📸 এইচডি কনভার্টার কিভাবে চলে?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHelpDeskSend("ছবির সাইজ পরিবর্তন করব কেমনে?")}
                      className="text-[8px] font-bold text-zinc-650 hover:text-zinc-900 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      📐 ছবির সাইজ পরিবর্তন করা
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHelpDeskSend("ছবিগুলো কি অফলাইনে প্রসেস হয় নাকি সার্ভারে যায়?")}
                      className="text-[8px] font-bold text-zinc-650 hover:text-zinc-900 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      🛡️ অফলাইন নিরাপত্তা ও প্রাইভেসি
                    </button>
                  </div>

                  {/* Bottom Input Area */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleHelpDeskSend();
                    }}
                    className="p-1.5 border-t border-zinc-200 flex gap-1.5 bg-zinc-50 shrink-0"
                  >
                    <input
                      type="text"
                      value={helpDeskInput}
                      onChange={(e) => setHelpDeskInput(e.target.value)}
                      placeholder="মেসেজ বা এডমিন ইউজারনেম লিখুন..."
                      className="flex-1 bg-white text-[9px] px-2 py-1 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-350 text-zinc-800"
                    />
                    <button
                      type="submit"
                      className={`p-1 rounded-lg text-white transition-all cursor-pointer ${theme.bg}`}
                    >
                      <Send className="w-2.5 h-2.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Static sidebar footer containing clean branding labels */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex flex-col gap-0.5 text-center font-mono">
          <span className="text-[10px] font-bold text-zinc-600">{brandName} Suite v1.5</span>
          <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-extrabold">
            Offline Engine
          </span>
        </div>
      </aside>

      {/* Upper Navigation Header Bar */}
      <header id="app-header-nav" className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          {/* Hamburger Menu 3-line Button */}
          <button
            id="app-menu-hamburger"
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 border border-zinc-200 hover:border-zinc-300 rounded-xl bg-white hover:bg-zinc-50 shadow-xs text-zinc-700 hover:text-black cursor-pointer transition-all mr-1.5"
            title="Open Workspace Menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-zinc-900" /> : <Menu className="w-5 h-5 text-zinc-900" />}
          </button>

          <div className={`flex items-center justify-center rounded-xl p-2 text-white transition-all duration-300 ${theme.bg} ${theme.shadow}`}>
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-zinc-900 flex items-center gap-1.5">
              {brandName} <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${theme.bgText}`}>ACTIVE STUDIO</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wide">{creatorCredit}</p>
          </div>
        </div>

        {/* Global Stats/Status indicators */}
        <div className="flex items-center gap-3">
          {batchQueue.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{batchQueue.length} items</span>
            </div>
          )}
          {imageObject && (
            <button
              id="global-clear-btn"
              onClick={handleClearApp}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Start New
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        {activeAppSection === 'enhancer' ? (
          <HDPhotoEnhancer
            initialFileUrl={imageObject?.processedUrl || imageObject?.originalUrl || undefined}
            initialFile={selectedFile}
            brandName={brandName}
            onBackToStudio={() => setActiveAppSection('studio')}
            themeColor={theme}
          />
        ) : (
          <>
            {status === 'idle' && (
          <div id="remover-idle-boundary" className="max-w-xl w-full mx-auto my-auto space-y-6 pt-12 text-center animate-fade-in">
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest ${theme.bgText}`}>
                <Sparkle className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '5s' }} /> Private Instant Editor
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                Studio-quality background removals, instantly.
              </h2>
              <p className="text-sm text-zinc-500 font-medium">
                Upload any picture. Our smart matting model detaches backgrounds offline in high resolution inside your browser privacy, with zero cloud uploads!
              </p>
            </div>

            {/* Speed vs. Quality Segmented Slider Toggle */}
            <div className="bg-white border border-zinc-200/80 p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">Processing Performance Mode</span>
                <span className="text-xs text-zinc-650 font-semibold">Speed up background detection & removal time</span>
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-xl shadow-inner border border-zinc-200/50 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setProcessingMode('ultra-fast')}
                  className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    processingMode === 'ultra-fast' 
                      ? `${theme.bg} text-white shadow-sm` 
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ultra Fast (3s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProcessingMode('high-quality')}
                  className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    processingMode === 'high-quality' 
                      ? `${theme.bg} text-white shadow-sm` 
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>HD Quality (Slow)</span>
                </button>
              </div>
            </div>

            {/* Bangla Support Tips for perfect background removal */}
            <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 rounded-2xl text-left flex gap-3 items-start shadow-sm max-w-xl mx-auto font-sans">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-900 block font-sans">ছবি নিখুঁতভাবে ব্যাকগ্রাউন্ড কাটের সিক্রেট টিপস 💡</span>
                <p className="text-[11px] text-amber-800/90 leading-relaxed font-semibold">
                  যদি কোনো ছবির ব্যাকগ্রাউন্ডে অতিরিক্ত অংশ বা কুয়াশা থেকে যায়, তবে অবশ্যই উপরে পাশে থাকা <span className="font-extrabold text-amber-950">"HD Quality (Slow)"</span> সিলেক্ট করে ছবি আবার আপলোড করুন। এটি অত্যন্ত নিখুঁত এআই (AI) মডেল দিয়ে কাটআউট প্রসেস করে। এছাড়াও ছবি সিলেক্ট করার পর ডানদিকের কন্ট্রোল প্যানেলের <span className="font-extrabold text-amber-950 font-sans">"Edge Cleansing & Halos"</span> সেকশনের পরিমাপগুলো বাড়িয়ে যেকোনো অবশিষ্টাংশ অনায়াসে মুছে দিতে পারেন!
                </p>
              </div>
            </div>

            {/* Main File Dropzone */}
            <ImageDropzone 
              onImageSelected={handleImageUploaded} 
              isLoading={false} 
            />
          </div>
        )}

        {status === 'processing' && !imageObject && (
          <div id="remover-loading-boundary" className="max-w-xl w-full mx-auto my-auto py-16 animate-fade-in">
            <ImageDropzone 
              onImageSelected={handleImageUploaded} 
              isLoading={true} 
              statusText={progressText}
              progressPercent={progress}
            />
          </div>
        )}

        {status === 'error' && (
          <div id="remover-error-boundary" className="max-w-lg w-full mx-auto my-auto bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-sm text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-rose-50 text-rose-500 ring-8 ring-rose-50">
              <Scissors className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900">Matting Operation Failed</h3>
              <p className="text-xs text-zinc-500 leading-normal max-w-sm">
                Our model ran into a resource constraint in your browser. This could be due to memory limits, image specs, or missing graphics layers.
              </p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-3 font-mono text-[10px] text-zinc-500 text-left break-all">
              {errorDetails || 'Unknown Neural Process Error'}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                id="error-reset-try-button"
                onClick={handleClearApp}
                className="px-4 py-2 border border-zinc-200 hover:border-zinc-350 rounded-lg text-xs font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Choose other image
              </button>
            </div>
          </div>
        )}

        {/* ================= PRIMARY WORKSPACE WORKSHOP ================= */}
        {imageObject && (
          <div id="remover-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            {/* Left Column: Previews and Canvas Displays */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Layout toggle tabs */}
              <div className="flex items-center justify-between p-1 bg-zinc-150/80 rounded-xl border border-zinc-200/50 select-none">
                <div className="flex items-center gap-2 p-0.5">
                  <div className="flex p-0.5 gap-1 bg-white rounded-lg shadow-sm border border-zinc-100">
                    <button
                      id="view-toggle-compare"
                      onClick={() => setViewMode('compare')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold leading-none cursor-pointer transition-all ${
                        viewMode === 'compare'
                          ? `${theme.bg} text-white`
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Comparisons Splice
                    </button>
                    <button
                      id="view-toggle-remix"
                      onClick={() => setViewMode('remix')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold leading-none cursor-pointer transition-all ${
                        viewMode === 'remix'
                          ? `${theme.bg} text-white`
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> Studio Backdrop Canvas
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5 pr-2">
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${theme.bgText}`}>
                    ACTIVE STUDIO
                  </span>
                </div>
              </div>

              {/* Main Visualizer Stage / Slider Conditional Render */}
              {viewMode === 'compare' ? (
                <div className="w-full h-[450px] relative overflow-hidden bg-zinc-100 rounded-xl border border-zinc-200/80 flex items-center justify-center">
                  <CompareSlider
                    originalUrl={imageObject.originalUrl}
                    processedUrl={imageObject.processedUrl}
                    bgColor={imageObject.bgColor}
                    bgType={imageObject.bgType}
                    bgImageUrl={imageObject.bgImageUrl}
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div
                  id="studio-remix-stage"
                  onPointerDown={handleStagePointerDown}
                  onPointerMove={handleStagePointerMove}
                  onPointerUp={handleStagePointerUp}
                  onPointerCancel={handleStagePointerUp}
                  className={`relative select-none overflow-hidden rounded-xl border ${isPickingColor ? 'border-emerald-500 ring-4 ring-emerald-500/30' : 'border-zinc-200/80'} bg-zinc-100 flex items-center justify-center transition-all duration-300 mx-auto ${
                    isPickingColor 
                      ? 'cursor-crosshair' 
                      : isDragging 
                        ? 'cursor-grabbing' 
                        : 'cursor-grab'
                  }`}
                  style={{
                    aspectRatio: `${getSelectedAspectRatio()}`,
                    width: '100%',
                    maxWidth: `min(100%, calc(450px * ${getSelectedAspectRatio()}))`,
                    maxHeight: '450px', // Prevent stretching too long on tall smartphone screens!
                    backgroundColor: imageObject.bgType === 'color' ? imageObject.bgColor : undefined,
                    backgroundImage: imageObject.bgType === 'transparent'
                      ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, white 25%, white 75%, #e5e7eb 75%, #e5e7eb)'
                      : imageObject.bgType === 'image' && imageObject.bgImageUrl ? `url(${imageObject.bgImageUrl})` : undefined,
                    backgroundPosition: imageObject.bgType === 'transparent' ? '0 0, 8px 8px' : 'center',
                    backgroundSize: imageObject.bgType === 'transparent' ? '16px 16px' : 'cover',
                    touchAction: 'none',
                  }}
                >
                  {/* Floor Shadow layer (Draw behind subject strictly) */}
                  {imageObject.shadow.type === 'floor' && (
                    <div
                      id="stage-shadow-floor"
                      className="absolute rounded-full transition-all duration-100"
                      style={{
                        backgroundColor: imageObject.shadow.color,
                        // Center shadows matching subject translate
                        left: `calc(50% + ${imageObject.transform.offsetX}%)`,
                        top: `calc(50% + ${imageObject.transform.offsetY}%)`,
                        transform: 'translate(-50%, -50%)',
                        // Shadow size offsets
                        width: `${70 * imageObject.transform.scale}%`,
                        height: `${6 * imageObject.transform.scale}%`,
                        marginTop: `${110 * imageObject.transform.scale}px`,
                        filter: `blur(${imageObject.shadow.blur}px)`,
                        opacity: imageObject.shadow.opacity,
                      }}
                    />
                  )}

                  {/* Cutout foreground image with dynamic CSS filters applied */}
                  <img
                    id="stage-processed-subject"
                    src={imageObject.processedUrl}
                    className="absolute w-full h-full object-contain pointer-events-none transition-all duration-100"
                    alt="Remixed Cutout"
                    referrerPolicy="no-referrer"
                    style={{
                      left: `calc(50% + ${imageObject.transform.offsetX}%)`,
                      top: `calc(50% + ${imageObject.transform.offsetY}%)`,
                      transform: `
                        translate(-50%, -50%)
                        scale(${imageObject.transform.scale})
                        rotate(${imageObject.transform.rotate}deg)
                      `,
                      // Group standard edits & shadow under single filter key for high composite performance
                      filter: `
                        brightness(${imageObject.transform.brightness}%)
                        contrast(${imageObject.transform.contrast}%)
                        saturate(${imageObject.transform.saturation}%)
                        ${imageObject.shadow.type === 'drop' 
                          ? `drop-shadow(${imageObject.shadow.offsetX}px ${imageObject.shadow.offsetY}px ${imageObject.shadow.blur}px ${hexToRGBA(imageObject.shadow.color, imageObject.shadow.opacity)})` 
                          : ''}
                        ${imageObject.shadow.type === 'glow' 
                          ? `drop-shadow(0 0 ${imageObject.shadow.blur}px ${imageObject.shadow.color}) opacity(${imageObject.shadow.opacity})` 
                          : ''}
                      `,
                    }}
                  />

                  {/* Top corner pixel tag */}
                  <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-650 bg-white/80 backdrop-blur border border-zinc-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1.5 pointer-events-none">
                    <span className="font-extrabold text-zinc-500">Output:</span>
                    <span>{getOutputDimensionsInPixels().width} × {getOutputDimensionsInPixels().height} px</span>
                    {selectedSizePreset !== 'original' && (
                      <span className="font-bold text-sky-700 bg-sky-50 px-1 rounded text-[8px] uppercase">
                        {selectedSizePreset === 'bd-passport' ? 'BD Passport' : 
                         selectedSizePreset === 'bd-stamp' ? 'BD Stamp' : 
                         selectedSizePreset === 'us-passport' ? 'US Visa/Square' : 'Custom'}
                      </span>
                    )}
                  </div>

                  {/* Floating Interactive Micro-Adjustment Ribbon overlay */}
                  <div className="absolute bottom-4 inset-x-0 mx-auto w-fit bg-zinc-900/90 hover:bg-zinc-900 backdrop-blur border border-zinc-800 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up pointer-events-auto">
                    {/* Zoom Actions */}
                    <div className="flex items-center gap-1.5 border-r border-zinc-700/60 pr-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextScale = Math.min(imageObject.transform.scale + 0.05, 2.0);
                          handleTransformChange({ ...imageObject.transform, scale: parseFloat(nextScale.toFixed(2)) });
                        }}
                        className="p-1 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition-all cursor-pointer"
                        title="Zoom In"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-zinc-300 min-w-[34px] text-center">
                        {Math.round(imageObject.transform.scale * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextScale = Math.max(imageObject.transform.scale - 0.05, 0.2);
                          handleTransformChange({ ...imageObject.transform, scale: parseFloat(nextScale.toFixed(2)) });
                        }}
                        className="p-1 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition-all cursor-pointer"
                        title="Zoom Out"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Rotation Actions */}
                    <div className="flex items-center gap-1.5 border-r border-zinc-700/60 pr-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextRotate = (imageObject.transform.rotate + 15) % 360;
                          handleTransformChange({ ...imageObject.transform, rotate: nextRotate });
                        }}
                        className="p-1 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition-all cursor-pointer"
                        title="Rotate 15° Clocwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-zinc-300">
                        {imageObject.transform.rotate}°
                      </span>
                    </div>

                    {/* Recenter Position CTA */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTransformChange({
                          ...imageObject.transform,
                          offsetX: 0,
                          offsetY: 0,
                          scale: 1.0,
                          rotate: 0
                        });
                      }}
                      className="px-2 py-0.5 hover:bg-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white font-bold rounded border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      Fit & Center
                    </button>
                  </div>
                </div>
              )}

              {/* Gemini Stylist Column integrated right on top of batch items */}
              <GeminiAssistant
                imageFile={selectedFile}
                onApplyColor={(color) => handleBgColorChange(color)}
                onApplyBackdrop={(themeUrl) => {
                  setViewMode('remix');
                  handleBgTypeChange('image');
                  handleBgImageUrlChange(themeUrl);
                }}
                brandName={brandName}
              />
            </div>

            {/* Right Column: Adjustment Forms, Sliders, Export buttons */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Photo Sizing & Official Presets Card */}
              <div id="photo-sizing-card" className="p-5 bg-white border border-zinc-200/80 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-white ${theme.bg}`}>
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-900">Output Dimensions & Sizing</h3>
                    <p className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold inline-block mt-0.5">Crop to Official Standards</p>
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Original ratio option */}
                  {(enabledPresets.length === 0 || enabledPresets.includes('original')) && (
                    <button
                      onClick={() => setSelectedSizePreset('original')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSizePreset === 'original'
                          ? `border-zinc-900 bg-zinc-50/80 ring-2 ${theme.ring}`
                          : 'border-zinc-250/70 hover:border-zinc-350 bg-white'
                      }`}
                    >
                      <span className="block text-xs font-extrabold text-zinc-800">Original Ratio</span>
                      <span className="block text-[10px] text-zinc-400 mt-1 font-medium">No sizing changes</span>
                    </button>
                  )}

                  {/* BD Passport Option */}
                  {(enabledPresets.length === 0 || enabledPresets.includes('bd-passport')) && (
                    <button
                      onClick={() => {
                        setSelectedSizePreset('bd-passport');
                        setViewMode('remix');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                        selectedSizePreset === 'bd-passport'
                          ? `border-zinc-900 bg-zinc-50/80 ring-2 ${theme.ring}`
                          : 'border-zinc-250/70 hover:border-zinc-350 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-extrabold text-zinc-800">BD Passport</span>
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 font-extrabold px-1 rounded uppercase tracking-wide">Official</span>
                      </div>
                      <span className="block text-[10px] text-zinc-400 mt-1 font-medium">40 × 50 mm (4:5 AR)</span>
                    </button>
                  )}

                  {/* BD Stamp Option */}
                  {(enabledPresets.length === 0 || enabledPresets.includes('bd-stamp')) && (
                    <button
                      onClick={() => {
                        setSelectedSizePreset('bd-stamp');
                        setViewMode('remix');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSizePreset === 'bd-stamp'
                          ? `border-zinc-900 bg-zinc-50/80 ring-2 ${theme.ring}`
                          : 'border-zinc-250/70 hover:border-zinc-350 bg-white'
                      }`}
                    >
                      <span className="block text-xs font-extrabold text-zinc-800">BD Stamp Size</span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5 font-medium">20 × 25 mm (4:5 AR)</span>
                    </button>
                  )}

                  {/* US Passport Option */}
                  {(enabledPresets.length === 0 || enabledPresets.includes('us-passport')) && (
                    <button
                      onClick={() => {
                        setSelectedSizePreset('us-passport');
                        setViewMode('remix');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSizePreset === 'us-passport'
                          ? `border-zinc-900 bg-zinc-50/80 ring-2 ${theme.ring}`
                          : 'border-zinc-250/70 hover:border-zinc-350 bg-white'
                      }`}
                    >
                      <span className="block text-xs font-extrabold text-zinc-800">US Visa / 1:1</span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5 font-medium">2" × 2" (600 × 600 px)</span>
                    </button>
                  )}

                  {/* Custom manual crop option */}
                  {(enabledPresets.length === 0 || enabledPresets.includes('custom')) && (
                    <button
                      onClick={() => {
                        setSelectedSizePreset('custom');
                        setViewMode('remix');
                      }}
                      className={`col-span-2 p-3 rounded-xl border text-left transition-all ${
                        selectedSizePreset === 'custom'
                          ? `border-zinc-900 bg-zinc-50/80 ring-2 ${theme.ring}`
                          : 'border-zinc-250/70 hover:border-zinc-350 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-zinc-850">⚙️ Custom Manual Size...</span>
                        <span className="text-[9px] text-zinc-400 font-mono">Specify px or mm values</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Custom Inputs Panel */}
                {selectedSizePreset === 'custom' && (
                  <div className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-xl space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-200/50 pb-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dimension Details</span>
                      <div className="flex bg-white border border-zinc-150 p-0.5 rounded-lg shadow-inner">
                        <button
                          type="button"
                          onClick={() => setCustomUnit('px')}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            customUnit === 'px' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          Pixels (px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomUnit('mm')}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            customUnit === 'mm' ? 'bg-zinc-805 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          Millimeters (mm)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Width</label>
                        <div className="flex items-center border border-zinc-200 bg-white rounded-xl focus-within:border-zinc-505 overflow-hidden pr-3 shadow-inner">
                          <input
                            type="number"
                            value={customWidth}
                            min="1"
                            onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-2 text-xs focus:outline-none text-zinc-800 font-mono font-semibold"
                          />
                          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">{customUnit}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Height</label>
                        <div className="flex items-center border border-zinc-200 bg-white rounded-xl focus-within:border-zinc-550 overflow-hidden pr-3 shadow-inner">
                          <input
                            type="number"
                            value={customHeight}
                            min="1"
                            onChange={(e) => setCustomHeight(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-2 text-xs focus:outline-none text-zinc-800 font-mono font-semibold"
                          />
                          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">{customUnit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-400 space-y-0.5 leading-relaxed bg-white p-2.5 border border-zinc-150 rounded-xl">
                      <p className="font-semibold text-zinc-650 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-450 animate-pulse" />
                        Live aspect ratio: <span className="font-mono text-zinc-800 font-bold">{(customWidth / (customHeight || 1)).toFixed(2)}:1</span>
                      </p>
                      {customUnit === 'mm' && (
                        <p className="text-[9px] text-zinc-400 font-medium">
                          Translates to approx <span className="font-mono text-zinc-700 font-bold">{Math.round(customWidth * 11.811)}</span> × <span className="font-mono text-zinc-700 font-bold">{Math.round(customHeight * 11.811)}</span> px under 300 DPI high-quality print.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary export button banner */}
              <div id="workspace-action-card" className="p-4 bg-zinc-900 text-white rounded-2xl shadow-lg border border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileImage className={`w-4 h-4 ${theme.text}`} />
                    <span className="text-xs font-semibold text-zinc-300 font-mono">Format: High Resolution PNG</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">READY</span>
                </div>
                
                <button
                  id="final-export-download-btn"
                  onClick={compileAndDownload}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 text-white active:scale-[0.98] transition-all cursor-pointer pointer-events-auto ${theme.bg} ${theme.shadow}`}
                >
                  <Download className="w-4 h-4" /> Export Studio Remixed Photo
                </button>
              </div>

              {/* Adjustments sheet panel */}
              <StudioControls
                bgType={imageObject.bgType}
                bgColor={imageObject.bgColor || '#ffffff'}
                bgImageUrl={imageObject.bgImageUrl || ''}
                transform={imageObject.transform}
                shadow={imageObject.shadow}
                onBgTypeChange={handleBgTypeChange}
                onBgColorChange={handleBgColorChange}
                onBgImageUrlChange={handleBgImageUrlChange}
                onTransformChange={handleTransformChange}
                onShadowChange={handleShadowChange}
                onUploadCustomBg={handleUploadCustomBg}
                onReset={handleResetSettings}
                edgeTrim={edgeTrim}
                setEdgeTrim={setEdgeTrim}
                alphaThreshold={alphaThreshold}
                setAlphaThreshold={setAlphaThreshold}
                colorPresets={colorPresets}
                bgRemoveMethod={bgRemoveMethod}
                setBgRemoveMethod={setBgRemoveMethod}
                chromaKeyColor={chromaKeyColor}
                setChromaKeyColor={setChromaKeyColor}
                chromaKeyTolerance={chromaKeyTolerance}
                setChromaKeyTolerance={setChromaKeyTolerance}
                chromaKeyFeather={chromaKeyFeather}
                setChromaKeyFeather={setChromaKeyFeather}
                isPickingColor={isPickingColor}
                setIsPickingColor={setIsPickingColor}
              />
            </div>
          </div>
        )}

        {/* Batch sessions queue */}
        {batchQueue.length > 0 && (
          <div id="remover-batch-queue" className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">
              Session Queue
            </span>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {batchQueue.map((item, index) => (
                <button
                  key={index}
                  id={`batch-item-${index}`}
                  onClick={() => handleImageUploaded(item.file)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl border overflow-hidden hover:border-zinc-405 transition-all cursor-pointer ${
                    selectedFile?.name === item.file.name ? `border-2 border-zinc-900 shadow ring-2 ${theme.ring}` : 'border-zinc-200'
                  }`}
                >
                  <img src={item.thumbUrl} className="w-full h-full object-cover" alt="Thumb" referrerPolicy="no-referrer" />
                  {selectedFile?.name === item.file.name && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <span className={`text-[9px] font-extrabold text-white uppercase px-1.5 py-0.5 rounded scale-90 ${theme.bg}`}>
                        active
                      </span>
                    </div>
                  )}
                </button>
              ))}

              {/* Quick file dropper to load additional items */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUploaded(e.target.files[0]);
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                id="queue-add-btn"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200/80 hover:border-zinc-400 hover:bg-zinc-50/50 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Add</span>
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Workspace Footer block */}
      <footer id="workspace-footer" className="mt-auto py-8 border-t border-zinc-200/60 bg-white/50 text-center space-y-1.5 shrink-0 select-none">
        <p className="text-sm font-bold text-zinc-700">
          {brandName} • {creatorCredit}
        </p>
        <p className="text-[10px] font-medium text-zinc-400">
          Offline Browser-Safe Processing
        </p>
      </footer>
    </div>
  );
}
