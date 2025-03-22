
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthAlertProps {
  variant?: "default" | "destructive";
  message: string;
}

export const AuthAlert = ({ variant = "default", message }: AuthAlertProps) => {
  return (
    <Alert variant={variant} className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
