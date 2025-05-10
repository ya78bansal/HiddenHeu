import { 
  users, type User, type InsertUser,
  cities, type City, type InsertCity,
  categories, type Category, type InsertCategory,
  places, type Place, type InsertPlace,
  reviews, type Review, type InsertReview,
  testimonials, type Testimonial, type InsertTestimonial,
  favorites, type Favorite, type InsertFavorite
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // City methods
  getCities(): Promise<City[]>;
  getCity(id: number): Promise<City | undefined>;
  getCityByName(name: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Place methods
  getPlaces(): Promise<Place[]>;
  getPlacesByCity(cityId: number): Promise<Place[]>;
  getPlacesByCategory(categoryId: number): Promise<Place[]>;
  getPlacesByCityAndCategory(cityId: number, categoryId: number): Promise<Place[]>;
  getFeaturedPlaces(): Promise<Place[]>;
  getPlace(id: number): Promise<Place | undefined>;
  createPlace(place: InsertPlace): Promise<Place>;
  
  // Review methods
  getReviews(placeId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Favorite methods
  getUserFavorites(userId: number): Promise<Place[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, placeId: number): Promise<boolean>;
  isFavorite(userId: number, placeId: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cities: Map<number, City>;
  private categories: Map<number, Category>;
  private places: Map<number, Place>;
  private reviews: Map<number, Review>;
  private testimonials: Map<number, Testimonial>;
  private favorites: Map<number, Favorite>;
  
  private userId: number;
  private cityId: number;
  private categoryId: number;
  private placeId: number;
  private reviewId: number;
  private testimonialId: number;
  private favoriteId: number;
  
  constructor() {
    this.users = new Map();
    this.cities = new Map();
    this.categories = new Map();
    this.places = new Map();
    this.reviews = new Map();
    this.testimonials = new Map();
    this.favorites = new Map();
    
    this.userId = 1;
    this.cityId = 1;
    this.categoryId = 1;
    this.placeId = 1;
    this.reviewId = 1;
    this.testimonialId = 1;
    this.favoriteId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const newUser: User = { id, ...user, profilePicture: null, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // City methods
  async getCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }
  
  async getCity(id: number): Promise<City | undefined> {
    return this.cities.get(id);
  }
  
  async getCityByName(name: string): Promise<City | undefined> {
    return Array.from(this.cities.values()).find(
      city => city.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async createCity(city: InsertCity): Promise<City> {
    const id = this.cityId++;
    const newCity: City = { id, ...city };
    this.cities.set(id, newCity);
    return newCity;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { id, ...category };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Place methods
  async getPlaces(): Promise<Place[]> {
    return Array.from(this.places.values());
  }
  
  async getPlacesByCity(cityId: number): Promise<Place[]> {
    return Array.from(this.places.values()).filter(
      place => place.cityId === cityId
    );
  }
  
  async getPlacesByCategory(categoryId: number): Promise<Place[]> {
    return Array.from(this.places.values()).filter(
      place => place.categoryId === categoryId
    );
  }
  
  async getPlacesByCityAndCategory(cityId: number, categoryId: number): Promise<Place[]> {
    return Array.from(this.places.values()).filter(
      place => place.cityId === cityId && place.categoryId === categoryId
    );
  }
  
  async getFeaturedPlaces(): Promise<Place[]> {
    return Array.from(this.places.values()).filter(
      place => place.isFeatured
    );
  }
  
  async getPlace(id: number): Promise<Place | undefined> {
    return this.places.get(id);
  }
  
  async createPlace(place: InsertPlace): Promise<Place> {
    const id = this.placeId++;
    const newPlace: Place = { 
      id, 
      ...place, 
      reviewCount: 0,
    };
    this.places.set(id, newPlace);
    return newPlace;
  }
  
  // Review methods
  async getReviews(placeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.placeId === placeId
    );
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const createdAt = new Date();
    const newReview: Review = { id, ...review, createdAt };
    this.reviews.set(id, newReview);
    
    // Update place's review count
    const place = this.places.get(review.placeId);
    if (place) {
      place.reviewCount = (place.reviewCount || 0) + 1;
      this.places.set(place.id, place);
    }
    
    return newReview;
  }
  
  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const newTestimonial: Testimonial = { id, ...testimonial };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }
  
  // Favorite methods
  async getUserFavorites(userId: number): Promise<Place[]> {
    const userFavorites = Array.from(this.favorites.values()).filter(
      favorite => favorite.userId === userId
    );
    
    return userFavorites.map(favorite => 
      this.places.get(favorite.placeId)
    ).filter(place => place !== undefined) as Place[];
  }
  
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteId++;
    const createdAt = new Date();
    const newFavorite: Favorite = { id, ...favorite, createdAt };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }
  
  async removeFavorite(userId: number, placeId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      fav => fav.userId === userId && fav.placeId === placeId
    );
    
    if (favorite) {
      this.favorites.delete(favorite.id);
      return true;
    }
    
    return false;
  }
  
  async isFavorite(userId: number, placeId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      favorite => favorite.userId === userId && favorite.placeId === placeId
    );
  }
  
  // Initialize with sample data
  private initSampleData() {
    // Initialize categories
    const categories = [
      {
        name: "Hidden Food Places",
        description: "Local eateries & cuisines",
        icon: "fa-utensils",
        colorClass: "amber",
      },
      {
        name: "Local Lifestyle",
        description: "Authentic daily experiences",
        icon: "fa-hands",
        colorClass: "green",
      },
      {
        name: "Cultural Clothing",
        description: "Traditional attires & crafts",
        icon: "fa-tshirt",
        colorClass: "purple",
      },
      {
        name: "Historical Spots",
        description: "Monuments & heritage sites",
        icon: "fa-monument",
        colorClass: "blue",
      },
      {
        name: "Nature Trails",
        description: "Scenic routes & landscapes",
        icon: "fa-tree",
        colorClass: "emerald",
      }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Initialize cities
    const cities = [
      {
        name: "Delhi",
        state: "Delhi",
        description: "Discover ancient bazaars, historical monuments, and secret gardens in India's capital city.",
        imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
        rating: 45,
        latitude: "28.6139",
        longitude: "77.2090",
      },
      {
        name: "Mumbai",
        state: "Maharashtra",
        description: "Experience hidden beaches, local eateries, and vibrant street culture in the city of dreams.",
        imageUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f",
        rating: 40,
        latitude: "19.0760",
        longitude: "72.8777",
      },
      {
        name: "Jaipur",
        state: "Rajasthan",
        description: "Uncover the secrets of the Pink City with hidden palaces, artisan workshops, and royal cuisine.",
        imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41",
        rating: 47,
        latitude: "26.9124",
        longitude: "75.7873",
      },
      {
        name: "Bangalore",
        state: "Karnataka",
        description: "Explore tech hubs alongside traditional markets and lush gardens in the Silicon Valley of India.",
        imageUrl: "https://images.unsplash.com/photo-1580667309005-9e5cffe54318",
        rating: 43,
        latitude: "12.9716",
        longitude: "77.5946",
      },
      {
        name: "Chennai",
        state: "Tamil Nadu",
        description: "Discover rich cultural heritage, hidden temples, and authentic South Indian cuisine.",
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
        rating: 42,
        latitude: "13.0827",
        longitude: "80.2707",
      },
      {
        name: "Kolkata",
        state: "West Bengal",
        description: "Explore colonial architecture, hidden bookstores, and authentic Bengali cuisine in the City of Joy.",
        imageUrl: "https://images.unsplash.com/photo-1558431382-27e303142255",
        rating: 41,
        latitude: "22.5726",
        longitude: "88.3639",
      }
    ];
    
    cities.forEach(city => {
      this.createCity(city);
    });
    
    // Initialize places
    const places = [
      {
        name: "Paranthe Wali Gali",
        description: "Experience Delhi's most authentic stuffed bread variations in this hidden lane of Old Delhi.",
        address: "Old Delhi, Delhi",
        cityId: 1, // Delhi
        categoryId: 1, // Food
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
        latitude: "28.6562",
        longitude: "77.2410",
        rating: 48,
        isFeatured: true,
        tags: ["street food", "breakfast", "local favorite"],
      },
      {
        name: "Rajasthani Heritage Textiles",
        description: "Discover artisanal block printing techniques and handloom fabrics from master craftsmen.",
        address: "Bapu Bazaar, Jaipur",
        cityId: 3, // Jaipur
        categoryId: 3, // Clothing
        imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b",
        latitude: "26.9186",
        longitude: "75.8222",
        rating: 40,
        isFeatured: true,
        tags: ["handloom", "traditional", "crafts"],
      },
      {
        name: "Jog Falls Hidden Path",
        description: "An off-the-beaten-path trail to witness India's second-highest waterfall from a secluded viewpoint.",
        address: "Shimoga, Karnataka",
        cityId: 4, // Bangalore (nearest major city)
        categoryId: 5, // Nature
        imageUrl: "https://images.unsplash.com/photo-1598233847491-f16487adee2f",
        latitude: "14.2241",
        longitude: "74.7938",
        rating: 46,
        isFeatured: true,
        tags: ["waterfall", "hiking", "scenic"],
      },
      {
        name: "Paigah Tombs",
        description: "A hidden necropolis with exquisite marble inlay work and Indo-Islamic architecture away from tourist crowds.",
        address: "Old City, Hyderabad",
        cityId: 4, // Using Bangalore as a proxy since Hyderabad isn't in our cities
        categoryId: 4, // Historical
        imageUrl: "https://images.unsplash.com/photo-1524613032530-449a5d94c285",
        latitude: "17.3615",
        longitude: "78.4747",
        rating: 49,
        isFeatured: true,
        tags: ["historical", "architecture", "hidden gem"],
      },
      {
        name: "Khari Baoli Spice Market",
        description: "Asia's largest wholesale spice market offering a sensory overload of colors and aromas.",
        address: "Chandni Chowk, Delhi",
        cityId: 1, // Delhi
        categoryId: 2, // Lifestyle
        imageUrl: "https://images.unsplash.com/photo-1566123628941-963b11f35bdb",
        latitude: "28.6579",
        longitude: "77.2200",
        rating: 44,
        isFeatured: false,
        tags: ["market", "spices", "shopping"],
      },
      {
        name: "Dharavi Pottery Colony",
        description: "Meet skilled artisans creating beautiful pottery in the heart of Mumbai's largest informal settlement.",
        address: "Dharavi, Mumbai",
        cityId: 2, // Mumbai
        categoryId: 2, // Lifestyle
        imageUrl: "https://images.unsplash.com/photo-1604847369696-c361b95e2fac",
        latitude: "19.0399",
        longitude: "72.8476",
        rating: 43,
        isFeatured: false,
        tags: ["crafts", "pottery", "local artisans"],
      }
    ];
    
    places.forEach(place => {
      this.createPlace(place);
    });
    
    // Initialize testimonials
    const testimonials = [
      {
        name: "Rahul P.",
        location: "Mumbai, Maharashtra",
        comment: "Thanks to HiddenHeu, I discovered an amazing food street in Old Delhi that wasn't on any major travel site. The voice guide feature explained the history of each dish in my language, making it a truly immersive experience.",
        rating: 50,
        avatarInitials: "RP",
      },
      {
        name: "Ananya K.",
        location: "Bangalore, Karnataka",
        comment: "The hidden nature trail near Munnar that this app recommended was breathtaking! It wasn't crowded like other tourist spots, and we felt like we discovered a secret paradise. The navigation feature made it easy to find.",
        rating: 45,
        avatarInitials: "AK",
      },
      {
        name: "Vikram S.",
        location: "Delhi, NCR",
        comment: "I visited Jaipur many times but never knew about the traditional textile workshop that HiddenHeu recommended. The artisans showed us ancient block printing techniques, and I bought authentic souvenirs directly from them.",
        rating: 50,
        avatarInitials: "VS",
      }
    ];
    
    testimonials.forEach(testimonial => {
      this.createTestimonial(testimonial);
    });
  }
}

export const storage = new MemStorage();
