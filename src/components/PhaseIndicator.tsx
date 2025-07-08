import type { ReportData } from '../types/governance';
import { governancePhases } from '../data/governanceData';

interface PhaseIndicatorProps {
  reportData: ReportData;
}

export function PhaseIndicator({ reportData }: PhaseIndicatorProps) {
  const { phaseProgress } = reportData;
  
  const getPhaseStatus = (phase: number) => {
    const progress = phase === 1 ? phaseProgress.phase1 : 
                   phase === 2 ? phaseProgress.phase2 : 
                   phaseProgress.phase3;
    
    if (progress >= 100) return 'completed';
    if (progress >= 50) return 'in-progress';
    return 'not-started';
  };

  return (
    <div className="phase-indicator">
      {governancePhases.map(phase => {
        const status = getPhaseStatus(phase.id);
        const progress = phase.id === 1 ? phaseProgress.phase1 : 
                        phase.id === 2 ? phaseProgress.phase2 : 
                        phaseProgress.phase3;
        
        return (
          <div key={phase.id} className={`phase phase-${phase.id} ${status}`}>
            <div className="phase-content">
              <span className="phase-icon">{phase.icon}</span>
              <div className="phase-info">
                <span className="phase-title">{phase.title}</span>
                <span className="phase-description">{phase.description}</span>
              </div>
              <div className="phase-progress">
                <span className="progress-text">{Math.round(progress)}%</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
