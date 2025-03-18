import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const WritingEvaluationSchema = z.object({
  feedback: z.string(),
  usedWords: z.array(z.string()),
  grammarSuggestions: z.array(z.string()).optional(),
  styleSuggestions: z.array(z.string()).optional(),
  overallQuality: z.enum(["excellent", "good", "needs_improvement"]),
  isValid: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { response, targetWords, minWords, prompt } = body;
    
    if (!response || !targetWords || !minWords || !prompt) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    // Count words in the response
    const wordCount = response.split(/\s+/).filter(word => word.length > 0).length;
    
    // Check if the response meets the minimum word count
    if (wordCount < minWords) {
      return NextResponse.json({
        feedback: `Your response is too short. Please write at least ${minWords} words. Current count: ${wordCount}`,
        usedWords: [],
        grammarSuggestions: [],
        styleSuggestions: [],
        overallQuality: "needs_improvement",
        isValid: false
      });
    }
    
    const evaluationPrompt = `
      Evaluate this writing response to the prompt: "${prompt}"
      
      The writer was asked to include these target vocabulary words: ${targetWords.join(", ")}
      
      The minimum word count was ${minWords} words.
      
      The writer's response is:
      "${response}"
      
      Please:
      1. Identify which target words were used correctly in the response
      2. Provide constructive feedback on the writing
      3. Suggest 2-3 grammar improvements if needed
      4. Suggest 2-3 style improvements if needed
      5. Rate the overall quality (excellent, good, or needs_improvement)
      6. Determine if the response is valid (true if at least 70% of target words were used and quality is at least "good")
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(WritingEvaluationSchema, "evaluation"),
      messages: [
        { 
          role: "system", 
          content: "You are a writing instructor. Evaluate written responses and provide helpful, constructive feedback."
        },
        { 
          role: "user", 
          content: evaluationPrompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 1024
    });
    
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error("Error evaluating writing response:", error);
    // Return a fallback evaluation if processing fails
    return NextResponse.json({
      feedback: "We couldn't properly evaluate your response. Please try again.",
      usedWords: [],
      grammarSuggestions: ["Check your grammar and punctuation"],
      styleSuggestions: ["Consider revising for clarity"],
      overallQuality: "needs_improvement",
      isValid: false
    }, { status: 500 });
  }
} 