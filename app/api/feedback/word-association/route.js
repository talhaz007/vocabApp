// File: app/api/word-association/evaluate/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const WordAssociationFeedbackSchema = z.object({
  exercisesEvaluation: z.array(z.object({
    category: z.string(),
    difficulty: z.string(),
    selectedWords: z.array(z.string()),
    userSentence: z.string(),
    evaluation: z.object({
      coherence: z.number().min(1).max(10),
      creativity: z.number().min(1).max(10),
      grammaticalAccuracy: z.number().min(1).max(10),
      wordUsage: z.number().min(1).max(10),
      overallScore: z.number().min(1).max(10)
    }),
    feedback: z.string(),
    improvementSuggestions: z.array(z.string())
  })),
  overallFeedback: z.string(),
  masteryScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string())
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { exercises } = body;
    
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: "No exercises provided" },
        { status: 400 }
      );
    }
    
    // Clean up the exercises data to ensure it has all needed fields
    const cleanedExercises = exercises.map(exercise => ({
      category: exercise.category || "Unknown Category",
      difficulty: exercise.difficulty || "medium",
      selectedWords: Array.isArray(exercise.selectedWords) ? exercise.selectedWords : [],
      userSentence: exercise.userSentence || ""
    }));
    
    const evaluationPrompt = `
      Evaluate these word association exercises where the user selected words and created a sentence.
      
      For each exercise, evaluate:
      - Coherence: How well the sentence flows and makes sense (1-10)
      - Creativity: How original and inventive the sentence is (1-10)
      - Grammatical Accuracy: How grammatically correct the sentence is (1-10)
      - Word Usage: How effectively the selected words are incorporated (1-10)
      - Overall Score: An overall rating of the sentence (1-10)
      
      Also provide:
      - Specific feedback on each sentence
      - 1-3 improvement suggestions for each sentence
      - Overall feedback across all exercises
      - A mastery score (0-100) based on overall performance
      - 2-3 strengths demonstrated across all exercises
      - 2-3 areas for improvement across all exercises
      
      Here are the exercises to evaluate:
      ${cleanedExercises.map((exercise, index) => 
        `${index + 1}. Category: "${exercise.category}"
         Difficulty: "${exercise.difficulty}"
         Selected Words: ${exercise.selectedWords.join(', ')}
         User's Sentence: "${exercise.userSentence}"`
      ).join('\n\n')}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { 
          role: "system", 
          content: `You are a language instructor specializing in evaluating word association exercises. You analyze how well learners can use selected words in meaningful, coherent sentences. Provide constructive, specific feedback focused on helping learners improve their ability to connect words meaningfully in sentences.

Your response must follow this exact JSON schema:
{
  "exercisesEvaluation": [
    {
      "category": "string",
      "difficulty": "string",
      "selectedWords": ["string"],
      "userSentence": "string",
      "evaluation": {
        "coherence": number (1-10),
        "creativity": number (1-10),
        "grammaticalAccuracy": number (1-10),
        "wordUsage": number (1-10),
        "overallScore": number (1-10)
      },
      "feedback": "string",
      "improvementSuggestions": ["string"]
    }
  ],
  "overallFeedback": "string",
  "masteryScore": number (0-100),
  "strengths": ["string"],
  "areasForImprovement": ["string"]
}`
        },
        { 
          role: "user", 
          content: evaluationPrompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 2048
    });
    
    // Parse the response content
    const responseData = JSON.parse(completion.choices[0].message.content);
    
    // Validate the response with Zod
    const validatedData = WordAssociationFeedbackSchema.parse(responseData);
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("Error evaluating word association exercises:", error);
    
    // Check for OpenAI API errors and provide more specific error messages
    if (error.response && error.response.data) {
      return NextResponse.json({
        error: "OpenAI API error",
        message: error.response.data.error.message || "Unknown OpenAI error"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: "Failed to evaluate exercises",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}