import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const SpeakingEvaluationSchema = z.object({
  detectedWords: z.array(z.string()),
  feedback: z.string(),
  transcription: z.string(),
  quality: z.enum(["excellent", "good", "needs_improvement"]),
  suggestions: z.array(z.string()).optional(),
  isValid: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the form data with the audio file and target information
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const targetWords = formData.get('targetWords') as string;
    const question = formData.get('question') as string;
    
    if (!audioFile || !targetWords || !question) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Parse the target words from JSON string
    const parsedTargetWords = JSON.parse(targetWords) as string[];
    
    // Convert the File to a Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Send the audio to OpenAI for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "speaking_response.webm", { type: audioFile.type }),
      model: "whisper-1",
    });
    
    // Now evaluate the response by analyzing the transcription
    const prompt = `
      Evaluate this spoken response to the question: "${question}"
      
      The user was asked to include these target vocabulary words: ${parsedTargetWords.join(", ")}
      
      The transcription of their response is: "${transcription.text}"
      
      Please:
      1. Identify which target words were used correctly in the response
      2. Provide constructive feedback on the response
      3. Rate the quality of the response (excellent, good, or needs_improvement)
      4. Suggest improvements if needed
      5. Determine if the response is valid (true if quality is good or excellent, false otherwise)
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(SpeakingEvaluationSchema, "evaluation"),
      messages: [
        { 
          role: "system", 
          content: "You are a speaking coach. Evaluate spoken responses for clarity, vocabulary usage, and relevance to the question."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 1024
    });
    
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error("Error evaluating speaking response:", error);
    // Return a fallback evaluation if processing fails
    return NextResponse.json({
      detectedWords: [],
      feedback: "We couldn't properly evaluate your response. Please try again.",
      transcription: "Transcription unavailable",
      quality: "needs_improvement",
      suggestions: ["Speak clearly into your microphone", "Try in a quieter environment"],
      isValid: false
    }, { status: 500 });
  }
} 