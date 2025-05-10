import OpenAI from "openai";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

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
 * Translates text to the specified target language using OpenAI
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // Check if we have a valid language code
    const langCode = languageCodes[targetLanguage] || "en";
    
    // Don't translate if text is empty or already in English and target is English
    if (!text || (targetLanguage === "English" && !text.match(/[^\x00-\x7F]/g))) {
      return text;
    }
    
    // Call OpenAI API to translate the text
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLanguage} (${langCode}). Preserve the original meaning, tone, and style. Only respond with the translated text, nothing else.`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 1000,
    });
    
    const translatedText = response.choices[0].message.content;
    return translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
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