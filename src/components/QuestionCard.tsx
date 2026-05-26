/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

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
    { value: 1, label: '非常不同意', color: 'hover:bg-[#ff007f]/10 border-[#ff007f]/60 text-[#ff007f] bg-black shadow-[2px_2px_0px_rgba(255,0,127,0.3)]' },
    { value: 2, label: '不同意', color: 'hover:bg-rose-500/10 border-rose-700/60 text-rose-400 bg-black shadow-[2px_2px_0px_rgba(244,63,94,0.3)]' },
    { value: 3, label: '中立', color: 'hover:bg-slate-500/10 border-slate-700 text-slate-300 bg-black shadow-[2px_2px_0px_rgba(100,116,139,0.3)]' },
    { value: 4, label: '同意', color: 'hover:bg-[#00f0ff]/10 border-[#00f0ff]/60 text-[#00f0ff] bg-black shadow-[2px_2px_0px_rgba(0,240,255,0.3)]' },
    { value: 5, label: '非常同意', color: 'hover:bg-[#39ff14]/10 border-[#39ff14]/60 text-[#39ff14] bg-black shadow-[2px_2px_0px_rgba(57,255,20,0.3)]' },
  ];

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 font-mono">
      {/* Upper Context Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-[13px] font-pixel tracking-wider text-[#00f0ff] bg-black border-2 border-[#00f0ff]/80 px-2.5 py-1.5 shadow-[2px_2px_0px_rgba(255,0,127,0.5)]">
          DIMENSION: {question.dimension.toUpperCase()}
        </span>
        <span className="text-[13px] font-pixel text-[#00f0ff] glow-cyan">
          [ <strong className="text-[#ff007f] text-[13px] font-pixel glow-magenta">{currentIndex + 1}</strong> / {totalQuestions} ]
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-4 bg-black border-2 border-[#00f0ff]/80 p-0.5 mb-8 overflow-hidden shadow-[2px_2px_0px_rgba(255,0,127,0.5)]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00f0ff] via-fuchsia-500 to-[#ff007f]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Main Question Surface */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="bg-[#070b19] border-2 border-[#00f0ff]/80 p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(255,0,127,0.6)] relative select-none"
        >
          {/* Subtle neon accents in corner */}
          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-[#ff007f]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-[#ffe600]" />

          {/* Question Text */}
          <h2 className="text-lg md:text-xl font-mono font-bold leading-relaxed text-white mb-6 select-none">
            {question.text}
          </h2>

          {/* Humorous Tip Box */}
          <div className="flex gap-3 items-start p-4 bg-black border-2 border-[#ff007f]/70 mb-10 shadow-[2.5px_2.5px_0px_rgba(0,240,255,0.6)]">
            <Quote className="w-4 h-4 text-[#ff007f] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#00f0ff] italic font-sans leading-relaxed select-none">
              {question.humorTip}
            </p>
          </div>

          {/* Likert Selection Nodes - Horizontal on desktop, Vertical/Adaptive on Mobile */}
          <div className="mb-10">
            {/* Desktop Horizontal Likert Layout */}
            <div className="hidden sm:flex justify-between items-center relative py-6">
              {/* Horizontal Connecting Guide Line */}
              <div className="absolute left-4 right-4 h-1 bg-[#ff007f] -translate-y-4 shadow-[0_0_8px_rgba(255,0,127,0.5)]" />
              
              {options.map((option) => {
                const isSelected = selectedAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => onSelectAnswer(option.value)}
                    className="flex flex-col items-center relative z-10 group"
                    style={{ width: '80px' }}
                  >
                    <div
                      className={`w-11 h-11 rounded-none border-2 flex items-center justify-center transition-all duration-150 -translate-y-4 font-pixel text-[13px]
                        ${isSelected 
                          ? 'bg-[#ffe600] border-white text-black font-black scale-110 shadow-[3px_3px_0px_rgba(255,0,127,0.7)]' 
                          : `${option.color} scale-100 group-hover:scale-105 active:translate-y-[-14px]`
                        }`}
                    >
                      {option.value}
                    </div>
                    <span
                      className={`text-[13px] font-pixel transition-colors duration-150 absolute -bottom-1 whitespace-nowrap
                        ${isSelected ? 'text-[#00f0ff] font-bold glow-cyan' : 'text-slate-400 group-hover:text-white'}`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Vertical List Layout */}
            <div className="flex sm:hidden flex-col gap-3">
              {options.map((option) => {
                const isSelected = selectedAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => onSelectAnswer(option.value)}
                    className={`w-full p-4 rounded-none border-2 flex items-center justify-between text-left transition-all duration-150 select-none
                      ${isSelected
                        ? 'bg-[#121b33] border-[#00f0ff] shadow-[4px_4px_0px_#ff007f]'
                        : 'bg-black border-slate-800 hover:border-[#00f0ff] hover:shadow-[2px_2px_0px_#00f0ff]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-none border-2 flex items-center justify-center font-pixel text-[13px]
                        ${isSelected
                          ? 'bg-[#ffe600] text-black border-white'
                          : 'bg-black border-slate-800 text-slate-400'
                        }`}
                      >
                        {option.value}
                      </span>
                      <span className={`text-[13px] font-mono font-bold ${isSelected ? 'text-[#00f0ff]' : 'text-slate-350'}`}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-3.5 h-3.5 bg-[#ff007f] animate-pulse border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Lower Controls */}
          <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
            <button
               onClick={onPrev}
               disabled={currentIndex === 0}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-none text-sm font-pixel uppercase transition-all select-none border-2 pixel-btn-active
                 ${currentIndex === 0 
                   ? 'border-slate-800 text-slate-700 cursor-not-allowed opacity-30 shadow-none' 
                   : 'border-[#ff007f]/70 text-[#ff007f] hover:bg-[#ff007f]/10 shadow-[2px_2px_0px_rgba(255,0,127,0.3)] hover:text-white'
                 }`}
            >
              <ArrowLeft className="w-4 h-4" />
              PREV
            </button>

            <button
              onClick={onNext}
              disabled={selectedAnswer === undefined}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-none text-sm font-pixel uppercase transition-all select-none border-2 pixel-btn-active
                ${selectedAnswer === undefined
                  ? 'border-slate-800 text-slate-705 cursor-not-allowed opacity-30 shadow-none'
                  : 'border-[#00f0ff]/70 text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:text-white shadow-[2px_2px_0px_rgba(0,240,255,0.3)]'
                }`}
            >
              NEXT
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
