import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Generates a mnemonic for a given word and definition using AI
 */
export async function generateMnemonic(word: string, definition: string): Promise<string> {
  try {
    const prompt = `
      Create a memorable mnemonic for the word "${word}" which means "${definition}".
      The mnemonic should be creative, easy to remember, and help associate the word with its meaning.
      Keep it concise (1-2 sentences) and make it engaging.
    `

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: process.env.OPENAI_API_KEY }),
      prompt,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating mnemonic:", error)
    return "Unable to generate a mnemonic at this time. Please try again later."
  }
}