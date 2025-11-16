import { invokeLLM } from "../_core/llm";

export interface CaseStudyInput {
  projectName: string;
  projectType: string; // residential, commercial, industrial
  location: string;
  totalArea: number; // sq ft
  materialsUsed: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }>;
  carbonSaved: number; // kg CO₂e
  costDifference: number; // $
  timeframe: string; // e.g., "6 months"
}

export interface CaseStudy {
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  keyMetrics: {
    carbonSaved: number;
    costImpact: string;
    materialsSubstituted: number;
  };
  testimonial: string;
}

/**
 * Generate a case study from project data using AI
 */
export async function generateCaseStudy(input: CaseStudyInput): Promise<CaseStudy> {
  const prompt = `Generate a professional case study for a sustainable construction project with the following details:

Project: ${input.projectName}
Type: ${input.projectType}
Location: ${input.location}
Size: ${input.totalArea} sq ft
Timeframe: ${input.timeframe}

Materials Used:
${input.materialsUsed.map(m => `- ${m.name} (${m.category}): ${m.quantity} ${m.unit}`).join('\n')}

Impact:
- Carbon Saved: ${input.carbonSaved.toFixed(1)} kg CO₂e
- Cost Difference: $${input.costDifference.toFixed(2)}

Please generate a case study with the following sections:
1. Title (compelling, under 100 characters)
2. Summary (2-3 sentences overview)
3. Challenge (what problem did the project face?)
4. Solution (how did sustainable materials solve it?)
5. Results (quantifiable outcomes)
6. Testimonial (realistic quote from project architect/owner)

Format as JSON with keys: title, summary, challenge, solution, results, testimonial`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a professional technical writer specializing in sustainable construction case studies. Generate compelling, data-driven case studies that highlight environmental and economic benefits." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "case_study",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Compelling case study title" },
              summary: { type: "string", description: "2-3 sentence overview" },
              challenge: { type: "string", description: "Problem statement" },
              solution: { type: "string", description: "How sustainable materials solved it" },
              results: { type: "string", description: "Quantifiable outcomes" },
              testimonial: { type: "string", description: "Realistic quote from stakeholder" },
            },
            required: ["title", "summary", "challenge", "solution", "results", "testimonial"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const caseStudyData = JSON.parse(content);

    return {
      ...caseStudyData,
      keyMetrics: {
        carbonSaved: input.carbonSaved,
        costImpact: input.costDifference >= 0 
          ? `+$${input.costDifference.toFixed(2)}` 
          : `-$${Math.abs(input.costDifference).toFixed(2)}`,
        materialsSubstituted: input.materialsUsed.length,
      },
    };
  } catch (error) {
    console.error("Case study generation failed:", error);
    throw new Error("Failed to generate case study");
  }
}

/**
 * Generate monthly impact email report content
 */
export async function generateMonthlyReport(data: {
  userName: string;
  month: string;
  carbonSaved: number;
  projectsCompleted: number;
  materialsSubstituted: number;
  topMaterial: string;
}): Promise<string> {
  const prompt = `Generate a friendly, motivating monthly impact report email for a user of BlockPlane (sustainable materials platform).

User: ${data.userName}
Month: ${data.month}
Carbon Saved: ${data.carbonSaved.toFixed(1)} kg CO₂e
Projects Completed: ${data.projectsCompleted}
Materials Substituted: ${data.materialsSubstituted}
Top Material: ${data.topMaterial}

Create an engaging email that:
1. Celebrates their achievements
2. Puts carbon savings in relatable terms (cars off road, trees planted)
3. Highlights their top material choice
4. Encourages continued use
5. Includes a call-to-action to optimize more projects

Tone: Professional but warm, data-driven but inspiring.
Format: Plain text email (no HTML)`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a sustainability communications specialist writing impact reports that motivate continued action." },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Monthly report generation failed:", error);
    throw new Error("Failed to generate monthly report");
  }
}
