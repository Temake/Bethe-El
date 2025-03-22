
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Flame, Snowflake, User, Settings, BookOpen } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { journalEntries, streak } = useUserData();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect via the useEffect
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Navbar />
      <main className="container max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8 animate-fade-in">
          <header>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Profile</h1>
            <p className="text-muted-foreground">
              View and manage your account information
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4 bg-primary text-primary-foreground">
                    <AvatarFallback className="text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Button variant="outline" className="justify-start" asChild>
                    <div>
                      <User className="mr-2 h-4 w-4" />
                      User Settings
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <div>
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </div>
                  </Button>
                  <Button
                    variant="destructive"
                    className="justify-start mt-4"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 md:col-span-2">
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flame className="mr-2 h-5 w-5 text-primary" /> 
                    Your Statistics
                  </CardTitle>
                  <CardDescription>
                    A summary of your spiritual journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                      <Flame className="h-8 w-8 text-primary mb-2" />
                      <span className="text-2xl font-bold">{streak.current}</span>
                      <span className="text-sm text-muted-foreground">
                        Current Streak
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                      <Flame className="h-8 w-8 text-primary mb-2" />
                      <span className="text-2xl font-bold">{streak.longest}</span>
                      <span className="text-sm text-muted-foreground">
                        Longest Streak
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                      <Snowflake className="h-8 w-8 text-primary mb-2" />
                      <span className="text-2xl font-bold">{streak.freezesAvailable}</span>
                      <span className="text-sm text-muted-foreground">
                        Freezes Available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-primary" />
                    Journal Summary
                  </CardTitle>
                  <CardDescription>
                    An overview of your journaling activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Journal Entries</span>
                      <span className="text-xl font-bold">{journalEntries.length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Most Recent Entry</span>
                      <span className="text-sm">
                        {journalEntries.length > 0
                          ? new Date(
                              Math.max(
                                ...journalEntries.map((e) => new Date(e.date).getTime())
                              )
                            ).toLocaleDateString()
                          : "No entries yet"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">First Entry</span>
                      <span className="text-sm">
                        {journalEntries.length > 0
                          ? new Date(
                              Math.min(
                                ...journalEntries.map((e) => new Date(e.date).getTime())
                              )
                            ).toLocaleDateString()
                          : "No entries yet"}
                      </span>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate("/journal")}>
                      View All Journal Entries
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
