
import React, { createContext, useContext, useEffect } from "react";
import { JournalEntry, Streak, UserData } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useStreak, DEFAULT_STREAK } from "@/hooks/useStreak";
import { useCheckIn } from "@/hooks/useCheckIn";
import { supabase } from "@/integrations/supabase/client";

type UserDataContextType = {
  journalEntries: JournalEntry[];
  streak: Streak;
  isCheckedInToday: boolean;
  checkIn: () => void;
  useFreeze: () => void;
  addJournalEntry: (prayedFor: string, receivedInsight: string) => void;
  updateJournalEntry: (id: string, prayedFor: string, receivedInsight: string) => void;
  getTodayEntry: () => JournalEntry | undefined;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();
  
  // Initialize hooks with empty values - we'll populate from Supabase in useEffect
  const { 
    journalEntries, 
    setJournalEntries, 
    addJournalEntry: addEntry, 
    updateJournalEntry, 
    getTodayEntry 
  } = useJournalEntries([], user);
  
  const { 
    streak, 
    setStreak, 
    checkStreakContinuity, 
    incrementStreak, 
    useFreeze 
  } = useStreak(DEFAULT_STREAK);
  
  const { 
    isCheckedInToday, 
    checkIsCheckedInToday, 
    checkIn 
  } = useCheckIn(journalEntries, setJournalEntries, streak, incrementStreak, user?.id);

  // Load user streak data from Supabase
  useEffect(() => {
    const fetchStreakData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('streak_data')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching streak data:", error);
          return;
        }
        
        if (data) {
          setStreak({
            current: data.current_streak,
            longest: data.longest_streak,
            lastCheckIn: data.last_check_in,
            freezesAvailable: 3 // This value is not stored in the database yet
          });
        } else {
          // If no streak data exists yet, create it
          try {
            await supabase
              .from('streak_data')
              .insert({
                user_id: user.id,
                current_streak: 0,
                longest_streak: 0
              });
          } catch (insertError) {
            console.error("Error creating initial streak data:", insertError);
          }
        }
      } catch (error) {
        console.error("Error in fetchStreakData:", error);
      }
    };
    
    fetchStreakData();
  }, [user, setStreak]);
  
  // Check streak continuity and check-in status
  useEffect(() => {
    if (user) {
      checkIsCheckedInToday();
      checkStreakContinuity(user.id);
    }
  }, [user, checkIsCheckedInToday, checkStreakContinuity]);

  // Wrapper for add journal entry that handles check-in
  const addJournalEntry = (prayedFor: string, receivedInsight: string) => {
    addEntry(prayedFor, receivedInsight);
    
    // Make sure streaks are updated
    if (!isCheckedInToday) {
      checkIn();
    }
  };

  // Wrapper for useFreeze to pass user ID
  const handleUseFreeze = () => {
    if (user) {
      useFreeze(user.id);
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        journalEntries,
        streak,
        isCheckedInToday,
        checkIn,
        useFreeze: handleUseFreeze,
        addJournalEntry,
        updateJournalEntry,
        getTodayEntry
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
