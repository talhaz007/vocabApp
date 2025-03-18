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
  phonetic?: string;
  pronunciationTips?: string[];
}

export interface WordSet {
  words: string[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
  possibleSentences: string[];
  question?: string;
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
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
    includeQuestion?: boolean;
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
        includeQuestion: options?.includeQuestion || false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data as WordSet;
  } catch (error) {
    console.error("Error generating word set:", error);
    // Return a fallback word set if generation fails
    return {
      words: ["Innovation", "Technology", "Progress", "Development", "Future"],
      category: "Technology and Progress",
      difficulty: "medium",
      possibleSentences: [
        "Technological innovation drives progress in many fields.",
        "The future of development depends on sustainable technology.",
        "Progress in technology has accelerated in recent decades."
      ],
      question: options?.includeQuestion ? 
        "How might technological innovation shape our future?" : undefined
    };
  }
}

/**
 * Evaluates a user's sentence that should include specific words
 * and saves the words to the learned_words table if the sentence is valid
 */
export async function evaluateSentence(
  sentence: string,
  requiredWords: string[],
  difficulty: "easy" | "medium" | "hard" = "medium"
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
    
    const data = await response.json() as SentenceEvaluation
    
    // If the sentence is valid, save each word to the learned_words table
    if (data.isValid) {
      try {
        // For each word in the required words, save it as a learned word
        for (const word of requiredWords) {
           saveLearnedWord(
            {
              word: word,
              definition: `Used in sentence: "${sentence}"`,
              mnemonic: "",
              difficulty: difficulty, // Use the provided difficulty
              hints: [],
              examples: [sentence],
              synonyms: [],
              antonyms: []
            },
            {
              // Adjust mastery based on difficulty
              mastery: difficulty === "easy" ? 80 : difficulty === "medium" ? 70 : 60,
              lastPracticed: new Date(),
              notes: `Used in word association exercise: "${sentence}"`
            }
          )
        }
      } catch (error) {
        console.error("Error saving words from sentence:", error)
        // Continue even if saving fails - don't affect the user experience
      }
    }
    
    return data
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

/**
 * Checks the pronunciation of a word using the audio recording
 */
export async function checkPronunciation(
    word: string,
    audioURL: string
  ): Promise<{ accuracy: number; feedback: string; errors?: string[]; suggestions?: string[] }> {
    try {
      // Convert the audio URL to a Blob
      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('word', word);
      
      // Send the audio to our API endpoint
      const apiResponse = await fetch('/api/pronunciation/evaluate', {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }
      
      const result = await apiResponse.json();
      return result;
    } catch (error) {
      console.error("Error checking pronunciation:", error);
      // Return a fallback result if evaluation fails
      return {
        accuracy: 0.5,
        feedback: "We couldn't evaluate your pronunciation. Please try again.",
      };
    }
  }

/**
 * Generates a shadowing exercise with text and pronunciation focus points
 */
  export async function generateShadowingExercise(
    options?: {
      difficulty?: "easy" | "medium" | "hard";
      category?: string;
    }
  ): Promise<{
    text: string;
    difficulty: "easy" | "medium" | "hard";
    focusPoints: string[];
    phonetics?: string;
    keywords: string[];
    category: string;
  }> {
    try {
      const response = await fetch('/api/speaking/shadowing-exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: options?.difficulty,
          category: options?.category,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating shadowing exercise:", error);
      // Return a fallback exercise if generation fails
      return {
        text: "The eloquent speaker captivated the audience with her persuasive arguments and clear delivery.",
        difficulty: options?.difficulty || "medium",
        focusPoints: [
          "Stress on 'eloquent' (EL-oh-kwent)",
          "Natural rising intonation at the end of 'audience'",
          "Clear pronunciation of 'captivated' with stress on 'CAP'",
          "Linking between 'with her' sounds like 'wither'",
        ],
        keywords: ["eloquent", "captivated", "persuasive", "delivery", "audience"],
        category: "Public Speaking"
      };
    }
  }

/**
 * Checks the pronunciation of a word or analyzes shadowing of a text
 */
  export async function checkShadowingPronunciation(
    text: string,
    audioURL: string,
    options?: {
      isShadowing?: boolean;
      focusPoints?: string[];
    }
  ): Promise<{ 
    accuracy: number; 
    feedback: string; 
    isValid?: boolean;
    strengths?: string[];
    improvements?: string[];
    transcription?: string;
    matchedWords?: number;
    totalWords?: number;
  }> {
    try {
      // Convert the audio URL to a Blob
      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      let apiUrl = '/api/pronunciation/evaluate';
      
      // If this is a shadowing exercise, use the shadowing analysis endpoint
      if (options?.isShadowing) {
        apiUrl = '/api/speaking/analyze-shadowing';
        formData.append('text', text);
        formData.append('focusPoints', JSON.stringify(options.focusPoints || []));
      } else {
        formData.append('word', text);
      }
      
      // Send the audio to our API endpoint
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }
      
      const result = await apiResponse.json();
      return result;
    } catch (error) {
      console.error("Error checking pronunciation:", error);
      // Return a fallback result if evaluation fails
      return {
        accuracy: 0.5,
        feedback: "We couldn't evaluate your pronunciation. Please try again.",
        isValid: false
      };
    }
  }