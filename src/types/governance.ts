export interface GovernanceItem {
  id: string;
  text: string;
  caption?: string;
  priority: 'high' | 'medium' | 'low' | 'optional';
  completed: boolean;
  phase: 1 | 2 | 3;
  category: 'security' | 'compliance' | 'management';
}

export interface GovernanceSection {
  id: string;
  title: string;
  icon: string;
  category: 'security' | 'compliance' | 'management';
  items: GovernanceItem[];
}

export interface GovernancePhase {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface AssessmentState {
  sections: GovernanceSection[];
  completedItems: Set<string>;
  lastUpdated: Date;
}

export interface ReportData {
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  phaseProgress: {
    phase1: number;
    phase2: number;
    phase3: number;
  };
  missingItems: GovernanceItem[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIReportRequest {
  assessmentState: AssessmentState;
  organizationInfo?: {
    name?: string;
    size?: string;
    industry?: string;
  };
}

export interface AIReportResponse {
  executiveSummary: string;
  detailedAnalysis: string;
  actionPlan: string[];
  timeline: string;
  riskAssessment: string;
  recommendations: string[];
}
