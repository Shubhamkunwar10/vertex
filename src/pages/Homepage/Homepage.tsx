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
  Code2,      // ✨ NEW ICON
  Palette,    // ✨ NEW ICON
  CloudCog,   // ✨ NEW ICON
  Quote,      // ✨ NEW ICON
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
// CUSTOM HOOK: For fetching multiple files for Sandpack (Unchanged)
//================================================================
const useSandpackFiles = (website: Website | null) => {
  const [sandpackFiles, setSandpackFiles] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!website || !website.files) {
      setSandpackFiles({
        "/index.html": {
          code: `<html><body style="background-color: #0D1117; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-family: sans-serif;"><h1>Select a template or start creating!</h1></body></html>`,
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
            code: `<html lang="en"><body style="background-color: #0D1117; color: #f87171; text-align: center; padding: 2rem;"><h2>Error Loading Preview</h2><p>${err.message}</p></body></html>`,
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
// ✨ UI & HELPER COMPONENTS (Unchanged) ✨
//================================================================
const MotionBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#0D1117]">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-indigo-600/20 blur-3xl filter"
        animate={{ x: [0, 100, 0, -50, 0], y: [0, -50, 100, 50, 0], scale: [1, 1.1, 0.9, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-sky-600/20 blur-3xl filter"
        animate={{ x: [0, -100, 0, 50, 0], y: [0, 50, -100, -50, 0], scale: [1, 0.9, 1.2, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 5 }}
      />
    </div>
  );
  
  const AnimatedLoader: React.FC<{ backgroundImageUrl?: string }> = ({ backgroundImageUrl }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-lg z-10 rounded-2xl overflow-hidden">
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-md scale-110 opacity-20"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}
      <div className="relative flex flex-col items-center justify-center">
        <motion.div
          className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-sm font-medium text-gray-300 tracking-wide">
          Loading Interactive Preview...
        </p>
      </div>
    </div>
  );
  
  const PreviewWithLoader: React.FC<{ style: React.CSSProperties; backgroundImageUrl?: string; }> = ({ style, backgroundImageUrl }) => {
    const { sandpack } = useSandpack();
    const { status } = sandpack;
    const [isReady, setIsReady] = useState(false);
  
    useEffect(() => {
      const fallbackTimer = setTimeout(() => setIsReady(true), 500);
      if (status === "idle") {
        clearTimeout(fallbackTimer);
        const readyTimer = setTimeout(() => setIsReady(true), 10);
        return () => clearTimeout(readyTimer);
      } else {
        setIsReady(false);
      }
      return () => clearTimeout(fallbackTimer);
    }, [status]);
  
    return (
      <div className="relative w-full h-full">
        <AnimatePresence>
          {!isReady && <AnimatedLoader backgroundImageUrl={backgroundImageUrl} />}
        </AnimatePresence>
        <SandpackPreview
          showOpenInCodeSandbox={false}
          style={{ ...style, visibility: isReady ? "visible" : "hidden", opacity: isReady ? 1 : 0, transition: "opacity 0.5s ease-in-out, visibility 0.5s" }}
        />
      </div>
    );
  };
  
  const ResponsiveFrame: React.FC<{ files: any | null; backgroundImageUrl?: string; }> = ({ files, backgroundImageUrl }) => {
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
      <SandpackProvider key={Object.keys(files).join("-")} files={files} theme={customTheme} template="static">
        <div className="relative w-full h-full">
          <div className="block relative w-full h-[65vh] bg-black/50 backdrop-blur-sm rounded-3xl shadow-2xl p-2 border border-white/10 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-sky-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/50">
              <SandpackLayout className="!rounded-2xl">
                <PreviewWithLoader style={{ height: "65vh" }} backgroundImageUrl={backgroundImageUrl}/>
              </SandpackLayout>
            </div>
          </div>
        </div>
      </SandpackProvider>
    );
  };
  
  const FullScreenPreview: React.FC<{ files: any | null; onClose: () => void; backgroundImageUrl?: string; }> = ({ files, onClose, backgroundImageUrl }) => {
    if (!files) return null;
  
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <SandpackProvider files={files} template="static" theme={sandpackDark}>
          <PreviewWithLoader style={{ height: "100vh" }} backgroundImageUrl={backgroundImageUrl} />
        </SandpackProvider>
        <button
          onClick={onClose}
          className="absolute bottom-5 left-5 bg-black/50 text-white p-3 rounded-full hover:bg-white hover:text-black transition-all transform hover:scale-110 active:scale-95 backdrop-blur-md border border-white/20"
          title="Exit Fullscreen"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    );
  };
  
  const TemplateThumbnail: React.FC<{ website: Website; onClick: () => void; isActive: boolean; isFavorite: boolean; onToggleFav: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void; }> = ({ website, onClick, isActive, isFavorite, onToggleFav }) => {
    const isNewCard = website.id === "new";
  
    return (
      <div
        onClick={onClick}
        className={`relative flex-shrink-0 w-56 p-2 rounded-2xl cursor-pointer transition-all duration-300 snap-center group
          ${isActive ? "bg-white/10" : "bg-white/5 hover:bg-white/10"}`}
      >
        <div
          className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 
            ${isActive ? "border-indigo-500" : "border-transparent group-hover:border-white/20"}`}
        />
        <div className="relative p-2 rounded-xl bg-black/20 transform transition-transform duration-300 group-hover:-translate-y-1">
          <div className="aspect-video bg-gray-800 rounded-lg mb-3 overflow-hidden pointer-events-none relative ring-1 ring-white/10">
            {isNewCard ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600/30 to-sky-600/30">
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
              <h4 className="font-semibold text-white text-sm truncate">{website.title}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {isNewCard ? "Start from Scratch" : `₹${website.price.toLocaleString("en-IN")}`}
              </p>
            </div>
            {!isNewCard && (
              <button
                onClick={(e) => onToggleFav(e, website.id)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 transition-all ${isFavorite ? "text-red-500 fill-current" : "text-gray-400 group-hover:text-white"}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const TemplateDetails: React.FC<{ website: Website; onBuyNow: () => void; }> = ({ website, onBuyNow }) => {
    return (
      <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-12">
        <div className="bg-gray-950/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-8 p-8">
              <div className="flex items-center gap-3 mb-3 mt-4">
                <span className="text-sm font-bold uppercase text-indigo-300 tracking-wider bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                  {website.category}
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                {website.title || <span className="text-gray-500 italic">Select a template</span>}
              </h2>
              {website.tags && website.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {website.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-white/5 text-sky-300 px-3 py-1.5 rounded-full border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-4 bg-white/5 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between p-8">
              <div>
                <div className="flex items-baseline justify-start gap-3 mb-2">
                  <span className="text-4xl font-bold text-white">₹{website.price.toLocaleString("en-IN")}</span>
                  {website.originalPrice > website.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{website.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {website.originalPrice > website.price && (
                  <div className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-xs font-medium px-2 py-1 rounded-full border border-red-500/20">
                    <span>Save ₹{(website.originalPrice - website.price).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <button
                  onClick={onBuyNow}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </button>
                <div className="text-center text-xs text-gray-400">✓ Instant Delivery & Full Source Code</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
//================================================================
// ✨ NEW: Project-Related Sections & Components ✨
//================================================================

const SectionWrapper: React.FC<{title: string; subtitle: string; children: React.ReactNode;}> = ({ title, subtitle, children }) => (
    <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-base font-semibold text-indigo-400 tracking-wider uppercase">{subtitle}</h2>
            <p className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">{title}</p>
            <div className="mt-12">
                {children}
            </div>
        </div>
    </div>
);

const OurServices = () => {
    const services = [
        { icon: Code2, title: 'Web Development', description: 'Crafting responsive, high-performance websites and web applications tailored to your business needs.' },
        { icon: Palette, title: 'UI/UX Design', description: 'Creating intuitive and beautiful user interfaces that provide an exceptional user experience.' },
        { icon: CloudCog, title: 'Cloud & DevOps', description: 'Automating workflows and deploying scalable solutions on the cloud for maximum efficiency.' }
    ];
    return (
        <SectionWrapper title="Our Core Services" subtitle="What We Offer">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg group hover:bg-white/10 transition-colors duration-300"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <div className="inline-block p-4 bg-indigo-500/10 rounded-xl mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                            <service.icon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                        <p className="text-gray-400 text-sm">{service.description}</p>
                    </motion.div>
                ))}
            </div>
        </SectionWrapper>
    );
};

const OurProcess = () => {
    const steps = [
        { number: '01', title: 'Discovery & Planning', description: "We start by understanding your vision, goals, and requirements to create a detailed project roadmap." },
        { number: '02', title: 'Design & Prototype', description: "Our team designs a stunning UI/UX prototype, ensuring it's both beautiful and user-friendly." },
        { number: '03', title: 'Development & Testing', description: "We build your solution using modern tech, followed by rigorous testing to ensure quality." },
        { number: '04', title: 'Deployment & Support', description: "We deploy your project and provide ongoing support to ensure it runs smoothly and scales effectively." }
    ];
    return (
        <SectionWrapper title="Our Streamlined Process" subtitle="How It Works">
            <div className="relative">
                {/* Connecting line */}
                <div className="hidden md:block absolute top-5 left-1/2 w-0.5 h-[calc(100%-2.5rem)] bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className={`relative text-center md:text-left ${index % 2 === 1 ? 'md:text-right' : ''}`}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            {/* Circle on the timeline */}
                            <div className="hidden md:flex absolute top-1 left-1/2 -ml-4 w-8 h-8 items-center justify-center bg-indigo-500 rounded-full ring-8 ring-[#0D1117]">
                                <span className="text-xs font-bold">{step.number}</span>
                            </div>

                            <div className={`inline-block p-6 bg-gray-900/50 border border-white/10 rounded-2xl ${index % 2 === 1 ? 'md:ml-auto' : 'md:mr-auto'} max-w-sm`}>
                                <h3 className="text-lg font-bold text-indigo-400 mb-2 md:hidden">Step {step.number}</h3>
                                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                                <p className="text-gray-400 text-sm">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
};

const Testimonials = () => {
    const testimonials = [
        { name: 'Aarav Sharma', company: 'CEO, Innovate Inc.', quote: 'Vertex Nexus delivered a product that exceeded our wildest expectations. Their professionalism and technical skill are second to none.' },
        { name: 'Priya Mehta', company: 'Founder, Creative Solutions', quote: 'Working with this team was a game-changer for our brand. The final website is not just beautiful but also incredibly fast and intuitive.' },
        { name: 'Rohan Desai', company: 'CTO, TechFront', quote: "The development process was seamless and transparent. They tackled complex challenges with ease and delivered on time." },
    ];
    return (
        <SectionWrapper title="What Our Clients Say" subtitle="Testimonials">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {testimonials.map((t, index) => (
                    <motion.div
                        key={index}
                        className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg flex flex-col items-start text-left"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <Quote className="w-8 h-8 text-indigo-500/50 mb-4 -ml-2" />
                        <p className="text-gray-300 mb-6 flex-grow">"{t.quote}"</p>
                        <div>
                            <p className="font-semibold text-white">{t.name}</p>
                            <p className="text-sm text-indigo-400">{t.company}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </SectionWrapper>
    );
};


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

  const goPrev = useCallback(() => setCurrentIndex((p) => (p - 1 + total) % total), [total]);
  const goNext = useCallback(() => setCurrentIndex((p) => (p + 1) % total), [total]);

  const toggleFav = useCallback((e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavs = new Set(prev);
      if (newFavs.has(id)) newFavs.delete(id);
      else newFavs.add(id);
      return newFavs;
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullScreen ? "hidden" : "auto";
  }, [isFullScreen]);

  const handleBuyNow = () => {
    if (currentWebsite.id !== "new") {
      const { title, price } = currentWebsite;
      const message = `Hello! I'm interested in purchasing the "${title}" template for ₹${price.toLocaleString("en-IN")}.`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const GlassButton = ({ onClick, children, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={`pointer-events-auto p-3 bg-gray-500 rounded-full hover:bg-white/10 transition-all z-30 transform hover:scale-110 active:scale-95 border border-white/10 shadow-lg backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="min-h-screen w-full font-sans text-white selection:bg-indigo-500 selection:text-white relative flex flex-col">
        <MotionBackground />

        {/* Header */}
        <header className="sticky top-0 z-40 bg-gray-950/50 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Vertex Nexus
            </h1>
            <div className="font-mono text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span>{currentIndex + 1}</span>
              <span className="text-gray-500 mx-1.5">/</span>
              <span>{total}</span>
            </div>
          </div>
        </header>

        <main className="relative z-20 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
            <div className="relative w-full">
              <ResponsiveFrame
                files={sandpackFiles}
                backgroundImageUrl={currentWebsite?.imagePath}
              />
              <div className="absolute top-64 inset-x-0 flex items-center justify-between pointer-events-none px-2 sm:px-4">
                <GlassButton onClick={goPrev} aria-label="Previous">
                  <ChevronLeft className="w-5 h-5" />
                </GlassButton>
                <GlassButton onClick={goNext} aria-label="Next">
                  <ChevronRight className="w-5 h-5" />
                </GlassButton>
              </div>
              <GlassButton
                onClick={() => setIsFullScreen(true)}
                className="absolute top-4 right-4 !p-2.5"
                title="Fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </GlassButton>
            </div>
          </div>

          <TemplateDetails website={currentWebsite} onBuyNow={handleBuyNow} />

          <div className="mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl font-bold text-gray-200 mb-4">
                Browse All Templates
              </h3>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0D1117] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0D1117] to-transparent z-10 pointer-events-none" />
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

          {/* ✨ RENDER NEW SECTIONS ✨ */}
          <OurServices />
          <OurProcess />
          <Testimonials />

        </main>
        
        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-sm text-white border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5">
                         <h4 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-400">
                             Vertex Nexus
                         </h4>
                         <p className="text-slate-400 mb-6 max-w-md text-sm">
                             Build your next-generation website with our AI-powered platform. Choose a stunning template or create something entirely new.
                         </p>
                         <div className="flex gap-3">
                             <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                             <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-600 transition-colors" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
                             <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Github"><Github className="w-5 h-5" /></a>
                         </div>
                    </div>
                    <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h5 className="font-semibold mb-4">Categories</h5>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                {["Business", "E-commerce", "Portfolio", "Landing Page", "SaaS"].map((c) => (
                                    <li key={c}><a href="#" className="hover:text-white transition-colors">{c}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-4">Company</h5>
                             <ul className="space-y-2 text-slate-400 text-sm">
                                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                             </ul>
                        </div>
                         <div>
                            <h5 className="font-semibold mb-4">Support</h5>
                             <ul className="space-y-2 text-slate-400 text-sm">
                                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                             </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-800 mt-12 pt-6 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Vertex Nexus. All rights reserved.</p>
                </div>
            </div>
        </footer>
      </div>

      {isFullScreen && sandpackFiles && (
        <FullScreenPreview
          files={sandpackFiles}
          onClose={() => setIsFullScreen(false)}
          backgroundImageUrl={currentWebsite?.imagePath}
        />
      )}
    </>
  );
}