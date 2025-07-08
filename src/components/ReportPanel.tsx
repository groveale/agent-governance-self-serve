import { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import type { ReportData } from '../types/governance';
import { FileText, Download, Brain, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ReportPanelProps {
  reportData: ReportData;
}

export function ReportPanel({ reportData }: ReportPanelProps) {
  const { aiReport, isGeneratingReport, reportError, generateAIReport } = useGovernanceStore();
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [orgInfo, setOrgInfo] = useState({
    name: '',
    size: '',
    industry: '',
  });

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="risk-icon low" size={16} />;
      case 'medium': return <Clock className="risk-icon medium" size={16} />;
      case 'high': return <AlertTriangle className="risk-icon high" size={16} />;
      case 'critical': return <AlertTriangle className="risk-icon critical" size={16} />;
      default: return <Clock className="risk-icon medium" size={16} />;
    }
  };

  const handleGenerateAIReport = async () => {
    await generateAIReport(orgInfo);
    setShowOrgForm(false);
  };

  const exportToPDF = () => {
    // This would implement PDF export functionality
    // For now, we'll create a simple HTML version
    const reportContent = document.getElementById('report-content');
    if (reportContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Governance Assessment Report</title>
              <style>
                body { font-family: 'Segoe UI', sans-serif; margin: 20px; }
                .report-header { border-bottom: 2px solid #0078d4; padding-bottom: 20px; margin-bottom: 20px; }
                .risk-level { padding: 5px 10px; border-radius: 5px; font-weight: bold; }
                .risk-level.low { background: #e8f5e8; color: #107c10; }
                .risk-level.medium { background: #fff4e6; color: #ff8c00; }
                .risk-level.high { background: #fdf2f2; color: #d13438; }
                .risk-level.critical { background: #fdf2f2; color: #d13438; font-weight: bold; }
                .phase-progress { margin: 10px 0; }
                .progress-bar { width: 100%; height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden; }
                .progress-fill { height: 100%; background: #0078d4; }
              </style>
            </head>
            <body>
              ${reportContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="report-panel">
      <div className="report-header">
        <h3>
          <FileText size={20} />
          Assessment Report
        </h3>
        <div className="report-actions">
          <button 
            onClick={() => setShowOrgForm(!showOrgForm)}
            className="action-button ai-report"
            disabled={isGeneratingReport}
          >
            <Brain size={16} />
            {isGeneratingReport ? 'Generating...' : 'AI Analysis'}
          </button>
          <button onClick={exportToPDF} className="action-button export">
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {showOrgForm && (
        <div className="org-form">
          <h4>Organization Information (Optional)</h4>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Organization Name"
              value={orgInfo.name}
              onChange={(e) => setOrgInfo({...orgInfo, name: e.target.value})}
            />
            <select
              value={orgInfo.size}
              onChange={(e) => setOrgInfo({...orgInfo, size: e.target.value})}
            >
              <option value="">Select Size</option>
              <option value="small">Small (1-50 employees)</option>
              <option value="medium">Medium (51-250 employees)</option>
              <option value="large">Large (251-1000 employees)</option>
              <option value="enterprise">Enterprise (1000+ employees)</option>
            </select>
            <input
              type="text"
              placeholder="Industry"
              value={orgInfo.industry}
              onChange={(e) => setOrgInfo({...orgInfo, industry: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleGenerateAIReport} disabled={isGeneratingReport}>
              Generate AI Report
            </button>
            <button onClick={() => setShowOrgForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {reportError && (
        <div className="report-error">
          <AlertTriangle size={16} />
          {reportError}
        </div>
      )}

      <div id="report-content" className="report-content">
        <div className="report-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <h4>Completion Status</h4>
              <div className="completion-stats">
                <span className="completion-percentage">
                  {Math.round(reportData.completionPercentage)}%
                </span>
                <span className="completion-details">
                  {reportData.completedItems} of {reportData.totalItems} items completed
                </span>
              </div>
            </div>

            <div className="summary-item">
              <h4>Risk Level</h4>
              <div className={`risk-level ${reportData.riskLevel}`}>
                {getRiskLevelIcon(reportData.riskLevel)}
                {reportData.riskLevel.toUpperCase()}
              </div>
            </div>

            <div className="summary-item">
              <h4>Phase Progress</h4>
              <div className="phase-progress">
                <div className="phase-item">
                  <span>Security & Access</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill security" 
                      style={{ width: `${reportData.phaseProgress.phase1}%` }}
                    />
                  </div>
                  <span>{Math.round(reportData.phaseProgress.phase1)}%</span>
                </div>
                <div className="phase-item">
                  <span>Compliance</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill compliance" 
                      style={{ width: `${reportData.phaseProgress.phase2}%` }}
                    />
                  </div>
                  <span>{Math.round(reportData.phaseProgress.phase2)}%</span>
                </div>
                <div className="phase-item">
                  <span>Management</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill management" 
                      style={{ width: `${reportData.phaseProgress.phase3}%` }}
                    />
                  </div>
                  <span>{Math.round(reportData.phaseProgress.phase3)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {reportData.missingItems.length > 0 && (
          <div className="missing-items">
            <h4>Outstanding Items ({reportData.missingItems.length})</h4>
            <div className="missing-items-grid">
              {['high', 'medium', 'low', 'optional'].map(priority => {
                const items = reportData.missingItems.filter(item => item.priority === priority);
                if (items.length === 0) return null;
                
                return (
                  <div key={priority} className={`priority-group ${priority}`}>
                    <h5>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority ({items.length})</h5>
                    <ul>
                      {items.map(item => (
                        <li key={item.id}>{item.text}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="recommendations">
          <h4>Recommendations</h4>
          <ul>
            {reportData.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        {aiReport && (
          <div className="ai-report">
            <h4>AI Analysis</h4>
            
            <div className="ai-section">
              <h5>Executive Summary</h5>
              <p>{aiReport.executiveSummary}</p>
            </div>

            <div className="ai-section">
              <h5>Detailed Analysis</h5>
              <p>{aiReport.detailedAnalysis}</p>
            </div>

            <div className="ai-section">
              <h5>Action Plan</h5>
              <ul>
                {aiReport.actionPlan.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>

            <div className="ai-section">
              <h5>Timeline</h5>
              <p>{aiReport.timeline}</p>
            </div>

            <div className="ai-section">
              <h5>Risk Assessment</h5>
              <p>{aiReport.riskAssessment}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
