import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential } from "@azure/identity";
import pdfParse from "pdf-parse";
import * as fs from 'fs';
import * as path from 'path';

interface AIReportRequest {
    assessmentState: {
        sections: any[];
        completedItems: string[];
        lastUpdated: string;
    };
    reportData?: {
        totalItems: number;
        completedItems: number;
        completionPercentage: number;
        missingItems: any[];
    };
    organizationInfo?: {
        name?: string;
        size?: string;
        industry?: string;
    };
}

// Helper function to load static documents from documents folder
async function loadStaticDocuments(): Promise<string | null> {
    try {
        // Look for document files in the documents folder
        console.log(`🔍 Debug: __dirname = ${__dirname}`);
        console.log(`🔍 Debug: process.cwd() = ${process.cwd()}`);
        
        // Try multiple possible paths
        const possiblePaths = [
            path.join(__dirname, '..', 'documents'),
            path.join(__dirname, 'documents'),
            path.join(process.cwd(), 'documents'),
            path.join(process.cwd(), 'api', 'documents')
        ];
        
        let documentsPath = '';
        let pathFound = false;
        
        for (const testPath of possiblePaths) {
            console.log(`📁 Testing path: ${testPath}`);
            if (fs.existsSync(testPath)) {
                documentsPath = testPath;
                pathFound = true;
                console.log(`✅ Found documents folder at: ${testPath}`);
                break;
            } else {
                console.log(`❌ Path does not exist: ${testPath}`);
            }
        }
        
        if (!pathFound) {
            console.log('⚠️ Documents folder not found in any of the expected locations');
            return null;
        }
        
        const documentFiles = fs.readdirSync(documentsPath).filter(file => 
            file.toLowerCase().endsWith('.pdf') || 
            file.toLowerCase().endsWith('.md') || 
            file.toLowerCase().endsWith('.txt')
        );
        
        console.log(`📂 Found ${documentFiles.length} document file(s) in documents folder:`, documentFiles);
        
        if (documentFiles.length === 0) {
            console.log('ℹ️ No static document files found in documents folder');
            return null;
        }
        
        let combinedContent = '';
        let pdfCount = 0;
        let textCount = 0;
        
        for (const fileName of documentFiles) {
            const filePath = path.join(documentsPath, fileName);
            console.log(`Loading static document: ${fileName}`);
            
            if (fileName.toLowerCase().endsWith('.pdf')) {
                // Handle PDF files
                try {
                    const pdfBuffer = fs.readFileSync(filePath);
                    const data = await pdfParse(pdfBuffer);
                    const extractedText = data.text.trim();
                    combinedContent += `\n\nDocument: ${fileName}\n${extractedText}`;
                    pdfCount++;
                    console.log(`✓ PDF loaded successfully: ${fileName} (${extractedText.length} characters extracted)`);
                } catch (pdfError) {
                    console.error(`✗ Failed to load PDF: ${fileName}`, pdfError);
                }
            } else {
                // Handle text/markdown files
                try {
                    const textContent = fs.readFileSync(filePath, 'utf-8');
                    combinedContent += `\n\nDocument: ${fileName}\n${textContent.trim()}`;
                    textCount++;
                    console.log(`✓ Text/Markdown loaded successfully: ${fileName} (${textContent.length} characters)`);
                } catch (textError) {
                    console.error(`✗ Failed to load text file: ${fileName}`, textError);
                }
            }
        }
        
        console.log(`📄 Static documents summary: ${pdfCount} PDF(s), ${textCount} text/markdown file(s) loaded`);
        console.log(`📝 Total combined content length: ${combinedContent.length} characters`);
        
        // Return extracted text (limit to reasonable size for AI processing)
        if (combinedContent.length > 8000) {
            console.log('Static documents content too long, truncating to 8,000 characters');
            return combinedContent.substring(0, 8000) + '\n\n[Content truncated for processing...]';
        }
        
        return combinedContent.trim();
    } catch (error) {
        console.error('Error loading static documents:', error);
        return null;
    }
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
    organizationInfo: any,
    reportData?: any,
    staticDocumentsText?: string
): Promise<any> {
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4";

    // Use pre-calculated data if available, otherwise calculate from assessment state
    const totalItems = reportData?.totalItems || assessmentState.sections.reduce((acc: number, section: any) => acc + section.items.length, 0);
    const completedItems = reportData?.completedItems || assessmentState.completedItems.length;
    const completionPercentage = reportData?.completionPercentage || (completedItems / totalItems) * 100;

    const missingItems = reportData?.missingItems || assessmentState.sections.flatMap((section: any) =>
        section.items.filter((item: any) => !assessmentState.completedItems.includes(item.id))
    );

    // Use provided static documents context
    let staticDocumentsContext = '';
    if (staticDocumentsText) {
        staticDocumentsContext = `\n\nOrganizational Governance Framework (from static reference documents):
${staticDocumentsText}`;
        console.log(`🤖 AI Report: Including ${staticDocumentsText.length} characters of static document context`);
    } else {
        console.log(`ℹ️ AI Report: No static documents provided`);
    }

    const prompt = `You are an expert Microsoft 365 governance consultant. Generate a comprehensive governance assessment report based on the following data:

Assessment Summary:
- Total governance items: ${totalItems}
- Completed items: ${completedItems}
- Completion percentage: ${Math.round(completionPercentage)}%
- Organization: ${organizationInfo?.name || 'Not specified'}
- Industry: ${organizationInfo?.industry || 'Not specified'}
- Organization size: ${organizationInfo?.size || 'Not specified'}

Missing items requiring attention:
${missingItems.map((item: any) => `- ${item.title} (Priority: ${item.priority})`).join('\n')}${staticDocumentsContext}

Please provide a detailed analysis in JSON format with the following structure, no markdown or html. just text:
{
  "executiveSummary": "High-level summary of governance posture",
  "detailedAnalysis": "Detailed technical analysis of gaps and strengths", 
  "actionPlan": ["specific", "actionable", "recommendations"],
  "timeline": "Realistic timeline for implementation",
  "riskAssessment": "Assessment of current risks and mitigation strategies",
  "recommendations": ["strategic", "recommendations", "for", "improvement"]
}

${staticDocumentsContext ? 'Use the organizational governance framework from the reference documents to provide recommendations that align with existing policies and best practices. ' : ''}Focus on Microsoft 365 agent governance, security, compliance, and operational excellence. Provide specific, actionable insights based on the assessment data.`;

    try {
        console.log('Calling Azure OpenAI with deployment:', deploymentName);
        const response = await openaiClient.chat.completions.create({
            model: deploymentName,
            messages: [
                {
                    role: "system",
                    content: "You are an expert Microsoft 365 governance consultant. Provide detailed, actionable governance recommendations that align with organizational policies and industry best practices."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 3000,
            temperature: 0.3
        });

        const content = response.choices[0]?.message?.content;
        console.log('Azure OpenAI response received:', content ? 'Success' : 'No content');

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
function generateFallbackReport(assessmentState: any, organizationInfo: any, reportData?: any, staticDocumentsText?: string): any {
    // Use pre-calculated data if available, otherwise calculate from assessment state
    const totalItems = reportData?.totalItems || assessmentState.sections.reduce((acc: number, section: any) => acc + section.items.length, 0);
    const completedItems = reportData?.completedItems || assessmentState.completedItems.length;
    const completionPercentage = reportData?.completionPercentage || (completedItems / totalItems) * 100;

    const missingItems = reportData?.missingItems || assessmentState.sections.flatMap((section: any) =>
        section.items.filter((item: any) => !assessmentState.completedItems.includes(item.id))
    );

    const highPriorityMissing = missingItems.filter((item: any) => item.priority === 'high');

    // Log static documents usage in fallback report
    if (staticDocumentsText) {
        console.log(`📋 Fallback Report: Including ${staticDocumentsText.length} characters of static document context`);
    } else {
        console.log(`📭 Fallback Report: No static documents provided`);
    }

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

        const { assessmentState, organizationInfo, reportData } = requestBody;

        // Always try to load static documents first, regardless of AI configuration
        context.log('Loading static governance documents...');
        let staticDocumentsContext = '';
        try {
            const staticDocumentsText = await loadStaticDocuments();
            if (staticDocumentsText) {
                staticDocumentsContext = staticDocumentsText;
                context.log(`Static documents loaded successfully: ${staticDocumentsText.length} characters`);
            } else {
                context.log('No static documents found or loaded');
            }
        } catch (error) {
            context.log('Error loading static documents:', error);
        }

        // Try to use Azure OpenAI first
        const openaiClient = createAzureOpenAIClient();
        let report;

        if (openaiClient) {
            context.log('Using Azure OpenAI for report generation');
            try {
                report = await generateAIReport(openaiClient, assessmentState, organizationInfo, reportData, staticDocumentsContext);
            } catch (error) {
                context.log('Azure OpenAI failed, falling back to static report:', error);
                report = generateFallbackReport(assessmentState, organizationInfo, reportData, staticDocumentsContext);
            }
        } else {
            context.log('Azure OpenAI not configured, using fallback report');
            report = generateFallbackReport(assessmentState, organizationInfo, reportData, staticDocumentsContext);
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
