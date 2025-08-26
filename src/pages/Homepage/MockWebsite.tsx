// Mock websites data (as provided, unchanged)
export const MOCK_WEBSITES = [
  {
    id: "luxury-hotel",
    title: "Luxury Hotel & Resort",
    category: "Hospitality",
    description:
      " An elegant and responsive template perfect for luxury hotels, resorts, and vacation rentals. Features a stunning hero section and an easy-to-navigate room showcase.",
    price: 3999,
    originalPrice: 5999,
    tags: ["Premium", "Responsive", "Booking"],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    .playfair { font-family: 'Playfair Display', serif; }
    .inter { font-family: 'Inter', sans-serif; }
    .hero-bg { background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200'); background-size: cover; background-position: center; }
  </style>
  <title>Serenity Resort</title>
</head>
<body class="inter text-gray-800">
  <nav class="absolute top-0 w-full z-50 bg-transparent">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="playfair text-2xl font-bold text-white">Serenity</div>
        <div class="hidden md:flex space-x-8 text-white">
          <a href="#" class="hover:text-amber-300 transition-colors">Rooms</a>
          <a href="#" class="hover:text-amber-300 transition-colors">Dining</a>
          <a href="#" class="hover:text-amber-300 transition-colors">Spa</a>
          <a href="#" class="hover:text-amber-300 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </nav>
  <section class="hero-bg h-screen flex items-center justify-center">
    <div class="text-center text-white px-4">
      <h1 class="playfair text-5xl md:text-7xl font-bold mb-6">Welcome to Paradise</h1>
      <p class="text-xl md:text-2xl mb-8 font-light">Experience luxury like never before</p>
      <button class="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105">
        Book Your Stay
      </button>
    </div>
  </section>
</body>
</html>`,
  },
  {
    id: "creative-agency",
    title: "Creative Digital Agency",
    category: "Agency",
    description:
      " A bold and modern dark-themed template for creative agencies, studios, and freelancers. Features gradient text and glassy UI elements to make your portfolio pop.",
    price: 4999,
    originalPrice: 7999,
    tags: ["Creative", "Portfolio", "Dark Theme"],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
    .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glass { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); }
  </style>
  <title>Pixel Studio</title>
</head>
<body class="bg-black text-white overflow-x-hidden">
  <nav class="fixed top-0 w-full z-50 glass border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="text-2xl font-bold gradient-text">Pixel</div>
        <div class="hidden md:flex space-x-8">
          <a href="#" class="hover:text-purple-400 transition-colors">Work</a>
          <a href="#" class="hover:text-purple-400 transition-colors">Services</a>
          <a href="#" class="hover:text-purple-400 transition-colors">About</a>
          <a href="#" class="hover:text-purple-400 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </nav>
  <section class="min-h-screen flex items-center justify-center relative">
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
    <div class="text-center z-10 px-4">
      <h1 class="text-6xl md:text-8xl font-bold mb-6">
        We Create<br>
        <span class="gradient-text">Digital Magic</span>
      </h1>
      <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
        Transforming ideas into extraordinary digital experiences that captivate and inspire
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105">
          View Our Work
        </button>
      </div>
    </div>
  </section>
</body>
</html>`,
  },
  {
    id: "restaurant",
    title: "Fine Dining Restaurant",
    category: "Restaurant",
    description:
      " A sophisticated template for fine dining restaurants and bistros. The warm and inviting design, combined with elegant typography, sets the perfect mood for showcasing culinary masterpieces.",
    price: 3499,
    originalPrice: 4999,
    tags: ["Food", "Elegant", "Reservation"],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    .cormorant { font-family: 'Cormorant Garamond', serif; }
    .lato { font-family: 'Lato', sans-serif; }
    .hero-overlay { background: linear-gradient(rgba(139, 69, 19, 0.7), rgba(139, 69, 19, 0.7)); }
  </style>
  <title>Bistro Elegance</title>
</head>
<body class="lato text-amber-900">
  <nav class="bg-amber-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="cormorant text-3xl font-bold text-amber-800">Bistro Elegance</div>
        <div class="hidden md:flex space-x-8 text-amber-800">
          <a href="#" class="hover:text-amber-600 transition-colors">Menu</a>
          <a href="#" class="hover:text-amber-600 transition-colors">Reservations</a>
        </div>
      </div>
    </div>
  </nav>
  <section class="relative h-screen">
    <div class="absolute inset-0 hero-overlay">
      <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200" alt="Restaurant Interior" class="w-full h-full object-cover mix-blend-multiply">
    </div>
    <div class="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
      <div>
        <h1 class="cormorant text-6xl md:text-8xl font-bold mb-6">Exquisite Dining</h1>
        <p class="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto">
          Where culinary artistry meets timeless elegance in every dish we serve
        </p>
        <button class="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-full font-medium text-lg transition-all transform hover:scale-105">
          Make Reservation
        </button>
      </div>
    </div>
  </section>
</body>
</html>`,
  },
];

// Add this new constant
export const DEFAULT_WEBSITE = {
  id: "new",
  title: "",
  description: "",
  category: "Business",
  price: 0,
  originalPrice: 0,
  tags: [],
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .placeholder {
            text-align: center;
            padding: 60px 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 600px;
        }
        .placeholder h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            opacity: 0.3;
        }
        .placeholder p {
            font-size: 1.2rem;
            opacity: 0.5;
            margin-bottom: 30px;
        }
        .edit-prompt {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            font-size: 1rem;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="placeholder">
        <h1>[Your Title Here]</h1>
        <p>[Your description will appear here]</p>
        <div class="edit-prompt">
            👆 Click the details below to add your title, description, and choose a category to get started!
        </div>
    </div>
</body>
</html>`,
};
