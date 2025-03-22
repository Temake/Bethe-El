
import { useState, useEffect } from "react";
import { Streak, User } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastCheckIn: null,
  freezesAvailable: 3
};

export function useStreak(initialStreak: Streak = DEFAULT_STREAK) {
  const [streak, setStreak] = useState<Streak>(initialStreak);

  const checkStreakContinuity = async (userId?: string) => {
    if (!userId) return;
    if (!streak.lastCheckIn) return;

    const lastCheckInDate = new Date(streak.lastCheckIn);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format as YYYY-MM-DD
    const formattedYesterday = yesterday.toISOString().split('T')[0];
    const formattedLastCheckIn = lastCheckInDate.toISOString().split('T')[0];
    
    // If last check-in was before yesterday and no freeze was used
    if (formattedLastCheckIn < formattedYesterday) {
      try {
        const { error } = await supabase
          .from('streak_data')
          .update({
            current_streak: 0,
            last_check_in: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (error) throw error;
        
        setStreak(prev => ({
          ...prev,
          current: 0,
          lastCheckIn: null
        }));
        
        toast.error("Your streak was reset because you missed a day.");
      } catch (error) {
        console.error("Error updating streak continuity:", error);
      }
    }
  };

  const incrementStreak = async (userId?: string) => {
    if (!userId) return false;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Only increment if not already checked in today
    if (streak.lastCheckIn === today) {
      return false;
    }
    
    try {
      const newCurrent = streak.current + 1;
      const newLongest = Math.max(streak.longest, newCurrent);
      
      const { error } = await supabase
        .from('streak_data')
        .update({
          current_streak: newCurrent,
          longest_streak: newLongest,
          last_check_in: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setStreak(prev => ({
        ...prev,
        current: newCurrent,
        longest: newLongest,
        lastCheckIn: today
      }));
      
      return true;
    } catch (error) {
      console.error("Error incrementing streak:", error);
      return false;
    }
  };

  const useFreeze = async (userId?: string) => {
    if (!userId) return false;
    if (streak.freezesAvailable <= 0) {
      toast.error("No freezes available!");
      return false;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('streak_data')
        .update({
          last_check_in: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setStreak(prev => ({
        ...prev,
        freezesAvailable: prev.freezesAvailable - 1,
        lastCheckIn: today
      }));
      
      toast.success(`Freeze used! Streak preserved. ${streak.freezesAvailable - 1} freeze${streak.freezesAvailable - 1 !== 1 ? 's' : ''} remaining.`);
      return true;
    } catch (error) {
      console.error("Error using freeze:", error);
      return false;
    }
  };

  return {
    streak,
    setStreak,
    checkStreakContinuity,
    incrementStreak,
    useFreeze
  };
}
