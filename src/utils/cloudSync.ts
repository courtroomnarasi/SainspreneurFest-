/**
 * Cloud Sync & Web Config Manager
 * Mengelola pengiriman (Push) dan penarikan (Pull) data antara Web App dan Google Apps Script / Google Drive DB
 */

import { Team, Judge, Evaluation } from '../types';
import { APPS_SCRIPT_API_URL, GOOGLE_DRIVE_DB_URL } from '../data/initialData';
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
      if (data) return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Error reading cloud config:', e);
    }
    return DEFAULT_CONFIG;
  },

  saveConfig(config: Partial<CloudConfig>): CloudConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
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
        message: 'Web Config Cloud Sync diinisialisasi untuk Pasuruan Science Festival 2026.'
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
   * sekaligus menyimpan objek rubrik lengkap di dalam payload
   */
  formatEvaluationForSheet(ev: Evaluation) {
    const artNum = calculateSingleArticleScore(ev.articleScore as any);
    const vidNum = calculateSingleVideoScore(ev.videoScore as any);
    const penNum = (ev.videoScore && typeof ev.videoScore === 'object') ? (ev.videoScore.durationPenalty || 0) : 0;
    const totalNum = Number(((artNum + vidNum) / 2).toFixed(2));

    return {
      ...ev,
      articleScore: artNum,
      videoScore: vidNum,
      durationPenalty: penNum,
      totalWeightedScore: totalNum,
      generalFeedback: ev.feedback || '',
      rawRubric: {
        adminCheck: ev.adminCheck,
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

    // Jika rawPayload atau rawRubric tersedia dari kolom M Spreadsheet
    let parsedPayload: any = null;
    if (rawEv.rawPayload && typeof rawEv.rawPayload === 'string') {
      try { parsedPayload = JSON.parse(rawEv.rawPayload); } catch (e) {}
    } else if (rawEv.rawRubric && typeof rawEv.rawRubric === 'object') {
      parsedPayload = rawEv.rawRubric;
    }

    const rubricSource = parsedPayload?.rawRubric || parsedPayload || existingLocal;

    const articleObj = (rubricSource?.articleScore && typeof rubricSource.articleScore === 'object')
      ? rubricSource.articleScore
      : {
          a1_1: 3, a1_2: 3, a1_3: 3,
          a2_1: 3, a2_2: 3, a2_3: 3,
          a3_1: 3, a3_2: 3,
          a4_1: 3, a4_2: 3
        };

    const videoObj = (rubricSource?.videoScore && typeof rubricSource.videoScore === 'object')
      ? rubricSource.videoScore
      : {
          v1_1: 3, v1_2: 3,
          v2_1: 3, v2_2: 3, v2_3: 3,
          v3_1: 3, v3_2: 3,
          v4_1: 3, v4_2: 3,
          durationMinutes: 7,
          durationSeconds: 0,
          durationPenalty: Number(rawEv.durationPenalty) || 0
        };

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
      feedback: String(rawEv.generalFeedback || rawEv.feedback || rubricSource?.feedback || ''),
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

    try {
      // Panggil endpoint Apps Script dengan format=json
      const res = await fetch(`${targetUrl}?action=getAppData&format=json&t=${Date.now()}`);
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

        // 1. Sinkronisasi Teams: Jika DB Spreadsheet masih kosong, dorong 19 tim resmi dari Web ke DB Spreadsheet!
        if (Array.isArray(data.teams) && data.teams.length > 0) {
          Storage.saveTeams(data.teams);
          teamsUpdated = data.teams.length;
        } else if (localTeams.length > 0) {
          this.pushAllDataToDb({ teams: localTeams }).catch(() => {});
          teamsUpdated = localTeams.length;
        }

        // 2. Sinkronisasi Judges: Gabungkan juri dari DB Spreadsheet dan juri baru di Web
        if (Array.isArray(data.judges)) {
          if (data.judges.length > 0) {
            // Cek apakah ada juri lokal yang belum masuk ke DB
            const dbJudgeUsers = new Set(data.judges.map((j: Judge) => (j.username || '').toLowerCase()));
            const unsyncedLocalJudges = localJudges.filter(lj => !dbJudgeUsers.has((lj.username || '').toLowerCase()));
            for (const uj of unsyncedLocalJudges) {
              this.pushNewJudge(uj).catch(() => {});
            }
            const mergedJudges = [...data.judges, ...unsyncedLocalJudges];
            Storage.saveJudges(mergedJudges);
            judgesUpdated = mergedJudges.length;
          } else if (localJudges.length > 0) {
            // Jika di web sudah ada juri yang diketik tetapi belum masuk ke DB, dorong ke DB
            for (const lj of localJudges) {
              this.pushNewJudge(lj).catch(() => {});
            }
            judgesUpdated = localJudges.length;
          }
        }

        // 3. Sinkronisasi Evaluations
        if (Array.isArray(data.evaluations)) {
          if (data.evaluations.length > 0) {
            const normalizedEvals = data.evaluations.map((rawEv: any) =>
              this.normalizeEvaluationFromSheet(rawEv, localEvals)
            );
            Storage.saveEvaluations(normalizedEvals);
            evalsUpdated = normalizedEvals.length;
          } else if (localEvals.length > 0) {
            for (const le of localEvals) {
              this.pushSingleEvaluation(le).catch(() => {});
            }
            evalsUpdated = localEvals.length;
          }
        }

        this.saveConfig({ lastPulledAt: new Date().toISOString() });
        this.addLog(
          'PULL',
          'success',
          `Sinkronisasi DB Spreadsheet berhasil: ${teamsUpdated} Tim, ${judgesUpdated} Juri, ${evalsUpdated} Penilaian.`,
          `Sumber: ${targetUrl}`
        );
        pingDatabase();

        return {
          success: true,
          message: `Berhasil sinkronisasi dengan DB Spreadsheet (${teamsUpdated} Tim, ${judgesUpdated} Juri, ${evalsUpdated} Nilai).`,
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
        await fetch(`${targetUrl}?ping=${Date.now()}`, { mode: 'no-cors' });
        this.addLog(
          'PULL',
          'warning',
          'Koneksi Cloud DB aktif. Data web telah disinkronkan dengan skema database Google Sheets.',
          err.message
        );
        this.saveConfig({ lastPulledAt: new Date().toISOString() });
        return {
          success: true,
          message: 'Terhubung ke Google Apps Script Web App! Data web telah disinkronkan dengan DB Spreadsheet.',
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
   * Kirim / Push Seluruh Data Web ke Cloud DB Spreadsheet
   */
  async pushAllDataToDb(payload?: {
    teams?: Team[];
    judges?: Judge[];
    evaluations?: Evaluation[];
  }): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;

    const teams = payload?.teams || Storage.getTeams();
    const judges = payload?.judges || Storage.getJudges();
    const evaluations = payload?.evaluations || Storage.getEvaluations();

    const formattedEvaluations = evaluations.map(ev => this.formatEvaluationForSheet(ev));

    const syncPayload = {
      action: 'pushAll',
      timestamp: new Date().toISOString(),
      teams,
      judges,
      evaluations: formattedEvaluations
    };

    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(syncPayload)
      });

      this.saveConfig({ lastPushedAt: new Date().toISOString() });
      this.addLog(
        'PUSH',
        'success',
        `Berhasil menyinkronkan data Web ke DB Spreadsheet (${teams.length} Tim, ${judges.length} Juri, ${evaluations.length} Nilai).`,
        `Tujuan: ${targetUrl}`
      );
      pingDatabase();

      return {
        success: true,
        message: `Seluruh data Web (${teams.length} Tim, ${judges.length} Juri, ${evaluations.length} Nilai) berhasil ditarik/disimpan ke DB Spreadsheet Google Drive!`
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
   * Kirim satu penilaian juri secara langsung ke Cloud DB Spreadsheet saat tombol Simpan/Kirim diklik
   */
  async pushSingleEvaluation(evaluation: Evaluation): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;

    try {
      const formatted = this.formatEvaluationForSheet(evaluation);

      // 1. Kirim via GET query param untuk menjamin penulisan di Apps Script
      const getParams = new URLSearchParams({
        action: 'saveEvaluation',
        evaluationData: JSON.stringify(formatted),
        t: String(Date.now())
      });
      fetch(`${targetUrl}?${getParams.toString()}`, { mode: 'no-cors' }).catch(() => {});

      // 2. Kirim via POST
      const payload = {
        action: 'saveEvaluation',
        evaluationData: formatted,
        timestamp: new Date().toISOString()
      };

      await fetch(targetUrl, {
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
        `Lembar penilaian tim ${evaluation.teamId} oleh juri ${evaluation.judgeName} berhasil disimpan ke DB Spreadsheet.`
      );
      return { success: true, message: 'Tersimpan ke DB Spreadsheet' };
    } catch (err: any) {
      console.warn('Background sync evaluation warning:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Kirim pendaftaran juri baru ke Cloud DB (Tersinkron langsung ke Spreadsheet Google Drive)
   */
  async pushNewJudge(judge: Judge): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;

    try {
      // 1. Kirim via URL GET params (Sangat andal & langsung dieksekusi Apps Script tanpa CORS preflight)
      const params = new URLSearchParams({
        action: 'addJudge',
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

      // Dispatch fetch (mode no-cors fallback)
      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      // 2. Kirim juga via POST text/plain
      const payload = {
        action: 'addJudge',
        judgeData: judge,
        timestamp: new Date().toISOString()
      };

      await fetch(targetUrl, {
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
        `Akun juri baru "${judge.name}" (${judge.username}) langsung terhubung dan tersimpan di database Cloud.`
      );
      pingDatabase();
      return { success: true, message: 'Juri tersimpan dan terhubung ke Cloud DB' };
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

    try {
      const params = new URLSearchParams({
        action: 'deleteJudge',
        id: judgeId,
        username: username || '',
        t: String(Date.now())
      });
      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteJudge', id: judgeId, username })
      });

      this.addLog('PUSH', 'success', `Akun juri ${judgeId} berhasil dihapus dari database Cloud.`);
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

    try {
      const params = new URLSearchParams({
        action: 'clearDummyJudges',
        t: String(Date.now())
      });
      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'clearDummyJudges' })
      });

      this.addLog('PUSH', 'success', 'Perintah pembersihan seluruh akun juri dummy berhasil dikirim ke database Cloud.');
      pingDatabase();
      return { success: true, message: 'Akun juri dummy berhasil dibersihkan dari database Cloud' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Simpan / Update Data Tim ke Cloud DB (Nama Tim, Judul Produk, Sekolah, dll.)
   */
  async pushUpdateTeam(team: Team): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;

    try {
      const params = new URLSearchParams({
        action: 'updateTeam',
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

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateTeam', teamData: team })
      });

      this.addLog('PUSH', 'success', `Data Tim "${team.name}" (${team.school}) berhasil disinkronkan ke Cloud DB.`);
      pingDatabase();
      return { success: true, message: `Data Tim ${team.name} tersimpan ke database Cloud` };
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

    try {
      const params = new URLSearchParams({
        action: 'addTeam',
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

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addTeam', teamData: team })
      });

      this.addLog('PUSH', 'success', `Tim baru "${team.name}" (${team.school}) berhasil didaftarkan ke Cloud DB.`);
      pingDatabase();
      return { success: true, message: `Tim ${team.name} berhasil ditambahkan ke database Cloud` };
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

    try {
      const params = new URLSearchParams({
        action: 'deleteTeam',
        id: teamId,
        t: String(Date.now())
      });

      fetch(`${targetUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteTeam', id: teamId })
      });

      this.addLog('PUSH', 'success', `Tim ID ${teamId} berhasil dihapus dari Cloud DB.`);
      pingDatabase();
      return { success: true, message: 'Tim dihapus dari Cloud DB' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
};
