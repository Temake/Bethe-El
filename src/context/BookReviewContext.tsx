import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

type BookReviewContextType = {
  todayBookReview: string | null;
  isLoadingBookReview: boolean;
  saveBookReviewForToday: (review: string) => Promise<void>;
};

const BookReviewContext = createContext<BookReviewContextType | undefined>(undefined);

// Define the hook outside the provider to make it compatible with Fast Refresh
function useBookReview() {
  const context = useContext(BookReviewContext);
  if (context === undefined) {
    throw new Error('useBookReview must be used within a BookReviewProvider');
  }
  return context;
}

export const BookReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [todayBookReview, setTodayBookReview] = useState<string | null>(null);
  const [isLoadingBookReview, setIsLoadingBookReview] = useState(true);

  // Fetch today's book review when user changes
  useEffect(() => {
    if (user) {
      fetchTodayBookReview();
    } else {
      setTodayBookReview(null);
      setIsLoadingBookReview(false);
    }
  }, [user]);

  const fetchTodayBookReview = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching book review for date:', today);
      
      const { data, error } = await supabase
        .from('book_reviews')
        .select('review_text')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, which is fine
          console.log('No book review found for today');
        } else {
          console.error('Error fetching book review:', error);
          throw error;
        }
      }

      setTodayBookReview(data?.review_text || null);
    } catch (error) {
      console.error('Error in fetchTodayBookReview:', error);
      toast.error('Failed to load today\'s book review');
    } finally {
      setIsLoadingBookReview(false);
    }
  };

  const saveBookReviewForToday = async (review: string) => {
    if (!user) {
      toast.error('You must be logged in to save a book review');
      return;
    }

    setIsLoadingBookReview(true);
    const today = new Date().toISOString().split('T')[0];
    console.log('Saving book review for date:', today);

    try {
      // First, check if an entry exists for today
      const { data: existingEntry, error: fetchError } = await supabase
        .from('book_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking for existing entry:', fetchError);
        throw fetchError;
      }

      let operation;
      if (existingEntry) {
        // Update existing entry
        console.log('Updating existing book review with ID:', existingEntry.id);
        operation = supabase
          .from('book_reviews')
          .update({ review_text: review })
          .eq('id', existingEntry.id);
      } else {
        // Insert new entry
        console.log('Creating new book review');
        operation = supabase
          .from('book_reviews')
          .insert({
            user_id: user.id,
            date: today,
            review_text: review
          });
      }

      const { data, error: saveError } = await operation;

      if (saveError) {
        console.error('Supabase error details:', saveError);
        throw saveError;
      }

      console.log('Book review saved successfully:', data);
      setTodayBookReview(review);
      toast.success('Book review saved successfully');
    } catch (error) {
      console.error('Error saving book review:', error);
      toast.error('Failed to save book review');
      throw error; // Re-throw to allow component to handle it
    } finally {
      setIsLoadingBookReview(false);
    }
  };

  return (
    <BookReviewContext.Provider
      value={{
        todayBookReview,
        isLoadingBookReview,
        saveBookReviewForToday
      }}
    >
      {children}
    </BookReviewContext.Provider>
  );
};

// Export the hook
export { useBookReview };