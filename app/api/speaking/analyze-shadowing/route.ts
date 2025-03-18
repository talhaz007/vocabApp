import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation
const ShadowingAnalysisSchema = z.object({
  accuracy: z.number().min(0).max(1),
  feedback: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  isValid: z.boolean(),
  transcription: z.string(),
  matchedWords: z.number(),
  totalWords: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the form data with the audio file and target text
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const targetText = formData.get('text') as string;
    const focusPoints = formData.get('focusPoints') as string;
    
    if (!audioFile || !targetText) {
      return NextResponse.json(
        { error: "Missing audio file or target text" },
        { status: 400 }
      );
    }

    // Parse the focus points from JSON string
    const parsedFocusPoints = JSON.parse(focusPoints) as string[];
    
    // Convert the File to a Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Send the audio to OpenAI for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "shadowing.webm", { type: audioFile.type }),
      model: "whisper-1",
    });
    
    // Count the total words in the target text
    const totalWords = targetText.split(/\s+/).length;
    
    // Calculate how many words from the target text appear in the transcription
    const targetWords = targetText.toLowerCase().split(/\s+/);
    const transcribedWords = transcription.text.toLowerCase().split(/\s+/);
    const matchedWords = targetWords.filter(word => 
      transcribedWords.includes(word.replace(/[.,!?;:()'"]/g, ''))
    ).length;
    
    // Now evaluate the shadowing by comparing the transcription to the target text
    const prompt = `
      Evaluate this shadowing exercise where the user attempted to repeat the following text:
      
      Original text: "${targetText}"
      
      Focus points for this exercise:
      ${parsedFocusPoints.map((point, i) => `${i+1}. ${point}`).join('\n')}
      
      The user's shadowing was transcribed as: "${transcription.text}"
      
      Please provide:
      1. An accuracy score between 0 and 1
      2. Specific feedback on the shadowing
      3. 2-3 strengths in the user's shadowing
      4. 2-3 areas for improvement
      5. Whether the shadowing is valid (true if accuracy > 0.7, false otherwise)
      
      The transcription shows ${matchedWords} out of ${totalWords} words were matched.
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(ShadowingAnalysisSchema, "analysis"),
      messages: [
        { 
          role: "system", 
          content: "You are a pronunciation and shadowing expert. Evaluate spoken English shadowing exercises and provide helpful, encouraging feedback."
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
    console.error("Error analyzing shadowing:", error);
    // Return a fallback analysis if processing fails
    return NextResponse.json({
      accuracy: 0.5,
      feedback: "We couldn't properly analyze your shadowing. Please try again.",
      strengths: ["Good attempt at shadowing the text"],
      improvements: ["Speak clearly into your microphone", "Try in a quieter environment"],
      isValid: false,
      transcription: "Transcription unavailable",
      matchedWords: 0,
      totalWords: 10
    }, { status: 500 });
  }
} 