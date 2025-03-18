import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const PronunciationEvaluationSchema = z.object({
  accuracy: z.number(),
  feedback: z.string(),
  errors: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the form data with the audio file and target word
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const targetWord = formData.get('word') as string;
    
    if (!audioFile || !targetWord) {
      return NextResponse.json(
        { error: "Missing audio file or target word" },
        { status: 400 }
      );
    }

    // Convert the File to a Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Send the audio to OpenAI for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "pronunciation.webm", { type: audioFile.type }),
      model: "whisper-1",
    });
    
    // Now evaluate the pronunciation by comparing the transcription to the target word
    const prompt = `
      Evaluate the pronunciation of the word "${targetWord}".
      
      The user's pronunciation was transcribed as: "${transcription.text}"
      
      Provide:
      1. An accuracy score between 0 and 1
      2. Specific feedback on the pronunciation
      3. Any errors detected
      4. Suggestions for improvement
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(PronunciationEvaluationSchema, "evaluation"),
      messages: [
        { 
          role: "system", 
          content: "You are a pronunciation expert. Evaluate spoken English pronunciation and provide helpful, encouraging feedback."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 512
    });
    
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error("Error evaluating pronunciation:", error);
    // Return a fallback evaluation if processing fails
    return NextResponse.json({
      accuracy: 0.5,
      feedback: "We couldn't properly evaluate your pronunciation. Please try again.",
      errors: [],
      suggestions: ["Speak clearly into your microphone", "Try in a quieter environment"]
    }, { status: 500 });
  }
} 