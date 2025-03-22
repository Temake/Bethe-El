
import { useState, useEffect } from "react";
import { useUserData } from "@/context/UserDataContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function JournalEntry() {
  const { getTodayEntry, addJournalEntry } = useUserData();
  const [prayedFor, setPrayedFor] = useState("");
  const [receivedInsight, setReceivedInsight] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load today's entry if it exists
  useEffect(() => {
    const todayEntry = getTodayEntry();
    if (todayEntry) {
      setPrayedFor(todayEntry.prayedFor || "");
      setReceivedInsight(todayEntry.receivedInsight || "");
    }
  }, [getTodayEntry]);

  // Track changes
  useEffect(() => {
    const todayEntry = getTodayEntry();
    if (todayEntry) {
      setHasChanges(
        todayEntry.prayedFor !== prayedFor || 
        todayEntry.receivedInsight !== receivedInsight
      );
    } else {
      setHasChanges(prayedFor !== "" || receivedInsight !== "");
    }
  }, [prayedFor, receivedInsight, getTodayEntry]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addJournalEntry(prayedFor, receivedInsight);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Today's Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prayedFor">What I prayed for today</Label>
          <Textarea
            id="prayedFor"
            placeholder="Share what you prayed about..."
            className="min-h-[100px] resize-none"
            value={prayedFor}
            onChange={(e) => setPrayedFor(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receivedInsight">What I received from God</Label>
          <Textarea
            id="receivedInsight"
            placeholder="Record insights, scripture, or thoughts you received..."
            className="min-h-[150px] resize-none"
            value={receivedInsight}
            onChange={(e) => setReceivedInsight(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="ml-auto" 
          onClick={handleSave} 
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Journal
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
