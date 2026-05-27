/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, UserAnswers, DimensionScore, AllDimensionId, AllPolarityKey } from './types';
import { questionsGeneral, dimensionMeta } from './data/questions';
import QuestionCard from './components/QuestionCard';
import ResultsDisplay from './components/ResultsDisplay';
import CognitiveHandbook from './components/CognitiveHandbook';
import { GraduationCap, ChevronRight, BookOpen } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'home' | 'test' | 'result'>('home');
  const [category, setCategory] = useState<Category | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showHandbook, setShowHandbook] = useState<boolean>(false);

  // 固定为通用版（隐藏程序员版）
  const activeCategory: Category = 'general';

  // 1. Initial mounting check for shared URLs and state restore
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCategory = params.get('category') as Category | null;
      const urlAnswersStr = params.get('answers');

      // (A) Check if shared via URL parameters first
      if (urlCategory === 'general' && urlAnswersStr) {
        const parsedAnswers: UserAnswers = {};
        urlAnswersStr.split(',').forEach(pair => {
          const parts = pair.split(':');
          if (parts.length === 2) {
            const qid = parseInt(parts[0], 10);
            const val = parseInt(parts[1], 10);
            if (!isNaN(qid) && !isNaN(val)) {
              parsedAnswers[qid] = val;
            }
          }
        });

        if (Object.keys(parsedAnswers).length > 0) {
          setCategory('general');
          setAnswers(parsedAnswers);
          setView('result');
          return;
        }
      }

      // (B) Fallback: Restoring states from sessionStorage
      const savedCategory = sessionStorage.getItem('cognistyle_category') as Category | null;
      const savedAnswersRaw = sessionStorage.getItem('cognistyle_answers');
      const savedIdxRaw = sessionStorage.getItem('cognistyle_index');
      const savedView = sessionStorage.getItem('cognistyle_view') as 'home' | 'test' | 'result' | null;

      if (savedCategory === 'general' && savedAnswersRaw) {
        const parsedAnswers = JSON.parse(savedAnswersRaw) as UserAnswers;
        setCategory('general');
        setAnswers(parsedAnswers);
        
        if (savedView === 'result') {
          setView('result');
        } else if (savedView === 'test') {
          const parsedIdx = parseInt(savedIdxRaw || '0', 10);
          setCurrentQuestionIdx(isNaN(parsedIdx) ? 0 : parsedIdx);
          setView('test');
        }
      }
    } catch (err) {
      console.error('Session state recovery failed:', err);
    }
  }, []);

  // Write status backups to sessionStorage on change
  useEffect(() => {
    if (view === 'home') {
      sessionStorage.removeItem('cognistyle_category');
      sessionStorage.removeItem('cognistyle_answers');
      sessionStorage.removeItem('cognistyle_index');
      sessionStorage.removeItem('cognistyle_view');
    } else {
      sessionStorage.setItem('cognistyle_category', 'general');
      sessionStorage.setItem('cognistyle_answers', JSON.stringify(answers));
      sessionStorage.setItem('cognistyle_index', currentQuestionIdx.toString());
      sessionStorage.setItem('cognistyle_view', view);
    }
  }, [view, answers, currentQuestionIdx]);

  // Questions set selector - 固定为通用版
  const questions = questionsGeneral;

  // 2. Start Test (Home page)
  const handleStartTest = () => {
    setCategory('general');
    setCurrentQuestionIdx(0);
    setAnswers({});
    setView('test');
  };

  // 3. Selection mapping handlers
  const handleSelectAnswer = (value: number) => {
    const currentQuestion = questions[currentQuestionIdx];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    if (currentQuestionIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
      }, 280);
    }
  };

  useEffect(() => {
    if (view !== 'test') return;
    if (questions.length === 0) return;
    const lastId = questions[questions.length - 1].id;
    if (answers[lastId] === undefined) return;

    const timer = setTimeout(() => {
      const serialized = Object.entries(answers)
        .map(([qid, val]) => `${qid}:${val}`)
        .join(',');
      window.history.pushState(null, '', `?category=general&answers=${serialized}`);
      setView('result');
    }, 280);

    return () => clearTimeout(timer);
  }, [answers, view, questions]);

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleReset = () => {
    // Clear Session storage & Clean URL parameters state gracefully
    window.history.pushState(null, '', window.location.pathname);
    sessionStorage.clear();
    setAnswers({});
    setCategory(null);
    setCurrentQuestionIdx(0);
    setView('home');
  };

  // 4. Score Math calculations
  // Dimensions order maps questions exactly
  const getResultsData = (): { scoreMap: Record<string, number>; scores: (DimensionScore & { percentage: number })[] } => {
    const scoreMap: Record<string, number> = {};
    const dimQuestionsCount: Record<string, number> = {};

    questions.forEach(q => {
      const qid = q.id;
      const userAns = answers[qid] ?? 3;
      const meta = dimensionMeta[q.dimension];

      let points = 0;
      if (q.direction === meta.rightPolarity.key) {
        points = (userAns - 1) * 1.25;
      } else {
        points = (5 - userAns) * 1.25;
      }

      scoreMap[q.dimension] = (scoreMap[q.dimension] ?? 0) + points;
      dimQuestionsCount[q.dimension] = (dimQuestionsCount[q.dimension] ?? 0) + 1;
    });

    const computeStrength = (normalized: number): 'slight' | 'moderate' | 'strong' => {
      const dominance = Math.abs(normalized - 50);
      if (dominance > 25) return 'strong';
      if (dominance > 10) return 'moderate';
      return 'slight';
    };

    const scores = Object.entries(dimensionMeta)
      .filter(([id]) => dimQuestionsCount[id] > 0)
      .map(([id, meta]) => {
        const count = dimQuestionsCount[id];
        const maxScore = count * 5;
        const rawScore = scoreMap[id] ?? (maxScore / 2);
        const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 50;
        const normalizedScore = Math.round(percentage);
        const isRightActive = percentage >= 50;
        const polarity = (isRightActive ? meta.rightPolarity.key : meta.leftPolarity.key) as AllPolarityKey;

        return {
          id: id as AllDimensionId,
          label: meta.label,
          rawScore,
          normalizedScore,
          polarity,
          strength: computeStrength(normalizedScore),
          percentage,
        };
      });

    return { scoreMap, scores };
  };

  const { scoreMap, scores } = view === 'result' ? getResultsData() : { scoreMap: {}, scores: [] };

  return (
    <div className="min-h-screen bg-[#050814] grid-overlay text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Retro scanline layer */}
      <div className="scanlines" />

      {/* Background radial space-slate lighting atmosphere */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.04)_0%,rgba(255,0,127,0.03)_50%,rgba(0,0,0,0)_85%)] pointer-events-none" />

      {/* 第七区城市剪影背景 */}
      <div className="fixed bottom-0 left-0 right-0 h-32 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1200 120" className="w-full h-full fill-[#00f0ff]">
          <path d="M0,120 L0,80 L40,80 L40,60 L80,60 L80,40 L120,40 L120,20 L160,20 L160,50 L200,50 L200,30 L240,30 L240,70 L280,70 L280,10 L320,10 L320,60 L360,60 L360,40 L400,40 L400,80 L440,80 L440,25 L480,25 L480,55 L520,55 L520,35 L560,35 L560,75 L600,75 L600,15 L640,15 L640,65 L680,65 L680,45 L720,45 L720,85 L760,85 L760,20 L800,20 L800,70 L840,70 L840,50 L880,50 L880,90 L920,90 L920,30 L960,30 L960,60 L1000,60 L1000,40 L1040,40 L1040,80 L1080,80 L1080,55 L1120,55 L1120,95 L1160,95 L1160,35 L1200,35 L1200,120 Z" />
        </svg>
      </div>

      {/* Header section - 第七区世界观 */}
      <header className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex items-center justify-between select-none relative z-10 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#ff007f] border-2 border-white flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-[3px_3px_0px_#00f0ff] font-pixel animate-pulse shrink-0">
            7
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-3xl font-black tracking-widest text-[#00f0ff] glow-cyan font-display uppercase leading-none">
              SECTOR 7
            </span>
            <span className="text-xs sm:text-xs font-pixel text-[#ff007f] tracking-widest hidden sm:inline">
              COGNITIVE PLACEMENT
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHandbook(true)}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 border-2 border-[#39ff14] bg-black text-[#39ff14] font-pixel text-xs sm:text-xs hover:bg-[#39ff14]/15 focus:outline-none transition-all cursor-pointer shadow-[2.5px_2.5px_0px_#00f0ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#00f0ff] min-h-[40px] sm:min-h-0"
          >
            <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>职业图鉴</span>
          </button>
        </div>
      </header>

      {/* Main Orchestrator Canvas */}
      <main className="flex-grow flex items-center justify-center p-2 sm:p-4 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME VIEW - 单卡片居中 */}
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-lg mx-auto text-center"
            >
              {/* 世界观标签 */}
              <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 bg-black/85 border-2 border-[#ff007f] px-3 sm:px-4 py-1.5 text-xs sm:text-xs font-pixel font-bold text-[#ff007f] uppercase select-none shadow-[3px_3px_0px_#00f0ff]">
                <span className="inline-block w-2 h-2 bg-[#39ff14] animate-pulse" />
                2147 · 后企业时代 · 认知适配协议
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-white mb-3 sm:mb-4 font-display uppercase leading-none">
                接入{' '}
                <span className="text-[#00f0ff] glow-cyan animate-pulse">
                  职业分配系统
                </span>
              </h1>
              
              <p className="text-slate-400 text-[13px] sm:text-sm font-sans max-w-md mx-auto mb-8 sm:mb-12 leading-relaxed select-none">
                第七区需要每一位公民找到最适合自己的位置。通过认知适配协议，我们将为你匹配最契合的职能身份——从应急局的抢险前线，到生科所的微观深渊。
              </p>

              {/* 单卡片 - 通用版独占 */}
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleStartTest}
                  className="group w-full bg-[#070b19]/90 hover:bg-[#0c1229] border-4 border-[#ff007f] p-4 sm:p-6 md:p-8 shadow-[6px_6px_0px_0px_#00f0ff] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#00f0ff] hover:shadow-[8px_8px_0px_0px_#00f0ff] transition-all duration-150 flex flex-col justify-between text-left relative select-none cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-3">
                    <span className="text-[11px] font-pixel px-2 py-0.5 bg-black border border-[#39ff14] text-[#39ff14] uppercase glow-green">
                      标准局备案
                    </span>
                  </div>

                  <div>
                    <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-[#ff007f] mb-6 shadow-[3px_3px_0px_#00f0ff] group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6 text-[#ff007f]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2 group-hover:text-[#ff007f] transition-colors font-display tracking-widest uppercase">
                      通用认知适配
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-xs leading-relaxed mb-3 sm:mb-4 font-sans">
                      基于日常生活场景——旅行规划、购物决策、学习新技能——测绘你的原生态思维底色。适配结果将关联第七区八大职能部门的职业定位。
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-pixel text-[#ff007f] mt-2 group-hover:translate-x-1 transition-transform">
                    [ 启动适配协议 ]
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
              
              {/* 底部安全声明 - 世界观化 */}
              <div className="mt-8 sm:mt-14 text-[11px] sm:text-xs font-pixel text-[#00f0ff]/60 tracking-widest uppercase flex items-center justify-center gap-2 bg-[#0c1229]/60 border border-[#00f0ff]/20 max-w-md mx-auto py-2.5 px-3 sm:px-4 select-none">
                <span className="w-2 h-2 bg-[#39ff14] rounded-none animate-ping" />
                <span>SECTOR 7 SECURE / NO TELEMETRY TO CORPORATE OVERLORDS</span>
              </div>
            </motion.div>
          )}

          {/* 2. TESTING/QUESTIONS VIEW */}
          {view === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <QuestionCard
                question={questions[currentQuestionIdx]}
                currentIndex={currentQuestionIdx}
                totalQuestions={questions.length}
                selectedAnswer={answers[questions[currentQuestionIdx].id]}
                onSelectAnswer={handleSelectAnswer}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            </motion.div>
          )}

          {/* 3. FINAL RESULTS VIEW */}
          {view === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <ResultsDisplay
                scoreMap={scoreMap}
                scores={scores}
                category="general"
                onReset={handleReset}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showHandbook && (
          <CognitiveHandbook onClose={() => setShowHandbook(false)} />
        )}
      </AnimatePresence>

      {/* Footer section - 世界观化 */}
      <footer className="w-full text-center py-4 sm:py-6 text-xs sm:text-xs font-mono text-stone-600 select-none px-2">
        SECTOR 7 COGNITIVE PLACEMENT BUREAU · EST. 2147 · NO CORPORATE AFFILIATION
      </footer>
    </div>
  );
}