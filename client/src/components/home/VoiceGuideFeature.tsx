import { useState, useEffect } from 'react';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';

export default function VoiceGuideFeature() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [progress, setProgress] = useState({ current: 83, total: 165 }); // seconds
  
  // Set up the voice guide
  const { speak, pause, stop, isSpeaking } = useVoiceGuide();
  
  // Sample transcript text to be read
  const transcript = "Jal Mahal, or the Water Palace, was built in the 18th century by Maharaja Jai Singh II. Unlike most palaces that stand on land, this architectural marvel appears to float in the middle of Man Sagar Lake...";
  
  // Fun fact to be read next
  const funFact = "The palace appears to be single-storied from the outside, but it actually has four more levels submerged underwater when the lake is full.";
  
  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLanguage(e.target.value);
    // Re-start the voice guide with the new language
    stop();
    setTimeout(() => {
      speak(transcript, e.target.value);
    }, 300);
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      speak(transcript, currentLanguage);
    }
    setIsPlaying(!isPlaying);
  };
  
  // Update progress bar
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newCurrent = prev.current + 1;
        if (newCurrent >= prev.total) {
          clearInterval(timer);
          setIsPlaying(false);
          return prev;
        }
        return { ...prev, current: newCurrent };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-12 md:py-16 bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Multilingual Voice Guide</h2>
            <p className="text-blue-100 mb-6">
              Experience our destinations like never before with our AI-powered voice guide 
              that speaks to you in your preferred language.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center mt-1">
                  <i className="fas fa-language text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold">Multiple Languages</h3>
                  <p className="text-blue-100 text-sm">
                    Our voice guide supports 10+ Indian languages including Hindi, Tamil, Bengali, and more.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center mt-1">
                  <i className="fas fa-history text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold">Rich Historical Context</h3>
                  <p className="text-blue-100 text-sm">
                    Learn about the hidden stories, historical significance, and cultural importance of each place.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center mt-1">
                  <i className="fas fa-map-marked-alt text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold">Location-Based Narration</h3>
                  <p className="text-blue-100 text-sm">
                    As you move around a site, the voice guide automatically detects your location 
                    and provides relevant information.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => speak(transcript, currentLanguage)}
                className="bg-white text-primary hover:bg-blue-50 px-5 py-2 rounded-md transition-colors font-medium flex items-center space-x-2"
              >
                <i className="fas fa-play"></i>
                <span>Try Demo</span>
              </button>
              <button className="bg-transparent hover:bg-blue-500 border border-white text-white px-5 py-2 rounded-md transition-colors font-medium">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Phone mockup containing voice guide UI */}
              <div className="bg-white rounded-3xl shadow-xl p-2 mx-auto" style={{ maxWidth: '280px' }}>
                <div className="rounded-2xl overflow-hidden bg-gray-50 h-[500px] relative">
                  {/* Voice guide interface */}
                  <div className="h-full flex flex-col">
                    {/* Top bar */}
                    <div className="bg-primary p-4 text-white">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Voice Guide</h3>
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <i className="fas fa-cog text-sm"></i>
                          </button>
                          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <i className="fas fa-times text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Main content */}
                    <div className="flex-1 p-4 overflow-auto">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800">Jal Mahal (Water Palace)</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <i className="fas fa-map-marker-alt text-red-500 mr-1"></i>
                          <span>Jaipur, Rajasthan</span>
                        </div>
                      </div>
                      
                      {/* Voice visualization */}
                      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            <i className="fas fa-volume-up text-primary"></i>
                            <span className="text-sm font-medium">Now Playing</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(progress.current)} / {formatTime(progress.total)}
                          </span>
                        </div>
                        <div className="h-12 bg-blue-50 rounded-md flex items-center justify-center overflow-hidden">
                          {/* Voice wave animation */}
                          <div className="voice-wave">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                              <div 
                                key={i} 
                                className={`voice-wave-bar animate-wave animate-wave-${i % 5 + 1}`} 
                                style={{
                                  animationPlayState: isPlaying ? 'running' : 'paused',
                                  height: `${Math.floor(Math.random() * 12) + 4}px`
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Text transcript */}
                      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-file-alt text-primary mr-1"></i>
                          <span className="text-sm font-medium">Transcript</span>
                        </div>
                        <p className="text-sm text-gray-600">{transcript}</p>
                      </div>
                      
                      {/* Fun facts */}
                      <div className="bg-white rounded-lg shadow-sm p-3">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-lightbulb text-amber-500 mr-1"></i>
                          <span className="text-sm font-medium">Did You Know?</span>
                        </div>
                        <p className="text-sm text-gray-600">{funFact}</p>
                      </div>
                    </div>
                    
                    {/* Bottom controls */}
                    <div className="bg-white p-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <button className="text-gray-600">
                            <i className="fas fa-step-backward"></i>
                          </button>
                          <button 
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"
                          >
                            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                          </button>
                          <button className="text-gray-600">
                            <i className="fas fa-step-forward"></i>
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{currentLanguage}</span>
                          <div className="relative">
                            <select 
                              className="appearance-none bg-gray-100 text-xs px-2 py-1 pr-6 rounded"
                              value={currentLanguage}
                              onChange={handleLanguageChange}
                            >
                              <option>English</option>
                              <option>Hindi</option>
                              <option>Tamil</option>
                              <option>Bengali</option>
                              <option>Gujarati</option>
                              <option>Marathi</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                              <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 w-64 h-64 bg-blue-400 rounded-full opacity-20 -bottom-10 -right-10"></div>
              <div className="absolute -z-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20 -top-5 -left-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
