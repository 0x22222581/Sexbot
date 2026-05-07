import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BotState, BotMode } from '../types';

interface AnimatedBotProps {
  state: BotState;
  mode?: BotMode;
  onClick?: () => void;
}

export const AnimatedBot: React.FC<AnimatedBotProps> = ({ state, mode = 'rater', onClick }) => {
  // Animation variants based on state
  const containerVariants = {
    idle: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    thinking: { y: [0, -5, 0], rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.5 } },
    speaking: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.3 } },
    happy: { y: [0, -20, 0], transition: { repeat: Infinity, duration: 0.8, ease: "easeOut" } },
    error: { x: [-5, 5, -5], transition: { repeat: Infinity, duration: 0.2 } },
    hurt: { x: [-15, 15, -10, 10, -5, 5, 0], y: [10, -10, 5, -5, 0], rotate: [-10, 10, -10, 0], transition: { duration: 0.4 } }
  };

  const eyeVariants = {
    idle: { scaleY: [1, 1, 0.1, 1, 1], transition: { repeat: Infinity, duration: 5, times: [0, 0.45, 0.5, 0.55, 1] } },
    thinking: { x: [-8, 8, -8], transition: { repeat: Infinity, duration: 1.2 } },
    speaking: { scaleY: [1, 0.8, 1], transition: { repeat: Infinity, duration: 0.2 } },
    happy: { scaleY: 0.3, borderRadius: '50% 50% 10% 10%' },
    error: { scaleY: 0.5, rotate: 15 },
    hurt: { scaleY: 0.1, scaleX: 1.2, rotate: [-15, 15, 0], transition: { duration: 0.3 } }
  };

  const mouthVariants = {
    idle: { scaleX: 0.6, height: 4, borderRadius: 10 },
    thinking: { scaleX: 0.3, height: 8, borderRadius: 10 },
    speaking: { scaleX: [0.5, 1, 0.6], height: [6, 16, 6], borderRadius: 10, transition: { repeat: Infinity, duration: 0.25 } },
    happy: { scaleX: 1.2, height: 12, borderRadius: '10px 10px 40px 40px' },
    error: { scaleX: 0.8, height: 6, rotate: -10 },
    hurt: { scaleX: 0.5, height: 24, borderRadius: '50%', y: 8 }
  };

  const colorMap = {
    idle: 'from-cyan-400 to-blue-500',
    thinking: 'from-amber-400 to-orange-500',
    speaking: 'from-emerald-400 to-teal-500',
    happy: 'from-pink-400 to-purple-500',
    error: 'from-red-500 to-rose-600',
    hurt: 'from-orange-500 to-red-600'
  };

  return (
    <div className="relative w-64 h-64 flex items-center justify-center filter drop-shadow-2xl mt-8">
      
      {/* Chalkboard (Only in Advisor mode) */}
      <AnimatePresence>
         {mode === 'advisor' && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: -20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="absolute -top-16 -left-12 -right-12 h-64 bg-emerald-900 rounded-lg border-8 border-amber-800 shadow-xl p-4 z-0 flex flex-col items-start"
            >
               <div className="text-white/60 font-mono text-xs opacity-70 transform -rotate-2 whitespace-pre leading-relaxed">
                 {"> "}f.style === 'cringe'<br/>
                 {"> "}execute(fix_vibe);<br/>
                 <br/>
                 [УРОК 1: БАЗА]<br/>
                 1. Свет<br/>
                 2. Ракурс<br/>
                 3. Вайб
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Halo effect behind bot */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className={`absolute inset-0 bg-gradient-to-br ${colorMap[state]} rounded-full blur-3xl opacity-40 z-0`}
      />

      <motion.div 
        variants={containerVariants}
        animate={state}
        onClick={onClick}
        className="relative z-10 w-48 h-48 bg-slate-800 rounded-[40px] shadow-inner shadow-white/20 border border-slate-700 p-4 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
      >
        {/* Antennas */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-8 bg-slate-700 rounded-t-lg">
           <motion.div 
             animate={state === 'thinking' ? { scale: [1, 1.5, 1], backgroundColor: ['#f59e0b', '#fbbf24', '#f59e0b'] } : {}}
             transition={{ repeat: Infinity, duration: 0.5 }}
             className="absolute -top-3 -left-1 w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
           />
        </div>
        <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-3 h-12 bg-slate-700 rounded-l-lg" />
        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 h-12 bg-slate-700 rounded-r-lg" />

        {/* Face Screen */}
        <div className="w-full h-full bg-slate-900 rounded-[28px] overflow-hidden relative shadow-inner flex flex-col items-center justify-center p-6 border-b-4 border-slate-950">
          
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />

          {/* Eyes */}
          <div className="flex gap-8 mb-6">
            <motion.div 
               variants={eyeVariants}
               animate={state}
               className={`w-10 h-14 rounded-full bg-gradient-to-b ${colorMap[state]} shadow-[0_0_20px_var(--tw-gradient-from)]`}
            />
            <motion.div 
               variants={eyeVariants}
               animate={state}
               className={`w-10 h-14 rounded-full bg-gradient-to-b ${colorMap[state]} shadow-[0_0_20px_var(--tw-gradient-from)]`}
            />
          </div>

          {/* Mouth */}
          <motion.div 
             variants={mouthVariants}
             animate={state}
             className={`w-16 bg-gradient-to-r ${colorMap[state]} shadow-[0_0_15px_var(--tw-gradient-from)]`}
          />
        </div>
      </motion.div>

      {/* Teacher Pointer stick for Advisor */}
      <AnimatePresence>
        {mode === 'advisor' && (
          <motion.div
            initial={{ opacity: 0, rotate: 45, x: 20 }}
            animate={
               state === 'speaking' || state === 'thinking' 
                 ? { opacity: 1, rotate: [10, 25, 10], y: [0, -10, 0], x: 30, transition: { repeat: Infinity, duration: 0.5 } }
                 : { opacity: 1, rotate: 15, x: 30, y: 10 }
            }
            exit={{ opacity: 0 }}
            className="absolute -right-8 bottom-4 w-2.5 h-36 bg-amber-700/90 rounded-t-full shadow-2xl shadow-amber-900/50 z-20 origin-bottom border border-amber-900/50"
          >
             <div className="w-3.5 h-3.5 bg-rose-500 rounded-full mt-[-6px] ml-[-2px] shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
