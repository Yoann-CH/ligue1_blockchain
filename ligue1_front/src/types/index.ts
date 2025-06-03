export interface Club {
  id: number;
  name: string;
  logo: string;
  votes: number;
  exists: boolean;
  percentage?: number;
}

export interface VoteResult {
  success: boolean;
  results: Club[];
  totalVotes: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  hasVoted: boolean;
  voterChoice: number | null;
}

export interface ContractInfo {
  address: string;
  network: string;
  deployedAt: string;
}

export interface Stats {
  totalVotes: number;
  votesByClub: Array<{
    _id: { clubId: number; clubName: string };
    count: number;
  }>;
  recentVotes: Array<{
    clubName: string;
    timestamp: string;
    voter: string;
  }>;
} 