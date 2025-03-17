import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const SentenceEvaluationSchema = z.object({
  isValid: z.boolean(),
  feedback: z.string(),
  alternativeSentences: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sentence, requiredWords } = body;
    
    const prompt = `
      Evaluate this sentence: "${sentence}"
      
      It should include these words: ${requiredWords.join(", ")}
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      response_format: zodResponseFormat(SentenceEvaluationSchema, "evaluation"),
      messages: [
        { 
          role: "system", 
          content: "You are a language expert. Evaluate sentences to check if they correctly use the required words and provide constructive feedback."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });
    
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error("Error evaluating sentence:", error);
    // Return a fallback evaluation if generation fails
    return NextResponse.json({
      isValid: false,
      feedback: "We couldn't evaluate your sentence. Please try again later."
    }, { status: 500 });
  }
} 