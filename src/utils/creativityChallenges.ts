import { supabase } from './supabase';
import { CreativityChallenge, UserProgress, LocalizedCreativityChallenge } from '../types/database';

/**
 * Fetches creativity challenges based on user domain preferences
 * @param userId The user's ID
 * @param domainPreferences Array of domain preferences (Drawing, Writing, Photography)
 * @param languageCode The current language code (en/fr)
 * @param level Optional level to filter challenges by
 * @returns Localized and processed creativity challenges
 */
export async function fetchUserChallenges(
  userId: string,
  domainPreferences: string[],
  languageCode: string,
  level?: string
): Promise<LocalizedCreativityChallenge[]> {
  try {
    // Ensure domain preferences are properly capitalized
    const formattedDomains = domainPreferences.map(
      domain => domain.charAt(0).toUpperCase() + domain.slice(1)
    );
    let query = supabase
      .from('Creativity')
      .select('*')
      .in('Category', formattedDomains)
      .order('Day', { ascending: true });
    if (level) {
      query = query.eq('Level', level);
    }
    const { data: challenges, error: challengesError }: { data: CreativityChallenge[] | null, error: Error | null } = await query;
    if (challengesError) {
      console.error('[fetchUserChallenges] Error fetching challenges:', challengesError);
      return [];
    }
    let progress: UserProgress[] = [];
    try {
      const { data: progressData, error: progressError }: { data: UserProgress[] | null, error: Error | null } = await supabase
        .from('UserProgress')
        .select('*')
        .eq('user_id', userId)
        .eq('level_at_time', level);
      if (progressError) {
        console.error('[fetchUserChallenges] Error fetching user progress:', progressError);
      } else {
        progress = progressData || [];
      }
    } catch (progressFetchError: unknown) {
      console.error('[fetchUserChallenges] Exception fetching user progress:', progressFetchError);
    }
    const progressMap = new Map<string, UserProgress>();
    progress.forEach(item => {
      progressMap.set(item.challenge_id, item);
    });
    const filteredChallenges = (challenges || []).filter((challenge: CreativityChallenge) => {
      return progressMap.has(challenge.ID);
    });
    return filteredChallenges.map((challenge: CreativityChallenge) => {
      const userProgress = progressMap.get(challenge.ID);
      return {
        id: challenge.ID,
        day: challenge.Day,
        title: languageCode === 'fr' ? challenge['Title FR'] : challenge['Title ENG'],
        description: languageCode === 'fr' ? challenge['Description FR'] : challenge['Description ENG'],
        difficulty: challenge.Difficulty,
        level: challenge.Level,
        programName: languageCode === 'fr' ? challenge['Program name FR'] : challenge['Program name ENG'],
        category: challenge.Category,
        completed: userProgress?.completed || false,
        completionDate: userProgress?.completion_date || null
      };
    });
  } catch (error: unknown) {
    console.error('[fetchUserChallenges] Error in fetchUserChallenges:', error);
    return [];
  }
}

/**
 * Marks a challenge as completed
 * @param userId The user's ID
 * @param challengeId The challenge ID
 * @param level The user's selected level
 * @param notes Optional notes from the user
 * @returns Success status
 */
export async function markChallengeCompleted(
  userId: string,
  challengeId: string,
  level: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error }: { error: Error | null } = await supabase
      .from('UserProgress')
      .update({
        completed: true,
        completion_date: new Date().toISOString(),
        notes: notes || null
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('level_at_time', level);
    if (error) {
      console.error('Error marking challenge as completed:', error);
      return false;
    }
    return true;
  } catch (error: unknown) {
    console.error('Error in markChallengeCompleted:', error);
    return false;
  }
}

/**
 * Initializes user progress for the first challenge if none exists
 * @param userId The user's ID
 * @param domainPreference The user's domain preference (Drawing, Writing, Photography)
 * @param level The user's selected level
 * @returns true if progress was created or already exists, false if error
 */
export async function initializeUserProgressIfNeeded(
  userId: string,
  domainPreference: string,
  level?: string
): Promise<boolean> {
  try {
    console.log('[initializeUserProgressIfNeeded] userId:', userId, 'domainPreference:', domainPreference, 'level:', level);
    // 1. Fetch all existing progress for this user/level
    const { data: existingProgress, error: existingError }: { data: { challenge_id: string }[] | null, error: Error | null } = await supabase
      .from('UserProgress')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('level_at_time', level || 'Beginner');
    if (existingError) {
      console.error('[initializeUserProgressIfNeeded] Error fetching existing progress:', existingError);
      return false;
    }
    const existingChallengeIds = new Set((existingProgress || []).map((row) => row.challenge_id));

    // 2. Fetch all challenges for the user's domain and level
    const formattedDomain = domainPreference.charAt(0).toUpperCase() + domainPreference.slice(1);
    const { data: challenges, error: challengesError }: { data: { ID: string; Day: number }[] | null, error: Error | null } = await supabase
      .from('Creativity')
      .select('ID, Day')
      .eq('Category', formattedDomain)
      .eq('Level', level || 'Beginner')
      .order('Day', { ascending: true });
    if (challengesError) {
      console.error('[initializeUserProgressIfNeeded] Error fetching challenges:', challengesError);
      return false;
    }
    console.log('[initializeUserProgressIfNeeded] challenges found:', challenges?.length, 'for domain:', formattedDomain, 'level:', level);
    if (!challenges || challenges.length === 0) {
      console.warn('[initializeUserProgressIfNeeded] No challenges found for domain:', formattedDomain, 'level:', level);
      return false;
    }
    // 3. Filter out challenges that already have progress
    const missingChallenges = (challenges || []).filter(
      (challenge) => !existingChallengeIds.has(challenge.ID)
    );
    if (missingChallenges.length === 0) {
      console.log('[initializeUserProgressIfNeeded] All progress rows already exist');
      return true;
    }
    // 4. Only insert missing progress rows
    const inserts = missingChallenges.map((challenge) => ({
      user_id: userId,
      challenge_id: challenge.ID,
      completed: false,
      completion_date: null,
      notes: null,
      level_at_time: level || 'Beginner'
    }));
    const { error: insertError }: { error: Error | null } = await supabase
      .from('UserProgress')
      .insert(inserts);
    if (insertError) {
      console.error('[initializeUserProgressIfNeeded] Error inserting progress rows:', insertError);
      return false;
    }
    console.log('[initializeUserProgressIfNeeded] Inserted missing progress rows:', inserts.length);
    return true;
  } catch (error: unknown) {
    console.error('[initializeUserProgressIfNeeded] Error in initializeUserProgressIfNeeded:', error);
    return false;
  }
}
