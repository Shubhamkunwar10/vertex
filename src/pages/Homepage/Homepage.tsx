// src/App.js

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  Code2,
  Palette,
  CloudCog,
  Quote,
} from "lucide-react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { MOCK_WEBSITES } from "./MockWebsite";

// SANDPACK IMPORTS
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useSandpack,
  defaultDark as sandpackDark,
} from "@codesandbox/sandpack-react";

// 3D IMPORTS
import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot } from "@react-three/drei";

//================================================================
// TYPE DEFINITIONS (Unchanged)
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
// ✨ UPDATED: Meteor Shower Effect ✨
// Now generates meteors with random sizes for a more natural look.
//================================================================
const MeteorShower = () => {
    const meteors = useMemo(() => 
        Array.from({ length: 35 }).map((_, i) => (
            <div
                key={i}
                className="meteor"
                style={{
                    top: `${-10 + Math.random() * 100}%`,
                    left: `${-10 + Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${2 + Math.random() * 4}s`,
                    transform: `scale(${0.4 +0.5 * 0.8})` // Random size
                }}
            />
        ))
    , []);

    return (
        <motion.div 
            className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            {meteors}
        </motion.div>
    );
};

//================================================================
// Preloader Component (Unchanged)
//================================================================
const Preloader: React.FC<{ progress: number }> = ({ progress }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0D1117]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <div className="relative font-mono text-8xl md:text-9xl font-bold text-white">
                <span className="animate-glitch" style={{ '--glitch-text': `"${progress}%"` } as React.CSSProperties}>
                    {progress}%
                </span>
            </div>
        </motion.div>
    );
};

//================================================================
// Hero Section with 3D Scrolling Animation (Unchanged)
//================================================================

// 3D Shape Component
// 3D Shape Component (Updated with Responsive Scaling)
function Shape({ scrollProgress }: { scrollProgress: any }) {
  const meshRef = useRef<any>(null);

  // 1. State to hold the scale value
  const [scale, setScale] = useState(1.1);

  // 2. useEffect to handle window resizing
  useEffect(() => {
    // Function to check window size and set scale
    const handleResize = () => {
      if (window.innerWidth < 768) { // Breakpoint for "small screen" (e.g., tablets and phones)
        setScale(1.1);
      } else {
        setScale(1.6);
      }
    };

    // Set the initial scale
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup: remove event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array means this runs only once on mount

  useFrame((state, delta) => {
    if (meshRef.current) {
      const scrollValue = scrollProgress.get();
      meshRef.current.rotation.y = scrollValue * Math.PI * 2;
      meshRef.current.rotation.x = scrollValue * Math.PI * 1.5;
      meshRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    // 3. Use the dynamic scale state here

    <mesh ref={meshRef} scale={scale} > 
      <TorusKnot args={[1, 0.3, 200, 24]} >
        <meshStandardMaterial color="#a855f7" wireframe={true} />
      </TorusKnot>
    </mesh>
  );
}

// Main Hero Component
const HeroWith3DAnimation = ({ onViewProductClick, onBookCallClick }: {onViewProductClick: () => void; onBookCallClick: () => void;}) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  return (
    <div ref={heroRef} className="relative h-screen">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Shape scrollProgress={scrollYProgress} />
        </Canvas>
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Next-Gen Software Solutions
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
            Explore our collection of interactive web templates or collaborate with us to build a bespoke digital experience from the ground up.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={onViewProductClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />
              View Products
            </motion.button>
            <motion.button
              onClick={onBookCallClick}
              className="w-full sm:w-auto bg-white/5 border border-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              whileTap={{ scale: 0.95 }}
            >
              Book a Call
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


//================================================================
// UI & HELPER COMPONENTS (Unchanged)
//================================================================
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
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-4xl font-bold text-white">₹{website.price.toLocaleString("en-IN")}</span>
                {website.originalPrice > website.price && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{website.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {website.originalPrice > website.price && (
                <div className=" flex justify-center items-center gap-1 bg-red-500/10 text-red-400 text-xs font-medium px-8 py-1 rounded-full border border-red-500/20 mx-24 md:mx-32 lg:mx-8">
                  <span >Save ₹{(website.originalPrice - website.price).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={onBuyNow}
                className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                Contact Now 
                <img src="/whatsapp.png" alt="WhatsApp Icon" className="w-8 h-8" />
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
// Project-Related Sections & Components (Unchanged)
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
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
// MAIN APP COMPONENT (Unchanged logic, updated CSS and Z-index)
//================================================================
const WHATSAPP_NUMBER = "9310739038";

export default function App() {
  const [websites] = useState<any[]>(() => MOCK_WEBSITES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [showMeteors, setShowMeteors] = useState(true);

  const productSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => setLoading(false), 50);
                return 100;
            }
            return prev + 4;
        });
    }, 10); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < window.innerHeight / 2) {
        setShowMeteors(true);
      } else {
        setShowMeteors(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


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

  const handleBookCall = () => {
      const message = `Hello Vertex Nexus! I'd like to book a call to discuss your services.`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
  };

  const handleViewProduct = () => {
    productSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const GlassButton = ({ onClick, children, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={`pointer-events-auto p-3 bg-gray-500/50 rounded-full hover:bg-white/10 transition-all z-30 transform hover:scale-110 active:scale-95 border border-white/10 shadow-lg backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <>
      <style>{`
        /* --- ✨ UPDATED: Meteor Animation CSS for "Dim Universe" Feel ✨ --- */
        .meteor {
            position: absolute;
            opacity: 0;
            animation: meteor-fall linear infinite;
        }

        /* The glowing head of the meteor */
        .meteor::after {
            content: '';
            display: block;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background-color: #fff;
            box-shadow: 
                0 0 5px 2px rgba(255, 255, 255, 0.2), 
                0 0 10px 5px rgba(255, 255, 255, 0.1),
                0 0 15px 7px rgba(168, 85, 247, 0.05); /* subtle purple glow */
        }
        
        /* The tail of the meteor */
        .meteor::before {
            content: '';
            position: absolute;
            top: 50%;
            transform: translateY(-50%) rotate(-45deg);
            right: 3px; /* Start just behind the head */
            width: 250px; /* Tail length */
            height: 1px;
            background: linear-gradient(to left, rgba(255, 255, 255, 0.15), transparent);
        }
        
        @keyframes meteor-fall {
            0% {
                transform: translate(0, 0);
                opacity: 1;
            }
            70% {
                opacity: 1;
            }
            100% {
                transform: translate(-500px, 500px);
                opacity: 0;
            }
        }
        
        /* --- Preloader Glitch Animation (Unchanged) --- */
        .animate-glitch {
            position: relative;
            color: #fff;
            text-shadow: 0 0 1px #fff, 0 0 5px #fff, 0 0 10px #6366f1, 0 0 20px #6366f1;
        }
        .animate-glitch::before,
        .animate-glitch::after {
            content: var(--glitch-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0D1117;
            overflow: hidden;
            clip: rect(0, 900px, 0, 0);
        }
        .animate-glitch::before {
            left: 2px;
            text-shadow: -1px 0 #ec4899;
            animation: glitch-anim-1 2s infinite linear alternate-reverse;
        }
        .animate-glitch::after {
            left: -2px;
            text-shadow: -1px 0 #0ea5e9;
            animation: glitch-anim-2 2s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim-1 {
            0% { clip: rect(42px, 9999px, 44px, 0); } 5% { clip: rect(12px, 9999px, 69px, 0); } 10% { clip: rect(62px, 9999px, 83px, 0); } 15% { clip: rect(31px, 9999px, 57px, 0); } 20% { clip: rect(25px, 9999px, 86px, 0); } 25% { clip: rect(48px, 9999px, 73px, 0); } 30% { clip: rect(80px, 9999px, 49px, 0); } 35% { clip: rect(49px, 9999px, 79px, 0); } 40% { clip: rect(35px, 9999px, 82px, 0); } 45% { clip: rect(87px, 9999px, 43px, 0); } 50% { clip: rect(21px, 9999px, 73px, 0); } 55% { clip: rect(79px, 9999px, 50px, 0); } 60% { clip: rect(20px, 9999px, 60px, 0); } 65% { clip: rect(93px, 9999px, 43px, 0); } 70% { clip: rect(15px, 9999px, 73px, 0); } 75% { clip: rect(63px, 9999px, 33px, 0); } 80% { clip: rect(23px, 9999px, 89px, 0); } 85% { clip: rect(98px, 9999px, 49px, 0); } 90% { clip: rect(10px, 9999px, 94px, 0); } 95% { clip: rect(5px, 9999px, 59px, 0); } 100% { clip: rect(42px, 9999px, 98px, 0); }
        }
        @keyframes glitch-anim-2 {
            0% { clip: rect(85px, 9999px, 100px, 0); } 5% { clip: rect(29px, 9999px, 92px, 0); } 10% { clip: rect(78px, 9999px, 15px, 0); } 15% { clip: rect(53px, 9999px, 86px, 0); } 20% { clip: rect(23px, 9999px, 73px, 0); } 25% { clip: rect(10px, 9999px, 64px, 0); } 30% { clip: rect(89px, 9999px, 43px, 0); } 35% { clip: rect(71px, 9999px, 98px, 0); } 40% { clip: rect(29px, 9999px, 80px, 0); } 45% { clip: rect(41px, 9999px, 53px, 0); } 50% { clip: rect(93px, 9999px, 29px, 0); } 55% { clip: rect(13px, 9999px, 83px, 0); } 60% { clip: rect(73px, 9999px, 29px, 0); } 65% { clip: rect(6px, 9999px, 54px, 0); } 70% { clip: rect(89px, 9999px, 38px, 0); } 75% { clip: rect(45px, 9999px, 95px, 0); } 80% { clip: rect(12px, 9999px, 69px, 0); } 85% { clip: rect(58px, 9999px, 21px, 0); } 90% { clip: rect(74px, 9999px, 49px, 0); } 95% { clip: rect(8px, 9999px, 73px, 0); } 100% { clip: rect(20px, 9999px, 82px, 0); }
        }
      `}</style>

      <div className="min-h-screen w-full font-sans text-white selection:bg-indigo-500 selection:text-white relative flex flex-col bg-[#0D1117]">
        <AnimatePresence>
            {loading && <Preloader progress={progress} />}
        </AnimatePresence>

        <AnimatePresence>
            {showMeteors && <MeteorShower />}
        </AnimatePresence>

        {/* Static background pattern - z-index is lowered to ensure meteors are on top */}
 <div className="absolute inset-0 -z-20 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:2px_2px] sm:[background-size:6px_6px]"></div>
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
          <HeroWith3DAnimation
            onViewProductClick={handleViewProduct}
            onBookCallClick={handleBookCall}
          />
          <div ref={productSectionRef} className="pt-16 bg-[#0D1117]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative w-full">
                  <ResponsiveFrame
                    files={sandpackFiles}
                    backgroundImageUrl={currentWebsite?.imagePath}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex items-center justify-between pointer-events-none px-2 sm:px-4">
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
          </div>
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