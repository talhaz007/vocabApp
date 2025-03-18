import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const MemoryFeedbackSchema = z.object({
  exerciseFeedback: z.array(z.object({
    exerciseType: z.enum(["soundMnemonic", "memoryPalace", "chunking"]),
    word: z.string().optional(),
    mnemonic: z.string().optional(),
    definition: z.string().optional(),
    isCorrect: z.boolean(),
    feedback: z.string(),
    usageQuality: z.enum(["excellent", "good", "fair", "poor"]).optional(),
    improvementSuggestions: z.array(z.string()).optional(),
  })),
  overallFeedback: z.string(),
  memoryScore: z.number(),
  appRecommendations: z.array(z.object({
    appName: z.enum(["Grammarly", "Spelling Pro", "Writely", "Readly", "Speakify"]),
    reason: z.string()
  }))
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { savedExercises } = body;
    
    if (!savedExercises || !Array.isArray(savedExercises) || savedExercises.length === 0) {
      return NextResponse.json(
        { error: "No saved exercises provided" },
        { status: 400 }
      );
    }
    
    const evaluationPrompt = `
      Evaluate these memory exercises.
      For each exercise, determine:
      - If the exercise was completed correctly
      - The quality of performance (excellent, good, fair, or poor)
      - Specific feedback on memory technique usage
      - Suggestions for improvement
      
      Here are the exercises to evaluate:
      ${savedExercises.map((item, index) => {
        let exerciseDetails = `${index + 1}. Type: "${item.exerciseType}"`;
        
        if (item.word) exerciseDetails += ` - Word: "${item.word}"`;
        if (item.mnemonic) exerciseDetails += ` - Mnemonic: "${item.mnemonic}"`;
        if (item.definition) exerciseDetails += ` - Definition: "${item.definition}"`;
        if (item.userAnswer) exerciseDetails += ` - User's Answer: "${item.userAnswer}"`;
        if (item.feedback) exerciseDetails += ` - Previous Feedback: "${item.feedback}"`;
        if (item.isCorrect !== undefined) exerciseDetails += ` - Was Correct: ${item.isCorrect}`;
        
        return exerciseDetails;
      }).join('\n')}
      
      Also provide:
      - Overall feedback on memory techniques and retention skills across all exercises
      - A memory mastery score (0-100) based on overall performance
      
      Based on the user's performance, recommend exactly 2 apps from the following list that would be most helpful:
      1. Grammarly - Helps with grammar, spelling, and writing clarity
      2. Spelling Pro - Focuses on improving spelling through interactive exercises
      3. Writely - Enhances writing skills with AI-powered suggestions
      4. Readly - Improves reading comprehension with adaptive exercises
      5. Speakify - Perfects pronunciation and speaking fluency with AI coaching
      
      For each recommended app, provide a specific reason why it would benefit this user based on their performance.
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      response_format: zodResponseFormat(MemoryFeedbackSchema, "feedback"),
      messages: [
        { 
          role: "system", 
          content: "You are a memory training expert specializing in language learning. Evaluate exercises for sound mnemonics, memory palace techniques, and chunking strategies. Provide constructive feedback to help students improve their vocabulary retention."
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
    console.error("Error evaluating memory exercises:", error);
    
    return NextResponse.json({
      error: "Failed to evaluate memory exercises",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 