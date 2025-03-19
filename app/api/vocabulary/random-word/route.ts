import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const WordDetailsSchema = z.object({
  word: z.string(),
  definition: z.string(),
  mnemonic: z.string(),
  mnemonicDescription: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  hints: z.array(z.string()),
  examples: z.array(z.string()),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  phonetic: z.string(),
  pronunciationTips: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty, category, mnemonicType, excludeWords } = body;
    
    const prompt = `Generate a vocabulary word ${difficulty ? `with ${difficulty} difficulty` : ""} ${category ? `from the category "${category}"` : ""} for students in grades 1 to 7. 

    The vocabulary word MUST be age-appropriate and NOT too difficult for elementary/middle school students (grades 1-7). Avoid advanced words like "glistening" or words that would be challenging for this age group.
    
    Create a memorable mnemonic for this word using a single word or short phrase that sounds similar to the vocabulary word. For example: For the word "eloquent," the mnemonic could be "elephant" - "Imagine an elephant giving a powerful speech—an eloquent elephant!"
    
    The mnemonic should:
    - Use a word that sounds similar to the vocabulary word
    - It should be a meaningful mnemonic that helps students remember both pronunciation and definition
    - Include a brief, vivid mental image connecting the sound-alike word to the meaning
    - Be appropriate and engaging for elementary/middle school students
    - Use simple language that helps students remember both pronunciation and definition
    - The mnemonic description should not be too long.
    - The mnemonic should be free of any punctuation marks, including ? and !, to ensure clarity for students.
    
    ${excludeWords ? `Do NOT generate any of these words: "${excludeWords.join(', ')}"` : ""}`;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(WordDetailsSchema, "wordDetails"),
      messages: [
        { 
          role: "system", 
          content: "You are a vocabulary and pronunciation expert. Generate detailed vocabulary words with definitions, mnemonics, examples, and pronunciation guidance."
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
    console.error("Error generating word:", error);
    // Return a fallback word if generation fails
    return NextResponse.json({
      word: "Serendipity",
      definition: "The occurrence and development of events by chance in a happy or beneficial way",
      mnemonic: "Serene-dip-ity: When you take a serene dip in the sea and unexpectedly find a treasure.",
      difficulty: "medium",
      hints: [
        "Starts with 'S'",
        "Related to lucky coincidences",
        "Think of finding something by chance",
        "S _ _ _ _ _ _ _ _ _ y",
      ],
      examples: [
        "Finding my dream job was pure serendipity—I wasn't even looking for a new position.",
        "By serendipity, she met her future husband while waiting for a delayed flight.",
        "The discovery of penicillin was a case of serendipity in scientific research."
      ],
      synonyms: ["chance", "fortune", "luck", "providence", "happenstance"],
      antonyms: ["misfortune", "design", "plan", "intention"],
      phonetic: "/ˌsɛrənˈdɪpɪti/",
      pronunciationTips: [
        "Break it down: ser-en-DIP-i-ty",
        "The stress is on the third syllable (DIP)",
        "The 'i' in 'dip' is short, like in 'tip'",
        "The final 'y' sounds like 'ee'"
      ]
    }, { status: 500 });
  }
} 