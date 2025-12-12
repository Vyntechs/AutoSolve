import { getOpenAITextResponse } from "./chat-service";
import { AIMessage } from "../types/ai";

export interface DiagnosticInput {
  vehicle: {
    year: string;
    make: string;
    model: string;
    engine: string;
    mileage: string;
  };
  symptoms: string[];
  dtcCodes: string[];
}

export interface DiagnosticStep {
  step: number;
  action: string;
  details: string;
  tools?: string[];
  specs?: string;
  proTip?: string;
}

export interface DiagnosticPath {
  title: string;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  commonCauses: string[];
  steps: DiagnosticStep[];
  estimatedCost?: string;
  safetyWarning?: string;
}

export interface DiagnosticResult {
  summary: string;
  paths: DiagnosticPath[];
  quickTips: string[];
  relatedTSBs?: string[];
}

const MASTER_TECH_PROMPT = `You are an elite Master Automotive Technician with 40+ years of experience across all vehicle makes and models. You have ASE Master Certification, factory training from major manufacturers, and have diagnosed thousands of vehicles.

Your expertise includes:
- Engine performance, emissions, and driveability
- Electrical systems and computer diagnostics
- Transmission, drivetrain, and differential issues
- Brake, suspension, and steering systems
- HVAC and comfort systems
- Hybrid and electric vehicle systems

When diagnosing, you:
1. Consider the MOST LIKELY causes first based on the specific vehicle, mileage, and symptoms
2. Provide step-by-step diagnostic procedures a technician can follow
3. Include specific test values and specifications when applicable
4. Share pro tips and common mistakes to avoid
5. Warn about safety hazards when present
6. Consider TSBs and common failures for the specific make/model/year

Always respond with practical, actionable diagnostic guidance that a shop technician can immediately use.`;

export async function getDiagnosticAnalysis(
  input: DiagnosticInput
): Promise<DiagnosticResult> {
  const { vehicle, symptoms, dtcCodes } = input;

  const userMessage = `
VEHICLE INFORMATION:
- Year: ${vehicle.year}
- Make: ${vehicle.make}
- Model: ${vehicle.model}
- Engine: ${vehicle.engine || "Not specified"}
- Mileage: ${vehicle.mileage || "Not specified"}

REPORTED SYMPTOMS:
${symptoms.length > 0 ? symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n") : "No symptoms reported"}

DTC CODES:
${dtcCodes.length > 0 ? dtcCodes.join(", ") : "No DTCs present"}

Please provide a comprehensive diagnostic analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary of the likely issue",
  "paths": [
    {
      "title": "Most likely diagnosis",
      "confidence": 85,
      "severity": "high",
      "description": "Detailed explanation of the issue",
      "commonCauses": ["Cause 1", "Cause 2"],
      "steps": [
        {
          "step": 1,
          "action": "What to do",
          "details": "Detailed instructions",
          "tools": ["Tool 1", "Tool 2"],
          "specs": "Specific values to check",
          "proTip": "Expert advice"
        }
      ],
      "estimatedCost": "$X - $Y parts + labor",
      "safetyWarning": "Any safety concerns"
    }
  ],
  "quickTips": ["Tip 1", "Tip 2"],
  "relatedTSBs": ["TSB number or description if applicable"]
}

Provide 1-3 diagnostic paths ranked by likelihood. Be specific to this exact vehicle.`;

  const messages: AIMessage[] = [
    { role: "system", content: MASTER_TECH_PROMPT },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await getOpenAITextResponse(messages, {
      temperature: 0.3,
      maxTokens: 4096,
    });

    // Parse the JSON response
    const content = response.content;

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    try {
      const result = JSON.parse(jsonStr.trim()) as DiagnosticResult;
      return result;
    } catch {
      // If JSON parsing fails, create a structured response from the text
      return {
        summary: content.substring(0, 200) + "...",
        paths: [
          {
            title: "Diagnostic Analysis",
            confidence: 70,
            severity: "medium",
            description: content,
            commonCauses: [],
            steps: [
              {
                step: 1,
                action: "Review analysis above",
                details: "Please review the diagnostic information provided",
              },
            ],
          },
        ],
        quickTips: [],
      };
    }
  } catch (error) {
    console.error("Diagnostic analysis error:", error);
    throw new Error("Failed to get diagnostic analysis. Please try again.");
  }
}
