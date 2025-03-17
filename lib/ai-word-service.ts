import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY // should ideally be loaded from external place such as env variable
 });

// Define Zod schemas for validation
const WordDetailsSchema = z.object({
  word: z.string(),
  definition: z.string(),
  mnemonic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  hints: z.array(z.string()).min(1),
  examples: z.array(z.string()).min(1),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
})

export type WordDetails = z.infer<typeof WordDetailsSchema>

const WordSetSchema = z.object({
  words: z.array(z.string()).min(2).max(6),
  category: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  possibleSentences: z.array(z.string()).min(1),
})

export type WordSet = z.infer<typeof WordSetSchema>

const SentenceEvaluationSchema = z.object({
  isValid: z.boolean(),
  feedback: z.string(),
  alternativeSentences: z.array(z.string()).optional(),
})

export type SentenceEvaluation = z.infer<typeof SentenceEvaluationSchema>

/**
 * Generates a random vocabulary word with all its details
 */
export async function generateRandomWord(
  options?: {
    difficulty?: "easy" | "medium" | "hard"
    category?: string
  }
): Promise<WordDetails> {
  try {
    const difficulty = options?.difficulty || ["easy", "medium", "hard"][Math.floor(Math.random() * 3)]
    const category = options?.category || ""
    
    const prompt = `
      Generate a vocabulary word ${difficulty ? `with ${difficulty} difficulty` : ""} 
      ${category ? `from the category "${category}"` : ""}.
      
      Return the result as a JSON object with the following structure:
      {
        "word": "the vocabulary word",
        "definition": "clear and concise definition",
        "mnemonic": "a memorable mnemonic to help remember the word",
        "difficulty": "easy/medium/hard",
        "hints": ["4 progressive hints to help guess the word", "with the last hint", "showing some letters", "W _ _ d"],
        "examples": ["3 example sentences using the word in context"],
        "synonyms": ["3-5 synonyms"],
        "antonyms": ["3-5 antonyms if applicable, otherwise empty array"]
      }
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini", { apiKey: process.env.OPENAI_API_KEY }),
      prompt,
    })

    // Parse and validate the JSON response
    let parsedData;
    try {
      // Try to parse the response directly
      parsedData = JSON.parse(text);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        parsedData = JSON.parse(jsonMatch[1].trim());
      } else {
        throw parseError;
      }
    }
    
    const validatedData = WordDetailsSchema.parse(parsedData)
    return validatedData
  } catch (error) {
    console.error("Error generating word:", error)
    // Return a fallback word if generation fails
    return {
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
      antonyms: ["misfortune", "design", "plan", "intention"]
    }
  }
}

/**
 * Generates a set of related words for word association exercises
 */
export async function generateWordSet(
  options?: {
    difficulty?: "easy" | "medium" | "hard"
    category?: string
  }
): Promise<WordSet> {
  try {
    const difficulty = options?.difficulty || ["easy", "medium", "hard"][Math.floor(Math.random() * 3)]
    const category = options?.category || ""
    
    const prompt = `
      Generate a set of 4-6 related words ${difficulty ? `with ${difficulty} difficulty` : ""} 
      ${category ? `from the category "${category}"` : ""}.
      
      Return the result as a JSON object with the following structure:
      {
        "words": ["array of related words"],
        "category": "the category or theme these words belong to",
        "difficulty": "easy/medium/hard",
        "possibleSentences": ["3 example sentences that use all or most of these words together"]
      }
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini", { apiKey: process.env.OPENAI_API_KEY }),
      prompt,
    })

    // Parse and validate the JSON response
    let parsedData;
    try {
      // Try to parse the response directly
      parsedData = JSON.parse(text);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        parsedData = JSON.parse(jsonMatch[1].trim());
      } else {
        throw parseError;
      }
    }
    
    const validatedData = WordSetSchema.parse(parsedData)
    return validatedData
  } catch (error) {
    console.error("Error generating word set:", error)
    // Return a fallback word set if generation fails
    return {
      words: ["Eloquent", "Persuasive", "Debate", "Audience"],
      category: "Communication",
      difficulty: "medium",
      possibleSentences: [
        "The eloquent speaker was persuasive in the debate, captivating the audience.",
        "During the debate, her eloquent style made her persuasive to the audience.",
        "The persuasive argument was delivered in an eloquent manner to the audience."
      ]
    }
  }
}

/**
 * Evaluates a user's sentence that should include specific words
 */
export async function evaluateSentence(
  sentence: string,
  requiredWords: string[]
): Promise<SentenceEvaluation> {
  try {
    const prompt = `
      Evaluate this sentence: "${sentence}"
      
      It should include these words: ${requiredWords.join(", ")}
      
      Return the result as a JSON object with the following structure:
      {
        "isValid": true/false (whether all words are used correctly),
        "feedback": "detailed feedback on the sentence structure, grammar, and word usage",
        "alternativeSentences": ["3 alternative sentences using the same words, if the original is valid"]
      }
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini", { apiKey: process.env.OPENAI_API_KEY }),
      prompt,
    })

    // Parse and validate the JSON response
    let parsedData;
    try {
      // Try to parse the response directly
      parsedData = JSON.parse(text);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        parsedData = JSON.parse(jsonMatch[1].trim());
      } else {
        throw parseError;
      }
    }
    
    const validatedData = SentenceEvaluationSchema.parse(parsedData)
    return validatedData
  } catch (error) {
    console.error("Error evaluating sentence:", error)
    // Return a fallback evaluation if generation fails
    return {
      isValid: false,
      feedback: "We couldn't evaluate your sentence. Please try again later."
    }
  }
}

/**
 * Saves a word to the user's learned words collection
 * In a real implementation, this would interact with your database
 */
export async function saveLearnedWord(
  wordDetails: WordDetails,
  userProgress: {
    mastery: number // 0-100
    lastPracticed: Date
    notes?: string
  }
): Promise<boolean> {
  // This is a mock implementation
  // In a real app, you would save this to your database
  console.log("Saving word to user's learned words:", wordDetails.word, userProgress)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Return success
  return true
} 