import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const ShadowingExerciseSchema = z.object({
  text: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  focusPoints: z.array(z.string()),
  phonetics: z.string().optional(),
  keywords: z.array(z.string()),
  category: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty, category, excludeCategories } = body;
    
    const prompt = `
      Generate a shadowing exercise for language learners.
      
      Create a natural, conversational sentence or short paragraph ${difficulty ? `with ${difficulty} difficulty` : ""} 
      ${category ? `related to the topic of "${category}"` : ""}.
      ${excludeCategories ? `Do NOT generate a shadowing exercise related to the following categories: ${excludeCategories.join(', ')}` : ""}
      The text should be suitable for pronunciation practice and shadowing exercises.
      
      Include:
      1. A clear, natural-sounding text (1-3 sentences)
      2. 3-5 specific pronunciation focus points (stress patterns, intonation, difficult sounds, etc.)
      3. Optional phonetic transcription of challenging words
      4. 3-5 keywords from the text that are important vocabulary items
      5. A category/topic label for the content
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(ShadowingExerciseSchema, "shadowingExercise"),
      messages: [
        { 
          role: "system", 
          content: "You are a pronunciation and speaking coach. Create natural, helpful shadowing exercises for language learners."
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
    console.error("Error generating shadowing exercise:", error);
    // Return a fallback exercise if generation fails
    return NextResponse.json({
      text: "The eloquent speaker captivated the audience with her persuasive arguments and clear delivery.",
      difficulty: "medium",
      focusPoints: [
        "Stress on 'eloquent' (EL-oh-kwent)",
        "Natural rising intonation at the end of 'audience'",
        "Clear pronunciation of 'captivated' with stress on 'CAP'",
        "Linking between 'with her' sounds like 'wither'",
      ],
      phonetics: "ði ˈɛləkwənt ˈspikər ˈkæptɪveɪtɪd ði ˈɔdiəns wɪð hɜr pərˈsweɪsɪv ˈɑrɡjəmənts ænd klɪr dɪˈlɪvəri",
      keywords: ["eloquent", "captivated", "persuasive", "delivery", "audience"],
      category:  "Public Speaking"
    }, { status: 500 });
  }
} 