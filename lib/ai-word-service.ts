import { z } from "zod"

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
    const response = await fetch('/api/vocabulary/random-word', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: options?.difficulty,
        category: options?.category,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return WordDetailsSchema.parse(data)
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
    const response = await fetch('/api/vocabulary/word-set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: options?.difficulty,
        category: options?.category,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return WordSetSchema.parse(data)
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
    const response = await fetch('/api/vocabulary/evaluate-sentence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sentence,
        requiredWords,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return SentenceEvaluationSchema.parse(data)
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
  try {
    const response = await fetch('/api/vocabulary/save-learned-word', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wordDetails,
        userProgress,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error saving learned word:", error)
    return false
  }
} 