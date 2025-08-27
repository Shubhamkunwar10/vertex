// src/App.js

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  X,
  Heart,
  ShoppingCart,
  Instagram,
  Linkedin,
  Github,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_WEBSITES } from "./MockWebsite";

// SANDPACK IMPORTS
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useSandpack,
  defaultDark as sandpackDark,
} from "@codesandbox/sandpack-react";

//================================================================
// TYPE DEFINITIONS
//================================================================

interface Website {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  tags: string[];
  files: Record<string, string> | null;
  imagePath: string;
}

//================================================================
// CUSTOM HOOK: For fetching multiple files for Sandpack
//================================================================
const useSandpackFiles = (website: Website | null) => {
  const [sandpackFiles, setSandpackFiles] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!website || !website.files) {
      setSandpackFiles({
        "/index.html": {
          code: `<html><body style="background-color: #111827; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-family: sans-serif;"><h1>Select a template or start creating!</h1></body></html>`,
        },
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSandpackFiles(null);
    setError(null);

    const filePromises = Object.entries(website.files).map(
      async ([sandboxPath, projectPath]) => {
        const response = await fetch(projectPath);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${projectPath}: ${response.statusText}`
          );
        }
        let content = await response.text();

        const pathParts = projectPath.split("/");
        pathParts.pop();
        const basePath = pathParts.join("/") + "/";
        const baseTag = `<base href="${basePath}">`;

        if (content.includes("<head>")) {
          content = content.replace("<head>", `<head>${baseTag}`);
        } else {
          content = `<head>${baseTag}</head>${content}`;
        }

        const anchorFixScript = `
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              if (window.self !== window.top) {
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                  anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const href = this.getAttribute('href');
                    if (href && href.length > 1) {
                      try {
                        const targetElement = document.querySelector(href);
                        if (targetElement) {
                          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      } catch (err) {
                        console.error('Failed to scroll to anchor:', href, err);
                      }
                    }
                  });
                });
              }
            });
          </script>
        `;

        if (content.includes("</body>")) {
          content = content.replace("</body>", anchorFixScript + "</body>");
        } else {
          content += anchorFixScript;
        }

        return [sandboxPath, { code: content }];
      }
    );

    Promise.all(filePromises)
      .then((fileEntries) => {
        setSandpackFiles(Object.fromEntries(fileEntries));
      })
      .catch((err) => {
        console.error("Error fetching template files:", err);
        setError("Failed to load template files.");
        setSandpackFiles({
          "/index.html": {
            code: `<html lang="en"><body style="background-color: #111827; color: #f87171; text-align: center; padding: 2rem;"><h2>Error Loading Preview</h2><p>${err.message}</p></body></html>`,
          },
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [website]);

  return { sandpackFiles, isLoading, error };
};

//================================================================
// ✨ UI & HELPER COMPONENTS ✨
//================================================================

const MotionBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
    <motion.div
      className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-indigo-600/30 blur-3xl filter"
      animate={{
        x: [0, 100, 0, -50, 0],
        y: [0, -50, 100, 50, 0],
        scale: [1, 1.1, 0.9, 1.2, 1],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-cyan-600/30 blur-3xl filter"
      animate={{
        x: [0, -100, 0, 50, 0],
        y: [0, 50, -100, -50, 0],
        scale: [1, 0.9, 1.2, 1.1, 1],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: 5,
      }}
    />
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVoaGhvb29ra2uCgoN+fn5wcLBpaWh9fX1zcnJsbGx4eHhoampkZGRowcXFysrLCwsLDg4NCgkJAhIRTExMTk5NTHRMAwkLAAAAAXRSTlMAQObYZgAAAFRJREFUeNpiYGBkYmUdzM0sBAAA//8DQAJgYAEEgEDCiAATEwMAAANQAAEAAAAAgAEBBAkGCAAdQAECBAkGCAAdQAECBAkGCAAdQAECAgYgAAMAAQpkk774eS0NAAAAAElFTSuQmCC)",
      }}
    />
  </div>
);

//================================================================
// ⭐️ START MODIFICATION: AnimatedLoader
//================================================================
interface AnimatedLoaderProps {
  backgroundImageUrl?: string; // Prop to receive the image URL
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  backgroundImageUrl,
}) => {
  const loaderContainerVariants = {
    start: { transition: { staggerChildren: 0.15 } },
    end: { transition: { staggerChildren: 0.15 } },
  };
  const loaderCircleVariants = {
    start: { y: "0%", opacity: 0.5 },
    end: { y: "100%", opacity: 1 },
  };
  const loaderTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut",
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-md z-10 rounded-2xl overflow-hidden">
      {/* Background Image Layer */}
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm scale-110 opacity-30"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      {/* Loader Content Layer (on top) */}
      <div className="relative flex flex-col items-center justify-center">
        <motion.div
          className="flex h-8 items-end gap-2"
          variants={loaderContainerVariants}
          initial="start"
          animate="end"
        >
          <motion.span
            className="block w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"
            variants={loaderCircleVariants}
            transition={loaderTransition as any}
          />
          <motion.span
            className="block w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"
            variants={loaderCircleVariants}
            transition={loaderTransition as any}
          />
          <motion.span
            className="block w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"
            variants={loaderCircleVariants}
            transition={loaderTransition as any}
          />
        </motion.div>
        <p className="mt-4 text-sm font-medium text-gray-300 tracking-wide">
          Loading Interactive Preview...
        </p>
      </div>
    </div>
  );
};
// ⭐️ END MODIFICATION
//================================================================


//================================================================
// ✨ MORE ROBUST COMPONENT TO HANDLE SANDPACK LOADING ✨
//================================================================

//================================================================
// ⭐️ START MODIFICATION: PreviewWithLoader
//================================================================
const PreviewWithLoader: React.FC<{
  style: React.CSSProperties;
  backgroundImageUrl?: string; // Prop to receive the image URL
}> = ({ style, backgroundImageUrl }) => {
// ⭐️ END MODIFICATION
//================================================================
  const { sandpack } = useSandpack();
  const { status } = sandpack;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.warn("Sandpack loading fallback triggered. Hiding loader.");
      setIsReady(true);
    }, 5000);

    if (status === "idle") {
      clearTimeout(fallbackTimer);
      const readyTimer = setTimeout(() => setIsReady(true), 300);
      return () => clearTimeout(readyTimer);
    } else {
      setIsReady(false);
    }

    return () => clearTimeout(fallbackTimer);
  }, [status]);

  return (
    <div className="relative w-full h-full">
      {/* ⭐️ START MODIFICATION: Pass prop to AnimatedLoader ⭐️ */}
      <AnimatePresence>
        {!isReady && <AnimatedLoader backgroundImageUrl={backgroundImageUrl} />}
      </AnimatePresence>
      {/* ⭐️ END MODIFICATION ⭐️ */}
      <SandpackPreview
        showOpenInCodeSandbox={false}
        style={{
          ...style,
          visibility: isReady ? "visible" : "hidden",
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.3s ease-in, visibility 0.3s",
        }}
      />
    </div>
  );
};

//================================================================
// REGULAR COMPONENTS
//================================================================

interface ResponsiveFrameProps {
  files: any | null;
  //================================================================
  // ⭐️ START MODIFICATION: Add backgroundImageUrl prop
  //================================================================
  backgroundImageUrl?: string;
  // ⭐️ END MODIFICATION
  //================================================================
}
const ResponsiveFrame: React.FC<ResponsiveFrameProps> = ({ files, backgroundImageUrl }) => {
  const customTheme = useMemo(
    () => ({
      ...sandpackDark,
      colors: { ...sandpackDark.colors, surface1: "transparent" },
      common: { borderRadius: "0px" },
    }),
    []
  );

  if (!files) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/30 rounded-3xl">
        <AnimatedLoader />
      </div>
    );
  }

  return (
    <SandpackProvider
      key={Object.keys(files).join("-")}
      files={files}
      theme={customTheme}
      template="static"
    >
      <div className="relative w-full h-full">
        {/* Mobile */}
        <div
          className="block sm:hidden relative w-full h-full mx-auto bg-black rounded-3xl shadow-2xl p-2"
        >
          <div className="w-full h-full rounded-2xl overflow-hidden relative bg-black">
            <SandpackLayout className="!rounded-2xl">
              {/* ⭐️ START MODIFICATION: Pass prop down ⭐️ */}
              <PreviewWithLoader style={{ height: "80vh" }} backgroundImageUrl={backgroundImageUrl}/>
              {/* ⭐️ END MODIFICATION ⭐️ */}
            </SandpackLayout>
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full" />
        </div>

        {/* Desktop */}
        <div className="hidden sm:block relative w-full h-full bg-gradient-to-br from-white/10 to-black/10 backdrop-blur-sm rounded-3xl shadow-2xl p-3 border border-white/10">
          <div className="w-full h-full rounded-2xl overflow-hidden relative bg-black/30">
            <SandpackLayout className="!rounded-2xl">
              {/* ⭐️ START MODIFICATION: Pass prop down ⭐️ */}
              <PreviewWithLoader style={{ height: "80vh" }} backgroundImageUrl={backgroundImageUrl}/>
              {/* ⭐️ END MODIFICATION ⭐️ */}
            </SandpackLayout>
          </div>
        </div>
      </div>
    </SandpackProvider>
  );
};

interface FullScreenPreviewProps {
  files: any | null;
  onClose: () => void;
  //================================================================
  // ⭐️ START MODIFICATION: Add backgroundImageUrl prop
  //================================================================
  backgroundImageUrl?: string;
  // ⭐️ END MODIFICATION
  //================================================================
}
const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  files,
  onClose,
  backgroundImageUrl, // Get prop
}) => {
  if (!files) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <SandpackProvider files={files} template="static" theme={sandpackDark}>
        {/* ⭐️ START MODIFICATION: Pass prop down ⭐️ */}
        <PreviewWithLoader style={{ height: "100vh" }} backgroundImageUrl={backgroundImageUrl} />
        {/* ⭐️ END MODIFICATION ⭐️ */}
      </SandpackProvider>
      <button
        onClick={onClose}
        className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-full hover:bg-white hover:text-black transition-all transform hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20"
        title="Exit Fullscreen"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

// ... (TemplateThumbnail and TemplateDetails components remain unchanged)
interface TemplateThumbnailProps {
  website: Website;
  onClick: () => void;
  isActive: boolean;
  isFavorite: boolean;
  onToggleFav: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}
const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  website,
  onClick,
  isActive,
  isFavorite,
  onToggleFav,
}) => {
  const isNewCard = website.id === "new";

  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 w-48 sm:w-56 lg:w-60 p-3 rounded-2xl cursor-pointer transition-all duration-300 snap-center border-2 bg-neutral-800/40 backdrop-blur-sm transform hover:scale-105 active:scale-95
        ${
          isActive
            ? "border-indigo-500 bg-neutral-800/70"
            : "border-transparent hover:border-white/20"
        }`}
    >
      <div className="aspect-video bg-gray-700/50 rounded-lg mb-3 overflow-hidden pointer-events-none relative ring-1 ring-white/10">
        {isNewCard ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600/20 to-cyan-600/20">
            <Plus className="w-8 h-8 text-emerald-400" />
          </div>
        ) : (
          <img
            src={website.imagePath}
            alt={`${website.title} thumbnail`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm truncate">
            {website.title}
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            {isNewCard ? "Free" : `₹${website.price.toLocaleString("en-IN")}`}
          </p>
        </div>
        {!isNewCard && (
          <button
            onClick={(e) => onToggleFav(e, website.id)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? "text-red-500 fill-current" : "text-gray-400"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

interface TemplateDetailsProps {
  website: Website;
  onBuyNow: () => void;
}
const TemplateDetails: React.FC<TemplateDetailsProps> = ({
  website,
  onBuyNow,
}) => {
  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 lg:-mt-16">
      <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs sm:text-sm font-bold uppercase text-indigo-400 tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    {website.category}
                  </span>
                  <span className="px-2 py-0.5 text-xs bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
                    AI-Powered
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  {website.title || (
                    <span className="text-gray-400 italic">
                      Select a template
                    </span>
                  )}
                </h2>
              </div>
            </div>
            {website.tags && website.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {website.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-200 px-3 py-1.5 rounded-full border border-indigo-500/20 backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-4 bg-white/5 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="p-6 sm:p-8 lg:p-10 h-full flex flex-col justify-between">
              <div className="text-center lg:text-left">
                <div className="mb-6">
                  <div className="flex items-baseline justify-center lg:justify-start gap-3 mb-2">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      ₹{website.price.toLocaleString("en-IN")}
                    </span>
                    {website.originalPrice > website.price && (
                      <span className="text-lg text-gray-500 line-through">
                        ₹{website.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  {website.originalPrice > website.price && (
                    <div className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-xs font-medium px-2 py-1 rounded-full border border-red-500/20">
                      <span>
                        Save ₹
                        {(
                          website.originalPrice - website.price
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={onBuyNow}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </button>

                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <span>✓ Instant Response</span>
                  <span className="mx-2">•</span>
                  <span>✓ Full Source Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const CATEGORY_OPTIONS = [
  "Business",
  "E-commerce",
  "Portfolio",
  "Landing",
  "SaaS",
  "AI Startup",
  "Blog",
  "Agency",
];

//================================================================
// MAIN APP COMPONENT
//================================================================

const WHATSAPP_NUMBER = "9310739038";


export default function App() {
  const [websites] = useState<any[]>(() => MOCK_WEBSITES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const total = websites.length;
  const currentWebsite = websites[currentIndex];

  const { sandpackFiles } = useSandpackFiles(currentWebsite);

  const goPrev = useCallback(
    () => setCurrentIndex((p) => (p - 1 + total) % total),
    [total]
  );
  const goNext = useCallback(
    () => setCurrentIndex((p) => (p + 1) % total),
    [total]
  );

  const toggleFav = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
      e.stopPropagation();
      setFavorites((prev) => {
        const newFavs = new Set(prev);
        if (newFavs.has(id)) newFavs.delete(id);
        else newFavs.add(id);
        return newFavs;
      });
    },
    []
  );

  useEffect(() => {
    document.body.style.overflow = isFullScreen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFullScreen]);

  const handleBuyNow = () => {
    if (currentWebsite.id !== "new") {
      const title = currentWebsite.title;
      const price = currentWebsite.price.toLocaleString("en-IN");
      const message = `Hello! I'm interested in purchasing the "${title}" template for ₹${price}. Please provide me with the next steps.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <>
      <div className="min-h-screen w-full font-sans text-white selection:bg-indigo-500 selection:text-white relative">
        <MotionBackground />

        <header className="relative z-30 sticky top-0 bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Vertex Nexus
              </h1>
              <span className="text-xs px-2 py-1 rounded-md bg-gradient-to-r from-indigo-600 to-cyan-400 text-white font-semibold">
                Custom 3D Websites
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-sm bg-neutral-900/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
                <span>{currentIndex + 1}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span>{total}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="max-w-7xl mx-auto">
              <div
                className="relative w-full"
                style={{
                  maxHeight: "70vh",
                }}
              >
                <div className="w-full h-full transition-all duration-400 ease-in-out rounded-3xl overflow-hidden">
                  {/* ⭐️ START MODIFICATION: Pass image path to ResponsiveFrame ⭐️ */}
                  <ResponsiveFrame
                    files={sandpackFiles}
                    backgroundImageUrl={currentWebsite?.imagePath}
                  />
                  {/* ⭐️ END MODIFICATION ⭐️ */}
                </div>
                <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={goPrev}
                    className="pointer-events-auto -ml-2 sm:ml-2 p-2 sm:p-3 bg-neutral-800/70 rounded-full hover:bg-indigo-600 transition-transform z-30 transform hover:scale-110 active:scale-95 border border-white/10 shadow-lg"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="pointer-events-auto -mr-2 sm:mr-2 p-2 sm:p-3 bg-neutral-800/70 rounded-full hover:bg-indigo-600 transition-transform z-30 transform hover:scale-110 active:scale-95 border border-white/10 shadow-lg"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="absolute top-4 right-4 bg-neutral-800/60 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-indigo-600 transition-transform z-50 transform hover:scale-110 active:scale-95 border border-white/10"
                  title="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <TemplateDetails website={currentWebsite} onBuyNow={handleBuyNow} />

          <div className="mt-12 sm:mt-16 lg:mt-20 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-300">
                  Browse Templates
                </h3>
                <div className="text-sm text-gray-400">
                  AI curated — create or customize
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
                <div className="flex gap-4 p-2 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                  {websites.map((w, idx) => (
                    <TemplateThumbnail
                      key={w.id}
                      website={w}
                      onClick={() => setCurrentIndex(idx)}
                      isActive={currentIndex === idx}
                      isFavorite={favorites.has(w.id)}
                      onToggleFav={toggleFav}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-slate-900/70 backdrop-blur-sm text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="sm:col-span-2 lg:col-span-2">
                <h4 className="text-xl sm:text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                  AI Website Builder
                </h4>
                <p className="text-slate-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                  Create stunning websites with AI assistance. Choose from
                  templates or build from scratch.
                </p>
                <div className="flex gap-3">
                  <a href="#" className="p-2 sm:p-3 bg-neutral-800 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Instagram">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-2 sm:p-3 bg-neutral-800 rounded-full hover:bg-indigo-600 transition-colors" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-2 sm:p-3 bg-neutral-800 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Github">
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div>
                <h5 className="text-base sm:text-lg font-semibold mb-3">
                  Categories
                </h5>
                <ul className="space-y-2 text-slate-400 text-sm sm:text-base">
                  {CATEGORY_OPTIONS.slice(0, 6).map((c) => (
                    <li key={c}>
                      <a href="#" className="hover:text-white transition-colors">
                        {c}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-base sm:text-lg font-semibold mb-3">
                  Support
                </h5>
                <ul className="space-y-2 text-slate-400 text-sm sm:text-base">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-8 sm:mt-12 pt-6 text-center text-slate-400 text-sm sm:text-base">
              <p>
                &copy; {new Date().getFullYear()} AI Website Builder. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>

        {isFullScreen && sandpackFiles && (
          // ⭐️ START MODIFICATION: Pass image path to FullScreenPreview ⭐️
          <FullScreenPreview
            files={sandpackFiles}
            onClose={() => setIsFullScreen(false)}
            backgroundImageUrl={currentWebsite?.imagePath}
          />
          // ⭐️ END MODIFICATION ⭐️
        )}

        <style>{`.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
      </div>
    </>
  );
}