import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const SentenceFeedbackSchema = z.object({
  sentenceFeedback: z.array(z.object({
    word: z.string(),
    sentence: z.string(),
    isCorrect: z.boolean(),
    feedback: z.string(),
    usageQuality: z.enum(["excellent", "good", "fair", "poor"]),
    improvementSuggestions: z.array(z.string()).optional(),
    exampleUsage: z.string()
  })),
  overallFeedback: z.string(),
  vocabularyMasteryScore: z.number()
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { savedAnswers } = body;
    
    if (!savedAnswers || !Array.isArray(savedAnswers) || savedAnswers.length === 0) {
      return NextResponse.json(
        { error: "No saved answers provided" },
        { status: 400 }
      );
    }
    
    const evaluationPrompt = `
      Evaluate these sentences that use specific vocabulary words.
      For each sentence, determine:
      - If the word is used correctly in context
      - The quality of usage (excellent, good, fair, or poor)
      - Specific feedback on how the word was used
      - Suggestions for improvement if needed
      - An example usage of the word in a new sentence
      
      Here are the sentences to evaluate:
      ${savedAnswers.map((item, index) => 
        `${index + 1}. Word: "${item.word}" - Sentence: "${item.answer}"`
      ).join('\n')}
      
      Also provide:
      - Overall feedback on vocabulary usage across all sentences
      - A vocabulary mastery score (0-100) based on overall performance
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      response_format: zodResponseFormat(SentenceFeedbackSchema, "feedback"),
      messages: [
        { 
          role: "system", 
          content: "You are a language instructor specializing in vocabulary usage. Evaluate sentences for correct word usage, context appropriateness, and provide constructive feedback to help students improve."
        },
        { 
          role: "user", 
          content: evaluationPrompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 2048
    });
    
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error("Error evaluating sentences:", error);
    
    return NextResponse.json({
      error: "Failed to evaluate sentences",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}