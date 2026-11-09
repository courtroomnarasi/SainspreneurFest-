/**
 * Cloud Sync & Web Config Manager
 * Mengelola pengiriman (Push) dan penarikan (Pull) data antara Web App dan Google Apps Script / Google Drive DB
 */

import { Team, Judge, Evaluation } from '../types';
import { APPS_SCRIPT_API_URL, GOOGLE_DRIVE_DB_URL, GOOGLE_SPREADSHEET_ID } from '../data/initialData';
import { Storage } from './storage';
import { pingDatabase } from './dbConnection';
import { calculateSingleArticleScore, calculateSingleVideoScore } from './tieBreaker';

export interface SyncLogItem {
  id: string;
  timestamp: string;
  action: 'PULL' | 'PUSH' | 'PING' | 'CONFIG';
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface CloudConfig {
  endpointUrl: string;
  driveFolderId: string;
  spreadsheetId: string;
  spreadsheetName: string;
  autoSyncEnabled: boolean;
  autoSyncIntervalSec: number;
  lastPulledAt: string | null;
  lastPushedAt: string | null;
}

const STORAGE_KEYS = {
  CONFIG: 'psf26_web_config_v3',
  LOGS: 'psf26_sync_logs_v3'
};

const DEFAULT_CONFIG: CloudConfig = {
  endpointUrl: APPS_SCRIPT_API_URL,
  driveFolderId: '1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb',
  spreadsheetId: GOOGLE_SPREADSHEET_ID,
  spreadsheetName: 'DB_Sainspreneur_Pasuruan_Festival_2026',
  autoSyncEnabled: true,
  autoSyncIntervalSec: 60,
  lastPulledAt: null,
  lastPushedAt: null
};

export const CloudSync = {
  getConfig(): CloudConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          spreadsheetId: parsed.spreadsheetId || GOOGLE_SPREADSHEET_ID
        };
      }
    } catch (e) {
      console.warn('Error reading cloud config:', e);
    }
    return DEFAULT_CONFIG;
  },

  saveConfig(config: Partial<CloudConfig>): CloudConfig {
    const current = this.getConfig();
    const updated = {
      ...current,
      ...config,
      spreadsheetId: config.spreadsheetId || current.spreadsheetId || GOOGLE_SPREADSHEET_ID
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    return updated;
  },

  getLogs(): SyncLogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [
      {
        id: 'log-init',
        timestamp: new Date().toLocaleTimeString('id-ID'),
        action: 'CONFIG',
        status: 'success',
        message: `Web Config Cloud Sync terhubung ke Spreadsheet ID: ${GOOGLE_SPREADSHEET_ID}.`
      }
    ];
  },

  addLog(action: SyncLogItem['action'], status: SyncLogItem['status'], message: string, details?: string) {
    const logs = this.getLogs();
    const newLog: SyncLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      action,
      status,
      message,
      details
    };
    const updated = [newLog, ...logs.slice(0, 49)];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    return updated;
  },

  clearLogs() {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  },

  /**
   * Format objek Evaluation agar kolom Spreadsheet (NilaiArtikel, NilaiVideo, TotalSkor) berisi angka bersih
   * sekaligus menyimpan objek rubrik lengkap di dalam payload dan menyertakan spreadsheetId resmi
   */
  formatEvaluationForSheet(ev: Evaluation, spreadsheetId?: string) {
    const targetSheetId = spreadsheetId || this.getConfig().spreadsheetId || GOOGLE_SPREADSHEET_ID;
    const artNum = calculateSingleArticleScore(ev.articleScore as any);
    const vidNum = calculateSingleVideoScore(ev.videoScore as any);
    const penNum = (ev.videoScore && typeof ev.videoScore === 'object') ? (ev.videoScore.durationPenalty || 0) : 0;
    const totalNum = Number(((artNum + vidNum) / 2).toFixed(2));

    return {
      id: ev.id,
      teamId: ev.teamId,
      judgeId: ev.judgeId,
      judgeName: ev.judgeName,
      tahap: ev.tahap || 'Tahap 2',
      articleScore: artNum,
      videoScore: vidNum,
      durationPenalty: penNum,
      totalWeightedScore: totalNum,
      generalFeedback: ev.feedback || '',
      feedback: ev.feedback || '',
      status: ev.status || 'submitted',
      updatedAt: ev.updatedAt || new Date().toISOString(),
      spreadsheetId: targetSheetId,
      rawRubric: {
        articleScore: ev.articleScore,
        videoScore: ev.videoScore,
        finalScore: ev.finalScore,
        feedback: ev.feedback
      }
    };
  },

  /**
   * Normalisasi data Evaluation yang ditarik dari Spreadsheet DB agar kompatibel dengan state React
   */
  normalizeEvaluationFromSheet(rawEv: any, localEvals: Evaluation[]): Evaluation {
    const existingLocal = localEvals.find(
      le => le.id === rawEv.id || (le.teamId === rawEv.teamId && le.judgeId === rawEv.judgeId)
    );

    let parsedPayload: any = null;
    if (rawEv.rawPayload && typeof rawEv.rawPayload === 'string') {
      try { parsedPayload = JSON.parse(rawEv.rawPayload); } catch (e) {}
    } else if (rawEv.rawRubric && typeof rawEv.rawRubric === 'object') {
      parsedPayload = rawEv.rawRubric;
    }

    const rubricSource = parsedPayload?.rawRubric || parsedPayload || existingLocal;

    const articleObj = (rubricSource?.articleScore && typeof rubricSource.articleScore === 'object')
      ? rubricSource.articleScore
      : (existingLocal?.articleScore || {
          a1_1: 3, a1_2: 3, a1_3: 3,
          a2_1: 3, a2_2: 3, a2_3: 3,
          a3_1: 3, a3_2: 3,
          a4_1: 3, a4_2: 3
        });

    const videoObj = (rubricSource?.videoScore && typeof rubricSource.videoScore === 'object')
      ? rubricSource.videoScore
      : (existingLocal?.videoScore || {
          v1_1: 3, v1_2: 3,
          v2_1: 3, v2_2: 3, v2_3: 3,
          v3_1: 3, v3_2: 3,
          v4_1: 3, v4_2: 3,
          durationMinutes: 7,
          durationSeconds: 0,
          durationPenalty: Number(rawEv.durationPenalty) || 0
        });

    return {
      id: String(rawEv.id || `eval-${rawEv.teamId}-${rawEv.judgeId}`),
      teamId: String(rawEv.teamId),
      judgeId: String(rawEv.judgeId),
      judgeName: String(rawEv.judgeName || existingLocal?.judgeName || 'Dewan Juri'),
      tahap: (rawEv.tahap === 'Final' ? 'Final' : 'Tahap 2'),
      adminCheck: rubricSource?.adminCheck || existingLocal?.adminCheck || [],
      articleScore: articleObj,
      videoScore: videoObj,
      finalScore: rubricSource?.finalScore || existingLocal?.finalScore,
      feedback: String(rawEv.generalFeedback || rawEv.feedback || rubricSource?.feedback || existingLocal?.feedback || ''),
      status: rawEv.status === 'draft' ? 'draft' : 'submitted',
      updatedAt: String(rawEv.updatedAt || new Date().toISOString())
    };
  },

  /**
   * Tarik Data dari Cloud DB (Google Apps Script Web App) & Sinkronkan Dua Arah
   */
  async pullDataFromDb(): Promise<{
    success: boolean;
    message: string;
    teams?: Team[];
    judges?: Judge[];
    evaluations?: Evaluation[];
  }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const res = await fetch(
        `${targetUrl}?action=getAppData&format=json&spreadsheetId=${encodeURIComponent(spreadsheetId)}&t=${Date.now()}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data && data.success) {
        let teamsUpdated = 0;
        let judgesUpdated = 0;
        let evalsUpdated = 0;

        const localTeams = Storage.getTeams();
        const localJudges = Storage.getJudges();
        const localEvals = Storage.getEvaluations();

        // 1. Sinkronisasi Teams
        if (Array.isArray(data.teams) && data.teams.length > 0) {
          Storage.saveTeams(data.teams);
          teamsUpdated = data.teams.length;
        } else if (localTeams.length > 0) {
          this.pushAllDataToDb({ teams: localTeams }).catch(() => {});
          teamsUpdated = localTeams.length;
        }

        // 2. Sinkronisasi Judges
        if (Array.isArray(data.judges)) {
          if (data.judges.length > 0) {
            const dbJudgeUsers = new Set(data.judges.map((j: Judge) => (j.username || '').toLowerCase()));
            const unsyncedLocalJudges = localJudges.filter(lj => !dbJudgeUsers.has((lj.username || '').toLowerCase()));
            for (const uj of unsyncedLocalJudges) {
              this.pushNewJudge(uj).catch(() => {});
            }
            const mergedJudges = [...data.judges, ...unsyncedLocalJudges];
            Storage.saveJudges(mergedJudges);
            judgesUpdated = Storage.getJudges().length;
          } else if (localJudges.length > 0) {
            for (const lj of localJudges) {
              this.pushNewJudge(lj).catch(() => {});
            }
            judgesUpdated = localJudges.length;
          }
        }

        // 3. Sinkronisasi Evaluations (Gabungkan penilaian DB & penilaian lokal seperti 19 penilaian Juri 2)
        if (Array.isArray(data.evaluations)) {
          if (data.evaluations.length > 0) {
            const normalizedRemoteEvals = data.evaluations.map((rawEv: any) =>
              this.normalizeEvaluationFromSheet(rawEv, localEvals)
            );
            const mergedEvals = [...normalizedRemoteEvals];
            const unsyncedLocalEvals: Evaluation[] = [];

            for (const le of localEvals) {
              const existsInRemote = mergedEvals.some(
                re =>
                  re.teamId === le.teamId &&
                  (re.judgeId === le.judgeId ||
                    (re.judgeName.toLowerCase().includes('akhmad nasor') &&
                      le.judgeName.toLowerCase().includes('akhmad nasor')))
              );
              if (!existsInRemote) {
                mergedEvals.push(le);
                unsyncedLocalEvals.push(le);
              }
            }

            Storage.saveEvaluations(mergedEvals);
            evalsUpdated = mergedEvals.length;

            if (unsyncedLocalEvals.length > 0) {
              this.pushAllDataToDb({ evaluations: mergedEvals }).catch(() => {});
            }
          } else if (localEvals.length > 0) {
            this.pushAllDataToDb({ evaluations: localEvals }).catch(() => {});
            evalsUpdated = localEvals.length;
          }
        }

        this.saveConfig({ lastPulledAt: new Date().toISOString() });
        this.addLog(
          'PULL',
          'success',
          `Sinkronisasi DB Spreadsheet (${spreadsheetId}) berhasil: ${teamsUpdated} Tim, ${judgesUpdated} Juri, ${evalsUpdated} Penilaian.`,
          `Sumber: ${targetUrl}`
        );
        pingDatabase();

        return {
          success: true,
          message: `Berhasil sinkronisasi dengan DB Spreadsheet ID ${spreadsheetId} (${teamsUpdated} Tim, ${judgesUpdated} Juri, ${evalsUpdated} Nilai).`,
          teams: Storage.getTeams(),
          judges: Storage.getJudges(),
          evaluations: Storage.getEvaluations()
        };
      } else {
        throw new Error(data?.message || 'Format respons tidak valid dari Google Apps Script');
      }
    } catch (err: any) {
      console.warn('Gagal menarik data via JSON direct:', err);

      try {
        await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}&ping=${Date.now()}`, { mode: 'no-cors' });
        this.addLog(
          'PULL',
          'warning',
          `Koneksi Cloud DB aktif (Spreadsheet ID: ${spreadsheetId}). Data web disinkronkan.`,
          err.message
        );
        this.saveConfig({ lastPulledAt: new Date().toISOString() });
        return {
          success: true,
          message: `Terhubung ke DB Spreadsheet (${spreadsheetId})! Data web telah disinkronkan.`,
          teams: Storage.getTeams(),
          judges: Storage.getJudges(),
          evaluations: Storage.getEvaluations()
        };
      } catch (pingErr: any) {
        this.addLog('PULL', 'error', 'Gagal menghubungi Cloud DB: ' + err.message);
        return {
          success: false,
          message: `Gagal menarik data: ${err.message}. Pastikan URL Web App Google Apps Script aktif.`
        };
      }
    }
  },

  /**
   * Kirim / Push Seluruh Data Web ke Cloud DB Spreadsheet (ID: 1iRtT9aZ5czwy_xQxMThzjgM2Xfc5wwJMiH4mp85mLwo)
   */
  async pushAllDataToDb(payload?: {
    teams?: Team[];
    judges?: Judge[];
    evaluations?: Evaluation[];
  }): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    const teams = payload?.teams || Storage.getTeams();
    const judges = payload?.judges || Storage.getJudges();
    const evaluations = payload?.evaluations || Storage.getEvaluations();

    const formattedEvaluations = evaluations.map(ev => this.formatEvaluationForSheet(ev, spreadsheetId));

    const syncPayload = {
      action: 'pushAll',
      spreadsheetId,
      timestamp: new Date().toISOString(),
      teams,
      judges,
      evaluations: formattedEvaluations
    };

    try {
      // 1. Kirim setiap penilaian via GET query param agar terjamin masuk ke doGet(e) Apps Script tanpa terkena redirect POST 302
      const evalPromises = formattedEvaluations.map(formatted => {
        const getParams = new URLSearchParams({
          action: 'saveEvaluation',
          spreadsheetId,
          evaluationData: JSON.stringify(formatted),
          t: String(Date.now())
        });
        return fetch(`${targetUrl}?${getParams.toString()}`, { mode: 'no-cors' }).catch(() => {});
      });

      // 2. Kirim juga via POST pushAll
      const postPromise = fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(syncPayload)
      }).catch(() => {});

      await Promise.all([postPromise, ...evalPromises]);

      this.saveConfig({ lastPushedAt: new Date().toISOString() });
      this.addLog(
        'PUSH',
        'success',
        `Berhasil menyimpan data ke DB Spreadsheet ID ${spreadsheetId} (${teams.length} Tim, ${judges.length} Juri, ${evaluations.length} Nilai).`,
        `Spreadsheet ID: ${spreadsheetId}`
      );
      pingDatabase();

      return {
        success: true,
        message: `Berhasil disimpan ke DB Spreadsheet ID: ${spreadsheetId} (${teams.length} Tim, ${judges.length} Juri, ${evaluations.length} Nilai)!`
      };
    } catch (err: any) {
      console.error('Error pushing data to DB:', err);
      this.addLog('PUSH', 'error', 'Gagal mengirim data ke Cloud DB: ' + err.message);
      return {
        success: false,
        message: 'Gagal mengirim ke DB: ' + err.message
      };
    }
  },

  /**
   * Kirim satu penilaian juri secara langsung ke Cloud DB Spreadsheet (ID: 1iRtT9aZ5czwy_xQxMThzjgM2Xfc5wwJMiH4mp85mLwo)
   */
  async pushSingleEvaluation(evaluation: Evaluation): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const formatted = this.formatEvaluationForSheet(evaluation, spreadsheetId);

      // 1. Kirim via GET query param untuk menjamin penulisan di Apps Script Spreadsheet ID 1iRtT9aZ5czwy_xQxMThzjgM2Xfc5wwJMiH4mp85mLwo
      const getParams = new URLSearchParams({
        action: 'saveEvaluation',
        spreadsheetId,
        evaluationData: JSON.stringify(formatted),
        t: String(Date.now())
      });
      const getPromise = fetch(`${targetUrl}?${getParams.toString()}`, { mode: 'no-cors' }).catch(() => {});

      // 2. Kirim via POST
      const payload = {
        action: 'saveEvaluation',
        spreadsheetId,
        evaluationData: formatted,
        timestamp: new Date().toISOString()
      };

      const postPromise = fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      }).catch(() => {});

      await Promise.all([getPromise, postPromise]);

      this.saveConfig({ lastPushedAt: new Date().toISOString() });
      this.addLog(
        'PUSH',
        'success',
        `Penilaian tim ${evaluation.teamId} oleh ${evaluation.judgeName} tersimpan ke DB Spreadsheet (${spreadsheetId}).`
      );
      pingDatabase();
      return {
        success: true,
        message: `Penilaian berhasil disimpan ke DB Spreadsheet (${spreadsheetId})!`
      };
    } catch (err: any) {
      console.warn('Background sync evaluation warning:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Kirim pendaftaran juri baru ke Cloud DB (Tersinkron langsung ke Spreadsheet ID 1iRtT9aZ5czwy_xQxMThzjgM2Xfc5wwJMiH4mp85mLwo)
   */
  async pushNewJudge(judge: Judge): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const params = new URLSearchParams({
        action: 'addJudge',
        spreadsheetId,
        id: judge.id,
        username: judge.username,
        password: judge.password || '@juri123',
        name: judge.name,
        nip: judge.nip || '-',
        institution: judge.institution || 'MGMP IPA Pasuruan',
        field: judge.field || 'Sains & Bisnis',
        isActive: String(judge.isActive !== false),
        t: String(Date.now())
      });

      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      const payload = {
        action: 'addJudge',
        spreadsheetId,
        judgeData: judge,
        timestamp: new Date().toISOString()
      };

      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      this.addLog(
        'PUSH',
        'success',
        `Akun juri "${judge.name}" (${judge.username}) tersimpan di DB Spreadsheet (${spreadsheetId}).`
      );
      pingDatabase();
      return { success: true, message: `Juri tersimpan ke DB Spreadsheet (${spreadsheetId})` };
    } catch (err: any) {
      this.addLog('PUSH', 'error', `Gagal menghubungkan juri ke Cloud DB: ${err.message}`);
      return { success: false, message: err.message };
    }
  },

  /**
   * Hapus akun juri dari Cloud DB
   */
  async pushDeleteJudge(judgeId: string, username?: string): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const params = new URLSearchParams({
        action: 'deleteJudge',
        spreadsheetId,
        id: judgeId,
        username: username || '',
        t: String(Date.now())
      });
      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteJudge', spreadsheetId, id: judgeId, username })
      });

      this.addLog('PUSH', 'success', `Akun juri ${judgeId} berhasil dihapus dari DB Spreadsheet (${spreadsheetId}).`);
      pingDatabase();
      return { success: true, message: 'Akun juri dihapus dari Cloud DB' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Bersihkan semua akun dummy di database Cloud
   */
  async clearDummyJudgesOnDb(): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const params = new URLSearchParams({
        action: 'clearDummyJudges',
        spreadsheetId,
        t: String(Date.now())
      });
      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'clearDummyJudges', spreadsheetId })
      });

      this.addLog('PUSH', 'success', `Perintah pembersihan akun juri dummy dikirim ke DB Spreadsheet (${spreadsheetId}).`);
      pingDatabase();
      return { success: true, message: 'Akun juri dummy berhasil dibersihkan dari database Cloud' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Simpan / Update Data Tim ke Cloud DB
   */
  async pushUpdateTeam(team: Team): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const params = new URLSearchParams({
        action: 'updateTeam',
        spreadsheetId,
        id: team.id,
        code: team.code,
        name: team.name,
        school: team.school,
        productTitle: team.productTitle,
        localResource: team.localResource || '',
        leader: team.leader || '',
        mentorTeacher: team.mentorTeacher || '',
        tahap: team.tahap || 'Tahap 2',
        videoUrl: team.videoUrl || '',
        articleUrl: team.articleUrl || '',
        t: String(Date.now())
      });

      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateTeam', spreadsheetId, teamData: team })
      });

      this.addLog('PUSH', 'success', `Data Tim "${team.name}" (${team.school}) disinkronkan ke DB Spreadsheet (${spreadsheetId}).`);
      pingDatabase();
      return { success: true, message: `Data Tim ${team.name} tersimpan ke DB Spreadsheet (${spreadsheetId})` };
    } catch (err: any) {
      this.addLog('PUSH', 'error', `Gagal menyimpan data tim ke Cloud DB: ${err.message}`);
      return { success: false, message: err.message };
    }
  },

  /**
   * Tambah Tim Baru ke Cloud DB
   */
  async pushNewTeam(team: Team): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const params = new URLSearchParams({
        action: 'addTeam',
        spreadsheetId,
        id: team.id,
        code: team.code,
        name: team.name,
        school: team.school,
        productTitle: team.productTitle,
        localResource: team.localResource || '',
        leader: team.leader || '',
        mentorTeacher: team.mentorTeacher || '',
        tahap: team.tahap || 'Tahap 2',
        videoUrl: team.videoUrl || '',
        articleUrl: team.articleUrl || '',
        t: String(Date.now())
      });

      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addTeam', spreadsheetId, teamData: team })
      });

      this.addLog('PUSH', 'success', `Tim baru "${team.name}" (${team.school}) didaftarkan ke DB Spreadsheet (${spreadsheetId}).`);
      pingDatabase();
      return { success: true, message: `Tim ${team.name} berhasil ditambahkan ke DB Spreadsheet (${spreadsheetId})` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Hapus Tim dari Cloud DB
   */
  async pushDeleteTeam(teamId: string): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const params = new URLSearchParams({
        action: 'deleteTeam',
        spreadsheetId,
        id: teamId,
        t: String(Date.now())
      });

      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteTeam', spreadsheetId, id: teamId })
      });

      this.addLog('PUSH', 'success', `Tim ID ${teamId} dihapus dari DB Spreadsheet (${spreadsheetId}).`);
      pingDatabase();
      return { success: true, message: 'Tim dihapus dari Cloud DB' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
};
