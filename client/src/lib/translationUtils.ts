import { apiRequest } from "./queryClient";

// We'll use our server-side API endpoint for translations instead of calling OpenAI directly
// This keeps the API key secure on the server

// Language codes for translation
export const languageCodes: Record<string, string> = {
  "English": "en",
  "Hindi": "hi",
  "Tamil": "ta",
  "Bengali": "bn",
  "Gujarati": "gu",
  "Marathi": "mr"
};

/**
 * Translates text to the specified target language using our server API
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // Don't translate if text is empty or target is English
    if (!text || targetLanguage === "English") {
      return text;
    }
    
    // Call our server API endpoint to translate the text
    const response = await apiRequest<{ translatedText: string }>("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        targetLanguage,
      }),
    });
    
    // Return the translated text or original if translation failed
    return response.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    
    // Provide detailed error messages based on error type
    if (error instanceof Error) {
      const errorMessage = error.message || "Unknown error";
      console.error('Translation API error:', errorMessage);
      
      // Check for common error messages
      if (errorMessage.includes('API key')) {
        throw new Error('Translation failed: API key issue detected. Please try again later.');
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        throw new Error('Translation failed: Network issue detected. Please check your connection.');
      } else {
        throw new Error('Translation failed. Please try again later.');
      }
    }
    
    // For non-Error types, return original text
    return text;
  }
}

/**
 * Cache for storing translations to avoid redundant API calls
 */
export const translationCache = new Map<string, string>();

/**
 * Get translation with caching
 */
export async function getTranslation(text: string, targetLanguage: string): Promise<string> {
  // Create a cache key from the text and target language
  const cacheKey = `${text}:${targetLanguage}`;
  
  // Check if we have this translation in the cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey) as string;
  }
  
  // Get translation
  const translatedText = await translateText(text, targetLanguage);
  
  // Store in cache
  translationCache.set(cacheKey, translatedText);
  
  return translatedText;
}