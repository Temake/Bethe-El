
import { useState, useEffect } from "react";
import { JournalEntry, User } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useJournalEntries(initialEntries: JournalEntry[] = [], user: User | null) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialEntries);

  // Fetch journal entries from Supabase when user changes
  useEffect(() => {
    const fetchJournalEntries = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select()
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Map Supabase journal entries to app format
          const mappedEntries: JournalEntry[] = data.map((entry: any) => ({
            id: entry.id,
            userId: entry.user_id,
            date: entry.entry_date,
            prayedFor: entry.prayed_for || '',
            receivedInsight: entry.received_insight || '',
            createdAt: entry.created_at,
            isCheckedIn: true // If there's a journal entry, user is checked in for that day
          }));
          
          setJournalEntries(mappedEntries);
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      }
    };
    
    fetchJournalEntries();
  }, [user]);

  const addJournalEntry = async (prayedFor: string, receivedInsight: string) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = journalEntries.find(entry => entry.date === today);
    
    try {
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            prayed_for: prayedFor,
            received_insight: receivedInsight,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
        
        if (error) throw error;
        
        setJournalEntries(prev => 
          prev.map(entry => 
            entry.id === existingEntry.id 
              ? { 
                  ...entry, 
                  prayedFor, 
                  receivedInsight,
                  isCheckedIn: true
                } 
              : entry
          )
        );
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            entry_date: today,
            prayed_for: prayedFor,
            received_insight: receivedInsight
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
      
      // Ensure check-in record exists for today
      const { error: checkInError } = await supabase
        .from('check_ins')
        .upsert({
          user_id: user.id,
          check_in_date: today
        }, { 
          onConflict: 'user_id,check_in_date' 
        });
      
      if (checkInError) {
        console.error("Error ensuring check-in record:", checkInError);
      }
      
      toast.success("Journal entry saved!");
    } catch (error: any) {
      console.error("Error saving journal entry:", error);
      toast.error(error.message || "Failed to save journal entry.");
    }
  };

  const updateJournalEntry = async (id: string, prayedFor: string, receivedInsight: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          prayed_for: prayedFor,
          received_insight: receivedInsight,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setJournalEntries(prev => 
        prev.map(entry => 
          entry.id === id 
            ? { ...entry, prayedFor, receivedInsight } 
            : entry
        )
      );
      
      toast.success("Journal entry updated!");
    } catch (error: any) {
      console.error("Error updating journal entry:", error);
      toast.error(error.message || "Failed to update journal entry.");
    }
  };

  const getTodayEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    return journalEntries.find(entry => entry.date === today);
  };

  return {
    journalEntries,
    setJournalEntries,
    addJournalEntry,
    updateJournalEntry,
    getTodayEntry
  };
}
