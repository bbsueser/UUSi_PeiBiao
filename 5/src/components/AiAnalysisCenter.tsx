/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AI分析中心：整合技能图谱分析、学习参与度分析、AI智能进阶推荐与 AI 学伴配置。
 */

import React, { useState } from "react";
import SkillGraphAnalysis from "./SkillGraphAnalysis";
import LearningEngagementAnalysis from "./LearningEngagementAnalysis";
import AiAdvancedRecommendation from "./AiAdvancedRecommendation";
import AiCompanionConfig from "./AiCompanionConfig";
import { Network, Activity, Sparkles, Bot } from "lucide-react";

type AnalysisTab = "skillGraph" | "engagement" | "recommend" | "companion";

const ANALYSIS_TABS: Array<{ id: AnalysisTab; label: string; icon: React.ElementType }> = [
  { id: "skillGraph", label: "技能图谱分析", icon: Network },
  { id: "engagement", label: "学习参与度分析", icon: Activity },
  { id: "recommend", label: "AI智能进阶推荐", icon: Sparkles },
  { id: "companion", label: "AI学伴配置", icon: Bot }
];

export default function AiAnalysisCenter() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("skillGraph");

  return (
    <div className="p-6 max-w-[1600px] mx-auto flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm self-start overflow-x-auto max-w-full">
        {ANALYSIS_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black whitespace-nowrap ${
                active
                  ? "bg-[#EAF8F1] text-[#10A66A]"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "skillGraph" && <SkillGraphAnalysis />}
      {activeTab === "engagement" && <LearningEngagementAnalysis />}
      {activeTab === "recommend" && <AiAdvancedRecommendation />}
      {activeTab === "companion" && <AiCompanionConfig />}
    </div>
  );
}