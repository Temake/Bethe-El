
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import CheckInButton from "@/components/CheckInButton";
import StreakDisplay from "@/components/StreakDisplay";
import JournalEntry from "@/components/JournalEntry";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, BookText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const { journalEntries } = useUserData();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Sort entries by date, most recent first
  const sortedEntries = [...journalEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get recent entries (excluding today)
  const today = new Date().toISOString().split('T')[0];
  const recentEntries = sortedEntries.filter(entry => entry.date !== today).slice(0, 5);

  if (!isAuthenticated) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-6 animate-fade-in">
          <header>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">
              Track your spiritual journey and maintain consistency
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 col-span-3 md:col-span-2">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-2 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Daily Check-in</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">
                        Mark your presence today and continue your streak
                      </p>
                      <CheckInButton />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <JournalEntry />
            </div>

            <div className="space-y-6 md:col-span-1">
              <StreakDisplay />

              <Card className="shadow-sm transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BookText className="h-5 w-5 mr-2" />
                    Recent Journal Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentEntries.length > 0 ? (
                    <ScrollArea className="h-72">
                      <div className="space-y-4">
                        {recentEntries.map((entry) => (
                          <div key={entry.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {new Date(entry.date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="text-sm line-clamp-2">
                              {entry.receivedInsight || entry.prayedFor || 'No notes added'}
                            </div>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-56 text-center">
                      <BookText className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
                      <p className="text-muted-foreground">No journal entries yet</p>
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
