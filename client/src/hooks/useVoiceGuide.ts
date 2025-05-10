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
    let voice = voices.find(v => v.lang.startsWith(langCode) && v.localService);
    
    // If no specific regional voice, try any voice for that language
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langCode));
    }
    
    // If still no voice, use default (usually English)
    if (!voice && voices.length > 0) {
      voice = voices.find(v => v.default) || voices[0];
    }
    
    return voice;
  };

  const speak = (text: string, language: string = 'English') => {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance
      const newUtterance = new SpeechSynthesisUtterance(text);
      
      // Load voices (might need a slight delay in some browsers)
      setTimeout(() => {
        const voice = getVoiceForLanguage(language);
        if (voice) {
          newUtterance.voice = voice;
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
          setError(`Speech synthesis error: ${event.error}`);
          setIsSpeaking(false);
          setIsPaused(false);
        };
        
        // Store the utterance
        setUtterance(newUtterance);
        
        // Start speaking
        window.speechSynthesis.speak(newUtterance);
      }, 100);
    } catch (err) {
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
