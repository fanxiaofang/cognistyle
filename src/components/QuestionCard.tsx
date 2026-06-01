/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  onSelectAnswer: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onPrev,
  onNext,
}: QuestionCardProps) {
  const options = [
    { value: 1, label: '非常不同意', color: 'hover:bg-[#ff007f]/10 border-[#ff007f]/40 text-[#ff007f]/70 bg-transparent' },
    { value: 2, label: '不同意', color: 'hover:bg-rose-500/10 border-rose-700/30 text-rose-400/70 bg-transparent' },
    { value: 3, label: '中立', color: 'hover:bg-slate-500/10 border-slate-700/30 text-slate-400 bg-transparent' },
    { value: 4, label: '同意', color: 'hover:bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]/70 bg-transparent' },
    { value: 5, label: '非常同意', color: 'hover:bg-[#39ff14]/10 border-[#39ff14]/40 text-[#39ff14]/70 bg-transparent' },
  ];

  const getSegmentStyle = (idx: number) => {
    switch (idx) {
      case 0:
        return 'bg-gradient-to-r from-[#ff007f] to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      case 1:
        return 'bg-gradient-to-r from-rose-500 to-slate-500 shadow-[0_0_8px_rgba(148,163,184,0.4)]';
      case 2:
        return 'bg-gradient-to-r from-slate-500 to-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.5)]';
      case 3:
        return 'bg-gradient-to-r from-[#00f0ff] to-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.5)]';
      default:
        return 'bg-slate-500';
    }
  };

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-2 font-mono">
      {/* Progress Bar Container */}
      <div className="w-full h-2 sm:h-3 bg-black border border-[#00f0ff]/20 p-0.5 mb-2 overflow-hidden shadow-[0_0_5px_rgba(0,240,255,0.05)]">
        <motion.div
          className="h-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Cyberpunk Progress Info */}
      <div className="flex justify-center items-center text-xs text-slate-400 mb-4 px-1 select-none font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[#39ff14] font-bold glow-green">{currentIndex}/{totalQuestions}</span>
        </div>
      </div>

      {/* Main Question Surface */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="bg-[#070b19] border border-white/10 p-3 sm:p-5 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,240,255,0.15)] relative select-none"
        >
          {/* Cyber Corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]/70 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff]/70 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff]/70 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]/70 pointer-events-none" />

          {/* Question Text */}
          <h2 className="text-base sm:text-lg md:text-xl font-mono font-bold leading-relaxed text-white mb-4 sm:mb-6 select-none flex items-start gap-2">
            <span className="text-[#00f0ff] shrink-0 font-bold animate-pulse">&gt;</span>
            <span>{question.text}</span>
          </h2>

          {/* Likert Selection Nodes - Horizontal on desktop, Vertical/Adaptive on Mobile */}
          <div className="mb-6 sm:mb-10">
            {/* Desktop Horizontal Likert Layout */}
            <div className="hidden sm:flex justify-between items-center relative py-6">
              {options.map((option, idx) => {
                const isSelected = selectedAnswer === option.value;
                const isNextActive = selectedAnswer !== undefined && selectedAnswer > option.value;
                return (
                  <React.Fragment key={option.value}>
                    <button
                      onClick={() => onSelectAnswer(option.value)}
                      className="flex flex-col items-center relative z-10 group shrink-0"
                      style={{ width: '80px' }}
                    >
                      <div
                        className={`w-10 h-10 rounded-none border flex items-center justify-center transition-all duration-150 -translate-y-4 font-mono text-[13px]
                          ${isSelected
                            ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] scale-105 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                            : `${option.color} scale-100 group-hover:scale-105`
                          }`}
                      >
                        {option.value}
                      </div>
                      <span
                        className={`text-[12px] font-mono transition-colors duration-150 absolute -bottom-1 whitespace-nowrap
                          ${isSelected ? 'text-[#00f0ff] glow-cyan font-bold' : 'text-slate-500 group-hover:text-slate-300'}`}
                      >
                        {option.label}
                      </span>
                    </button>

                    {/* Connecting Line Segment (render after each option except the last one) */}
                    {idx < options.length - 1 && (
                      <div className="flex-1 h-0.5 -translate-y-4 relative flex items-center min-w-[20px] mx-1">
                        {/* Background track */}
                        <div className="w-full h-[1px] border-t border-dashed border-slate-700/40" />
                        {/* Active glow track */}
                        <motion.div
                          className={`absolute left-0 right-0 h-[2px] origin-left ${getSegmentStyle(idx)}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isNextActive ? 1 : 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile Vertical List Layout */}
            <div className="flex sm:hidden flex-col gap-2.5">
              {options.map((option) => {
                const isSelected = selectedAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => onSelectAnswer(option.value)}
                    className={`w-full p-3 rounded-none border flex items-center justify-between text-left transition-all duration-150 select-none min-h-[44px]
                      ${isSelected
                        ? 'bg-[#0c1229] border-[#00f0ff]/50 border-l-4 border-l-[#00f0ff] shadow-[inset_0_0_8px_rgba(0,240,255,0.15)]'
                        : 'bg-transparent border-slate-800/50 hover:border-slate-600'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-none border flex items-center justify-center font-mono text-[13px] shrink-0
                        ${isSelected
                          ? 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/50'
                          : 'bg-transparent text-slate-500 border-slate-800/50'
                        }`}
                      >
                        {option.value}
                      </span>
                      <span className={`text-[12px] font-mono ${isSelected ? 'text-[#00f0ff] glow-cyan font-bold' : 'text-slate-400'}`}>
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Lower Controls */}
          <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-slate-800/50">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 rounded-none text-xs font-mono uppercase transition-all duration-150 select-none border min-h-[44px] sm:min-h-0 group
                 ${currentIndex === 0
                  ? 'border-slate-800 text-slate-600 bg-black/20 cursor-not-allowed'
                  : 'border-slate-700 text-slate-300 hover:border-slate-400 hover:text-white hover:bg-slate-800/40 shadow-[0_0_4px_rgba(255,255,255,0.02)]'
                }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
              PREV
            </button>

            <button
              onClick={onNext}
              disabled={selectedAnswer === undefined}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-none text-xs font-mono uppercase transition-all duration-150 select-none border min-h-[44px] sm:min-h-0 group
                ${selectedAnswer === undefined
                  ? 'border-slate-800 text-slate-600 bg-black/20 cursor-not-allowed'
                  : 'border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                }`}
            >
              NEXT
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
