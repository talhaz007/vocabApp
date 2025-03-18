import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const SentenceEvaluationSchema = z.object({
  isCorrect: z.boolean(),
  feedback: z.string(),
  usageQuality: z.string().optional(), // e.g., "excellent", "good", "needs improvement"
  exampleSentences: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, sentence } = body;
    
    if (!word || !sentence) {
      return NextResponse.json({
        error: "Both 'word' and 'sentence' are required"
      }, { status: 400 });
    }

    const prompt = `
      Mode: sentenceUsage
      
      Evaluate this sentence: "${sentence}"
      Word to evaluate: "${word}"
      
      Check for:
      1. Correct usage of the word in context
      2. Appropriate part of speech (noun, verb, adjective, etc.)
      3. Proper word form/conjugation if applicable
      4. Collocations and natural language patterns with this word
      5. Semantic appropriateness in the context
      
      Provide:
      - Clear feedback on how the word was used
      - A brief definition of the word to help understanding
      - Usage quality rating (excellent, good, fair, poor)
      - 2-3 example sentences showing proper usage if the original was incorrect
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(SentenceEvaluationSchema, "evaluation"),
      messages: [
        { 
          role: "system", 
          content: "You are a language learning assistant in sentenceUsage mode. Focus specifically on how well the given word is used in the sentence. Evaluate if the word is used correctly in terms of meaning, context, and grammar. Provide a definition of the word, constructive feedback, example sentences for incorrect usage, and a usage quality rating."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.5,
      max_tokens: 1024
    });
    
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error("Error evaluating sentence:", error);
    return NextResponse.json({
      isCorrect: false,
      feedback: "We couldn't evaluate your sentence. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}