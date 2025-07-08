import type { GovernanceSection as GovernanceSectionType } from '../types/governance';
import { GovernanceItem } from './GovernanceItem';

interface GovernanceSectionProps {
  section: GovernanceSectionType;
}

export function GovernanceSection({ section }: GovernanceSectionProps) {
  const completedCount = section.items.filter(item => item.completed).length;
  const totalCount = section.items.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`governance-section ${section.category}`}>
      <div className="section-header">
        <h3>
          <span className="section-icon">{section.icon}</span>
          {section.title}
        </h3>
        <div className="section-progress">
          <span className="progress-text">
            {completedCount}/{totalCount}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <ul className="governance-items">
        {section.items.map(item => (
          <GovernanceItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
