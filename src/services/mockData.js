export const currentUser = {
  id: "user_001",
  name: "Lakshmi Devi",
  role: "seller", // We set this to 'seller' so the Dashboard knows who you are
  location: "Kanchipuram, Tamil Nadu",
  avatar: "https://ui-avatars.com/api/?name=Lakshmi+Devi&background=random"
};
export const products = [
  {
    id: 1,
    name: "Pure Kanchipuram Silk Saree",
    price: 15500,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    category: "Textiles",
    artisanName: "Lakshmi Devi",
    rating: 4.9,
    description: "Hand-woven with pure mulberry silk and gold-coated silver zari from the temples of Kanchipuram."
  },
  {
    id: 2,
    name: "Hand-painted Terracotta Pot",
    price: 1200,
    image: "https://images.unsplash.com/photo-1593106410288-caf6037748a2?auto=format&fit=crop&q=80&w=800",
    category: "Pottery",
    artisanName: "Ramesh Kumbhar",
    rating: 4.7,
    description: "Earth-fired clay pot featuring traditional tribal motifs and organic natural dyes."
  },
  {
    id: 3,
    name: "Madhubani Tree of Life Painting",
    price: 3500,
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",
    category: "Paintings",
    artisanName: "Sita Devi",
    rating: 4.8,
    description: "Intricate Mithila art depicting the interconnectedness of nature, created using fingers and twigs."
  },
  {
    id: 4,
    name: "Hand-carved Rosewood Elephant",
    price: 4500,
    image: "https://images.unsplash.com/photo-1610473068504-266150244437?auto=format&fit=crop&q=80&w=800",
    category: "Woodwork",
    artisanName: "Arjun Shilpi",
    rating: 4.6,
    description: "Solid rosewood carving with detailed floral patterns, a specialty of Saharanpur artisans."
  },
  {
    id: 5,
    name: "Brass Dhokra Tribal Figurine",
    price: 2800,
    image: "https://images.unsplash.com/photo-1617202227468-7597afc7046d?auto=format&fit=crop&q=80&w=800",
    category: "Metalwork",
    artisanName: "Birju Lohar",
    rating: 4.5,
    description: "Lost-wax casted non-ferrous metal art using techniques dating back 4,000 years."
  },
  {
    id: 6,
    name: "Embroidered Pashmina Shawl",
    price: 22000,
    image: "https://images.unsplash.com/photo-1621644043204-7476e938997a?auto=format&fit=crop&q=80&w=800",
    category: "Textiles",
    artisanName: "Zahid Khan",
    rating: 5.0,
    description: "Authentic Ladakhi Pashmina wool featuring delicate hand-stitched Sozni embroidery."
  }
];

export const courses = [
  {
    id: 101,
    title: "Basics of Wheel Pottery",
    instructor: "Ramesh Kumbhar",
    price: 1999,
    thumbnail: "https://images.unsplash.com/photo-1565191999001-551c187427bb?auto=format&fit=crop&q=80&w=800",
    lessonsCount: 12,
    rating: 4.9
  },
  {
    id: 102,
    title: "Traditional Madhubani Techniques",
    instructor: "Sita Devi",
    price: 1499,
    thumbnail: "https://images.unsplash.com/photo-1574044536225-04753fd3e92f?auto=format&fit=crop&q=80&w=800",
    lessonsCount: 8,
    rating: 4.8
  },
  {
    id: 103,
    title: "Introduction to Handloom Weaving",
    instructor: "Lakshmi Devi",
    price: 2499,
    thumbnail: "https://images.unsplash.com/photo-1511119255263-2200230230bc?auto=format&fit=crop&q=80&w=800",
    lessonsCount: 15,
    rating: 4.7
  }
];

export const sellerOrders = [
  {
    orderId: "#ORD-7721",
    customerName: "Amit Sharma",
    amount: 15500,
    status: "Shipped",
    date: "2023-10-24"
  },
  {
    orderId: "#ORD-8832",
    customerName: "Priya Patel",
    amount: 1200,
    status: "Pending",
    date: "2023-10-25"
  },
  {
    orderId: "#ORD-9910",
    customerName: "Rahul Nair",
    amount: 3500,
    status: "Shipped",
    date: "2023-10-26"
  }
];