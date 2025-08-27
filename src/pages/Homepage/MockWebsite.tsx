// src/mock-data.js

export const MOCK_WEBSITES = [
  {
    id: "corp-landing-v3",
    title: "Innovate Inc. Advanced Landing Page",
    category: "Business",
    price: 3000,
    originalPrice: 4500,
    tags: [
      "Landing Page",
      "Corporate",
      "Dark Mode",
      "Responsive",
      "CTA",
      "FAQ",
      "Testimonials",
      "Tailwind CSS",
    ],
    // UPDATED: from htmlPath to files object
    files: {
      "/index.html": "/templates/innovative.html",
    },
    imagePath: "/templates/innovative.png",
  },
  {
    id: "quantum-landing-v1",
    title: "Quantum Leap Digital - Propelling Your Business Forward",
    category: "Technology",
    price: 6000,
    originalPrice: 8000,
    tags: [
      "Landing Page",
      "Futuristic",
      "Dark Mode",
      "Lead Generation",
      "Tailwind CSS",
      "Testimonials",
      "Responsive",
      "CTA",
      "Animations",
    ],
    // UPDATED: from htmlPath to files object
    files: {
      "/index.html": "/templates/quantumleap.html",
    },
    imagePath: "/templates/quantumleap.png",
  },
  {
    id: "doctor-portfolio-3d",
    title: "Interactive 3D Medical Portfolio",
    category: "Healthcare",
    price: 12000,
    originalPrice: 16500,
    tags: [
      "3D Model Integration",
      "WebGL",
      "GSAP Animations",
      "Interactive UI",
      "Contact Us",
      "Single-Page App",
      "Patient Testimonials",
      "Three.js",
    ],
    // UPDATED: from htmlPath to files object
    files: {
      "/index.html": "/templates/DoctorPortfolio3D.html",
    },
    imagePath: "/templates/DoctorPortfolio3D.png",
  },
  // {
  //   id: "bespoke-ecommerce-3d-configurator",
  //   title: "Aura Bespoke - 3D Product Configurator",
  //   category: "E-commerce",
  //   price: 25000,
  //   originalPrice: 32000,
  //   tags: [
  //     "3D Product Configurator",
  //     "Real-time Customization",
  //     "Next.js",
  //     "User Info",
  //     "React 3 D",
  //   ],
  //   // UPDATED: from htmlPath to files object
  //   files: {
  //     "/index.html": "/templates/AuraBespoke.html",
  //   },
  //   imagePath: "/thumbnails/synergy-bi.webp",
  // },
  // {
  //   id: "saas-analytics-dashboard-v2",
  //   title: "Synergy BI - Collaborative Analytics Dashboard",
  //   category: "SaaS / Business",
  //   price: 40000,
  //   originalPrice: 50000,
  //   tags: [
  //     "SaaS Platform",
  //     "Real-time Dashboard",
  //     "D3.js Data Viz",
  //     "Collaborative Tools",
  //     "Secure Authentication (RBAC)",
  //     "AI-Generated Insights",
  //     "PDF Reporting",
  //     "WebSockets",
  //   ],
  //   // UPDATED: from htmlPath to files object
  //   files: {
  //     "/index.html": "/templates/SynergyBI.html",
  //   },
  //   imagePath: "/thumbnails/synergy-bi.webp",
  // },
];