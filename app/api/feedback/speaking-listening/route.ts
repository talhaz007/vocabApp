import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const SpeakingListeningFeedbackSchema = z.object({
  exerciseFeedback: z.array(z.object({
    exerciseType: z.enum(["pronunciation", "shadowing", "audioLearning", "speakingChallenge"]),
    word: z.string().optional(),
    text: z.string().optional(),
    isCorrect: z.boolean(),
    feedback: z.string(),
    usageQuality: z.enum(["excellent", "good", "fair", "poor"]).optional(),
    detectedWords: z.array(z.string()).optional(),
    improvementSuggestions: z.array(z.string()).optional(),
  })),
  overallFeedback: z.string(),
  speakingListeningScore: z.number(),
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
      Evaluate these speaking and listening exercises.
      For each exercise, determine:
      - If the exercise was completed correctly
      - The quality of performance (excellent, good, fair, or poor)
      - Specific feedback on performance
      - Suggestions for improvement
      
      Here are the exercises to evaluate:
      ${savedExercises.map((item, index) => {
        let exerciseDetails = `${index + 1}. Type: "${item.exerciseType}"`;
        
        if (item.word) exerciseDetails += ` - Word: "${item.word}"`;
        if (item.text) exerciseDetails += ` - Text: "${item.text}"`;
        if (item.detectedWords) exerciseDetails += ` - Detected Words: [${item.detectedWords.join(', ')}]`;
        if (item.feedback) exerciseDetails += ` - Previous Feedback: "${item.feedback}"`;
        if (item.isCorrect !== undefined) exerciseDetails += ` - Was Correct: ${item.isCorrect}`;
        
        return exerciseDetails;
      }).join('\n')}
      
      Also provide:
      - Overall feedback on speaking and listening skills across all exercises
      - A speaking and listening mastery score (0-100) based on overall performance it should be a strict score based on the correctness of the exercises
      
      Based on the user's performance, recommend exactly 2 apps from the following list that would be most helpful:
      1. Grammarly - Helps with grammar, spelling, and writing clarity
      2. Spelling Pro - Focuses on improving spelling through interactive exercises
      3. Writely - Enhances writing skills with AI-powered suggestions
      4. Readly - Improves reading comprehension with adaptive exercises
      5. Speakify - Perfects pronunciation and speaking fluency with AI coaching
      
      For each recommended app, provide a specific reason why it would benefit this user based on their performance.
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(SpeakingListeningFeedbackSchema, "feedback"),
      messages: [
        { 
          role: "system", 
          content: "You are a language instructor specializing in speaking and listening skills. Evaluate exercises for pronunciation, shadowing, audio comprehension, and speaking challenges. Provide constructive feedback to help students improve their speaking and listening abilities."
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
    console.error("Error evaluating speaking-listening exercises:", error);
    
    return NextResponse.json({
      error: "Failed to evaluate speaking-listening exercises",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 