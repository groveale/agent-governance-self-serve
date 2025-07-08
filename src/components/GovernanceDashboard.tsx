import { useState } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { PhaseIndicator } from './PhaseIndicator';
import { GovernanceSection } from './GovernanceSection';
import { ReportPanel } from './ReportPanel';
import { Header } from './Header';
import { FileDown, FileUp, RotateCcw } from 'lucide-react';
import '../styles/GovernanceDashboard.css';

export function GovernanceDashboard() {
  const { 
    sections, 
    completedItems, 
    resetAssessment, 
    loadAssessment,
    getReportData,
    lastUpdated 
  } = useGovernanceStore();
  
  const [showReport, setShowReport] = useState(false);
  const reportData = getReportData();

  const handleExport = () => {
    const data = {
      sections,
      completedItems: Array.from(completedItems),
      lastUpdated,
      exportDate: new Date(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `governance-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.sections && data.completedItems) {
          loadAssessment({
            sections: data.sections,
            completedItems: new Set(data.completedItems),
            lastUpdated: new Date(data.lastUpdated),
          });
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  // Group sections by category
  const securitySections = sections.filter(s => s.category === 'security');
  const complianceSections = sections.filter(s => s.category === 'compliance');
  const managementSections = sections.filter(s => s.category === 'management');

  return (
    <div className="governance-dashboard">
      <Header />
      
      <div className="dashboard-content">
        <PhaseIndicator reportData={reportData} />
        
        <div className="dashboard-actions">
          <button onClick={handleExport} className="action-button export">
            <FileDown size={16} />
            Export Assessment
          </button>
          
          <label className="action-button import">
            <FileUp size={16} />
            Import Assessment
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          
          <button onClick={resetAssessment} className="action-button reset">
            <RotateCcw size={16} />
            Reset
          </button>
          
          <button 
            onClick={() => setShowReport(!showReport)} 
            className="action-button report"
          >
            {showReport ? 'Hide Report' : 'Generate Report'}
          </button>
        </div>

        {showReport && <ReportPanel reportData={reportData} />}

        <div className="sections-container">
          <div className="section-group">
            <h2 className="section-group-title security">
              🔐 Security & Access Controls
            </h2>
            <div className="sections-grid">
              {securitySections.map(section => (
                <GovernanceSection key={section.id} section={section} />
              ))}
            </div>
          </div>

          <div className="section-group">
            <h2 className="section-group-title compliance">
              📜 Compliance & Data Protection
            </h2>
            <div className="sections-grid">
              {complianceSections.map(section => (
                <GovernanceSection key={section.id} section={section} />
              ))}
            </div>
          </div>

          <div className="section-group">
            <h2 className="section-group-title management">
              📊 Management & Operations
            </h2>
            <div className="sections-grid">
              {managementSections.map(section => (
                <GovernanceSection key={section.id} section={section} />
              ))}
            </div>
          </div>
        </div>

        <footer className="dashboard-footer">
          <p>For internal use only – <strong>UNITED KINGDOM</strong></p>
          <p>Cloud Solution Architect: <span className="author">Alex Grover</span></p>
          <p>Based on Microsoft Agent Governance Whitepaper v1.0</p>
          <p className="last-updated">
            {/* Last updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()} */}
          </p>
        </footer>
      </div>
    </div>
  );
}
