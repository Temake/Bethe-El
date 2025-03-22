
export type User = {
  id: string;
  name: string;
  email: string;
  phone_number: Text;
};

export type JournalEntry = {
  id: string;
  userId: string;
  date: string;
  prayedFor: string;
  receivedInsight: string;
  createdAt: string;
  isCheckedIn: boolean;
};

export type Streak = {
  current: number;
  longest: number;
  lastCheckIn: string | null;
  freezesAvailable: number;
};

export type UserData = {
  user: User | null;
  journalEntries: JournalEntry[];
  streak: Streak;
};

// Supabase Database Types
export type ProfilesRow = {
  id: string;
  name: string | null;
  created_at: string;
};

export type CheckInsRow = {
  id: string;
  user_id: string;
  check_in_date: string;
  created_at: string;
};

export type JournalEntriesRow = {
  id: string;
  user_id: string;
  prayed_for: string | null;
  received_insight: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
};

export type StreakDataRow = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  created_at: string;
  updated_at: string;
};
