// Define TypeScript interfaces instead of Zod schemas
export interface WordDetails {
  word: string;
  definition: string;
  mnemonic: string;
  difficulty: "easy" | "medium" | "hard";
  hints: string[];
  examples: string[];
  synonyms: string[];
  antonyms: string[];
}

export interface WordSet {
  words: string[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
  possibleSentences: string[];
}

export interface SentenceEvaluation {
  isValid: boolean;
  feedback: string;
  alternativeSentences?: string[];
}

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
    return data as WordDetails
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
    return data as WordSet
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
    return data as SentenceEvaluation
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
 * Saves a word to the user's learned words collection in Supabase
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