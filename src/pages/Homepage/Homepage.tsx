import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  X,
  Heart,
  ShoppingCart,
  Check,
  Sparkle,
  Cpu,
  Instagram,
  Linkedin,
  Github,
  Plus,
  Save,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_WEBSITES } from "./MockWebsite";

//================================================================
// TYPE DEFINITIONS & MOCK DATA
//================================================================

interface Website {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  tags: string[];
  html: string;
}

const simpleHtmlTemplate = (title: string, themeColor: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f9; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; }
        .container { max-width: 600px; padding: 2rem; }
        h1 { font-size: 3rem; color: ${themeColor}; }
        p { font-size: 1.2rem; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <p>A beautifully generated AI website template.</p>
    </div>
</body>
</html>
`;



//================================================================
// CUSTOM HOOK
//================================================================

interface UseTypewriterTextareaProps {
  initialValue: string;
  ref: React.RefObject<HTMLTextAreaElement | null>;
}

const useTypewriterTextarea = ({ initialValue, ref }: UseTypewriterTextareaProps) => {
  const [value, setValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsTyping(true);
    setValue("");
    let i = 0;

    intervalRef.current = setInterval(() => {
      if (i < initialValue.length) {
        setValue((prev) => prev + initialValue.charAt(i));
        i++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, 20);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initialValue]);

  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, ref]);

  const stopTyping = () => {
    if (isTyping) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTyping(false);
      setValue(initialValue);
    }
  };

  const handleFocus = () => stopTyping();
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    stopTyping();
    setValue(e.target.value);
  };

  const isModified = value !== initialValue && !isTyping;

  return { value, isModified, handleFocus, handleChange };
};

//================================================================
// COMPONENTS
//================================================================

const IframeLoader: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-10 rounded-2xl">
    <div className="text-gray-300 flex items-center gap-3">
      <svg
        className="animate-spin h-6 w-6 text-indigo-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm">Loading Preview...</span>
    </div>
  </div>
);

interface ResponsiveFrameProps {
  htmlContent: string;
}

const ResponsiveFrame: React.FC<ResponsiveFrameProps> = ({ htmlContent }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [htmlContent]);

  return (
    <div className="relative w-full h-full">
      {/* Mobile */}
      <div
        className="block sm:hidden relative w-full mx-auto bg-black rounded-3xl shadow-2xl p-2"
        style={{ aspectRatio: "9/19.5" }}
      >
        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-black">
          {isLoading && <IframeLoader />}
          <iframe
            srcDoc={htmlContent}
            title="Website Preview"
            className="w-full h-full border-0 rounded-2xl"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setIsLoading(false)}
            style={{
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.45s ease",
            }}
          />
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full" />
      </div>

      {/* Desktop */}
      <div className="hidden sm:block relative w-full h-full bg-gradient-to-br from-white/3 to-black/10 backdrop-blur-sm rounded-3xl shadow-2xl p-3 border border-white/6">
        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-white/5">
          {isLoading && <IframeLoader />}
          <iframe
            srcDoc={htmlContent}
            title="Website Preview"
            className="w-full h-full border-0 rounded-2xl"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setIsLoading(false)}
            style={{
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.45s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

interface TemplateDetailsProps {
  website: Website;
  onBuyNow: () => void;
  onSaveDescription: (description: string) => void;
  onEdit: () => void;
}

const TemplateDetails: React.FC<TemplateDetailsProps> = ({ website, onBuyNow, onSaveDescription, onEdit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmptyTemplate = website.id === "new";

  const {
    value: description,
    isModified,
    handleFocus,
    handleChange,
  } = useTypewriterTextarea({
    initialValue: website.description,
    ref: textareaRef,
  });

  const handleSave = () => {
    onSaveDescription(description);
    textareaRef.current?.blur();
  };

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 lg:-mt-16">
      <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {!isEmptyTemplate && (
                    <span className="text-xs sm:text-sm font-bold uppercase text-indigo-400 tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      {website.category}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-xs bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
                    AI-Powered
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  {website.title || (
                    <span className="text-gray-400 italic">
                      Click "Edit Details" to add your title
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <div className="mb-6">
              {isEmptyTemplate ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm sm:text-base italic">
                    Click "Edit Details" to add a description to explain what
                    makes your website special...
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    ref={textareaRef}
                    value={description}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    rows={1}
                    disabled={true}
                    className="text-gray-200 text-sm sm:text-base leading-relaxed w-full bg-white/5 border border-white/10 outline-none resize-none overflow-hidden p-4 rounded-xl transition-all duration-200 focus:border-indigo-500/50 focus:bg-white/10"
                    placeholder="Enter a compelling description for your website..."
                  />

                  <AnimatePresence>
                    {isModified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginTop: "12px",
                        }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "16px",
                        }}
                      >
                 
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
            {!isEmptyTemplate && website.tags && website.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
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
                {isEmptyTemplate ? (
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <Sparkle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">
                        Create for Free
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-3">
                      Start building your custom website from scratch
                    </p>
                  </div>
                ) : (
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
                )}
              </div>
              <div className="space-y-3">
                {!isEmptyTemplate ? (
                  <button
                    onClick={onBuyNow}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now
                  </button>
                ) : (
                  <button
                    onClick={onEdit}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-5 h-5" />
                    Start Creating
                  </button>
                )}
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

interface FullScreenPreviewProps {
  htmlContent: string;
  onClose: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ htmlContent, onClose }) => (
  <div className="fixed inset-0 z-[9999] bg-black">
    <iframe
      srcDoc={htmlContent}
      title="Fullscreen Website Preview"
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
    />
    <button
      onClick={onClose}
      className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-full hover:bg-white hover:text-black transition-all transform hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20"
      title="Exit Fullscreen"
    >
      <X className="w-6 h-6" />
    </button>
  </div>
);

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

interface EditorModalProps {
  open: boolean;
  initialData?: Partial<Website>;
  onSave: (data: {
    title: string;
    description: string;
    category: string;
    tags: string[];
  }) => void;
  onClose: () => void;
}

function EditorModal({ open, initialData = {}, onSave, onClose }: EditorModalProps) {
  const [title, setTitle] = useState<string>(initialData.title || "");
  const [description, setDescription] = useState<string>(initialData.description || "");
  const [category, setCategory] = useState<string>(initialData.category || CATEGORY_OPTIONS[0]);
  const [tags, setTags] = useState<string[]>(initialData.tags ? [...initialData.tags] : []);
  const [tagInput, setTagInput] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || CATEGORY_OPTIONS[0]);
      setTags(initialData.tags ? [...initialData.tags] : []);
      setSaved(false);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 450));
    onSave({
      title: title.trim() || "My New Website",
      description:
        description.trim() || "A beautiful website created with AI assistance.",
      category,
      tags,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, title, description, category, tags, handleSave, onClose]);


  const addTag = useCallback(() => {
    const val = tagInput.trim();
    if (!val) return;
    if (!tags.includes(val)) setTags((t) => [...t, val]);
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((t) => t.filter((x) => x !== tag));
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.995 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed z-[10001] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] sm:w-[720px] max-w-[92vw]"
          >
            <div className="rounded-2xl p-1 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-cyan-500/20">
              <div className="rounded-2xl bg-gray-900/95 border border-white/6 p-5 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">
                        Website Details
                      </h3>
                      <p className="text-sm text-gray-400">
                        Customize your website's information
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">
                      Website Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your website title"
                      className="w-full rounded-xl bg-white/5 border border-white/6 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your website in a few sentences"
                      rows={3}
                      className="w-full rounded-xl bg-white/5 border border-white/6 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/6 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c} className="bg-gray-800">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        Add Tags
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder="Add tag and press Enter"
                          className="flex-1 rounded-xl bg-white/5 border border-white/6 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                        <button
                          onClick={addTag}
                          className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <motion.div
                            key={tag}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/6"
                          >
                            <span className="text-sm text-gray-200">{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-white/6">
                    <div className="text-xs text-gray-400">
                      Press{" "}
                      <kbd className="px-2 py-0.5 rounded bg-white/10 text-gray-300">
                        Ctrl/⌘+S
                      </kbd>{" "}
                      to save
                    </div>

                    <motion.button
                      onClick={handleSave}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold transition-all"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

//================================================================
// MAIN APP COMPONENT
//================================================================

export default function App() {
  const [websites, setWebsites] = useState<Website[]>(() => [...MOCK_WEBSITES]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [editorOpen, setEditorOpen] = useState<boolean>(false);

  const total = websites.length;
  const current = websites[currentIndex];

  const goPrev = useCallback(
    () => setCurrentIndex((p) => (p - 1 + total) % total),
    [total]
  );
  const goNext = useCallback(
    () => setCurrentIndex((p) => (p + 1) % total),
    [total]
  );

  const toggleFav = useCallback((e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullScreen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  const openEditor = () => setEditorOpen(true);
  const closeEditor = () => setEditorOpen(false);

  const handleSaveDescription = (newDescription: string) => {
    setWebsites((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...copy[currentIndex],
        description: newDescription,
      };
      return copy;
    });
  };

  const handleSave = ({ title, description, category, tags }: { title: string; description: string; category: string; tags: string[] }) => {
    setWebsites((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...copy[currentIndex],
        title: title ?? copy[currentIndex].title,
        description: description ?? copy[currentIndex].description,
        category: category ?? copy[currentIndex].category,
        tags: tags ?? copy[currentIndex].tags,
      };
      return copy;
    });
  };

  const buyNow = () => {
    if (current.id === "new") {
      openEditor();
    } else {
      alert(
        `Proceeding to buy: ${current.title} — ₹${current.price.toLocaleString(
          "en-IN"
        )}`
      );
    }
  };

  interface AiNode {
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
  }
  
  const AiNodes = useMemo((): AiNode[] => {
    return Array.from({ length: 18 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 10,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 10,
    }));
  }, []);

  return (
    <>
      <div className="min-h-screen w-full bg-gray-900 font-sans text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-neutral-900 to-black/90" />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g1)" />
          </svg>

          {AiNodes.map((n, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 blur-[6px] opacity-60"
              style={{
                width: n.size,
                height: n.size,
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                opacity: [0.2, 0.9, 0.2],
                y: [`${n.y}%`, `${n.y + (Math.random() * 6 - 3)}%`, `${n.y}%`],
              }}
              transition={{
                repeat: Infinity,
                duration: n.duration,
                delay: n.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <header className="relative z-30 sticky top-0 bg-gray-900/50 backdrop-blur-xl border-b border-white/6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Vertex Nexus
              </h1>
              <span className="text-xs px-2 py-1 rounded-md bg-gradient-to-r from-indigo-600 to-cyan-400 text-white font-semibold">
                Custom 3d websites
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-sm bg-neutral-900/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/6">
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
                style={{ height: "clamp(620px, 64vh, 720px)" }}
              >
                <div className="w-full h-full transition-all duration-400 ease-in-out rounded-3xl overflow-hidden">
                  <ResponsiveFrame htmlContent={current.html} />
                </div>
                <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={goPrev}
                    className="pointer-events-auto ml-2 p-2 sm:p-3 bg-neutral-800/70 rounded-full hover:bg-indigo-600 transition-transform z-30 transform hover:scale-110 active:scale-95 border border-white/6 shadow-lg"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="pointer-events-auto mr-2 p-2 sm:p-3 bg-neutral-800/70 rounded-full hover:bg-indigo-600 transition-transform z-30 transform hover:scale-110 active:scale-95 border border-white/6 shadow-lg"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="absolute top-3 right-3 bg-neutral-800/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-indigo-600 transition-transform z-50 transform hover:scale-110 active:scale-95 border border-white/8"
                  title="Fullscreen"
                >
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <TemplateDetails
            website={current}
            onBuyNow={buyNow}
            onSaveDescription={handleSaveDescription}
            onEdit={openEditor}
          />

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

                <div className="flex justify-between p-2 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
                  {websites.map((w, idx) => (
                    <div
                      key={w.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex-shrink-0 p-4 my-4 w-48 sm:w-56 lg:w-60 p-3 rounded-2xl cursor-pointer transition-all duration-300 snap-center border-2 bg-neutral-800/40 backdrop-blur-sm transform hover:scale-105 active:scale-95
                      ${
                        currentIndex === idx
                          ? "border-indigo-500 bg-neutral-800/70"
                          : "border-transparent hover:border-white/6"
                      }`}
                    >
                      <div className="h-28 bg-gray-700/50 rounded-lg mb-3 overflow-hidden pointer-events-none relative ring-1 ring-white/6">
                        {w.id === "new" ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600/20 to-cyan-600/20">
                            <Plus className="w-8 h-8 text-emerald-400" />
                          </div>
                        ) : (
                          <iframe
                            srcDoc={w.html}
                            title={`${w.title} thumb`}
                            className="w-[400%] h-[400%] border-0 scale-[0.25] origin-top-left"
                            sandbox=""
                            scrolling="no"
                          />
                        )}
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate">
                            {w.title || "Untitled"}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {w.id === "new"
                              ? "Free"
                              : `₹${w.price.toLocaleString("en-IN")}`}
                          </p>
                        </div>
                        {w.id !== "new" && (
                          <button
                            onClick={(e) => toggleFav(e, w.id)}
                            className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favorites.has(w.id)
                                  ? "text-red-500 fill-current"
                                  : "text-gray-400"
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-slate-900/70 backdrop-blur-sm text-white border-t border-white/6">
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
                  <a
                    href="#"
                    className="p-2 sm:p-3 bg-neutral-800 rounded-full hover:bg-indigo-600 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="p-2 sm:p-3 bg-neutral-800 rounded-full hover:bg-indigo-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="p-2 sm:p-3 bg-neutral-800 rounded-full hover:bg-indigo-600 transition-colors"
                    aria-label="Github"
                  >
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
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
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
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
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

        {isFullScreen && (
          <FullScreenPreview
            htmlContent={current.html}
            onClose={() => setIsFullScreen(false)}
          />
        )}
        
        <EditorModal
          open={editorOpen}
          initialData={current}
          onSave={handleSave}
          onClose={closeEditor}
        />
        
        <style>{`
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </>
  );
}