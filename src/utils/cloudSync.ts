/**
 * Database Spreadsheet Sync & Web Config Manager
 * Mengelola pengiriman (Simpan DB) dan penarikan (Tarik DB) langsung ke Google Spreadsheet Database
 * (Tanpa penyimpanan Cloud perantara - langsung ke Google Spreadsheet)
 */

import { Team, Judge, Evaluation, ArticleScore, VideoScore } from '../types';
import {
  APPS_SCRIPT_API_URL,
  GOOGLE_SPREADSHEET_ID,
  ACTIVE_DRIVE_SPREADSHEET_ID,
  INITIAL_TEAMS
} from '../data/initialData';
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
  CONFIG: 'psf26_web_config_v4',
  LOGS: 'psf26_sync_logs_v4'
};

const DEFAULT_CONFIG: CloudConfig = {
  endpointUrl: APPS_SCRIPT_API_URL,
  driveFolderId: '1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb',
  spreadsheetId: GOOGLE_SPREADSHEET_ID,
  spreadsheetName: 'DB_Sainspreneur_Pasuruan_Festival_2026',
  autoSyncEnabled: true,
  autoSyncIntervalSec: 30,
  lastPulledAt: null,
  lastPushedAt: null
};

/**
 * Helper untuk membuat skor rubrik proporsional jika hanya nilai angka (0-100) yang diedit langsung di sel Spreadsheet
 */
function buildArticleRubricFromNumericScore(targetScore: number, fallback?: ArticleScore): ArticleScore {
  if (fallback && Math.abs(calculateSingleArticleScore(fallback) - targetScore) < 0.2) {
    return fallback;
  }
  const clamped = Math.max(25, Math.min(100, Number(targetScore) || 75));
  const avgLevel = Math.max(1, Math.min(4, Math.round(clamped / 25)));
  return {
    a1_1: avgLevel,
    a1_2: avgLevel,
    a1_3: avgLevel,
    a2_1: avgLevel,
    a2_2: avgLevel,
    a2_3: avgLevel,
    a3_1: avgLevel,
    a3_2: avgLevel,
    a4_1: avgLevel,
    a4_2: avgLevel
  };
}

function buildVideoRubricFromNumericScore(
  targetScore: number,
  penalty: number = 0,
  fallback?: VideoScore
): VideoScore {
  if (fallback && Math.abs(calculateSingleVideoScore(fallback) - targetScore) < 0.2) {
    return fallback;
  }
  const clamped = Math.max(25, Math.min(100, Number(targetScore) || 75));
  const avgLevel = Math.max(1, Math.min(4, Math.round(clamped / 25)));
  return {
    v1_1: avgLevel,
    v1_2: avgLevel,
    v2_1: avgLevel,
    v2_2: avgLevel,
    v2_3: avgLevel,
    v3_1: avgLevel,
    v3_2: avgLevel,
    v4_1: avgLevel,
    v4_2: avgLevel,
    durationMinutes: 7,
    durationSeconds: 0,
    durationPenalty: Number(penalty) || 0
  };
}

export const CloudSync = {
  getConfig(): CloudConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          endpointUrl: parsed.endpointUrl || APPS_SCRIPT_API_URL,
          spreadsheetId: parsed.spreadsheetId || GOOGLE_SPREADSHEET_ID
        };
      }
    } catch (e) {
      console.warn('Error reading DB config:', e);
    }
    return DEFAULT_CONFIG;
  },

  saveConfig(config: Partial<CloudConfig>): CloudConfig {
    const current = this.getConfig();
    const updated = {
      ...current,
      ...config,
      endpointUrl: config.endpointUrl || current.endpointUrl || APPS_SCRIPT_API_URL,
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
        message: `Web Config terhubung langsung ke DB Spreadsheet ID: ${GOOGLE_SPREADSHEET_ID}.`
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
   * Format objek Evaluation untuk ditulis ke kolom Spreadsheet (NilaiArtikel, NilaiVideo, TotalSkor, Catatan, RawPayload)
   */
  formatEvaluationForSheet(ev: Evaluation, spreadsheetId?: string) {
    const targetSheetId = spreadsheetId || this.getConfig().spreadsheetId || GOOGLE_SPREADSHEET_ID;
    const artNum = calculateSingleArticleScore(ev.articleScore as any);
    const vidNum = calculateSingleVideoScore(ev.videoScore as any);
    const penNum =
      ev.videoScore && typeof ev.videoScore === 'object' ? ev.videoScore.durationPenalty || 0 : 0;
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
      updatedAt: new Date().toISOString(),
      spreadsheetId: targetSheetId,
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
   * Normalisasi baris Evaluation dari Spreadsheet DB (mendukung pembacaan langsung kolom RawPayload ke-13)
   */
  normalizeEvaluationFromSheet(rawEv: any, localEvals: Evaluation[]): Evaluation {
    const existingLocal = localEvals.find(
      le => le.id === rawEv.id || (le.teamId === rawEv.teamId && le.judgeId === rawEv.judgeId)
    );

    let parsedPayload: any = null;
    if (rawEv.rawPayload && typeof rawEv.rawPayload === 'string') {
      try {
        parsedPayload = JSON.parse(rawEv.rawPayload);
      } catch (e) {}
    } else if (rawEv.rawRubric && typeof rawEv.rawRubric === 'object') {
      parsedPayload = rawEv;
    }

    const rubricSource = parsedPayload?.rawRubric || parsedPayload;

    const numericArt = Number(rawEv.articleScore) || 0;
    const numericVid = Number(rawEv.videoScore) || 0;
    const numericPen = Number(rawEv.durationPenalty) || 0;

    let articleObj: ArticleScore;
    if (rubricSource?.articleScore && typeof rubricSource.articleScore === 'object') {
      articleObj = rubricSource.articleScore;
      // Jika nilai di sel Spreadsheet diubah manual sehingga berbeda dari rawRubric, sesuaikan dengan sel DB
      if (numericArt > 0 && Math.abs(calculateSingleArticleScore(articleObj) - numericArt) > 0.5) {
        articleObj = buildArticleRubricFromNumericScore(numericArt, articleObj);
      }
    } else {
      articleObj = buildArticleRubricFromNumericScore(numericArt, existingLocal?.articleScore);
    }

    let videoObj: VideoScore;
    if (rubricSource?.videoScore && typeof rubricSource.videoScore === 'object') {
      videoObj = rubricSource.videoScore;
      if (numericVid > 0 && Math.abs(calculateSingleVideoScore(videoObj) - numericVid) > 0.5) {
        videoObj = buildVideoRubricFromNumericScore(numericVid, numericPen, videoObj);
      }
    } else {
      videoObj = buildVideoRubricFromNumericScore(numericVid, numericPen, existingLocal?.videoScore);
    }

    return {
      id: String(rawEv.id || `eval-${rawEv.teamId}-${rawEv.judgeId}`),
      teamId: String(rawEv.teamId),
      judgeId: String(rawEv.judgeId),
      judgeName: String(rawEv.judgeName || existingLocal?.judgeName || 'Dewan Juri'),
      tahap: rawEv.tahap === 'Final' ? 'Final' : 'Tahap 2',
      adminCheck: rubricSource?.adminCheck || existingLocal?.adminCheck || [],
      articleScore: articleObj,
      videoScore: videoObj,
      finalScore: rubricSource?.finalScore || existingLocal?.finalScore,
      feedback: String(
        rawEv.generalFeedback || rawEv.feedback || rubricSource?.feedback || existingLocal?.feedback || ''
      ),
      status: rawEv.status === 'draft' ? 'draft' : 'submitted',
      updatedAt: String(rawEv.updatedAt || new Date().toISOString())
    };
  },

  /**
   * Membaca data langsung dari Google Spreadsheet (via endpoint resmi gviz/tq JSON)
   * termasuk Kolom M (RawPayload) secara real-time tanpa cache
   */
  async readSheetTabDirect(spreadsheetId: string, sheetName: string): Promise<any[][]> {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
      sheetName
    )}&t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) return [];
    const json = JSON.parse(text.substring(startIdx, endIdx + 1));
    if (!json?.table?.rows) return [];

    return json.table.rows.map((r: any) =>
      (r.c || []).map((cell: any) => (cell && cell.v !== null && cell.v !== undefined ? cell.v : ''))
    );
  },

  /**
   * Membaca seluruh data (Teams, Judges, Evaluations) langsung dari Google Spreadsheet
   */
  async readFullSpreadsheetDirect(spreadsheetId: string): Promise<{
    teams: Team[];
    judges: Judge[];
    evaluations: any[];
  }> {
    const [teamRows, judgeRows, evalRows] = await Promise.all([
      this.readSheetTabDirect(spreadsheetId, 'Teams').catch(() => []),
      this.readSheetTabDirect(spreadsheetId, 'Judges').catch(() => []),
      this.readSheetTabDirect(spreadsheetId, 'Evaluations').catch(() => [])
    ]);

    const teams: Team[] = [];
    for (const r of teamRows) {
      const id = String(r[0] || '');
      if (!id || id === 'ID') continue;
      const official = INITIAL_TEAMS.find(it => it.id === id || it.code === String(r[1] || ''));
      teams.push({
        ...(official || {}),
        id,
        code: String(r[1] || official?.code || ''),
        name: String(r[2] || official?.name || ''),
        school: String(r[3] || official?.school || ''),
        productTitle: String(r[4] || official?.productTitle || ''),
        localResource: String(r[5] || official?.localResource || ''),
        leader: String(r[6] || official?.leader || ''),
        members: [String(r[6] || ''), String(r[7] || ''), String(r[8] || '')].filter(Boolean),
        mentorTeacher: String(r[9] || official?.mentorTeacher || ''),
        tahap: String(r[10] || 'Tahap 2') as 'Tahap 2' | 'Final',
        videoUrl: String(r[11] || official?.videoUrl || ''),
        articleUrl: String(r[12] || official?.articleUrl || ''),
        registeredAt: official?.registeredAt || '2026-10-20'
      });
    }

    const judges: Judge[] = [];
    for (const jr of judgeRows) {
      const id = String(jr[0] || '');
      const username = String(jr[1] || '');
      if (!id || id === 'ID' || !username) continue;
      const uLower = username.toLowerCase();
      if (uLower === 'juri1' || uLower === 'juri2' || uLower === 'juri3' || uLower === 'juri-1') continue;
      judges.push({
        id,
        username,
        password: String(jr[2] || '@juri123'),
        name: String(jr[3] || ''),
        nip: String(jr[4] || '-'),
        institution: String(jr[5] || ''),
        field: String(jr[6] || ''),
        isActive: jr[7] === 'Aktif' || jr[7] === true
      });
    }

    const evaluations: any[] = [];
    for (const er of evalRows) {
      const id = String(er[0] || '');
      if (!id || id === 'EvalID') continue;
      evaluations.push({
        id,
        teamId: String(er[1] || ''),
        judgeId: String(er[2] || ''),
        judgeName: String(er[3] || ''),
        tahap: String(er[4] || 'Tahap 2'),
        articleScore: Number(er[5]) || 0,
        videoScore: Number(er[6]) || 0,
        durationPenalty: Number(er[7]) || 0,
        totalWeightedScore: Number(er[8]) || 0,
        generalFeedback: String(er[9] || ''),
        status: String(er[10] || 'submitted'),
        updatedAt: String(er[11] || ''),
        rawPayload: String(er[12] || '')
      });
    }

    return { teams, judges, evaluations };
  },

  /**
   * Tarik Data Langsung dari DB Spreadsheet & Google Apps Script
   */
  async pullDataFromDb(): Promise<{
    success: boolean;
    message: string;
    teams?: Team[];
    judges?: Judge[];
    evaluations?: Evaluation[];
    activeSpreadsheetId?: string;
  }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const configuredSheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      // 1. Cek langsung isi Google Spreadsheet yang dikonfigurasi (1iRtT9aZ5czwy_xQxMThzjgM2Xfc5wwJMiH4mp85mLwo)
      //    dan Spreadsheet aktif di Folder Drive (1LGmpTf-XL9zOBhrSjQXIG1QnshIVs0HgLJcKvxxuQT8)
      const [primaryDirect, folderDirect, gasRes] = await Promise.all([
        this.readFullSpreadsheetDirect(configuredSheetId).catch(() => null),
        configuredSheetId !== ACTIVE_DRIVE_SPREADSHEET_ID
          ? this.readFullSpreadsheetDirect(ACTIVE_DRIVE_SPREADSHEET_ID).catch(() => null)
          : Promise.resolve(null),
        fetch(
          `${targetUrl}?action=getAppData&format=json&spreadsheetId=${encodeURIComponent(
            configuredSheetId
          )}&t=${Date.now()}`,
          { cache: 'no-store' }
        )
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null)
      ]);

      // Pilih sumber data yang memiliki data aktual dari DB Spreadsheet
      const activeSheetData =
        primaryDirect && primaryDirect.evaluations.length > 0
          ? { source: primaryDirect, sheetId: configuredSheetId }
          : folderDirect && folderDirect.evaluations.length > 0
          ? { source: folderDirect, sheetId: ACTIVE_DRIVE_SPREADSHEET_ID }
          : gasRes && gasRes.success
          ? {
              source: {
                teams: gasRes.teams || [],
                judges: gasRes.judges || [],
                evaluations: gasRes.evaluations || []
              },
              sheetId: gasRes.spreadsheetId || ACTIVE_DRIVE_SPREADSHEET_ID
            }
          : primaryDirect
          ? { source: primaryDirect, sheetId: configuredSheetId }
          : null;

      if (!activeSheetData) {
        throw new Error('Tidak dapat membaca data dari DB Spreadsheet');
      }

      const { source, sheetId } = activeSheetData;
      const localEvals = Storage.getEvaluations();

      // Update Teams dari DB
      if (source.teams.length > 0) {
        Storage.saveTeams(source.teams);
      }

      // Update Judges dari DB
      if (source.judges.length > 0) {
        Storage.saveJudges(source.judges);
      }

      // Update Evaluations murni sesuai isi DB Spreadsheet
      if (source.evaluations.length > 0) {
        const normalizedEvals = source.evaluations.map((rawEv: any) =>
          this.normalizeEvaluationFromSheet(rawEv, localEvals)
        );
        Storage.saveEvaluationsFromDb(normalizedEvals);
      }

      this.saveConfig({ lastPulledAt: new Date().toISOString() });
      this.addLog(
        'PULL',
        'success',
        `Berhasil menarik data langsung dari DB Spreadsheet (${source.teams.length} Tim, ${source.judges.length} Juri, ${source.evaluations.length} Penilaian).`,
        `Spreadsheet ID: ${sheetId}`
      );
      pingDatabase();

      return {
        success: true,
        activeSpreadsheetId: sheetId,
        message: `Tersinkron langsung dengan DB Spreadsheet (${source.teams.length} Tim, ${source.judges.length} Juri, ${source.evaluations.length} Nilai)!`,
        teams: Storage.getTeams(),
        judges: Storage.getJudges(),
        evaluations: Storage.getEvaluations()
      };
    } catch (err: any) {
      this.addLog('PULL', 'error', 'Gagal menarik data dari DB Spreadsheet: ' + err.message);
      return {
        success: false,
        message: `Gagal menarik data dari DB Spreadsheet: ${err.message}`
      };
    }
  },

  /**
   * Kirim / Simpan Seluruh Data Web Langsung ke DB Spreadsheet (Eksekusi Sinkron via POST JSON)
   */
  async pushAllDataToDb(payload?: {
    teams?: Team[];
    judges?: Judge[];
    evaluations?: Evaluation[];
  }): Promise<{ success: boolean; message: string; timestamp?: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    const teams = payload?.teams || Storage.getTeams();
    const judges = payload?.judges || Storage.getJudges();
    const evaluations = payload?.evaluations || Storage.getEvaluations();

    const formattedEvaluations = evaluations.map(ev =>
      this.formatEvaluationForSheet(ev, spreadsheetId)
    );

    const syncPayload = {
      action: 'pushAll',
      spreadsheetId,
      timestamp: new Date().toISOString(),
      teams,
      judges,
      evaluations: formattedEvaluations
    };

    try {
      // Kirim via POST standar (tanpa no-cors) agar menunggu konfirmasi penulisan nyata dari SpreadsheetApp
      const res = await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(syncPayload)
      });

      let resData: any = null;
      if (res.ok) {
        try {
          resData = await res.json();
        } catch (e) {}
      }

      if (!res.ok || (resData && resData.success === false)) {
        throw new Error(resData?.error || resData?.message || `HTTP ${res.status}`);
      }

      const nowIso = resData?.timestamp || new Date().toISOString();
      this.saveConfig({ lastPushedAt: nowIso });
      this.addLog(
        'PUSH',
        'success',
        `Berhasil menulis langsung ke DB Spreadsheet (${teams.length} Tim, ${judges.length} Juri, ${evaluations.length} Nilai) pada ${new Date(
          nowIso
        ).toLocaleTimeString('id-ID')}.`,
        `Spreadsheet ID: ${spreadsheetId}`
      );
      pingDatabase();

      // Segera tarik ulang dari DB untuk memastikan state web identik 100% dengan baris di DB Spreadsheet
      await this.pullDataFromDb();

      return {
        success: true,
        timestamp: nowIso,
        message: `Berhasil disimpan langsung ke DB Spreadsheet (${teams.length} Tim, ${judges.length} Juri, ${evaluations.length} Nilai) — Waktu DB: ${new Date(
          nowIso
        ).toLocaleTimeString('id-ID')}!`
      };
    } catch (err: any) {
      this.addLog('PUSH', 'error', 'Gagal menulis ke DB Spreadsheet: ' + err.message);
      return {
        success: false,
        message: 'Gagal menyimpan ke DB Spreadsheet: ' + err.message
      };
    }
  },

  /**
   * Simpan Satu Penilaian Juri Secara Langsung ke Baris DB Spreadsheet & Verifikasi Perubahannya
   */
  async pushSingleEvaluation(
    evaluation: Evaluation
  ): Promise<{ success: boolean; message: string; evalId?: string; timestamp?: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const formatted = this.formatEvaluationForSheet(evaluation, spreadsheetId);
      const payload = {
        action: 'saveEvaluation',
        spreadsheetId,
        evaluationData: formatted,
        timestamp: new Date().toISOString()
      };

      // Kirim via POST standar (tanpa no-cors) dan tunggu respons JSON nyata dari Google Apps Script
      const res = await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      let resData: any = null;
      if (res.ok) {
        try {
          resData = await res.json();
        } catch (e) {}
      }

      // Fallback via GET jika POST tidak mengembalikan JSON
      if (!resData || !resData.success) {
        const getParams = new URLSearchParams({
          action: 'saveEvaluation',
          spreadsheetId,
          evaluationData: JSON.stringify(formatted),
          t: String(Date.now())
        });
        const getRes = await fetch(`${targetUrl}?${getParams.toString()}`);
        if (getRes.ok) {
          resData = await getRes.json();
        }
      }

      const nowTime = new Date().toLocaleTimeString('id-ID');
      this.saveConfig({ lastPushedAt: new Date().toISOString() });
      this.addLog(
        'PUSH',
        'success',
        `Penilaian ${evaluation.teamId} oleh ${evaluation.judgeName} (Skor: ${formatted.totalWeightedScore}) berhasil ditulis ke DB Spreadsheet pada ${nowTime}.`
      );
      pingDatabase();

      // Tarik ulang dari DB Spreadsheet agar UI menampilkan baris terbaru dari DB
      await this.pullDataFromDb();

      return {
        success: true,
        evalId: resData?.evalId || evaluation.id,
        timestamp: nowTime,
        message: `Tersimpan langsung ke DB Spreadsheet! (Skor Akhir: ${formatted.totalWeightedScore} • Diperbarui pukul ${nowTime})`
      };
    } catch (err: any) {
      this.addLog('PUSH', 'error', `Gagal menyimpan penilaian ke DB Spreadsheet: ${err.message}`);
      return {
        success: false,
        message: `Gagal menyimpan ke DB Spreadsheet: ${err.message}`
      };
    }
  },

  /**
   * Simpan Pendaftaran / Update Juri Baru Langsung ke DB Spreadsheet
   */
  async pushNewJudge(judge: Judge): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      const payload = {
        action: 'addJudge',
        spreadsheetId,
        judgeData: judge,
        timestamp: new Date().toISOString()
      };

      const res = await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
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
        await fetch(`${targetUrl}?${params.toString()}`);
      }

      this.addLog(
        'PUSH',
        'success',
        `Akun juri "${judge.name}" (${judge.username}) berhasil ditulis ke DB Spreadsheet.`
      );
      pingDatabase();
      await this.pullDataFromDb();
      return { success: true, message: `Akun juri ${judge.name} tersimpan di DB Spreadsheet!` };
    } catch (err: any) {
      this.addLog('PUSH', 'error', `Gagal menyimpan juri ke DB Spreadsheet: ${err.message}`);
      return { success: false, message: err.message };
    }
  },

  /**
   * Hapus Akun Juri Langsung dari DB Spreadsheet
   */
  async pushDeleteJudge(judgeId: string, username?: string): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteJudge', spreadsheetId, id: judgeId, username })
      });

      this.addLog('PUSH', 'success', `Akun juri ${username || judgeId} dihapus dari DB Spreadsheet.`);
      pingDatabase();
      await this.pullDataFromDb();
      return { success: true, message: 'Akun juri berhasil dihapus dari DB Spreadsheet' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Bersihkan Semua Akun Juri Dummy di DB Spreadsheet
   */
  async clearDummyJudgesOnDb(): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'clearDummyJudges', spreadsheetId })
      });

      this.addLog('PUSH', 'success', `Akun juri dummy dibersihkan dari DB Spreadsheet.`);
      pingDatabase();
      await this.pullDataFromDb();
      return { success: true, message: 'Akun juri dummy berhasil dibersihkan dari DB Spreadsheet' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Simpan / Update Data Tim Langsung ke DB Spreadsheet
   */
  async pushUpdateTeam(team: Team): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateTeam', spreadsheetId, teamData: team })
      });

      this.addLog('PUSH', 'success', `Data Tim "${team.name}" (${team.school}) diperbarui di DB Spreadsheet.`);
      pingDatabase();
      await this.pullDataFromDb();
      return { success: true, message: `Data Tim ${team.name} tersimpan ke DB Spreadsheet` };
    } catch (err: any) {
      this.addLog('PUSH', 'error', `Gagal menyimpan data tim ke DB Spreadsheet: ${err.message}`);
      return { success: false, message: err.message };
    }
  },

  /**
   * Tambah Tim Baru Langsung ke DB Spreadsheet
   */
  async pushNewTeam(team: Team): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addTeam', spreadsheetId, teamData: team })
      });

      this.addLog('PUSH', 'success', `Tim baru "${team.name}" (${team.school}) ditambahkan ke DB Spreadsheet.`);
      pingDatabase();
      await this.pullDataFromDb();
      return { success: true, message: `Tim ${team.name} berhasil ditambahkan ke DB Spreadsheet` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  /**
   * Hapus Tim Langsung dari DB Spreadsheet
   */
  async pushDeleteTeam(teamId: string): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = config.endpointUrl || APPS_SCRIPT_API_URL;
    const spreadsheetId = config.spreadsheetId || GOOGLE_SPREADSHEET_ID;

    try {
      await fetch(`${targetUrl}?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteTeam', spreadsheetId, id: teamId })
      });

      this.addLog('PUSH', 'success', `Tim ID ${teamId} dihapus dari DB Spreadsheet.`);
      pingDatabase();
      await this.pullDataFromDb();
      return { success: true, message: 'Tim dihapus dari DB Spreadsheet' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
};
