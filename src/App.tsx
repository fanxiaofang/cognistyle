/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, UserAnswers, DimensionScore, AllDimensionId, AllPolarityKey, ARCHETYPE_KEYS } from './types';
import { questionsGeneral, dimensionMeta } from './data/questions';
import QuestionCard from './components/QuestionCard';
import ResultsDisplay from './components/ResultsDisplay';
import CognitiveHandbook from './components/CognitiveHandbook';
import DualReportPage from './pages/DualReportPage';
import PublicSharePage from './pages/PublicSharePage';
import DualHistoryPage from './pages/DualHistoryPage';
import { ChevronsRight, BookOpen, History } from 'lucide-react';

type AppRoute =
  | { kind: 'main' }
  | { kind: 'dual'; targetFriendId: string | null }
  | { kind: 'share'; token: string | null }
  | { kind: 'history' };

function getCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return { kind: 'main' };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);

  if (pathname === '/dual') {
    return {
      kind: 'dual',
      targetFriendId: params.get('friend'),
    };
  }

  if (pathname === '/history') {
    return { kind: 'history' };
  }

  if (pathname.startsWith('/share/')) {
    return {
      kind: 'share',
      token: pathname.split('/').filter(Boolean)[1] || null,
    };
  }

  return { kind: 'main' };
}

export default function App() {
  const [view, setView] = useState<'home' | 'test' | 'result'>('home');
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute());
  const [category, setCategory] = useState<Category | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showHandbook, setShowHandbook] = useState<boolean>(false);

  // 固定为通用版（隐藏程序员版）
  const activeCategory: Category = 'general';

  // 1. Initial mounting check for shared URLs and state restore
  useEffect(() => {
    const syncRoute = () => setRoute(getCurrentRoute());
    window.addEventListener('popstate', syncRoute);

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

    return () => {
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  // Write status backups to sessionStorage on change
  useEffect(() => {
    if (route.kind !== 'main') return;

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
  }, [route.kind, view, answers, currentQuestionIdx]);

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

  const buildResultUrl = () => {
    const serialized = Object.entries(answers)
      .map(([qid, val]) => `${qid}:${val}`)
      .join(',');

    return serialized ? `/?category=general&answers=${serialized}` : '/';
  };

  const handleOpenDualReport = (targetFriendId: string) => {
    const nextUrl = `/dual?friend=${encodeURIComponent(targetFriendId)}`;
    window.history.pushState(null, '', nextUrl);
    setRoute({
      kind: 'dual',
      targetFriendId,
    });
  };

  const handleBackFromDual = () => {
    const fallbackUrl = buildResultUrl();
    window.history.pushState(null, '', fallbackUrl);
    setRoute({ kind: 'main' });
  };

  const handleBackFromShare = () => {
    window.history.pushState(null, '', '/');
    setRoute({ kind: 'main' });
  };

  const handleBackFromHistory = () => {
    window.history.pushState(null, '', buildResultUrl() || '/');
    setRoute({ kind: 'main' });
  };

  const handleOpenHistory = () => {
    window.history.pushState(null, '', '/history');
    setRoute({ kind: 'history' });
  };

  // 4. Score Math calculations
  // Dimensions order maps questions exactly
  const getResultsData = (): { scoreMap: Record<string, number>; scores: (DimensionScore & { percentage: number })[]; primaryArchetype: { key: string; matchScore: number }; secondaryArchetype: { key: string; matchScore: number } } => {
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

    const archetypeMatches = ARCHETYPE_KEYS.map(key => {
      const parts = key.split('-');
      const expectedPolars = [
        parts[0] === 'I' ? 0 : 100,
        parts[1] === 'C' ? 0 : 100,
        parts[2] === 'W' ? 0 : 100,
      ];
      
      const getNormalized = (id: string) => {
        const s = scores.find(s => s.id === id);
        return s ? s.normalizedScore : 50;
      };

      const actualPercents = [
        getNormalized('impulsive_reflective'),
        getNormalized('convergent_divergent'),
        getNormalized('wholistic_analytic'),
      ];
      
      const distance = Math.sqrt(
        expectedPolars.reduce((sum, target, idx) => sum + Math.pow(target - actualPercents[idx], 2), 0)
      );
      
      const matchScore = Math.max(0, Math.round(100 - (distance / 173.2) * 100));
      return { key, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const primaryArchetype = archetypeMatches[0] || { key: 'I-C-W', matchScore: 100 };
    const secondaryArchetype = archetypeMatches[1] || { key: 'I-C-A', matchScore: 80 };

    return { scoreMap, scores, primaryArchetype, secondaryArchetype };
  };

  const { scoreMap, scores, primaryArchetype, secondaryArchetype } = view === 'result' ? getResultsData() : { scoreMap: {}, scores: [], primaryArchetype: {key:'', matchScore:0}, secondaryArchetype: {key:'', matchScore:0} };

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
          {/* Logo Badge */}
          <div className="relative group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#ff007f] to-[#ff007f]/80 border-2 border-[#00f0ff] flex items-center justify-center font-bold text-white text-base sm:text-xl shadow-[4px_4px_0px_rgba(0,240,255,0.6)] font-pixel shrink-0 relative overflow-hidden">
              <span className="relative z-10">7</span>
              {/* Animated pulse effect */}
              <div className="absolute inset-0 bg-[#00f0ff]/20 animate-pulse" />
            </div>
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-[#ff007f] blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          </div>

          {/* Title Section */}
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-widest text-[#00f0ff] glow-cyan font-display uppercase leading-none">
                SECTOR 7
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#ffe600]/70 tracking-wider mt-0.5 uppercase">
              Cognitive Adaptation Protocol
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleOpenHistory}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-[#ffe600]/60 bg-black/80 text-[#ffe600] font-sans text-xs sm:text-[13px] hover:bg-[#ffe600]/10 hover:border-[#ffe600] focus:outline-none transition-all cursor-pointer shadow-[0_0_8px_rgba(255,230,0,0.2)] hover:shadow-[0_0_15px_rgba(255,230,0,0.4)] active:scale-95 min-h-[40px] sm:min-h-0 font-medium"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">测试历史</span>
            <span className="sm:hidden">历史</span>
          </button>
          <button
            onClick={() => setShowHandbook(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-[#39ff14]/60 bg-black/80 text-[#39ff14] font-sans text-xs sm:text-[13px] hover:bg-[#39ff14]/10 hover:border-[#39ff14] focus:outline-none transition-all cursor-pointer shadow-[0_0_8px_rgba(57,255,20,0.2)] hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] active:scale-95 min-h-[40px] sm:min-h-0 font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">职业图鉴</span>
            <span className="sm:hidden">图鉴</span>
          </button>
        </div>
      </header>

      {/* Main Orchestrator Canvas */}
      <main className="flex-grow flex items-center justify-center p-2 sm:p-4 relative z-10">
        <AnimatePresence mode="wait">
          
          {route.kind === 'dual' && (
            <motion.div
              key="dual"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <DualReportPage
                targetFriendId={route.targetFriendId}
                onBack={handleBackFromDual}
              />
            </motion.div>
          )}

          {route.kind === 'share' && (
            <motion.div
              key="share"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <PublicSharePage token={route.token} onBack={handleBackFromShare} />
            </motion.div>
          )}

          {route.kind === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <DualHistoryPage
                onBack={handleBackFromHistory}
                onOpenReport={handleOpenDualReport}
              />
            </motion.div>
          )}

          {/* 1. HOME VIEW - 单卡片居中 */}
          {route.kind === 'main' && view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-lg mx-auto text-center"
            >
              {/* 世界观标签 */}
              <div className="mb-3 sm:mb-4 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-mono text-slate-500 select-none">
                2147 · 后企业时代
              </div>
              
              <h1 className="text-xl sm:text-3xl font-black tracking-widest text-white mb-2 sm:mb-3 font-display uppercase leading-none">
                接入{' '}
                <span className="text-[#00f0ff]">
                  认知适配协议
                </span>
              </h1>
              
              <p className="text-slate-400 text-[13px] sm:text-sm font-sans max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed select-none">
                {/* 认知适配协议将测绘你的原生态思维底色，帮助你发现自己的认知偏好与思维模式。理解你的风格，是找到最适合位置的第一步。 */}
                第七区需要每一位公民找到最适合自己的位置。通过认知适配协议，测绘你的原生态思维底色，适配结果将关联第七区八大职能部门的职业定位
              </p>

              {/* 单卡片 - 通用版独占 */}
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleStartTest}
                  className="group w-full bg-[#070b19]/90 hover:bg-[#0c1229] border border-white/10 p-4 sm:p-6 md:p-8 shadow-[6px_6px_0px_0px_#00f0ff] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#00f0ff] hover:shadow-[8px_8px_0px_0px_#00f0ff] transition-all duration-150 flex flex-col justify-between text-left relative select-none cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-3">
                    <span className="text-[11px] font-pixel px-2 py-0.5 bg-black border border-[#39ff14]/60 text-[#39ff14]/80 uppercase">
                      标准局备案
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-base sm:text-lg font-mono text-[#00f0ff] mt-2 group-hover:translate-x-1.5 transition-transform tracking-wide">
                    启动适配协议
                    <ChevronsRight className="w-5 h-5 animate-pulse" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-mono text-slate-600 mt-2 tracking-wider select-none text-right">
                    约 3 分钟 · 20 题
                  </p>
                </button>

              </div>

              
              {/* 底部安全声明 - 世界观化
              <div className="mt-8 sm:mt-14 text-[11px] sm:text-xs font-pixel text-[#00f0ff]/60 tracking-widest uppercase flex items-center justify-center gap-2 bg-[#0c1229]/60 border border-[#00f0ff]/20 max-w-md mx-auto py-2.5 px-3 sm:px-4 select-none">
                <span className="w-2 h-2 bg-[#39ff14] rounded-none animate-ping" />
                <span>SECTOR 7 SECURE / NO TELEMETRY TO CORPORATE OVERLORDS</span>
              </div> */}
            </motion.div>
          )}

          {/* 2. TESTING/QUESTIONS VIEW */}
          {route.kind === 'main' && view === 'test' && (
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
          {route.kind === 'main' && view === 'result' && (
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
                primaryArchetype={primaryArchetype}
                secondaryArchetype={secondaryArchetype}
                onReset={handleReset}
                onOpenDualReport={handleOpenDualReport}
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
