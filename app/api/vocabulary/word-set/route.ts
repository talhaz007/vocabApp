import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const WordSetSchema = z.object({
  words: z.array(z.string()),
  category: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  possibleSentences: z.array(z.string()),
  question: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty, category, includeQuestion, excludeCategories } = body;
    
    const prompt = `
      Generate a set of 5 related vocabulary words ${difficulty ? `with ${difficulty} difficulty` : ""} 
      ${category ? `from the category "${category}"` : ""} for students in grades 1-7. Words should not be synonyms.
      Include the category name, and 3 example sentences using these words.
      ${includeQuestion ? "Also generate a thought-provoking question that would require using these words in the response." : ""}
      ${excludeCategories ? `Do NOT generate words from the following categories: ${excludeCategories.join(', ')}` : ""}
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(WordSetSchema, "wordSet"),
      messages: [
        { 
          role: "system", 
          content: "You are a language expert. Generate sets of related vocabulary words with example sentences."
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
    console.error("Error generating word set:", error);
    // Return a fallback word set if generation fails
    return NextResponse.json({
      words: ["Innovation", "Technology", "Progress", "Development", "Future"],
      category: "Technology and Progress",
      difficulty: "medium",
      possibleSentences: [
        "Technological innovation drives progress in many fields.",
        "The future of development depends on sustainable technology.",
        "Progress in technology has accelerated in recent decades."
      ],
      question: 
        "How might technological innovation shape our future?" 
    }, { status: 500 });
  }
} 