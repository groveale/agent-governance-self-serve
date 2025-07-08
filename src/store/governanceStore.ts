import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentState, ReportData, AIReportResponse } from '../types/governance';
import { governanceSections } from '../data/governanceData';

interface GovernanceStore extends AssessmentState {
  // Actions
  toggleItem: (itemId: string) => void;
  resetAssessment: () => void;
  loadAssessment: (state: AssessmentState) => void;
  getReportData: () => ReportData;
  
  // AI Report state
  aiReport: AIReportResponse | null;
  isGeneratingReport: boolean;
  reportError: string | null;
  generateAIReport: (
    organizationInfo?: { name?: string; size?: string; industry?: string }
  ) => Promise<void>;
}

const calculatePhaseProgress = (sections: typeof governanceSections, completedItems: Set<string>) => {
  const allItems = sections.flatMap(section => section.items);
  
  const getPhaseItems = (phase: number) => allItems.filter(item => item.phase === phase);
  const getCompletedPhaseItems = (phase: number) => 
    getPhaseItems(phase).filter(item => completedItems.has(item.id));

  const phase1Items = getPhaseItems(1);
  const phase2Items = getPhaseItems(2);
  const phase3Items = getPhaseItems(3);

  return {
    phase1: phase1Items.length > 0 ? (getCompletedPhaseItems(1).length / phase1Items.length) * 100 : 0,
    phase2: phase2Items.length > 0 ? (getCompletedPhaseItems(2).length / phase2Items.length) * 100 : 0,
    phase3: phase3Items.length > 0 ? (getCompletedPhaseItems(3).length / phase3Items.length) * 100 : 0,
  };
};

const calculateRiskLevel = (completionPercentage: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (completionPercentage >= 80) return 'low';
  if (completionPercentage >= 60) return 'medium';
  if (completionPercentage >= 40) return 'high';
  return 'critical';
};

export const useGovernanceStore = create<GovernanceStore>()(
  persist(
    (set, get) => ({
      sections: governanceSections.map(section => ({
        ...section,
        items: section.items.map(item => ({ ...item, completed: false }))
      })),
      completedItems: new Set<string>(),
      lastUpdated: new Date(),
      aiReport: null,
      isGeneratingReport: false,
      reportError: null,

      toggleItem: (itemId: string) => {
        set((state) => {
          const newCompletedItems = new Set(state.completedItems);
          
          if (newCompletedItems.has(itemId)) {
            newCompletedItems.delete(itemId);
          } else {
            newCompletedItems.add(itemId);
          }

          const updatedSections = state.sections.map(section => ({
            ...section,
            items: section.items.map(item => ({
              ...item,
              completed: newCompletedItems.has(item.id)
            }))
          }));

          return {
            completedItems: newCompletedItems,
            sections: updatedSections,
            lastUpdated: new Date(),
          };
        });
      },

      resetAssessment: () => {
        set({
          sections: governanceSections.map(section => ({
            ...section,
            items: section.items.map(item => ({ ...item, completed: false }))
          })),
          completedItems: new Set<string>(),
          lastUpdated: new Date(),
          aiReport: null,
          reportError: null,
        });
      },

      loadAssessment: (newState: AssessmentState) => {
        set({
          sections: newState.sections,
          completedItems: newState.completedItems,
          lastUpdated: newState.lastUpdated,
        });
      },

      getReportData: (): ReportData => {
        const state = get();
        const allItems = state.sections.flatMap(section => section.items);
        const totalItems = allItems.length;
        const completedItemsCount = state.completedItems.size;
        const completionPercentage = totalItems > 0 ? (completedItemsCount / totalItems) * 100 : 0;
        const phaseProgress = calculatePhaseProgress(state.sections, state.completedItems);
        const missingItems = allItems.filter(item => !state.completedItems.has(item.id));
        const riskLevel = calculateRiskLevel(completionPercentage);

        // Generate basic recommendations based on missing high-priority items
        const highPriorityMissing = missingItems.filter(item => item.priority === 'high');
        const recommendations = [
          `Complete ${highPriorityMissing.length} high-priority items to improve security posture`,
          `Focus on Phase ${phaseProgress.phase1 < 100 ? '1 (Security)' : phaseProgress.phase2 < 100 ? '2 (Compliance)' : '3 (Management)'} completion`,
          'Review agent inventory regularly to maintain compliance',
        ];

        return {
          totalItems,
          completedItems: completedItemsCount,
          completionPercentage,
          phaseProgress,
          missingItems,
          recommendations,
          riskLevel,
        };
      },

      generateAIReport: async (organizationInfo?: { name?: string; size?: string; industry?: string }) => {
        const state = get();
        const reportData = get().getReportData();
        set({ isGeneratingReport: true, reportError: null });

        try {
          // Use environment variable or fallback to local Azure Functions
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071';
          const apiUrl = import.meta.env.MODE === 'development' 
            ? `${apiBaseUrl}/api/generate-report`
            : '/api/generate-report';
            
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              assessmentState: {
                sections: state.sections,
                completedItems: Array.from(state.completedItems),
                lastUpdated: state.lastUpdated,
              },
              reportData: {
                totalItems: reportData.totalItems,
                completedItems: reportData.completedItems,
                completionPercentage: reportData.completionPercentage,
                missingItems: reportData.missingItems,
              },
              organizationInfo,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate report');
          }

          const aiReport: AIReportResponse = await response.json();
          set({ aiReport, isGeneratingReport: false });
        } catch (error) {
          set({ 
            reportError: error instanceof Error ? error.message : 'Unknown error occurred',
            isGeneratingReport: false 
          });
        }
      },
    }),
    {
      name: 'governance-assessment',
      partialize: (state) => ({
        sections: state.sections,
        completedItems: Array.from(state.completedItems),
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.completedItems)) {
          state.completedItems = new Set(state.completedItems);
        }
      },
    }
  )
);
