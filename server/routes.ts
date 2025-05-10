import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertReviewSchema, insertFavoriteSchema } from "@shared/schema";

// Define the extended request with user property
interface AuthRequest extends Request {
  user?: { id: number; username: string; email: string };
}

// Import OpenAI for server-side translation
import OpenAI from "openai";

// Create OpenAI client (uses OPENAI_API_KEY environment variable automatically)
const openai = new OpenAI();

// Language codes for translation
const languageCodes: Record<string, string> = {
  "English": "en",
  "Hindi": "hi",
  "Tamil": "ta", 
  "Bengali": "bn",
  "Gujarati": "gu",
  "Marathi": "mr"
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Simple session handling (in a real app, use proper session management)
  let currentUserId: number | null = null;

  // ------------- Auth Routes -------------
  
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // In a real app, hash the password before storing
      const user = await storage.createUser(validatedData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set current user (simulating session)
      currentUserId = user.id;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set current user (simulating session)
      currentUserId = user.id;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    currentUserId = null;
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", async (req: AuthRequest, res: Response) => {
    if (!currentUserId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(currentUserId);
      
      if (!user) {
        currentUserId = null;
        return res.status(401).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ------------- City Routes -------------
  
  // Get all cities
  app.get("/api/cities", async (req: Request, res: Response) => {
    try {
      const cities = await storage.getCities();
      res.json({ cities });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get city by ID
  app.get("/api/cities/:id", async (req: Request, res: Response) => {
    try {
      const cityId = parseInt(req.params.id);
      
      if (isNaN(cityId)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }
      
      const city = await storage.getCity(cityId);
      
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      
      res.json({ city });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ------------- Category Routes -------------
  
  // Get all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ------------- Place Routes -------------
  
  // Get all places
  app.get("/api/places", async (req: Request, res: Response) => {
    try {
      const cityId = req.query.cityId ? parseInt(req.query.cityId as string) : undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let places;
      
      if (cityId && categoryId) {
        places = await storage.getPlacesByCityAndCategory(cityId, categoryId);
      } else if (cityId) {
        places = await storage.getPlacesByCity(cityId);
      } else if (categoryId) {
        places = await storage.getPlacesByCategory(categoryId);
      } else {
        places = await storage.getPlaces();
      }
      
      res.json({ places });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get featured places
  app.get("/api/places/featured", async (req: Request, res: Response) => {
    try {
      const places = await storage.getFeaturedPlaces();
      res.json({ places });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get place by ID
  app.get("/api/places/:id", async (req: Request, res: Response) => {
    try {
      const placeId = parseInt(req.params.id);
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      const place = await storage.getPlace(placeId);
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      res.json({ place });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ------------- Review Routes -------------
  
  // Get reviews for a place
  app.get("/api/places/:id/reviews", async (req: Request, res: Response) => {
    try {
      const placeId = parseInt(req.params.id);
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      const reviews = await storage.getReviews(placeId);
      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add a review for a place
  app.post("/api/places/:id/reviews", async (req: AuthRequest, res: Response) => {
    if (!currentUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const placeId = parseInt(req.params.id);
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      const place = await storage.getPlace(placeId);
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: currentUserId,
        placeId,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json({ review });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // ------------- Testimonial Routes -------------
  
  // Get all testimonials
  app.get("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json({ testimonials });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ------------- Favorite Routes -------------
  
  // Get user favorites
  app.get("/api/favorites", async (req: AuthRequest, res: Response) => {
    if (!currentUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const favorites = await storage.getUserFavorites(currentUserId);
      res.json({ favorites });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add a favorite
  app.post("/api/favorites", async (req: AuthRequest, res: Response) => {
    if (!currentUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { placeId } = req.body;
      
      if (!placeId) {
        return res.status(400).json({ message: "Place ID is required" });
      }
      
      const place = await storage.getPlace(parseInt(placeId));
      
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      
      const isFavorite = await storage.isFavorite(currentUserId, place.id);
      
      if (isFavorite) {
        return res.status(400).json({ message: "Place is already in favorites" });
      }
      
      const validatedData = insertFavoriteSchema.parse({
        userId: currentUserId,
        placeId: place.id,
      });
      
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json({ success: true, favorite });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Remove a favorite
  app.delete("/api/favorites/:placeId", async (req: AuthRequest, res: Response) => {
    if (!currentUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const placeId = parseInt(req.params.placeId);
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      const success = await storage.removeFavorite(currentUserId, placeId);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Check if a place is favorited
  app.get("/api/favorites/:placeId", async (req: AuthRequest, res: Response) => {
    if (!currentUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const placeId = parseInt(req.params.placeId);
      
      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }
      
      const isFavorite = await storage.isFavorite(currentUserId, placeId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
