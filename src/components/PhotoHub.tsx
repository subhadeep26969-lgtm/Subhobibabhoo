import React, { useState, useEffect } from 'react';
import { Photo } from '../types';
import { submitPhoto, listenToPhotos } from '../firebase';
import { compressImage } from '../utils/imageCompressor';
import { Camera, Image as ImageIcon, Heart, Upload, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Gorgeous default royalty-free Bengali/Indian wedding images from Unsplash to ensure the hub looks premium instantly!
const DEFAULT_MEMORIES: Photo[] = [
  {
    id: "seed-1",
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
    uploadedBy: "বিয়াস ও শুভ্রাংশু",
    caption: "একত্রে পথচলার প্রথম শুভ সিঁদুরদান মুহূর্ত।",
    createdAt: "2026-06-01T12:00:00.000Z"
  },
  {
    id: "seed-2",
    imageUrl: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=800",
    uploadedBy: "পরিবার",
    caption: "আলপনা ও মেহেন্দির সুনিপুণ হাতের ছোঁয়া।",
    createdAt: "2026-06-02T14:30:00.000Z"
  },
  {
    id: "seed-3",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
    uploadedBy: "বন্ধুরা",
    caption: "গাঁদা ফুলের ডেকোরেশন ও গায়ে হলুদের মধুর আনন্দ।",
    createdAt: "2026-06-05T09:15:00.000Z"
  },
  {
    id: "seed-4",
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=800",
    uploadedBy: "মিষ্টি মুখ",
    caption: "বিবাহের প্রাণ - খাঁটি রসগোল্লার উষ্ণ আপ্যায়ন।",
    createdAt: "2026-06-10T18:45:00.000Z"
  }
];

export const PhotoHub: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Lightbox State
  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null);

  // Combine default memories with user uploaded ones
  useEffect(() => {
    // Listen to real-time additions from Firestore
    const unsubscribe = listenToPhotos((dbPhotos) => {
      // Merge: dbPhotos come first, then seed items
      setPhotos([...dbPhotos, ...DEFAULT_MEMORIES]);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('অনুগ্রহ করে একটি ছবি নির্বাচন করুন।');
      return;
    }
    if (!authorName.trim()) {
      setErrorMessage('আপনার নামটি অনুগ্রহ করে লিখুন।');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Compress to Base64 (reduces size dramatically)
      const compressedBase64 = await compressImage(selectedFile, 800);
      
      await submitPhoto({
        imageUrl: compressedBase64,
        uploadedBy: authorName,
        caption: caption.trim() || undefined,
        createdAt: new Date().toISOString()
      });

      setSuccessMessage('ছবিটি সফলভাবে আপলোড করা হয়েছে! স্মৃতিচিত্রে যুক্ত হলো।');
      clearSelectedFile();
      // Keep author name for next uploads
    } catch (err) {
      console.error(err);
      setErrorMessage('আপলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsUploading(false);
    }
  };

  const openLightbox = (idx: number) => {
    setActiveLightboxIdx(idx);
  };

  const closeLightbox = () => {
    setActiveLightboxIdx(null);
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeLightboxIdx !== null) {
      setActiveLightboxIdx((activeLightboxIdx + 1) % photos.length);
    }
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeLightboxIdx !== null) {
      setActiveLightboxIdx((activeLightboxIdx - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="space-y-8" id="photo-hub-section">
      <div className="text-center">
        <span className="font-display text-xs tracking-wider text-amber-600 font-bold block mb-1">IMAGE GALLERY</span>
        <h3 className="font-serif text-3xl text-red-950 font-extrabold flex items-center justify-center gap-2">
          📸 স্মৃতি চিত্র (Smriti Chitro)
        </h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto mt-1.5 leading-relaxed font-sans">
          বরের এবং কনের সুন্দর মুহূর্তগুলির সঙ্গে আপনাদের তোলা যেকোনো স্মৃতি ছবি সরাসরি ফোনের গ্যালারি বা ক্যামেরা থেকে আপলোড করুন!
        </p>
      </div>

      {/* Upload Box Form */}
      <div className="max-w-xl mx-auto bg-stone-50 border border-amber-800/20 p-5 rounded-2xl shadow-sm">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="text-center">
            {previewUrl ? (
              <div className="relative inline-block max-w-[260px] rounded-xl overflow-hidden shadow-inner border border-stone-200">
                <img src={previewUrl} alt="Preview" className="h-44 w-auto object-cover" />
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="absolute top-2 right-2 bg-red-950/80 text-white rounded-full p-1.5 hover:bg-red-800 transition-colors"
                  id="clear-photo-preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label 
                className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-xl py-8 px-4 bg-white hover:bg-amber-50/20 hover:border-amber-600/50 cursor-pointer transition-all group"
                id="photo-upload-label"
              >
                <div className="p-3 bg-amber-50 rounded-full text-amber-700 mb-2.5 group-hover:scale-105 transition-transform">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-stone-800">ফোনের ক্যামেরা বা গ্যালারি থেকে ছবি নিন</span>
                <span className="text-[10px] text-stone-500 mt-1">Tap here to capture or select photographic memory</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment" // Auto-triggers camera on mobile
                  className="hidden"
                  onChange={handleFileChange}
                  id="photo-file-input"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="photo-author">আপনার নাম (Your Name) *</label>
              <input
                id="photo-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="যিনি তুলেছেন..."
                className="w-full text-xs font-sans rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:border-red-805"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="photo-caption">ক্যাপশন (Caption / Message)</label>
              <input
                id="photo-caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="একটি ছোট সুন্দর ক্যাপশন..."
                className="w-full text-xs font-sans rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:border-red-805"
              />
            </div>
          </div>

          {errorMessage && <p className="text-xs text-red-700 text-center">{errorMessage}</p>}
          {successMessage && <p className="text-xs text-emerald-800 text-center font-semibold">{successMessage}</p>}

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-red-800 text-white font-serif text-xs px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                isUploading || !selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900 active:scale-95 cursor-pointer'
              }`}
              id="submit-photo-btn"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>স্মৃতিচিত্রে যুক্ত করুন (Upload Photo)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Photo Grid Gallery with Masonry Columns */}
      <div className="columns-2 md:columns-4 gap-4 space-y-4 max-w-6xl mx-auto px-1.5" id="masonry-gallery-container">
        {photos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            onClick={() => openLightbox(idx)}
            className="break-inside-avoid relative rounded-xl overflow-hidden cursor-zoom-in border border-stone-200 bg-white group shadow-sm hover:shadow-md transition-all duration-300"
            id={`gallery-item-${idx}`}
          >
            <img
              src={photo.imageUrl}
              alt={photo.caption || "Wedding Memory"}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-red-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider flex items-center gap-1">
                <Heart className="h-3 w-3 fill-current text-red-500" /> By {photo.uploadedBy}
              </p>
              {photo.caption && (
                <p className="text-xs text-white mt-1 line-clamp-2 leading-tight">
                  {photo.caption}
                </p>
              )}
            </div>
            
            {/* Small Zoom Indicator */}
            <div className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between items-center py-6 px-4"
          >
            {/* Header / Close button */}
            <div className="w-full max-w-5xl flex justify-between items-center text-white">
              <div className="text-xs font-sans tracking-wide">
                <span>স্মৃতি চিত্র {activeLightboxIdx + 1} / {photos.length}</span>
              </div>
              <button
                onClick={closeLightbox}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-colors"
                id="close-lightbox-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content view */}
            <div className="flex-1 w-full flex items-center justify-center relative max-w-4xl max-h-[70vh]">
              {/* Prev button */}
              <button
                onClick={prevPhoto}
                className="absolute left-0 md:-left-12 bg-white/15 hover:bg-white/20 text-white p-3 rounded-full cursor-pointer transition-all z-10"
                id="prev-lightbox-btn"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <motion.img
                key={activeLightboxIdx}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={photos[activeLightboxIdx].imageUrl}
                alt="Selected Memory"
                referrerPolicy="no-referrer"
                onClick={(e) => e.stopPropagation()} // Stop modal closing when clicking the image
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl border border-white/10"
              />

              {/* Next button */}
              <button
                onClick={nextPhoto}
                className="absolute right-0 md:-right-12 bg-white/15 hover:bg-white/20 text-white p-3 rounded-full cursor-pointer transition-all z-10"
                id="next-lightbox-btn"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Footer metadata */}
            <div className="w-full max-w-2xl text-center text-white bg-black/40 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-amber-300 font-bold tracking-wider uppercase mb-1">
                MEMORIES BY {photos[activeLightboxIdx].uploadedBy}
              </p>
              {photos[activeLightboxIdx].caption ? (
                <p className="font-serif text-sm text-stone-100 max-w-xl mx-auto">
                  "{photos[activeLightboxIdx].caption}"
                </p>
              ) : (
                <p className="text-xs text-stone-400 italic">No caption provided.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
