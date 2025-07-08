import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential } from "@azure/identity";

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

// Helper function to create Azure OpenAI client
function createAzureOpenAIClient(): AzureOpenAI | null {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

    console.log('Azure OpenAI Config Check:');
    console.log('- Endpoint:', endpoint ? 'Set' : 'Missing');
    console.log('- API Key:', apiKey ? 'Set' : 'Missing');
    console.log('- Deployment:', deploymentName ? deploymentName : 'Missing');

    if (!endpoint || !apiKey || !deploymentName) {
        console.log('Azure OpenAI not fully configured, using fallback');
        return null; // Will use fallback report
    }

    console.log('Creating Azure OpenAI client with endpoint:', endpoint);
    return new AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion: "2024-02-01"
    });
}

// Helper function to generate AI-powered report
async function generateAIReport(
    openaiClient: AzureOpenAI,
    assessmentState: any,
    organizationInfo: any
): Promise<any> {
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4";

    const totalItems = assessmentState.sections.reduce((acc: number, section: any) => acc + section.items.length, 0);
    const completedItems = assessmentState.completedItems.length;
    const completionPercentage = (completedItems / totalItems) * 100;

    const missingItems = assessmentState.sections.flatMap((section: any) =>
        section.items.filter((item: any) => !assessmentState.completedItems.includes(item.id))
    );

    const prompt = `You are an expert Microsoft 365 governance consultant. Generate a comprehensive governance assessment report based on the following data:

Assessment Summary:
- Total governance items: ${totalItems}
- Completed items: ${completedItems}
- Completion percentage: ${Math.round(completionPercentage)}%
- Organization: ${organizationInfo?.name || 'Not specified'}
- Industry: ${organizationInfo?.industry || 'Not specified'}
- Organization size: ${organizationInfo?.size || 'Not specified'}

Missing items requiring attention:
${missingItems.map((item: any) => `- ${item.title} (Priority: ${item.priority})`).join('\n')}

Please provide a detailed analysis with the following structure:
 
- Executive Summary: High-level summary of governance posture
- Detailed Analysis: "Detailed technical analysis of gaps and strengths 
- Action Plan: specific, actionable, recommendations
- Timeline: Realistic timeline for implementation
- RiskAssessment": Assessment of current risks and mitigation strategies
- Recommendations: strategic recommendations for improvement


Focus on Microsoft 365 agent governance, security, compliance, and operational excellence. Provide specific, actionable insights based on the assessment data.`;

    try {
        const response = await openaiClient.chat.completions.create({
            model: deploymentName,
            messages: [
                {
                    role: "system",
                    content: "You are an expert Microsoft 365 governance consultant. Provide detailed, actionable governance recommendations."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
            try {
                return JSON.parse(content);
            } catch {
                // If AI doesn't return valid JSON, create structured response
                return {
                    executiveSummary: content.substring(0, 500),
                    detailedAnalysis: content,
                    actionPlan: ["Review AI-generated recommendations", "Implement high-priority items", "Monitor progress"],
                    timeline: "Implementation timeline varies based on organizational capacity",
                    riskAssessment: "AI analysis provided detailed risk assessment",
                    recommendations: ["Follow AI-generated recommendations", "Regular monitoring", "Continuous improvement"]
                };
            }
        }
    } catch (error) {
        console.error('Azure OpenAI API error:', error);
        throw error;
    }

    throw new Error('No response from Azure OpenAI');
}

// Helper function to generate fallback report when AI is not available
function generateFallbackReport(assessmentState: any, organizationInfo: any): any {
    const totalItems = assessmentState.sections.reduce((acc: number, section: any) => acc + section.items.length, 0);
    const completedItems = assessmentState.completedItems.length;
    const completionPercentage = (completedItems / totalItems) * 100;

    const missingItems = assessmentState.sections.flatMap((section: any) =>
        section.items.filter((item: any) => !assessmentState.completedItems.includes(item.id))
    );

    const highPriorityMissing = missingItems.filter((item: any) => item.priority === 'high');

    return {
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

        riskAssessment: `Current governance gaps present ${completionPercentage > 80 ? 'LOW' :
                completionPercentage > 60 ? 'MODERATE' :
                    completionPercentage > 40 ? 'HIGH' : 'CRITICAL'
            } risk to the organization. ${highPriorityMissing.length > 0 ?
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

        const { assessmentState, organizationInfo } = requestBody;

        // Try to use Azure OpenAI first
        const openaiClient = createAzureOpenAIClient();
        let report;

        if (openaiClient) {
            context.log('Using Azure OpenAI for report generation');
            try {
                report = await generateAIReport(openaiClient, assessmentState, organizationInfo);
            } catch (error) {
                context.log('Azure OpenAI failed, falling back to static report:', error);
                report = generateFallbackReport(assessmentState, organizationInfo);
            }
        } else {
            context.log('Azure OpenAI not configured, using fallback report');
            report = generateFallbackReport(assessmentState, organizationInfo);
        }

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            jsonBody: report
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
