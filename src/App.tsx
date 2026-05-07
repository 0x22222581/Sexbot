/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, StopCircle, RefreshCw, Volume2, Camera, UserSquare2, GraduationCap } from 'lucide-react';
import { BotState, BotMode } from './types';
import { analyzeImage } from './services/ai';
import { AnimatedBot } from './components/AnimatedBot';

export default function App() {
  const [botState, setBotState] = useState<BotState>('idle');
  const [botMode, setBotMode] = useState<BotMode>('rater');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    // We just call to preload voices in browser
    window.speechSynthesis.getVoices();
  }, []);

  const handleStopSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setBotState('idle');
    }
  };

  const handleModeChange = (mode: BotMode) => {
    if (botState === 'thinking') return;
    handleStopSpeech();
    setBotMode(mode);
    setAnalysisText('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleStopSpeech();
    setAnalysisText('');
    setBotState('thinking');

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        
        const responseText = await analyzeImage(base64Data, file.type, botMode);
        setAnalysisText(responseText);
        
        // Let's talk!
        speakText(responseText);

      } catch (err) {
        setBotState('error');
        setAnalysisText('Ой, произошла ошибка: ' + (err as Error).message);
      }
    };
    reader.readAsDataURL(file);
  };

  const speakText = (text: string, isHurt = false) => {
    if (!('speechSynthesis' in window)) {
      setBotState(isHurt ? 'idle' : 'happy');
      return;
    }

    // Stop anything currently speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find Russian voice ideally
    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v => v.lang.startsWith('ru'));
    if (ruVoice) {
      utterance.voice = ruVoice;
    }
    
    // Config speed/pitch for robot personality
    utterance.pitch = isHurt ? 0.9 : 1.1; 
    utterance.rate = isHurt ? 0.9 : 1.05;
    utterance.volume = isHurt ? 0.6 : 1.0;

    utterance.onstart = () => {
      setBotState(isHurt ? 'hurt' : 'speaking');
    };

    utterance.onend = () => {
      if (isHurt) {
        setBotState('idle');
      } else {
        setBotState('happy');
        // Revert to idle after happy state
        setTimeout(() => setBotState('idle'), 3000);
      }
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setBotState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleBotClick = () => {
    if (botState === 'thinking') return;
    
    const hurtPhrases = [
      "Ай!", 
      "Эу, полегче!", 
      "Ай, за что?!", 
      "Больно же!", 
      "Ты че творишь, кринж!", 
      "Руки убрал!",
      "Ауф, больно!"
    ];
    const phrase = hurtPhrases[Math.floor(Math.random() * hurtPhrases.length)];
    
    speakText(phrase, true);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-hidden text-slate-100">
      <header className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
           <Volume2 className="w-6 h-6 text-cyan-400" />
           <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
             НейроБот
           </h1>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl shadow-inner border border-white/5">
           <button 
             onClick={() => handleModeChange('rater')}
             disabled={botState === 'thinking'}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${botMode === 'rater' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'} disabled:opacity-50`}
           >
             <UserSquare2 className="w-4 h-4" />
             Оценщик
           </button>
           <button 
             onClick={() => handleModeChange('advisor')}
             disabled={botState === 'thinking'}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${botMode === 'advisor' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'} disabled:opacity-50`}
           >
             <GraduationCap className="w-4 h-4" />
             Советчик
           </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-12 relative overflow-y-auto w-full custom-scrollbar">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* AI Bot Display */}
        <section className="flex flex-col items-center justify-center gap-12 z-10 w-full lg:w-1/2 max-w-md my-8 lg:my-0">
          <AnimatedBot state={botState} mode={botMode} onClick={handleBotClick} />

          <div className="w-full flex items-center justify-center gap-4 mt-8">
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
             />
             <button 
               onClick={triggerUpload}
               disabled={botState === 'thinking'}
               className={`px-6 py-4 rounded-2xl text-white font-bold text-lg flex items-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center ${botMode === 'rater' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25'}`}
             >
               {botState === 'thinking' ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
               {botState === 'thinking' ? 'Делаю выводы...' : botMode === 'rater' ? 'Оценить фото' : 'Получить совет'}
             </button>
             
             {botState === 'speaking' && (
               <button 
                 onClick={handleStopSpeech} 
                 className="p-4 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-2xl transition-all flex-shrink-0"
                 title="Остановить речь"
               >
                 <StopCircle className="w-6 h-6" />
               </button>
             )}
          </div>
        </section>

        {/* Analysis Result Panel */}
        <section className="w-full lg:w-1/2 max-w-lg z-10 flex flex-col gap-6 lg:h-full justify-center">
          <AnimatePresence mode="popLayout">
            {imageSrc && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full aspect-[4/3] max-h-[50vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-900 flex items-center justify-center flex-shrink-0"
              >
                <img src={imageSrc} alt="User Uploaded" className="w-full h-full object-contain" />
              </motion.div>
            )}

            {analysisText && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`bg-slate-800/80 backdrop-blur-xl border rounded-3xl p-6 shadow-2xl ${botMode === 'rater' ? 'border-blue-500/20' : 'border-emerald-500/20'}`}
               >
                 <div className={`flex items-center gap-3 mb-4 ${botMode === 'rater' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    <span className="flex w-3 h-3 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${botMode === 'rater' ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
                      <span className={`relative inline-flex rounded-full w-3 h-3 ${botMode === 'rater' ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      {botMode === 'rater' ? 'Вердикт НейроБота' : 'Урок от нейроучилки'}
                    </span>
                 </div>
                 <p className="text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">
                   {analysisText}
                 </p>
               </motion.div>
            )}
            
            {!imageSrc && !analysisText && (
               <motion.div className="bg-slate-800/50 border border-white/5 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 text-slate-500 lg:my-auto">
                  <Upload className="w-12 h-12 opacity-50" />
                  <div>
                    <h3 className="text-lg font-medium text-slate-400 mb-1">Жду твою картинку!</h3>
                    <p className="text-sm">{botMode === 'rater' ? 'Загрузи любое фото, а я покажу всю свою нейро-гениальность, опишу его и оценю.' : 'Грузи фотку, сейчас расскажу, почему это кринж и как сделать норм.'}</p>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}

