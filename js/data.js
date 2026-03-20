export const defaultRooms = [
  { id: "hallway", name: "Hallway", icon: "🚪", order: 1 },
  { id: "bedroom", name: "Bedroom", icon: "🛏", order: 2 },
  { id: "bathroom", name: "Ensuite Bathroom", icon: "🚿", order: 3 },
  { id: "living", name: "Living & Drawing Area", icon: "🛋", order: 4 },
  { id: "kitchen", name: "Kitchen & Dining", icon: "🍽", order: 5 },
  { id: "utility", name: "Utility Room", icon: "🧹", order: 6 }
];

export const defaultFurniture = [
  { id: "f1", roomId: "hallway", name: "Ottoman (with storage)", order: 1 },
  { id: "f2", roomId: "hallway", name: "Shoe Rack", order: 2 },
  { id: "f3", roomId: "bedroom", name: "Wardrobe (4 door, shared)", order: 1 },
  { id: "f4", roomId: "bedroom", name: "Bedside Table — Priya", order: 2 },
  { id: "f5", roomId: "bedroom", name: "Bedside Table — Vivek", order: 3 },
  { id: "f6", roomId: "bedroom", name: "Kallax Unit — Storage Box 1", order: 4 },
  { id: "f7", roomId: "bedroom", name: "Kallax Unit — Storage Box 2", order: 5 },
  { id: "f8", roomId: "bedroom", name: "Laundry Basket — Priya", order: 6 },
  { id: "f9", roomId: "bedroom", name: "Laundry Basket — Vivek", order: 7 },
  { id: "f10", roomId: "bedroom", name: "Flamingo Basket", order: 8 },
  { id: "f11", roomId: "bathroom", name: "Shelf on Wheels — Ikea (3 tier)", order: 1 },
  { id: "f12", roomId: "bathroom", name: "Hanging Shelf — Temu (3 tier)", order: 2 },
  { id: "f13", roomId: "bathroom", name: "Shower Shelf (wall mounted)", order: 3 },
  { id: "f14", roomId: "living", name: "Computer Desk (standing)", order: 1 },
  { id: "f15", roomId: "living", name: "TV Unit", order: 2 },
  { id: "f16", roomId: "living", name: "Bookshelf", order: 3 },
  { id: "f17", roomId: "kitchen", name: "Top Cupboard 1", order: 1 },
  { id: "f18", roomId: "kitchen", name: "Top Cupboard 2", order: 2 },
  { id: "f19", roomId: "kitchen", name: "Bottom Cupboard 1", order: 3 },
  { id: "f20", roomId: "kitchen", name: "Bottom Cupboard 2", order: 4 },
  { id: "f21", roomId: "kitchen", name: "Bottom Cupboard 3", order: 5 },
  { id: "f22", roomId: "kitchen", name: "Fridge", order: 6 },
  { id: "f23", roomId: "kitchen", name: "Freezer", order: 7 },
  { id: "f24", roomId: "kitchen", name: "Countertop", order: 8 },
  { id: "f25", roomId: "kitchen", name: "Dining Table", order: 9 },
  { id: "f26", roomId: "utility", name: "Utility Shelf", order: 1 }
];

export const categories = [
  {
    id: "medicine", name: "Medicine & Health", icon: "💊",
    subcategories: ["Prescription Medicine", "Over the Counter Medicine", "First Aid", "Vitamins & Supplements", "Medical Devices & Equipment"]
  },
  {
    id: "beauty", name: "Beauty & Skincare", icon: "🧴",
    subcategories: ["Skincare — Face", "Skincare — Body", "Haircare", "Makeup & Cosmetics", "Fragrances & Deodorants", "Nail Care", "Dental & Oral Care", "Feminine Care", "Tools & Accessories"]
  },
  {
    id: "clothing", name: "Clothing", icon: "👗",
    subcategories: ["Tops", "Bottoms", "Dresses & Suits", "Underwear & Socks", "Outerwear & Jackets", "Nightwear & Loungewear", "Sportswear & Activewear", "Traditional & Occasion Wear"]
  },
  {
    id: "footwear", name: "Footwear", icon: "👟",
    subcategories: ["Casual Shoes", "Formal Shoes", "Boots", "Sandals & Slippers", "Sports Shoes"]
  },
  {
    id: "accessories", name: "Accessories", icon: "👜",
    subcategories: ["Bags & Purses", "Jewellery", "Watches", "Belts & Wallets", "Scarves & Hats", "Sunglasses", "Hair Accessories"]
  },
  {
    id: "food", name: "Food & Grocery", icon: "🛒",
    subcategories: ["Dry Food & Pantry", "Spices & Condiments", "Fridge & Fresh Food", "Frozen Food", "Snacks & Confectionery", "Drinks & Beverages", "Baby & Special Diet Food"]
  },
  {
    id: "kitchen", name: "Kitchen", icon: "🍳",
    subcategories: ["Kitchen Appliances", "Cookware & Bakeware", "Crockery & Dinnerware", "Cutlery & Utensils", "Food Storage & Containers", "Cleaning & Dish Care"]
  },
  {
    id: "home", name: "Home & Living", icon: "🏠",
    subcategories: ["Furniture", "Bedding & Linen", "Towels & Bath", "Curtains & Blinds", "Rugs & Mats", "Home Decor & Ornaments", "Candles & Fragrance", "Storage & Organisation", "Clocks & Mirrors"]
  },
  {
    id: "cleaning", name: "Cleaning & Laundry", icon: "🧹",
    subcategories: ["Surface & Floor Cleaning", "Bathroom Cleaning", "Laundry & Fabric Care", "Dishwashing", "Bins & Waste"]
  },
  {
    id: "electronics", name: "Electronics & Tech", icon: "💻",
    subcategories: ["Phones & Tablets", "Computers & Laptops", "TV & Audio", "Cables, Chargers & Adapters", "Cameras & Photography", "Smart Home Devices", "Gaming", "Batteries & Power Banks"]
  },
  {
    id: "books", name: "Books & Stationery", icon: "📚",
    subcategories: ["Fiction Books", "Non Fiction Books", "Academic & Professional Books", "Magazines & Journals", "Stationery & Office Supplies", "Art & Craft Supplies"]
  },
  {
    id: "sports", name: "Sports & Fitness", icon: "🏋️",
    subcategories: ["Gym & Workout Equipment", "Yoga & Wellness", "Outdoor & Cycling", "Sports Clothing & Shoes"]
  },
  {
    id: "travel", name: "Travel", icon: "🧳",
    subcategories: ["Luggage & Suitcases", "Travel Bags & Backpacks", "Travel Accessories & Toiletries", "Travel Documents & Organisers"]
  },
  {
    id: "documents", name: "Documents & Admin", icon: "📄",
    subcategories: ["Identity Documents", "Financial Documents", "Insurance & Warranties", "Manuals & Guides", "Lease & Property Documents"]
  },
  {
    id: "tools", name: "Tools & DIY", icon: "🔧",
    subcategories: ["Hand Tools", "Power Tools", "Batteries & Bulbs", "Adhesives & Fixings", "Painting & Decorating"]
  },
  {
    id: "hobbies", name: "Hobbies & Leisure", icon: "🎮",
    subcategories: ["Musical Instruments", "Games & Board Games", "Toys & Kids Items", "Photography & Art", "Collectibles & Memorabilia"]
  },
  {
    id: "gifts", name: "Gifts & Miscellaneous", icon: "🎁",
    subcategories: ["Gifts & Wrapping", "Seasonal & Festive Items", "Miscellaneous / Other"]
  }
];
