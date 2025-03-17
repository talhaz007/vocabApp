import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the word details and user progress from the request
    const { wordDetails, userProgress } = await request.json()
    
    // Insert or update the learned word in Supabase
    const { error } = await supabase
      .from('learned_words')
      .upsert({
        user_id: user.id,
        word: wordDetails.word,
        definition: wordDetails.definition,
        difficulty: wordDetails.difficulty,
        mastery_level: userProgress.mastery,
        last_practiced: userProgress.lastPracticed,
        notes: userProgress.notes || null,
        mnemonic: wordDetails.mnemonic,
        examples: wordDetails.examples,
        synonyms: wordDetails.synonyms,
        antonyms: wordDetails.antonyms || [],
        hints: wordDetails.hints
      })
    
    if (error) {
      console.error('Error saving word to Supabase:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in save-learned-word API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 