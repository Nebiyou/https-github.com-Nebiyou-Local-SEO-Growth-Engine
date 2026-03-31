import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function runAudit(url: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Perform a Local SEO Gap Analysis for the following URL: ${url}. 
    Focus on:
    1. Map Pack presence (simulated).
    2. NAP (Name, Address, Phone) consistency.
    3. Google Ad Grant potential (if it's a nonprofit).
    4. "Zero-Click" optimization opportunities for small businesses.
    
    Tone: Professional, neighborly (DMV area focus), and mission-driven.
    Geography: Arlington, Alexandria, Tysons Corner, Silver Spring, Bethesda, Rockville, and DC.
    
    Output in Markdown format with clear sections.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response.text;
}

export async function generateOutreach(auditData: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this SEO audit data:
    ${auditData}
    
    Generate a "Cold but Helpful" email using the "Found Money" template. 
    Focus on the $10k/month Google Ad Grant for nonprofits and "Zero-Click" optimization for businesses.
    
    Tone: Professional, neighborly (DMV area focus), and mission-driven.
    Geography: Arlington, Alexandria, Tysons Corner, Silver Spring, Bethesda, Rockville, and DC.
    
    Avoid jargon. Explain the benefit before the feature.`,
  });
  return response.text;
}

export async function getGrantAdvice(ctr: number, keywords: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Monitor Google Ad Grant status for a nonprofit client.
    Current CTR: ${ctr}%
    Keywords: ${keywords}
    
    If CTR is below 5%, flag it and suggest "Negative Keywords" to protect their $120k/year budget.
    Provide actionable advice in a neighborly tone.`,
  });
  return response.text;
}

export async function generateImpactReport(metrics: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize GA4 and Google Ads data into a "Monthly Impact Report".
    Raw Metrics: ${metrics}
    
    Translate technical metrics into "Community Impact" (e.g., "Volunteers Recruited" instead of "Conversions").
    Tone: Professional, neighborly (DMV area focus), and mission-driven.`,
  });
  return response.text;
}
