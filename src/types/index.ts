export interface TeamMember {
  name: string;
  isLeader?: boolean;
}

export interface AdminCheckItem {
  id: number;
  item: string;
  status: 'Ya' | 'Tidak';
  keterangan: string;
}

export interface ArticleScore {
  a1_1: number; // 1-4 (8%)
  a1_2: number; // 1-4 (12%)
  a1_3: number; // 1-4 (10%)
  a2_1: number; // 1-4 (8%)
  a2_2: number; // 1-4 (10%)
  a2_3: number; // 1-4 (12%)
  a3_1: number; // 1-4 (10%)
  a3_2: number; // 1-4 (10%)
  a4_1: number; // 1-4 (10%)
  a4_2: number; // 1-4 (10%)
}

export interface VideoScore {
  v1_1: number; // 1-4 (15%)
  v1_2: number; // 1-4 (15%)
  v2_1: number; // 1-4 (12%)
  v2_2: number; // 1-4 (12%)
  v2_3: number; // 1-4 (6%)
  v3_1: number; // 1-4 (12%)
  v3_2: number; // 1-4 (8%)
  v4_1: number; // 1-4 (10%)
  v4_2: number; // 1-4 (10%)
  durationMinutes: number;
  durationSeconds: number;
  durationPenalty: number; // 0, 5, or 10 points
}

export interface FinalScore {
  f1: number; // 1-4 (30%)
  f2: number; // 1-4 (30%)
  f3: number; // 1-4 (20%)
  f4: number; // 1-4 (20%)
}

export interface Evaluation {
  id: string;
  teamId: string;
  judgeId: string;
  judgeName: string;
  tahap: 'Tahap 2' | 'Final';
  adminCheck: AdminCheckItem[];
  articleScore: ArticleScore;
  videoScore: VideoScore;
  finalScore?: FinalScore;
  feedback: string;
  status: 'draft' | 'submitted';
  updatedAt: string;
}

export interface Team {
  id: string;
  code: string; // e.g. "TIM-01"
  name: string;
  school: string;
  productTitle: string;
  localResource: string; // e.g. "Susu Sapi Nongkojajar", "Mangga Klonal 21", etc.
  leader: string;
  members: string[];
  mentorTeacher: string;
  tahap: 'Tahap 2' | 'Final';
  folderId?: string;
  folderUrl?: string;
  articleFileId?: string;
  articleFileName?: string;
  articleUrl?: string;
  videoFileId?: string;
  videoFileName?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  photoUrl?: string;
  registeredAt: string;
  // Rich Article preview data for judges
  articleAbstract?: string;
  articleSummary?: {
    background: string;
    scienceTheory: string;
    methodology: string;
    businessModel: string;
    localImpact: string;
  };
}

export interface Judge {
  id: string;
  username: string;
  name: string;
  nip?: string;
  institution: string;
  field: string;
  isActive: boolean;
  password?: string;
}

export interface TeamAggregatedScore {
  team: Team;
  evaluationsCount: number;
  articleScoreAvg: number;
  videoScoreAvg: number;
  finalScoreAvg: number;
  // Weighted components by priority
  scoreSainsInovasi: number; // 30% Prioritas 1
  scoreKelayakanBisnis: number; // 30% Prioritas 2
  scoreBahanLokal: number; // 20% Prioritas 3
  scorePresentasiPenulisan: number; // 20% Non-prioritas
  totalScore: number; // 100%
  rank?: number;
  isTopTen?: boolean;
}

export interface BackgroundConfig {
  imageUrl: string;
  opacity: number; // 0.05 - 0.50
  brightness: number; // 0.8 - 1.8
  saturation: number; // 0.8 - 2.5
  blur: number; // 0 - 20 px
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
  enabled: boolean;
}

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  imageUrl: '/hero_banner.jpg',
  opacity: 0.22,
  brightness: 1.18,
  saturation: 1.45,
  blur: 2,
  blendMode: 'soft-light',
  enabled: true
};
