import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const WordSetSchema = z.object({
  words: z.array(z.string()).min(2).max(6),
  category: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  possibleSentences: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty, category } = body;
    
    const prompt = `
      Generate a set of 4-6 related words ${difficulty ? `with ${difficulty} difficulty` : ""} 
      ${category ? `from the category "${category}"` : ""}.
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(WordSetSchema, "wordSet"),
      messages: [
        { 
          role: "system", 
          content: "You are a vocabulary expert. Generate sets of related words that can be used together in sentences."
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
      words: ["Eloquent", "Persuasive", "Debate", "Audience"],
      category: "Communication",
      difficulty: "medium",
      possibleSentences: [
        "The eloquent speaker was persuasive in the debate, captivating the audience.",
        "During the debate, her eloquent style made her persuasive to the audience.",
        "The persuasive argument was delivered in an eloquent manner to the audience."
      ]
    }, { status: 500 });
  }
} 