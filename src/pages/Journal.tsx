
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { JournalEntry as JournalEntryType } from "@/lib/types";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, BookOpen, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function Journal() {
  const { isAuthenticated } = useAuth();
  const { journalEntries, updateJournalEntry } = useUserData();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [prayedForEdit, setPrayedForEdit] = useState("");
  const [receivedInsightEdit, setReceivedInsightEdit] = useState("");
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = 
      entry.prayedFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.receivedInsight.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDate = selectedDate 
      ? entry.date === format(selectedDate, "yyyy-MM-dd")
      : true;
      
    return matchesSearch && matchesDate;
  });
  
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });
  
  const handleEntryClick = (entry: JournalEntryType) => {
    setSelectedEntry(entry);
    setPrayedForEdit(entry.prayedFor);
    setReceivedInsightEdit(entry.receivedInsight);
    setIsDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (selectedEntry) {
      updateJournalEntry(selectedEntry.id, prayedForEdit, receivedInsightEdit);
      setIsDialogOpen(false);
    }
  };
  
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDate(undefined);
    setSortBy("newest");
  };

  const getDateWithEntries = () => {
    return journalEntries
      .map(entry => new Date(entry.date))
      .filter(date => !isNaN(date.getTime()));
  };

  if (!isAuthenticated) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-6 animate-fade-in">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Journal</h1>
              <p className="text-muted-foreground">
                Record and review your spiritual journey
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")}>
              Write Today's Entry
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </header>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Your Journal Entries</CardTitle>
                  <CardDescription>
                    {journalEntries.length === 0
                      ? "Start journaling to see your entries here"
                      : `You have ${journalEntries.length} journal ${journalEntries.length === 1 ? "entry" : "entries"}`}
                  </CardDescription>
                </div>
                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search journal entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || selectedDate || sortBy !== "newest") && (
                    <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
                      Clear Filters
                    </Button>
                  )}
                </div>

                {viewMode === "list" && (
                  <div className="space-y-4">
                    {sortedEntries.length > 0 ? (
                      sortedEntries.map((entry) => (
                        <Card
                          key={entry.id}
                          className="cursor-pointer transition-all duration-300 hover:shadow-md"
                          onClick={() => handleEntryClick(entry)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                <CardTitle className="text-lg">
                                  {new Date(entry.date).toLocaleDateString(undefined, {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </CardTitle>
                              </div>
                              {entry.isCheckedIn && (
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  Checked In
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {entry.prayedFor && (
                                <div>
                                  <p className="text-sm font-medium">I prayed for:</p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {entry.prayedFor}
                                  </p>
                                </div>
                              )}
                              {entry.receivedInsight && (
                                <div>
                                  <p className="text-sm font-medium">I received:</p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {entry.receivedInsight}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                        <p className="text-lg font-medium">No journal entries found</p>
                        <p className="text-muted-foreground">
                          {searchQuery || selectedDate
                            ? "Try adjusting your search or filters"
                            : "Start writing your first journal entry"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {viewMode === "calendar" && (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border shadow"
                        modifiers={{
                          hasEntry: getDateWithEntries(),
                        }}
                        modifiersStyles={{
                          hasEntry: {
                            fontWeight: 'bold',
                            border: '2px solid var(--color-primary)',
                            backgroundColor: 'hsl(var(--primary) / 0.1)',
                          },
                        }}
                      />
                    </div>
                    <div className="md:w-1/2">
                      <h3 className="text-lg font-medium mb-4">
                        {selectedDate ? (
                          <>Entries for {format(selectedDate, "MMMM d, yyyy")}</>
                        ) : (
                          <>Select a date to view entries</>
                        )}
                      </h3>
                      <div className="space-y-4">
                        {sortedEntries.length > 0 ? (
                          sortedEntries.map((entry) => (
                            <Card
                              key={entry.id}
                              className="cursor-pointer transition-all duration-300 hover:shadow-md"
                              onClick={() => handleEntryClick(entry)}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  {entry.prayedFor && (
                                    <div>
                                      <p className="text-sm font-medium">I prayed for:</p>
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {entry.prayedFor}
                                      </p>
                                    </div>
                                  )}
                                  {entry.receivedInsight && (
                                    <div>
                                      <p className="text-sm font-medium">I received:</p>
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {entry.receivedInsight}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-muted-foreground">
                              {selectedDate
                                ? "No entries for this date"
                                : "Select a date to view entries"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry && format(new Date(selectedEntry.date), "MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>View and edit your journal entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prayedForEdit">What I prayed for</Label>
              <Textarea
                id="prayedForEdit"
                value={prayedForEdit}
                onChange={(e) => setPrayedForEdit(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedInsightEdit">What I received from God</Label>
              <Textarea
                id="receivedInsightEdit"
                value={receivedInsightEdit}
                onChange={(e) => setReceivedInsightEdit(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
