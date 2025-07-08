import type { GovernanceSection, GovernancePhase } from '../types/governance';

export const governancePhases: GovernancePhase[] = [
  {
    id: 1,
    title: 'Security & Access Controls',
    description: 'Secure access first',
    icon: '🔐',
    color: 'var(--ms-green)'
  },
  {
    id: 2,
    title: 'Compliance & Data Protection', 
    description: 'Ensure compliance next',
    icon: '📜',
    color: 'var(--ms-purple)'
  },
  {
    id: 3,
    title: 'Management & Operations',
    description: 'Optimize operations at scale',
    icon: '📊',
    color: 'var(--ms-orange)'
  }
];

export const governanceSections: GovernanceSection[] = [
  // Phase 1: Security & Access Controls
  {
    id: 'mac-controls',
    title: 'MAC Controls',
    icon: '🛡️',
    category: 'security',
    items: [
      {
        id: 'mac-1',
        text: 'Require admin approval for agent publishing',
        caption: 'Establish approval process / guidance for tenant wide agents. Ensure risky agents are never published',
        priority: 'medium',
        completed: false,
        phase: 1,
        category: 'security'
      },
      {
        id: 'mac-2',
        text: 'Set up security groups for agent access / creation',
        caption: 'Restricts who can create or use agents',
        priority: 'optional',
        completed: false,
        phase: 1,
        category: 'security'
      },
      {
        id: 'mac-3',
        text: 'View and manage agent inventory in MAC',
        caption: 'Use the Integrated Apps section in MAC to track all agents (including Copilot Studio agents) deployed in your tenant. This helps you quickly identify, review, and block agents as required',
        priority: 'high',
        completed: false,
        phase: 1,
        category: 'security'
      }
    ]
  },
  {
    id: 'power-platform-controls',
    title: 'Power Platform Controls',
    icon: '🔌',
    category: 'security',
    items: [
      {
        id: 'pp-1',
        text: 'Set Up Power Platform Environments',
        caption: 'Establish separate environments for development, testing (sandbox), and production. With different controls around items such as agent sharing and DLP',
        priority: 'high',
        completed: false,
        phase: 1,
        category: 'security'
      },
      {
        id: 'pp-2',
        text: 'Provide Developer Sandboxes',
        caption: 'Ensure each Copilot Studio maker has a dedicated sandbox for independent work, supporting secure development and testing',
        priority: 'high',
        completed: false,
        phase: 1,
        category: 'security'
      },
      {
        id: 'pp-3',
        text: 'Implement environment routing',
        caption: 'Use environment routing to ensure agents and makers are provisioned in the correct environment',
        priority: 'high',
        completed: false,
        phase: 1,
        category: 'security'
      }
    ]
  },
  {
    id: 'sharepoint-content-controls',
    title: 'SharePoint & Content Controls',
    icon: '📋',
    category: 'security',
    items: [
      {
        id: 'sp-1',
        text: 'Leverage SharePoint Advanced Management (SAM)',
        caption: 'Deploy SAM to gain enhanced governance, security, and compliance capabilities for SharePoint sites that agents may access',
        priority: 'high',
        completed: false,
        phase: 1,
        category: 'security'
      },
      {
        id: 'sp-2',
        text: 'Configure Restricted Content Discovery for overshared sites',
        caption: 'Prevent AI agents from accessing overly permissive SharePoint sites that may contain sensitive data beyond intended scope',
        priority: 'high',
        completed: false,
        phase: 1,
        category: 'security'
      },
      {
        id: 'sp-3',
        text: 'Set up site ownership and lifecycle policies',
        caption: 'Establish clear ownership and automated lifecycle management to prevent orphaned sites from becoming security risks for agent access',
        priority: 'medium',
        completed: false,
        phase: 1,
        category: 'security'
      }
    ]
  },

  // Phase 2: Compliance & Data Protection
  {
    id: 'purview-integration',
    title: 'Microsoft Purview Integration',
    icon: '🔍',
    category: 'compliance',
    items: [
      {
        id: 'purview-1',
        text: 'Enable Data Security Posture Management for AI',
        caption: 'Proactively monitor and assess AI data security risks across your environment, identifying potential vulnerabilities before they become threats',
        priority: 'high',
        completed: false,
        phase: 2,
        category: 'compliance'
      },
      {
        id: 'purview-2',
        text: 'Apply prompt management via Purview',
        caption: 'Centrally govern and monitor all AI prompts to prevent data leakage, ensure compliance, and maintain prompt quality standards',
        priority: 'high',
        completed: false,
        phase: 2,
        category: 'compliance'
      },
      {
        id: 'purview-3',
        text: 'Set up sensitivity labels and protection',
        caption: 'Allow users to classify and protect sensitive data that AI agents may access, ensuring appropriate handling based on data classification',
        priority: 'high',
        completed: false,
        phase: 2,
        category: 'compliance'
      }
    ]
  },
  {
    id: 'insider-risk-communication',
    title: 'Insider Risk & Communication',
    icon: '👥',
    category: 'compliance',
    items: [
      {
        id: 'insider-1',
        text: 'Enable Insider Risk Management for AI',
        caption: 'Use Microsoft Purview Insider Risk Management to detect and respond to risky user activities in AI (e.g., unusual access, excessive sensitive data in prompts)',
        priority: 'high',
        completed: false,
        phase: 2,
        category: 'compliance'
      },
      {
        id: 'insider-2',
        text: 'Configure Communication Compliance policies',
        caption: 'Set up policies to monitor and remediate inappropriate, non-compliant, or risky communications involving AI agents',
        priority: 'medium',
        completed: false,
        phase: 2,
        category: 'compliance'
      },
      {
        id: 'insider-3',
        text: 'Configure audit logging for investigations',
        caption: 'Ensure audit logs are enabled for all agent interactions to support investigations and compliance',
        priority: 'high',
        completed: false,
        phase: 2,
        category: 'compliance'
      }
    ]
  },
  {
    id: 'legal-audit-controls',
    title: 'Legal & Audit Controls',
    icon: '⚖️',
    category: 'compliance',
    items: [
      {
        id: 'legal-1',
        text: 'Configure eDiscovery for agent interactions',
        caption: 'Agent interactions can be reviewed in eDiscovery for investigations and litigation. eDiscovery enables legal teams to identify, collect agent interactions',
        priority: 'medium',
        completed: false,
        phase: 2,
        category: 'compliance'
      },
      {
        id: 'legal-2',
        text: 'Set up comprehensive audit logging',
        caption: 'Audit logs record interactions with agents, capturing timestamps, user identities, prompts, and AI responses.',
        priority: 'high',
        completed: false,
        phase: 2,
        category: 'compliance'
      },
      {
        id: 'legal-3',
        text: 'Configure data lifecycle management',
        caption: 'Use built-in classification and governance to set retention and deletion policies for agent interactions. This helps meet legal, business, privacy, and regulatory obligations.',
        priority: 'medium',
        completed: false,
        phase: 2,
        category: 'compliance'
      }
    ]
  },

  // Phase 3: Management & Operations
  {
    id: 'cost-management-licensing',
    title: 'Cost Management & Licensing',
    icon: '💳',
    category: 'management',
    items: [
      {
        id: 'cost-1',
        text: 'Configure PAYG for non-licensed users',
        caption: 'Enable metered consumption so unlicensed users can access Copilot Chat agents',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'cost-2',
        text: 'Set up consumption alerts and thresholds',
        caption: 'Configure alerts in the Azure subscription associated with the MAC billing policy to monitor usage and spending',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'cost-3',
        text: 'Configure departmental pay-go meters',
        caption: 'Assign dedicated PAYG meters to departments for granular cost management',
        priority: 'optional',
        completed: false,
        phase: 3,
        category: 'management'
      }
    ]
  },
  {
    id: 'analytics-monitoring',
    title: 'Analytics & Monitoring',
    icon: '📈',
    category: 'management',
    items: [
      {
        id: 'analytics-1',
        text: 'Enable Copilot usage analytics via Viva Insights',
        caption: 'Access detailed analytics on Copilot adoption, usage patterns, and productivity impact across your organization through Viva Insights dashboards',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'analytics-2',
        text: 'Use M365 Admin Center for insights',
        caption: 'Monitor agent usage, user activity, and system health through the Microsoft 365 Admin Center\'s reporting and analytics features',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'analytics-3',
        text: 'Track agent adoption and performance trends',
        caption: 'Establish KPIs and metrics to measure agent effectiveness, user satisfaction, and business value delivery over time',
        priority: 'medium',
        completed: false,
        phase: 3,
        category: 'management'
      }
    ]
  },
  {
    id: 'lifecycle-governance',
    title: 'Lifecycle & Governance',
    icon: '🔄',
    category: 'management',
    items: [
      {
        id: 'lifecycle-1',
        text: 'Establish Center of Excellence (CoE)',
        caption: 'CoE governs all agents, defines standards, approves new agents, and ensures best practices',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'lifecycle-2',
        text: 'Manage lifecycle: ownership and rollout',
        caption: 'CoE manages agent ownership, oversees rollout, and ensures agents are aligned with business needs',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'lifecycle-3',
        text: 'Implement agent retirement and cleanup processes',
        caption: 'CoE and IT should regularly review agents, retire unused or non-compliant agents, and clean up environments to maintain security and compliance',
        priority: 'medium',
        completed: false,
        phase: 3,
        category: 'management'
      }
    ]
  },
  {
    id: 'third-party-custom-agents',
    title: 'Third-Party & Custom Agents',
    icon: '🌐',
    category: 'management',
    items: [
      {
        id: 'third-party-1',
        text: 'Apply tenant-level security posture agent controls',
        caption: 'Implement controls to govern default access to Microsoft, third party and in house build agents',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'third-party-2',
        text: 'Define Agent Ownership and Compliance guidance / policy',
        caption: 'Define a policy for what agent ownership means. What agents can do, what they can connect to. This helps ensure agent governance',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'third-party-3',
        text: 'Audit third-party AI interactions via Purview',
        caption: 'Monitor and audit all interactions with external AI agents through Microsoft Purview to maintain visibility, compliance, and security oversight',
        priority: 'medium',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'third-party-4',
        text: 'Regularly review agent inventory in MAC',
        caption: 'Use the Integrated Apps section in MAC to review agents (including Copilot Studio agents) deployed in your tenant. This helps you quickly identify, review, and non-compliant block agents as required',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      }
    ]
  },
  {
    id: 'copilot-connectors',
    title: 'Copilot Connectors',
    icon: '🔌',
    category: 'management',
    items: [
      {
        id: 'connectors-1',
        text: 'Review Microsoft-built connectors',
        caption: 'Assess all Microsoft-provided connectors for security, compliance, and business fit before deployment. Validate that only approved connectors are enabled in your environment',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'connectors-2',
        text: 'Plan deployment of connectors',
        caption: 'Define which connectors are allowed for use (business, non-business, blocked) via Data Loss Prevention (DLP) policies in the Power Platform Admin Center. Document deployment plans and communicate to stakeholders',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'connectors-3',
        text: 'Define onboarding process for new connectors',
        caption: 'Establish a formal process for requesting, evaluating, and approving new connectors. Include security, compliance, and data access reviews. Require business justification and IT/security sign-off',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      },
      {
        id: 'connectors-4',
        text: 'Assign connector ownership',
        caption: 'Assign a product/data owner for each third-party connector. Owners are responsible for ongoing compliance, lifecycle management, and responding to incidents or changes',
        priority: 'high',
        completed: false,
        phase: 3,
        category: 'management'
      }
    ]
  }
];
