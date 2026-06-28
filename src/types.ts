export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: "citizen" | "resolver";
  points: number;
  badges: string[];
  photoUrl?: string | null;
  reportsCount: number;
  verificationsCount: number;
  resolvedReportsCount: number;
  resolverIssuesResolved: number;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note: string;
  mediaUrls?: string[];
}

export interface Comment {
  username: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface Issue {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  location: {
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
  issueType: string;
  title: string;
  summary: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Reported" | "Verified" | "In Progress" | "Resolved";
  statusHistory: StatusHistoryEntry[];
  resolutionProof?: {
    note: string;
    mediaUrls: string[];
  } | null;
  mediaUrls: string[];
  mediaUrl: string | null;
  reporterId: string | null;
  confirmations: number;
  confirmedBy: string[];
  stillHappeningCount?: number;
  stillHappeningBy?: { userId: string; timestamp: string }[];
  commentsList: Comment[];
  comments: number;
  upvotes: number;
  createdAt: string;
  updatedAt: string | null;
  lastActivityAt?: string;
  lastCorroboratedAt?: string;
}
