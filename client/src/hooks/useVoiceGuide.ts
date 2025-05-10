import { useState, useEffect } from 'react';

interface VoiceGuideHook {
  speak: (text: string, language: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  error: string | null;
}

export function useVoiceGuide(): VoiceGuideHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Initialize voices
  useEffect(() => {
    // Some browsers (like Chrome) load voices asynchronously
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Check if voices are already loaded
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesLoaded(true);
      }
      
      // Add event listener for when voices change/load
      const handleVoicesChanged = () => {
        setVoicesLoaded(true);
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Cleanup
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (utterance) {
        window.speechSynthesis.cancel();
      }
    };
  }, [utterance]);

  const getVoiceForLanguage = (language: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    
    // Map language names to BCP 47 language tags
    const languageMap: Record<string, string> = {
      'English': 'en',
      'Hindi': 'hi',
      'Tamil': 'ta',
      'Bengali': 'bn',
      'Gujarati': 'gu',
      'Marathi': 'mr'
    };
    
    const langCode = languageMap[language] || 'en';
    
    // Try to find a voice for the specific language
    let voice: SpeechSynthesisVoice | null = null;
    
    // First try to find a local service voice for the specified language
    const localVoice = voices.find(v => v.lang.startsWith(langCode) && v.localService);
    if (localVoice) {
      voice = localVoice;
    } else {
      // If no local voice, try any voice for that language
      const anyLangVoice = voices.find(v => v.lang.startsWith(langCode));
      if (anyLangVoice) {
        voice = anyLangVoice;
      } else if (voices.length > 0) {
        // If still no voice, use default (usually English) or first available
        const defaultVoice = voices.find(v => v.default);
        voice = defaultVoice || voices[0];
      }
    }
    
    return voice;
  };

  const speak = (text: string, language: string = 'English') => {
    if (!text) {
      setError("No text provided for speech synthesis");
      return;
    }
    
    try {
      // Clear any previous errors
      setError(null);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance
      const newUtterance = new SpeechSynthesisUtterance(text);
      
      const setupAndSpeak = () => {
        try {
          // Get appropriate voice for the language
          const voice = getVoiceForLanguage(language);
          
          if (voice) {
            newUtterance.voice = voice;
            newUtterance.lang = voice.lang; // Set language explicitly as well
          } else {
            console.warn(`No voice found for language: ${language}, using default voice`);
          }
          
          // Set speech properties
          newUtterance.rate = 1.0;
          newUtterance.pitch = 1.0;
          
          // Set event handlers
          newUtterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };
          
          newUtterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
          };
          
          newUtterance.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            setError(`Speech synthesis error: ${event.error}`);
            setIsSpeaking(false);
            setIsPaused(false);
          };
          
          // Store the utterance reference for cleanup
          setUtterance(newUtterance);
          
          // Start speaking
          window.speechSynthesis.speak(newUtterance);
        } catch (setupError) {
          console.error("Error setting up speech:", setupError);
          setError(`Error setting up speech: ${setupError instanceof Error ? setupError.message : String(setupError)}`);
        }
      };
      
      if (voicesLoaded) {
        setupAndSpeak();
      } else {
        // Wait for voices to load with a timeout
        const voiceLoadTimeout = setTimeout(() => {
          if (!voicesLoaded) {
            setError("Timed out waiting for voice data to load. Please try again.");
          }
        }, 3000);
        
        // Set up a watcher to detect when voices are loaded
        const checkInterval = setInterval(() => {
          if (window.speechSynthesis.getVoices().length > 0) {
            clearTimeout(voiceLoadTimeout);
            clearInterval(checkInterval);
            setVoicesLoaded(true);
            setupAndSpeak();
          }
        }, 100);
        
        // Clean up after 5 seconds maximum to prevent memory leaks
        setTimeout(() => {
          clearInterval(checkInterval);
          clearTimeout(voiceLoadTimeout);
        }, 5000);
      }
    } catch (err) {
      console.error("Speech synthesis initialization error:", err);
      setError(`Failed to initialize speech synthesis: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const pause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    error,
  };
}
