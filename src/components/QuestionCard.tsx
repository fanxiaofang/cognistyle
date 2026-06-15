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
  const isBipolar = !!(question.leftText && question.rightText);

  // 4-option bipolar — no neutral, endpoints larger
  const bipolarOptions = [
    { value: 1, label: '强', color: '#0066ff' },
    { value: 2, label: '偏', color: '#3388ff' },
    { value: 3, label: '偏', color: '#00cccc' },
    { value: 4, label: '强', color: '#00f0ff' },
  ];
  // Likert fallback (programmer version)
  const likertOptions = [
    { value: 1, label: '非常不同意', color: '#ff007f' },
    { value: 2, label: '不同意', color: '#ff4488' },
    { value: 3, label: '中立', color: '#666666' },
    { value: 4, label: '同意', color: '#00cccc' },
    { value: 5, label: '非常同意', color: '#00f0ff' },
  ];
  const options = isBipolar ? bipolarOptions : likertOptions;

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const isEndpoint = (idx: number) => idx === 0 || idx === options.length - 1;

  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-6 py-1.5 sm:py-4 font-mono">
      {/* Progress Bar */}
      <div className="w-full h-1.5 sm:h-2.5 bg-black border border-[#00f0ff]/20 p-px mb-2 sm:mb-3 overflow-hidden shadow-[0_0_5px_rgba(0,240,255,0.05)] shrink-0">
        <motion.div
          className="h-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Progress Info */}
      <div className="flex justify-center text-[11px] sm:text-sm text-slate-400 mb-2 sm:mb-4 select-none font-mono shrink-0">
        <span className="text-[#39ff14] font-bold glow-green">{currentIndex + 1}/{totalQuestions}</span>
      </div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="bg-[#070b19] border border-white/10 p-3 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,240,255,0.15)] relative select-none"
        >
          {/* Cyber Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00f0ff]/70 pointer-events-none" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00f0ff]/70 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00f0ff]/70 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00f0ff]/70 pointer-events-none" />

          {/* Question Text */}
          <h2 className="text-sm sm:text-xl md:text-2xl font-mono font-bold leading-snug text-white mb-3 sm:mb-6 select-none flex items-start gap-1.5 sm:gap-2">
            <span className="text-[#00f0ff] shrink-0 font-bold animate-pulse mt-0.5">&gt;</span>
            <span>{question.prompt || question.text}</span>
          </h2>

          {/* ============================ Bipolar pole labels ============================ */}
          {isBipolar ? (
            /* ── Mobile: vertical stack ── */
            <div className="sm:hidden mb-2 select-none">
              <div className="mb-1.5">
                <span className="text-[#0066ff] font-bold text-xs">← {question.leftText}</span>
              </div>
            </div>
          ) : null}
          {isBipolar ? (
            /* ── Desktop: horizontal labels ── */
            <div className="hidden sm:flex justify-between items-start gap-2 mb-4 sm:mb-5 select-none">
              <span className="text-[#0066ff] font-bold text-sm sm:text-base leading-tight flex-1">
                ← {question.leftText}
              </span>
              <span className="text-[#00f0ff] font-bold text-sm sm:text-base text-right leading-tight flex-1">
                {question.rightText} →
              </span>
            </div>
          ) : (
            /* Non-bipolar: no pole labels */
            <div className="mb-2" />
          )}

          {/* ============================ Scale ============================ */}
          <div className={isBipolar ? 'mb-1.5 sm:mb-5' : 'mb-3 sm:mb-6'}>
            {/* Dot track */}
            <div className="flex items-center justify-center gap-0">
              {options.map((option, idx) => {
                const isSelected = selectedAnswer === option.value;
                const isPast = selectedAnswer !== undefined && option.value < selectedAnswer;
                const isLast = idx === options.length - 1;
                const endpoint = isBipolar && isEndpoint(idx);
                const dotSize = endpoint ? 'sm:w-7 sm:h-7 w-4 h-4' : 'sm:w-5 sm:h-5 w-3 h-3';

                return (
                  <React.Fragment key={option.value}>
                    {/* Dot button */}
                    <button
                      onClick={() => onSelectAnswer(option.value)}
                      className="relative z-10 flex flex-col items-center group shrink-0 py-1.5 sm:py-3"
                      style={{ width: isBipolar ? 'clamp(52px, 8vw, 80px)' : 'clamp(72px, 12vw, 100px)' }}
                    >
                      <div
                        className={`${dotSize} rounded-full transition-all duration-200`}
                        style={{
                          backgroundColor: isSelected ? option.color : isPast ? option.color + '88' : option.color + (endpoint ? '33' : '22'),
                          boxShadow: isSelected
                            ? `0 0 ${endpoint ? '14px' : '10px'} ${option.color}, 0 0 ${endpoint ? '24px' : '16px'} ${option.color}55`
                            : 'none',
                          transform: isSelected ? `scale(${endpoint ? 1.35 : 1.25})` : 'scale(1)',
                          border: isSelected ? `2px solid ${option.color}` : isPast ? `1.5px solid ${option.color}55` : `1.5px solid ${option.color}${endpoint ? '66' : '44'}`,
                        }}
                      />
                    </button>

                    {/* Connecting line */}
                    {!isLast && (
                      <div className="flex-1 h-[4px] sm:h-[5px] relative" style={{ maxWidth: isBipolar ? 'clamp(48px, 8vw, 80px)' : 'clamp(88px, 12vw, 100px)' }}>
                        <div className="absolute inset-0 rounded-full bg-slate-800" />
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            background: isBipolar
                              ? `linear-gradient(to right, ${options[idx].color}, ${options[idx + 1].color})`
                              : `linear-gradient(to right, ${options[idx].color}, ${options[idx + 1].color})`,
                          }}
                          initial={{ width: '0%' }}
                          animate={{ width: isPast ? '100%' : '0%' }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

          </div>

          {/* ============================ Mobile right pole label ============================ */}
          {isBipolar && (
            <div className="sm:hidden mb-2 text-right select-none">
              <span className="text-[#00f0ff] font-bold text-xs">{question.rightText} →</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-2 sm:pt-4 border-t border-slate-800/50">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-none text-[11px] sm:text-sm font-mono uppercase transition-all duration-150 select-none border min-h-[40px] sm:min-h-0
                 ${currentIndex === 0
                  ? 'border-slate-800 text-slate-600 bg-black/20 cursor-not-allowed'
                  : 'border-slate-700 text-slate-300 hover:border-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              上一题
            </button>

            <button
              onClick={onNext}
              disabled={selectedAnswer === undefined}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-none text-[11px] sm:text-sm font-mono uppercase transition-all duration-150 select-none border min-h-[40px] sm:min-h-0
                ${selectedAnswer === undefined
                  ? 'border-slate-800 text-slate-600 bg-black/20 cursor-not-allowed'
                  : 'border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                }`}
            >
              下一题
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
