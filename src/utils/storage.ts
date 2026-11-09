import { Team, Judge, Evaluation, BackgroundConfig, DEFAULT_BACKGROUND_CONFIG } from '../types';
import { INITIAL_TEAMS, INITIAL_JUDGES, INITIAL_EVALUATIONS } from '../data/initialData';

const STORAGE_KEYS = {
  TEAMS: 'psf26_teams_v4',
  JUDGES: 'psf26_judges_v4',
  EVALUATIONS: 'psf26_evaluations_v4',
  CURRENT_USER: 'psf26_session_v4',
  ACTIVE_TAB: 'psf26_active_tab_v4',
  IS_PUBLISHED: 'psf26_is_published_v4',
  GAS_SYNC_TIMESTAMP: 'psf26_gas_synced_v4',
  BG_CONFIG: 'psf26_bg_config_v4'
};

export const Storage = {
  getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (data) {
        const parsed: Team[] = JSON.parse(data);
        let needsUpgrade = false;
        const enriched = parsed.map(t => {
          const official = INITIAL_TEAMS.find(it => it.id === t.id || it.code === t.code);
          if (!official) return t;

          const hasYoutubeOrInvalidVideo = !t.videoUrl || t.videoUrl.includes('youtube.com') || t.videoUrl.includes('youtu.be');
          const hasGenericArticle = !t.articleUrl || t.articleUrl.includes('/folders/');
          const missingFileIds = !t.videoFileId || !t.articleFileId || !t.folderId;

          if (hasYoutubeOrInvalidVideo || hasGenericArticle || missingFileIds) {
            needsUpgrade = true;
            return {
              ...official,
              ...t,
              name: (t.name && !t.name.startsWith('Lab Rats') && !t.name.startsWith('ScienNova')) ? t.name : official.name,
              productTitle: (t.productTitle && !t.productTitle.startsWith('LAB RATS') && !t.productTitle.startsWith('SCIENNOVA')) ? t.productTitle : official.productTitle,
              folderId: official.folderId,
              folderUrl: official.folderUrl,
              videoFileId: official.videoFileId,
              videoFileName: official.videoFileName,
              videoUrl: hasYoutubeOrInvalidVideo ? official.videoUrl : t.videoUrl,
              videoThumbnailUrl: official.videoThumbnailUrl,
              articleFileId: official.articleFileId,
              articleFileName: official.articleFileName,
              articleUrl: hasGenericArticle ? official.articleUrl : t.articleUrl,
              articleAbstract: t.articleAbstract || official.articleAbstract,
              articleSummary: t.articleSummary || official.articleSummary
            };
          }
          return t;
        });

        if (needsUpgrade) {
          localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(enriched));
        }
        return enriched;
      }
    } catch (e) {
      console.error('Error reading teams:', e);
    }
    this.saveTeams(INITIAL_TEAMS);
    return INITIAL_TEAMS;
  },

  saveTeams(teams: Team[]) {
    const enriched = teams.map(t => {
      const official = INITIAL_TEAMS.find(it => it.id === t.id || it.code === t.code);
      if (!official) return t;
      const hasYoutubeOrInvalidVideo = !t.videoUrl || t.videoUrl.includes('youtube.com') || t.videoUrl.includes('youtu.be');
      const hasGenericArticle = !t.articleUrl || t.articleUrl.includes('/folders/');
      return {
        ...official,
        ...t,
        folderId: t.folderId || official.folderId,
        folderUrl: t.folderUrl || official.folderUrl,
        videoFileId: t.videoFileId || official.videoFileId,
        videoFileName: t.videoFileName || official.videoFileName,
        videoUrl: hasYoutubeOrInvalidVideo ? official.videoUrl : t.videoUrl,
        videoThumbnailUrl: (!t.videoThumbnailUrl || t.videoThumbnailUrl.includes('unsplash.com')) ? official.videoThumbnailUrl : t.videoThumbnailUrl,
        articleFileId: t.articleFileId || official.articleFileId,
        articleFileName: t.articleFileName || official.articleFileName,
        articleUrl: hasGenericArticle ? official.articleUrl : t.articleUrl
      };
    });
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(enriched));
  },

  getJudges(): Judge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JUDGES);
      if (data) {
        const parsed: Judge[] = JSON.parse(data);
        // Otomatis saring dan buang akun dummy lama
        const filtered = parsed.filter(j => {
          const u = (j.username || '').toLowerCase();
          const id = (j.id || '').toLowerCase();
          return u !== 'juri1' && u !== 'juri2' && u !== 'juri3' &&
                 id !== 'juri-1' && id !== 'juri-2' && id !== 'juri-3';
        });

        // Deduplikasi berdasarkan username & pastikan INITIAL_JUDGES (juri-001 & juri-002) selalu ada
        const byUsername = new Map<string, Judge>();
        for (const ij of INITIAL_JUDGES) {
          byUsername.set(ij.username.toLowerCase(), ij);
        }
        for (const fj of filtered) {
          if (fj.username) {
            const key = fj.username.toLowerCase();
            const official = INITIAL_JUDGES.find(ij => ij.username.toLowerCase() === key);
            byUsername.set(key, official ? { ...official, ...fj, id: official.id } : fj);
          }
        }
        const deduped = Array.from(byUsername.values());
        if (deduped.length !== parsed.length || filtered.length === 0) {
          this.saveJudges(deduped);
        }
        return deduped;
      }
    } catch (e) {
      console.error('Error reading judges:', e);
    }
    this.saveJudges(INITIAL_JUDGES);
    return INITIAL_JUDGES;
  },

  saveJudges(judges: Judge[]) {
    const byUsername = new Map<string, Judge>();
    for (const ij of INITIAL_JUDGES) {
      byUsername.set(ij.username.toLowerCase(), ij);
    }
    for (const j of judges) {
      if (!j.username) continue;
      const key = j.username.toLowerCase();
      if (key === 'juri1' || key === 'juri2' || key === 'juri3') continue;
      const official = INITIAL_JUDGES.find(ij => ij.username.toLowerCase() === key);
      byUsername.set(key, official ? { ...official, ...j, id: official.id } : j);
    }
    localStorage.setItem(STORAGE_KEYS.JUDGES, JSON.stringify(Array.from(byUsername.values())));
  },

  getEvaluations(): Evaluation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      if (data) {
        const parsed: Evaluation[] = JSON.parse(data);
        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading evaluations:', e);
    }
    this.saveEvaluations(INITIAL_EVALUATIONS);
    return INITIAL_EVALUATIONS;
  },

  saveEvaluations(evals: Evaluation[]) {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
  },

  saveEvaluationsFromDb(evals: Evaluation[]) {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
  },

  getIsResultsPublished(): boolean {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IS_PUBLISHED);
      if (data !== null) return JSON.parse(data);
    } catch (e) {}
    return true; // Default: publish official Top 10 leaderboard & evaluations
  },

  saveIsResultsPublished(isPublished: boolean) {
    localStorage.setItem(STORAGE_KEYS.IS_PUBLISHED, JSON.stringify(isPublished));
  },

  saveEvaluation(evaluation: Evaluation) {
    const list = this.getEvaluations();
    const idx = list.findIndex(
      e =>
        e.teamId === evaluation.teamId &&
        (e.judgeId === evaluation.judgeId ||
          (e.judgeName.toLowerCase().includes('akhmad nasor') &&
            evaluation.judgeName.toLowerCase().includes('akhmad nasor')))
    );
    if (idx >= 0) {
      list[idx] = evaluation;
    } else {
      list.push(evaluation);
    }
    this.saveEvaluations(list);
  },

  getUserSession(): { role: 'admin' | 'judge'; judge?: Judge } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading session:', e);
    }
    return null;
  },

  saveUserSession(session: { role: 'admin' | 'judge'; judge?: Judge } | null) {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getBackgroundConfig(): BackgroundConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BG_CONFIG);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading bg config:', e);
    }
    return DEFAULT_BACKGROUND_CONFIG;
  },

  saveBackgroundConfig(config: BackgroundConfig) {
    localStorage.setItem(STORAGE_KEYS.BG_CONFIG, JSON.stringify(config));
  },

  resetAllToDefault() {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.JUDGES, JSON.stringify(INITIAL_JUDGES));
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.IS_PUBLISHED, JSON.stringify(false));
    localStorage.setItem(STORAGE_KEYS.BG_CONFIG, JSON.stringify(DEFAULT_BACKGROUND_CONFIG));
  }
};
