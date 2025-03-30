import { useState, useEffect } from "react";
import { JournalEntry, Streak } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useCheckIn(
  journalEntries: JournalEntry[],
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>,
  streak: Streak,
  incrementStreak: (userId?: string) => Promise<boolean>,
  userId: string | undefined
) {
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  const fetchTodayCheckIn = async () => {
    if (!userId) return false;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select()
        .eq('user_id', userId)
        .eq('check_in_date', today);

      if (error) {
        console.error("Error checking for today's check-in:", error);
        toast.error("Failed to verify today's check-in. Please try again.");
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error in fetchTodayCheckIn:", error);
      toast.error("An unexpected error occurred. Please try again.");
      return false;
    }
  };

  // Check if already checked in today
  useEffect(() => {
    const checkDbForTodayCheckIn = async () => {
      const isCheckedIn = await fetchTodayCheckIn();
      setIsCheckedInToday(isCheckedIn);
    };

    checkDbForTodayCheckIn();
  }, [userId]);

  const checkIsCheckedInToday = async () => {
    const isCheckedIn = await fetchTodayCheckIn();
    setIsCheckedInToday(isCheckedIn);
  };

  const checkIn = async () => {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    // Prevent multiple check-ins on the same day
    if (isCheckedInToday) {
      toast.info("You've already checked in today!");
      return;
    }

    // Check if the last check-in was today
    if (streak.lastCheckIn === today) {
      setIsCheckedInToday(true);
      toast.info("You've already checked in today!");
      return;
    }

    try {
      // Create check-in record in database
      const { error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          user_id: userId,
          check_in_date: today
        });

      if (checkInError) throw checkInError;

      // Update streak
      const streakUpdated = await incrementStreak(userId);
      setIsCheckedInToday(true);

      // Create a checked-in entry for today if it doesn't exist
      const todayEntry = journalEntries.find(entry => entry.date === today);

      if (!todayEntry) {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: userId,
            entry_date: today,
            prayed_for: '',
            received_insight: ''
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newEntry: JournalEntry = {
            id: data.id,
            userId: data.user_id,
            date: data.entry_date,
            prayedFor: data.prayed_for || '',
            receivedInsight: data.received_insight || '',
            createdAt: data.created_at,
            isCheckedIn: true
          };

          setJournalEntries(prev => [...prev, newEntry]);
        }
      }

      if (streakUpdated) {
        toast.success(`Checked in! Current streak: ${streak.current + 1} day${streak.current + 1 !== 1 ? 's' : ''}`);
      } else {
        toast.success("Checked in for today!");
      }
    } catch (error: any) {
      console.error("Error during check-in:", error);
      toast.error(error.message || "Failed to check in. Please try again.");
    }
  };

  return {
    isCheckedInToday,
    checkIsCheckedInToday,
    checkIn
  };
}
