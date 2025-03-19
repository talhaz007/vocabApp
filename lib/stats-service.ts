import { createClient } from '@/utils/supabase/client';

export interface UserStats {
  wordsLearned: number;
  streak: number;
  lastActivity: string | null; // ISO date string
  totalExercises: number;
  totalPoints: number;
}

const DEFAULT_STATS: UserStats = {
  wordsLearned: 0,
  streak: 0,
  lastActivity: null,
  totalExercises: 0,
  totalPoints: 0,
};

export async function getUserStats(): Promise<UserStats> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return DEFAULT_STATS;
  }
  
  // Get user stats from database
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error || !data) {
    // If no stats exist yet, create default stats
    await initializeUserStats(user.id);
    return DEFAULT_STATS;
  }
  
  return {
    wordsLearned: data.words_learned,
    streak: data.streak,
    lastActivity: data.last_activity,
    totalExercises: data.total_exercises,
    totalPoints: data.total_points,
  };
}

async function initializeUserStats(userId: string): Promise<void> {
  const supabase = createClient();
  
  // Insert default stats for new user
  await supabase
    .from('user_stats')
    .insert({
      id: userId,
      words_learned: DEFAULT_STATS.wordsLearned,
      streak: DEFAULT_STATS.streak,
      last_activity: DEFAULT_STATS.lastActivity,
      total_exercises: DEFAULT_STATS.totalExercises,
      total_points: DEFAULT_STATS.totalPoints,
    });
}

export async function updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get current stats
  const currentStats = await getUserStats();
  
  // Calculate streak
  const today = new Date().toISOString().split('T')[0];
  const lastActivityDate = currentStats.lastActivity?.split('T')[0];
  let streak = currentStats.streak;
  
  if (lastActivityDate !== today) {
    // If last activity was yesterday, increment streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActivityDate === yesterdayStr) {
      streak += 1;
    } else if (lastActivityDate && lastActivityDate !== today) {
      // Reset streak if more than a day has passed
      streak = 1;
    } else if (!lastActivityDate) {
      // First activity
      streak = 1;
    }
  }
  
  // Update stats in database
  const { data, error } = await supabase
    .from('user_stats')
    .update({
      words_learned: updates.wordsLearned !== undefined ? updates.wordsLearned : currentStats.wordsLearned,
      streak: updates.streak !== undefined ? updates.streak : streak,
      last_activity: new Date().toISOString(),
      total_exercises: updates.totalExercises !== undefined ? updates.totalExercises : currentStats.totalExercises,
      total_points: updates.totalPoints !== undefined ? updates.totalPoints : currentStats.totalPoints,
    })
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user stats:', error);
    return currentStats;
  }
  
  return {
    wordsLearned: data.words_learned,
    streak: data.streak,
    lastActivity: data.last_activity,
    totalExercises: data.total_exercises,
    totalPoints: data.total_points,
  };
}

export async function incrementWordLearned(count = 1): Promise<UserStats> {
  const currentStats = await getUserStats();
  return updateUserStats({ 
    wordsLearned: currentStats.wordsLearned + count 
  });
}

export async function incrementExerciseCompleted(points = 10): Promise<UserStats> {
  const currentStats = await getUserStats();
  return updateUserStats({
    totalExercises: currentStats.totalExercises + 1,
    totalPoints: currentStats.totalPoints + points
  });
} 