import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface AIReportRequest {
  assessmentState: {
    sections: any[];
    completedItems: string[];
    lastUpdated: string;
  };
  organizationInfo?: {
    name?: string;
    size?: string;
    industry?: string;
  };
}

export async function generateReport(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('AI Report generation function processed a request.');

  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    };
  }

  if (request.method !== 'POST') {
    return {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: "Method not allowed"
    };
  }

  try {
    const requestBody: AIReportRequest = await request.json() as AIReportRequest;
    
    if (!requestBody.assessmentState) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: "Assessment state is required"
      };
    }

    // For now, let's skip Azure OpenAI and use the fallback response
    // You can enable this later when you have Azure OpenAI configured
    const { assessmentState, organizationInfo } = requestBody;
    const totalItems = assessmentState.sections.reduce((acc, section) => acc + section.items.length, 0);
    const completedItems = assessmentState.completedItems.length;
    const completionPercentage = (completedItems / totalItems) * 100;
    
    const missingItems = assessmentState.sections.flatMap(section => 
      section.items.filter((item: any) => !assessmentState.completedItems.includes(item.id))
    );

    const highPriorityMissing = missingItems.filter((item: any) => item.priority === 'high');
    
    // Generate a comprehensive fallback report
    const fallbackReport = {
      executiveSummary: `Your organization has completed ${Math.round(completionPercentage)}% of the Microsoft 365 Agent Governance assessment. ${completionPercentage < 50 ? 'Significant improvements needed' : completionPercentage < 80 ? 'Good progress with some gaps remaining' : 'Excellent governance posture'} to ensure secure and compliant AI agent deployment.`,
      
      detailedAnalysis: `Assessment analysis reveals ${completedItems} of ${totalItems} governance controls are implemented (${Math.round(completionPercentage)}%). Key focus areas include ${highPriorityMissing.length} high-priority items requiring immediate attention. ${organizationInfo?.name ? `For ${organizationInfo.name}` : 'Your organization'}, priority should be placed on completing security controls, compliance measures, and operational governance frameworks to establish a robust foundation for Microsoft 365 agent management.`,
      
      actionPlan: [
        `Complete ${highPriorityMissing.length} high-priority security and access controls`,
        'Implement Microsoft Purview integration for data protection',
        'Establish Center of Excellence for agent governance',
        'Configure monitoring and analytics for ongoing oversight',
        'Develop organizational policies for agent lifecycle management'
      ],
      
      timeline: completionPercentage < 30 ? 
        'Immediate action required: Complete Phase 1 (Security) within 2 weeks, Phase 2 (Compliance) within 6 weeks, Phase 3 (Operations) within 12 weeks' :
        completionPercentage < 70 ?
        'Phase 1 (Security): 30 days, Phase 2 (Compliance): 60 days, Phase 3 (Operations): 90 days' :
        'Finalize remaining items within 30 days, establish quarterly review cycles',
      
      riskAssessment: `Current governance gaps present ${
        completionPercentage > 80 ? 'LOW' : 
        completionPercentage > 60 ? 'MODERATE' : 
        completionPercentage > 40 ? 'HIGH' : 'CRITICAL'
      } risk to the organization. ${
        highPriorityMissing.length > 0 ? 
        `Immediate attention required for ${highPriorityMissing.length} critical security controls.` :
        'Continue building on your strong governance foundation.'
      } Regular monitoring and continuous improvement essential for maintaining security posture.`,
      
      recommendations: [
        'Prioritize high-priority security and access controls',
        'Establish comprehensive governance policies and procedures',
        'Implement regular audit and review processes',
        'Consider automation for ongoing compliance monitoring',
        organizationInfo?.size === 'enterprise' ? 'Deploy enterprise-grade monitoring and analytics solutions' : 'Scale governance approach based on organizational maturity'
      ]
    };

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      jsonBody: fallbackReport
    };

  } catch (error) {
    context.log('Error generating report:', error);
    
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      jsonBody: {
        error: 'Failed to generate report',
        message: 'An error occurred while processing your request'
      }
    };
  }
}

app.http('generate-report', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: generateReport
});
