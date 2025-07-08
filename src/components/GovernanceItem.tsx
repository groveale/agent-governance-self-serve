import { useGovernanceStore } from '../store/governanceStore';
import type { GovernanceItem as GovernanceItemType } from '../types/governance';
import { Check } from 'lucide-react';

interface GovernanceItemProps {
  item: GovernanceItemType;
}

export function GovernanceItem({ item }: GovernanceItemProps) {
  const { toggleItem } = useGovernanceStore();

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      case 'optional': return 'priority-optional';
      default: return 'priority-medium';
    }
  };

  return (
    <li className="governance-item">
      <div 
        className={`item-checkbox ${item.completed ? 'checked' : ''}`}
        onClick={() => toggleItem(item.id)}
        role="checkbox"
        aria-checked={item.completed}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleItem(item.id);
          }
        }}
      >
        {item.completed && <Check size={12} />}
      </div>
      
      <div className="item-content">
        <div className="item-text">
          {item.text}
          {item.caption && (
            <span className="item-caption">{item.caption}</span>
          )}
        </div>
        
        <span className={`item-priority ${getPriorityClass(item.priority)}`}>
          {item.priority}
        </span>
      </div>
    </li>
  );
}
