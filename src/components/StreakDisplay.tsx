
import { useUserData } from "@/context/UserDataContext";
import { Flame, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StreakDisplay() {
  const { streak, useFreeze } = useUserData();

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Streak</h3>
        <div className="flex items-center space-x-1">
          {Array.from({ length: streak.freezesAvailable }).map((_, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Snowflake className="h-5 w-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Streak Freeze Available</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
      
      <div className="relative h-36 flex flex-col items-center justify-center mb-6">
        <div className="absolute flex justify-center items-center w-28 h-28 rounded-full overflow-hidden border-4 border-secondary">
          <div className="absolute inset-0 flex justify-center items-center">
            <Flame className={`h-12 w-12 ${streak.current > 0 ? 'text-primary' : 'text-muted'}`} />
          </div>
        </div>
        <div className="absolute flex justify-center items-center w-28 h-28 pt-16">
          <span className="text-3xl font-semibold">{streak.current}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center mb-4">
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Longest</p>
          <p className="text-lg font-medium">{streak.longest} days</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Freezes</p>
          <p className="text-lg font-medium">{streak.freezesAvailable}</p>
        </div>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full"
            disabled={streak.freezesAvailable <= 0}
          >
            <Snowflake className="mr-2 h-4 w-4" />
            Use Streak Freeze
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use a Streak Freeze?</AlertDialogTitle>
            <AlertDialogDescription>
              A streak freeze will protect your current streak if you miss a day.
              You have {streak.freezesAvailable} freeze{streak.freezesAvailable !== 1 ? 's' : ''} available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={useFreeze}>Use Freeze</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
