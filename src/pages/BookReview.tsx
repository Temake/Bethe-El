import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBookReview } from '@/context/BookReviewContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, CalendarIcon, BookText, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function BookReview() {
  const { isAuthenticated, user } = useAuth();
  const { todayBookReview, isLoadingBookReview, saveBookReviewForToday } = useBookReview();
  const [review, setReview] = useState(todayBookReview || '');
  const [isSaving, setIsSaving] = useState(false);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Update review state when todayBookReview changes
  useEffect(() => {
    if (todayBookReview !== null) {
      setReview(todayBookReview);
    }
  }, [todayBookReview]);

  // Fetch recent book reviews
  useEffect(() => {
    if (user) {
      fetchRecentReviews();
    }
  }, [user]);

  const fetchRecentReviews = async () => {
    if (!user) return;
    
    setIsLoadingReviews(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching recent book reviews for user:', user.id);
      
      const { data, error } = await supabase
        .from('book_reviews')
        .select('id, date, review_text')
        .eq('user_id', user.id)
        .neq('date', today)
        .order('date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent book reviews:', error);
        throw error;
      }

      console.log('Recent book reviews fetched:', data);
      setRecentReviews(data || []);
    } catch (error) {
      console.error('Error in fetchRecentReviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) {
      toast.error('Please enter a book review');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Submitting book review:', review);
      await saveBookReviewForToday(review);
      // Refresh recent reviews after saving
      fetchRecentReviews();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to save book review. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-6 animate-fade-in">
          <header>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Book Review Journal</h1>
            <p className="text-muted-foreground">
              Record what you learned from your reading today
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 col-span-3 md:col-span-2">
              <Card className="bg-card shadow-sm transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Today's Book Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="What did you learn from your reading today?"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="min-h-[200px]"
                        disabled={isLoadingBookReview || isSaving}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoadingBookReview || isSaving || !review.trim()}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Review'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 md:col-span-1">
              <Card className="shadow-sm transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BookText className="h-5 w-5 mr-2" />
                    Recent Book Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingReviews ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : recentReviews.length > 0 ? (
                    <ScrollArea className="h-72">
                      <div className="space-y-4">
                        {recentReviews.map((review) => (
                          <div key={review.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {new Date(review.date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="text-sm line-clamp-2">
                              {review.review_text || 'No review text'}
                            </div>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-56 text-center">
                      <BookText className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
                      <p className="text-muted-foreground">No book reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}