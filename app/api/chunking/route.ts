// app/api/vocabcluster/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define Zod schema for validation based on the simplified interface
const WordClusterSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  words: z.array(z.string()),
  category: z.enum(["thematic", "synonym", "antonym", "contextual"]),
  randomWords: z.array(z.string())
});

const WordClusterResponseSchema = z.object({
  cluster: WordClusterSchema
});

/**
 * POST endpoint to generate a vocabulary cluster
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, category, wordsCount } = body;
    
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    
    const clusterCategory = category || "thematic";
    const wordCount = wordsCount || 7;
    
    const prompt = `
      Generate a ${clusterCategory} word cluster about "${topic}" 
      with ${wordCount} words.
      Include a description.
      Also generate 5 random words that are not part of the current cluster. They should not be related to the topic.
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(WordClusterResponseSchema, "vocabCluster"),
      messages: [
        { 
          role: "system", 
          content: `You are a vocabulary expert specializing in word clusters for students in grades 1 to 7.
            Generate specific word clusters based on user-provided topics that are appropriate for this age group.
            For thematic clusters, focus on simple words related to the given topic.
            For synonym clusters, provide words with similar meanings that are easy to understand.
            For antonym clusters, provide words with contrasting meanings that are suitable for young learners.
            For contextual clusters, provide words commonly used together in the context of the topic, ensuring they are age-appropriate.`
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
    console.error("Error generating vocabulary cluster:", error);
    
    // Ensure body is defined before using it
    const fallbackTopic =  "Vocabulary Cluster";
    const fallbackCategory = "thematic";

    // Return a fallback cluster if generation fails
    return NextResponse.json({
      cluster: {
        id: fallbackTopic.toLowerCase().replace(/\s+/g, '-') || "custom-" + Date.now(),
        name: fallbackTopic,
        description: "A set of related words",
        words: ["Example", "Sample", "Illustration", "Instance", "Demonstration", "Model", "Prototype"],
        category: fallbackCategory
      }
    }, { status: 500 });
  }
}

