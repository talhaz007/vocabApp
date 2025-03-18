import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const WritingPromptSchema = z.object({
  title: z.string(),
  description: z.string(),
  targetWords: z.array(z.string()),
  category: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  minWords: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty, category } = body;
    
    const prompt = `
      Generate a writing prompt for language learners in grades 1-7.
      
      Create a thoughtful, engaging writing prompt ${difficulty ? `with ${difficulty} difficulty` : ""} 
      ${category ? `related to the category "${category}"` : ""}.
      
      Include:
      1. A clear, concise title for the prompt
      2. A detailed description of what the learner should write about
      3. 5-7 target vocabulary words that the learner should try to use in their response
      4. A category/topic label for the prompt
      5. A minimum word count appropriate for the difficulty level:
         - easy: 80-100 words
         - medium: 120-150 words
         - hard: 180-250 words
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(WritingPromptSchema, "writingPrompt"),
      messages: [
        { 
          role: "system", 
          content: "You are a writing instructor. Create engaging, educational writing prompts for language learners."
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
    console.error("Error generating writing prompt:", error);
    // Return a fallback prompt if generation fails
    return NextResponse.json({
      title: "Technology in Daily Life",
      description: "Discuss how technology has changed your daily routine in the past five years. What activities have become easier or more efficient? Are there any downsides to these technological changes?",
      targetWords: ["Innovation", "Integrate", "Efficient", "Convenient", "Drawback", "Dependency"],
      category: "Technology",
      difficulty: "medium",
      minWords: 120
    }, { status: 500 });
  }
} 