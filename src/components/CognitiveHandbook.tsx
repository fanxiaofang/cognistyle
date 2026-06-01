/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cognitiveProfiles } from '../data/suggestions';
import PixelAvatar from './PixelAvatar';
import { 
  BookOpen, 
  X, 
  Compass, 
  ShieldCheck, 
  Binary, 
  Cpu, 
  Sparkles, 
  CornerDownRight, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface CognitiveHandbookProps {
  onClose: () => void;
}

interface GuildMember {
  profileId: string;
  callSign: string;
  department: string;
  role: string;
}

interface Guild {
  id: string;
  name: string;
  english: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  shadowColor: string;
  glowClass: string;
  description: string;
  members: GuildMember[];
  factionLore: string;
  cognitiveEssence: string;
}

const GUILDS: Guild[] = [
  {
    id: 'overlords',
    name: '筑基者',
    english: 'The Standard Architects',
    icon: Compass,
    color: 'text-[#00f0ff]',
    borderColor: 'border-[#00f0ff]/70',
    shadowColor: 'shadow-[0_0_10px_rgba(0,240,255,0.25)]',
    glowClass: 'glow-cyan',
    description: '第七区总控中心与应急局的脊梁。他们用经过验证的标准协议搭建城市骨架——无论是灾区的临时秩序，还是城市网络的长期稳定。他们相信：秩序不是束缚，而是让系统在崩坏边缘仍能运转的底线。',
    members: [
      { profileId: 'I-C-W-S', callSign: '先遣机师', department: '应急局', role: '单兵特勤' },
      { profileId: 'I-C-W-T', callSign: '应急指挥官', department: '应急局', role: '前线指挥' },
      { profileId: 'R-C-W-S', callSign: '孤星观测员', department: '总控中心', role: '塔楼守望' },
      { profileId: 'R-C-W-T', callSign: '监控指挥官', department: '总控中心', role: '系统调度' }
    ],
    factionLore: '筑基者不追求惊艳，他们追求"明天醒来，城市还在"。当探路者在禁区点燃篝火时，是筑基者确保了电网没有过载；当炼金师推敲基因序列时，是筑基者守护着伦理协议的边界。他们是第七区最不被看见、却最不可缺的阶层。',
    cognitiveEssence: '聚合 × 整体：用标准方案搭建宏观骨架'
  },
  {
    id: 'sentry',
    name: '守门人',
    english: 'The Quality Guardians',
    icon: ShieldCheck,
    color: 'text-[#ffe600]',
    borderColor: 'border-[#ffe600]/70',
    shadowColor: 'shadow-[0_0_10px_rgba(255,230,0,0.25)]',
    glowClass: 'glow-yellow',
    description: '第七区医疗部与标准局的最后防线。他们深入微观细节，用严谨的规范确保每个单元无懈可击——从战地缝合的每一针，到城市底层协议的每一个参数。漏洞和瑕疵在他们眼中不是"可容忍的风险"，而是"必须消灭的敌人"。',
    members: [
      { profileId: 'I-C-A-S', callSign: '战地孤医', department: '医疗部', role: '前线速修' },
      { profileId: 'I-C-A-T', callSign: '战地医官长', department: '医疗部', role: '总线协调' },
      { profileId: 'R-C-A-S', callSign: '孤夜守灯人', department: '标准局', role: '调校师' },
      { profileId: 'R-C-A-T', callSign: '质检指挥官', department: '标准局', role: '质检总长' }
    ],
    factionLore: '守门人的存在让第七区得以"精确运转"。他们不是规则的制定者，而是规则的校准仪。当筑基者搭建骨架时，守门人检查每一颗螺丝的扭矩；当探路者带回新发现时，守门人评估它是否会破坏现有系统的稳定性。他们常被误解为"保守"，但城市知道：没有他们，任何创新都是定时炸弹。',
    cognitiveEssence: '聚合 × 分析：用标准规范守护微观精度'
  },
  {
    id: 'explorers',
    name: '探路者',
    english: 'The Visionary Pathfinders',
    icon: Cpu,
    color: 'text-[#39ff14]',
    borderColor: 'border-[#39ff14]/70',
    shadowColor: 'shadow-[0_0_10px_rgba(57,255,20,0.25)]',
    glowClass: 'glow-green',
    description: '第七区边界署与遗迹司的先驱。他们拒绝官方叙事的边界，在禁区与废墟中寻找被删除的真相。他们相信：最好的答案不在现有选项之中，而在"此处以下，尚未探索"的黑暗里。',
    members: [
      { profileId: 'I-D-W-S', callSign: '禁区游侠', department: '边界署', role: '独行勘探' },
      { profileId: 'I-D-W-T', callSign: '拓荒领队', department: '边界署', role: '开拓小队' },
      { profileId: 'R-D-W-S', callSign: '独行勘探员', department: '遗迹司', role: '废墟猎人' },
      { profileId: 'R-D-W-T', callSign: '考古领队', department: '遗迹司', role: '发掘主管' }
    ],
    factionLore: '探路者是第七区的"未来债务"与"未来资产"。他们消耗大量资源探索可能一无所获的禁区，但每一次成功发现都可能改变城市的命运。筑基者视他们为"不稳定因素"，守门人视他们为"规范破坏者"，但所有人都知道：当现有系统走到尽头时，只有探路者能找到下一条路。',
    cognitiveEssence: '发散 × 整体：用创新探索突破宏观边界'
  },
  {
    id: 'alchemists',
    name: '炼金师',
    english: 'The Precision Innovators',
    icon: Binary,
    color: 'text-[#ff007f]',
    borderColor: 'border-[#ff007f]/70',
    shadowColor: 'shadow-[0_0_10px_rgba(255,0,127,0.25)]',
    glowClass: 'glow-magenta',
    description: '第七区黑市工坊与生科所的微观魔术师。他们在无人关注的角落里，用精巧的创新突破性能与逻辑的极限——从定制义体的微米级关节，到基因序列的精确编辑。他们的作品是孤品，也是艺术品。',
    members: [
      { profileId: 'I-D-A-S', callSign: '地下改装师', department: '黑市工坊', role: '独行技师' },
      { profileId: 'I-D-A-T', callSign: '创意工坊主', department: '黑市工坊', role: '定制专家' },
      { profileId: 'R-D-A-S', callSign: '碱基女巫', department: '生科所', role: '微观炼金' },
      { profileId: 'R-D-A-T', callSign: '基因织匠', department: '生科所', role: '序列统筹' }
    ],
    factionLore: '炼金师是第七区最矛盾的阶层。他们既被需要（没有他们，义体无法升级、基因病无法治愈），又被恐惧（他们的创新随时可能突破伦理边界）。筑基者试图用协议约束他们，守门人试图用标准检测他们，但炼金师知道：真正的突破，永远发生在标准制定之前。',
    cognitiveEssence: '发散 × 分析：用创新突破微观极限'
  }
];

export default function CognitiveHandbook({ onClose }: CognitiveHandbookProps) {
  const [activeGuild, setActiveGuild] = useState<string>('overlords');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return GUILDS[0].members[0]?.profileId || null;
    }
    return null;
  });

  const selectedGuild = GUILDS.find(g => g.id === activeGuild) || GUILDS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden select-none font-mono">
      {/* Background Decorative Laser Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.06)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#ffe600]" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-6xl h-dvh sm:h-[90vh] bg-[#050814] border-2 border-[#00f0ff]/80 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="flex justify-between items-center bg-[#070b19] border-b-2 border-dashed border-[#00f0ff]/40 px-3 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff]" />
            <div>
              <h2 className="text-sm sm:text-lg font-black text-white tracking-widest font-display leading-none">
                认知风格全图鉴
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 border-2 border-[#ff007f] hover:bg-[#ff007f] hover:text-white text-[#ff007f] bg-black transition-colors pointer-events-auto cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Nav - 4 Guild Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#00f0ff]/20 bg-black">
          {GUILDS.map(g => {
            const isActive = g.id === activeGuild;
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGuild(g.id);
                  setSelectedProfileId(typeof window !== 'undefined' && window.innerWidth >= 768 ? g.members[0]?.profileId || null : null);
                }}
                className={`py-2.5 sm:py-3.5 px-2 sm:px-3 flex flex-col items-center justify-center gap-0.5 sm:gap-1 border-r border-[#00f0ff]/10 text-center transition-all cursor-pointer relative min-h-[44px] sm:min-h-0
                  ${isActive 
                    ? 'bg-[#0d1428] border-b-2 border-b-[#00f0ff] font-bold text-white shadow-inner' 
                    : 'text-slate-450 hover:bg-[#070b19]/60 hover:text-slate-300'
                  }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? g.color : 'text-slate-500'}`} />
                  <span className={`text-xs ${isActive ? g.glowClass : ''} tracking-wide leading-tight`}>
                    {g.name.split(' (')[0]}
                  </span>
                </div>
                {/* <span className="text-[8px] font-pixel text-slate-500 font-normal scale-95 uppercase tracking-widest">
                  {g.english}
                </span> */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Workspace split panel: Left list of 4, Right details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#050814]/70 min-h-0">
          
          {/* Left: Interactive List of Cards */}
          <div className={`w-full md:w-[45%] lg:w-[40%] p-3 sm:p-4 border-b md:border-b-0 md:border-r border-[#00f0ff]/20 overflow-y-auto gap-3 sm:gap-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950 ${selectedProfileId ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
            {/* Guild Intro */}
            <div className={`p-3 sm:p-4 bg-black border-2 border-dashed ${selectedGuild.borderColor} rounded-none`}>
              <h3 className={`text-xs sm:text-sm font-black flex items-center gap-2 mb-1.5 ${selectedGuild.color} uppercase tracking-widest`}>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                {selectedGuild.name}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed font-sans">
                {selectedGuild.description}
              </p>
            </div>

            {/* Member cards under selected guild */}
            <div className="space-y-2 sm:space-y-3">
              {selectedGuild.members.map(member => {
                const profile = cognitiveProfiles[member.profileId];
                if (!profile) return null;
                const isSelected = selectedProfileId === member.profileId;
                return (
                  <button
                    key={member.profileId}
                    onClick={() => setSelectedProfileId(member.profileId)}
                    className={`w-full p-3 sm:p-4 border-2 text-left transition-all cursor-pointer select-none rounded-none
                      ${isSelected 
                        ? `bg-[#0e162f] ${selectedGuild.borderColor} ${selectedGuild.shadowColor}` 
                        : 'bg-black border-slate-850 hover:border-slate-700 hover:bg-[#070b19]'
                      }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`p-1 bg-black border-2 shrink-0 ${isSelected ? selectedGuild.borderColor : 'border-slate-800'}`}>
                        <PixelAvatar id={member.profileId} size={40} glow={isSelected} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5 sm:mb-1">
                          <span className="text-xs sm:text-[13px] font-pixel text-[#00f0ff] glow-cyan">{member.profileId}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-white leading-tight font-display tracking-widest">
                          {profile.displayName}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                          <span className="text-xs sm:text-[13px] font-pixel text-[#ffe600]">{member.callSign}</span>
                          <span className="text-xs sm:text-[13px] text-slate-500">|</span>
                          <span className="text-xs sm:text-[13px] text-slate-400 font-sans">{member.department}</span> 
                          <span className="text-xs sm:text-[13px] text-slate-600">·</span>
                          <span className="text-xs sm:text-[13px] text-slate-500 font-sans">{member.role}</span>
                        </div>
                        <p className="text-[11px] sm:text-[13px] text-slate-500 font-sans truncate tracking-tight mt-0.5 sm:mt-1">{profile.flavorText}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Card Profile Spec */}
          <div className="flex-1 p-4 sm:p-5 md:p-8 overflow-y-auto bg-black border-t md:border-t-0 md:border-l border-[#00f0ff]/10 relative flex flex-col scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
            <AnimatePresence mode="wait">
              {selectedProfileId ? (
                (() => {
                  const profile = cognitiveProfiles[selectedProfileId];
                  const member = selectedGuild.members.find(m => m.profileId === selectedProfileId);
                  return (
                    <motion.div
                      key={selectedProfileId}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 sm:space-y-6 flex-grow"
                    >
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setSelectedProfileId(null)}
                        className="md:hidden w-full py-2.5 border-2 border-[#00f0ff]/60 bg-black text-[#00f0ff] font-pixel text-xs hover:bg-[#00f0ff]/10 transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        ← 返回列表
                      </button>
                      {/* Identity Details Card Header */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5 pb-4 sm:pb-5 border-b border-dashed border-[#00f0ff]/30">
                        <div className={`p-1.5 bg-black border-2 ${selectedGuild.borderColor} shadow-[3px_3px_0px_rgba(5,8,20,0.6)] shrink-0`}>
                          <PixelAvatar id={selectedProfileId} size={56} />
                        </div>
                        <div className="text-center sm:text-left">
                          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                            <span className="text-[11px] sm:text-[13px] font-pixel text-[#00f0ff] glow-cyan">
                              {selectedProfileId}
                            </span>
                            {member && (
                              <span className={`text-[11px] sm:text-[13px] font-pixel px-1.5 py-0.5 border ${selectedGuild.borderColor} text-slate-300`}>
                                {member.role}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-2xl font-black text-white py-0.5 sm:py-1 font-display tracking-widest uppercase break-words">
                            {profile.displayName}
                          </h3>
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                            <span className="text-xs sm:text-[13px] text-[#ff007f] font-mono tracking-wide italic font-bold">
                              「 {profile.flavorText} 」
                            </span>
                            {member && (
                              <span className="text-[11px] sm:text-[13px] font-pixel text-[#ffe600] bg-black border border-[#ffe600]/30 px-1.5 py-0.5">
                                {member.callSign} · {member.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cognitive Essence Tag */}
                      <div className={`-mx-2 sm:-mx-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-black border-l-4 ${selectedGuild.borderColor}`}>
                        <span className="text-[11px] sm:text-[13px] font-pixel text-slate-500 uppercase tracking-widest block mb-0.5 sm:mb-1">
                          认知底层基因
                        </span>
                        <p className={`text-xs sm:text-[13px] font-bold ${selectedGuild.color} tracking-wide`}>
                          {selectedGuild.cognitiveEssence}
                        </p>
                      </div>

                      {/* Summary Narrative block */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <span className="text-[11px] sm:text-[13px] font-pixel text-slate-500 uppercase tracking-widest block">    
                          [ SYSTEM DECODER REPORT ]
                        </span>
                        <p className="text-[13px] sm:text-sm text-slate-300 leading-relaxed bg-[#070b19] p-3 sm:p-5 border border-dashed border-slate-800 font-sans shadow-inner break-words">
                          {profile.essence}
                        </p>
                      </div>

                      {/* Strengths & Weaknesses double column block */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-1 sm:pt-2">
                        {/* Strengths */}
                        <div className="bg-[#070b19]/30 border-2 border-[#122e23] p-4">
                          <h4 className="text-xs sm:text-[13px] font-pixel text-[#39ff14] flex items-center gap-1.5 mb-3 uppercase tracking-wider glow-green">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#39ff14]" />
                            核心优势
                          </h4>
                          <ul className="space-y-2 font-sans mt-3">
                            {profile.workplaceEdge.filter(e => e.startsWith('优势：')).map((st, i) => (
                              <li key={i} className="text-xs sm:text-[13px] leading-relaxed text-slate-300 flex items-start gap-1.5">
                                <CornerDownRight className="w-3 h-3 text-[#39ff14] shrink-0 mt-1" />
                                <span>{st.replace(/^优势：/, '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-[#070b19]/30 border-2 border-[#2f2711] p-4">
                          <h4 className="text-xs sm:text-[13px] font-pixel text-[#ffe600] flex items-center gap-1.5 mb-3 uppercase tracking-wider glow-yellow">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#ffe600]" />
                            潜在盲区
                          </h4>
                          <ul className="space-y-2 font-sans mt-3">
                            {profile.workplaceEdge.filter(e => e.startsWith('边界：')).map((we, i) => (
                              <li key={i} className="text-xs sm:text-[13px] leading-relaxed text-slate-300 flex items-start gap-1.5">
                                <CornerDownRight className="w-3 h-3 text-[#ff007f] shrink-0 mt-1" />
                                <span>{we.replace(/^边界：/, '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Cognitive Pattern */}
                      <div className="border-t border-dashed border-[#00f0ff]/30 pt-4 sm:pt-5">
                        <h4 className="text-xs sm:text-[13px] font-pixel text-[#00f0ff] flex items-center gap-1.5 mb-2 sm:mb-3 uppercase tracking-wider glow-cyan">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#00f0ff]" />
                          认知模式
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {profile.cognitivePattern.map((cp, i) => (
                            <div key={i} className="bg-[#ff007f]/5 border border-[#ff007f]/20 p-2.5 sm:p-3">
                              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 font-medium">{cp}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Collaboration */}
                      <div className="border-t border-dashed border-[#ffe600]/30 pt-4 sm:pt-5">
                        <h4 className="text-xs sm:text-[13px] font-pixel text-[#ffe600] flex items-center gap-1.5 mb-2 sm:mb-3 uppercase tracking-wider glow-yellow font-bold">
                          <CornerDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffe600]" />
                          协作风格
                        </h4>
                        <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400 bg-[#070b19] p-3 sm:p-4 border border-dashed border-[#ffe600]/30 font-sans break-words">
                          {profile.collaboration}
                        </p>
                      </div>

                      {/* Growth Tip */}
                      <div className="border-t border-dashed border-[#39ff14]/30 pt-4 sm:pt-5">
                        <h4 className="text-xs sm:text-[13px] font-pixel text-[#39ff14] flex items-center gap-1.5 mb-2 sm:mb-3 uppercase tracking-wider glow-green">
                          <CornerDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#39ff14]" />
                          成长建议
                        </h4>
                        <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400 bg-[#070b19] p-3 sm:p-4 border border-dashed border-[#39ff14]/30 font-sans break-words">
                          {profile.growthTip}
                        </p>
                      </div>

                      {/* Visual Theme */}
                      <div className="border-t border-dashed border-[#00f0ff]/20 pt-4 sm:pt-5">
                        <h4 className="text-[13px] font-pixel text-[#00f0ff] flex items-center gap-1.5 mb-2 sm:mb-3 uppercase tracking-wider glow-cyan">  
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#00f0ff]" />
                          视觉场景
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: '光影', value: profile.visual.lighting },
                            { label: '氛围', value: profile.visual.atmosphere },
                            { label: '姿态', value: profile.visual.pose },
                            { label: '场景', value: profile.visual.background },
                          ].map((item, i) => (
                            <div key={i} className="bg-[#070b19] border border-[#00f0ff]/15 p-2.5">
                              <span className="text-[13px] font-pixel text-slate-500 uppercase block mb-0.5">{item.label}</span>
                              <p className="text-[13px] leading-snug text-slate-300 font-sans">{item.value}</p> 
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Faction Lore Context */}
                      <div className={`border-t ${selectedGuild.borderColor}/20 pt-5`}>
                        <span className={`text-[13px] font-pixel ${selectedGuild.color} uppercase tracking-widest block mb-2`}>
                          {selectedGuild.name} · 派系背景
                        </span>
                        <p className="text-[13px] leading-relaxed text-slate-500 font-sans italic border-l-2 border-slate-800 pl-3">
                          {selectedGuild.factionLore}
                        </p>
                      </div>

                    </motion.div>
                  );
                })()
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-grow flex flex-col items-center justify-center text-center py-8 select-none gap-6"
                >
                  <div className="w-16 h-16 rounded-none bg-black border-4 border-dashed border-slate-800 flex items-center justify-center text-[#00f0ff] opacity-40 animate-pulse">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-pixel text-[#00f0ff] glow-cyan">请从左侧选择一个思维卡片...</p>

                  {/* Faction Lore */}
                  <div className={`max-w-md mx-4 p-5 bg-black border-2 border-dashed ${selectedGuild.borderColor} text-left`}>
                    <span className={`text-[13px] font-pixel ${selectedGuild.color} uppercase tracking-widest block mb-2`}>
                      {selectedGuild.name} · 派系传说
                    </span>
                    <p className="text-[13px] leading-relaxed text-slate-400 font-sans">
                      {selectedGuild.factionLore}
                    </p>
                    <div className={`mt-3 pt-3 border-t ${selectedGuild.borderColor}/30`}>
                      <span className="text-[13px] font-pixel text-slate-500 uppercase tracking-widest block mb-1">
                        认知底层基因
                      </span>
                      <p className={`text-[13px] font-bold ${selectedGuild.color} tracking-wide`}>  
                        {selectedGuild.cognitiveEssence}
                      </p>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-black border-t-2 border-dashed border-[#00f0ff]/30 flex justify-between items-center text-[13px] text-slate-500">
          <span>. TOTAL RECORDS: 16/16</span>
        </div>
      </motion.div>
    </div>
  );
}
