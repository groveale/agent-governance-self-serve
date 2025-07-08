# Microsoft 365 Agent Governance Dashboard

A comprehensive interactive web application for managing and governing AI agents across your Microsoft 365 organization. Built with React TypeScript and deployed on Azure Static Web Apps with AI-powered reporting capabilities.

## Features

- **Interactive Governance Checklist**: Three-phase deployment strategy covering Security & Access Controls, Compliance & Data Protection, and Management & Operations
- **Progress Tracking**: Real-time completion tracking with visual progress indicators
- **AI-Powered Reporting**: Generate comprehensive governance reports using Azure OpenAI
- **Export/Import Functionality**: Save and share assessment progress
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Cloud-Ready**: Deployed on Azure Static Web Apps with serverless backend

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Azure Functions (TypeScript)
- **AI Integration**: Azure OpenAI Service
- **Hosting**: Azure Static Web Apps
- **State Management**: Zustand with persistence
- **Styling**: CSS Modules with Microsoft Design System principles

## Getting Started

### Prerequisites

- Node.js 18+
- Azure subscription (for deployment)
- Azure OpenAI Service (for AI reporting features)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd agent-governance-self-serve
   npm install
   ```

2. **Environment Setup**
   Create a `local.settings.json` file in the `api` folder:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "AZURE_OPENAI_ENDPOINT": "your-openai-endpoint",
       "AZURE_OPENAI_API_KEY": "your-openai-key",
       "AZURE_OPENAI_DEPLOYMENT_NAME": "gpt-35-turbo"
     }
   }
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Azure Functions (in separate terminal)**
   ```bash
   cd api
   func start
   ```

### Deployment to Azure

This project is configured for deployment using Azure Developer CLI (azd):

1. **Install Azure Developer CLI**
   ```bash
   # Windows
   powershell -ex AllSigned -c "Invoke-RestMethod 'https://aka.ms/install-azd.ps1' | Invoke-Expression"
   
   # macOS/Linux
   curl -fsSL https://aka.ms/install-azd.sh | bash
   ```

2. **Login and Initialize**
   ```bash
   azd auth login
   azd init
   ```

3. **Deploy**
   ```bash
   azd up
   ```

## Project Structure

```
agent-governance-self-serve/
├── src/
│   ├── components/           # React components
│   ├── data/                # Governance data and configurations
│   ├── store/               # Zustand state management
│   ├── styles/              # CSS modules and styling
│   └── types/               # TypeScript type definitions
├── api/                     # Azure Functions backend
│   └── generate-report/     # AI report generation function
├── infra/                   # Bicep infrastructure templates
├── public/                  # Static assets
└── dist/                    # Build output
```

## Governance Framework

The dashboard implements a three-phase governance approach:

### Phase 1: Security & Access Controls
- MAC (Microsoft Admin Center) Controls
- Power Platform Controls  
- SharePoint & Content Controls

### Phase 2: Compliance & Data Protection
- Microsoft Purview Integration
- Insider Risk & Communication Management
- Legal & Audit Controls

### Phase 3: Management & Operations
- Cost Management & Licensing
- Analytics & Monitoring
- Lifecycle & Governance
- Third-Party & Custom Agents
- Copilot Connectors

## Key Components

### GovernanceDashboard
Main dashboard component with phase indicators, progress tracking, and report generation.

### GovernanceSection
Individual section cards with checkboxes for governance items.

### ReportPanel
AI-powered report generation with organizational context and detailed analysis.

### Phase Indicators
Visual progress tracking across the three governance phases.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.

---

**Cloud Solution Architect**: Alex Grover  
**Based on**: Microsoft Agent Governance Whitepaper v1.0
