import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Clock, Save, Send, Download, ArrowLeft, Info, HelpCircle, ExternalLink, Play, FileText, FolderOpen, Eye, Database, Check } from 'lucide-react';
import { Team, Judge, Evaluation, AdminCheckItem, ArticleScore, VideoScore, FinalScore } from '../types';
import { ARTICLE_RUBRIC, VIDEO_RUBRIC, FINAL_RUBRIC, ADMIN_CHECKLIST_TEMPLATE } from '../data/rubricData';
import { calculateSingleArticleScore, calculateSingleVideoScore, calculateSingleFinalScore } from '../utils/tieBreaker';
import { generateSchoolPDF } from '../utils/pdfGenerator';
import { DbLiveIndicator } from './DbLiveIndicator';
import {
  INITIAL_TEAMS,
  GOOGLE_SPREADSHEET_ID,
  GOOGLE_SPREADSHEET_URL,
  ACTIVE_DRIVE_SPREADSHEET_URL
} from '../data/initialData';
import { CloudSync } from '../utils/cloudSync';
import { Storage } from '../utils/storage';

interface EvaluationFormProps {
  team: Team;
  judge: Judge;
  existingEvaluation?: Evaluation;
  onSave: (evaluation: Evaluation) => void | Promise<void>;
  onBack: () => void;
  onOpenArticlePreview?: () => void;
  onOpenVideoPreview?: () => void;
}

const extractDriveId = (url?: string): string | null => {
  if (!url) return null;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return m[1];
  const mId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (mId && mId[1]) return mId[1];
  return null;
};

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  team,
  judge,
  existingEvaluation,
  onSave,
  onBack,
  onOpenArticlePreview,
  onOpenVideoPreview
}) => {
  // Match canonical team data for Drive IDs if needed
  const canonical = INITIAL_TEAMS.find(
    t => t.id === team.id || t.code === team.code || t.school.toLowerCase() === team.school.toLowerCase()
  );

  const videoDriveId = team.videoFileId || extractDriveId(team.videoUrl) || canonical?.videoFileId || '';
  const articleDriveId = team.articleFileId || extractDriveId(team.articleUrl) || canonical?.articleFileId || '';
  const directVideoUrl = videoDriveId
    ? `https://drive.google.com/file/d/${videoDriveId}/view?usp=drive_web`
    : (team.videoUrl || canonical?.videoUrl || '');
  const directArticleUrl = articleDriveId
    ? `https://drive.google.com/file/d/${articleDriveId}/view?usp=drive_web`
    : (team.articleUrl || canonical?.articleUrl || '');
  const directFolderUrl = team.folderUrl || canonical?.folderUrl || (team.folderId ? `https://drive.google.com/drive/folders/${team.folderId}?usp=sharing` : 'https://drive.google.com/drive/folders/1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb?usp=sharing');
  const videoFileName = team.videoFileName || canonical?.videoFileName || `Video_${team.school}.mp4`;
  const articleFileName = team.articleFileName || canonical?.articleFileName || `Makalah_${team.school}.pdf`;
  const driveThumbUrl = videoDriveId
    ? `https://drive.google.com/thumbnail?id=${videoDriveId}&sz=w800`
    : (team.videoThumbnailUrl || canonical?.videoThumbnailUrl || '');

  const [inlineMediaMode, setInlineMediaMode] = useState<'none' | 'video' | 'article'>('none');
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [dbSaveBanner, setDbSaveBanner] = useState<string | null>(null);

  // Bagian A State
  const [adminChecks, setAdminChecks] = useState<AdminCheckItem[]>(
    existingEvaluation?.adminCheck || ADMIN_CHECKLIST_TEMPLATE
  );

  // Bagian B State (Artikel)
  const [articleScore, setArticleScore] = useState<ArticleScore>(
    existingEvaluation?.articleScore || {
      a1_1: 3, a1_2: 3, a1_3: 3,
      a2_1: 3, a2_2: 3, a2_3: 3,
      a3_1: 3, a3_2: 3,
      a4_1: 3, a4_2: 3
    }
  );

  // Bagian C State (Video)
  const [videoScore, setVideoScore] = useState<VideoScore>(
    existingEvaluation?.videoScore || {
      v1_1: 3, v1_2: 3,
      v2_1: 3, v2_2: 3, v2_3: 3,
      v3_1: 3, v3_2: 3,
      v4_1: 3, v4_2: 3,
      durationMinutes: 7,
      durationSeconds: 0,
      durationPenalty: 0
    }
  );

  // Bagian D State (Final - Optional)
  const [finalScore, setFinalScore] = useState<FinalScore>(
    existingEvaluation?.finalScore || {
      f1: 3, f2: 3, f3: 3, f4: 3
    }
  );

  // Notes
  const [feedback, setFeedback] = useState<string>(existingEvaluation?.feedback || '');
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('B');
  const [activeRubricHelper, setActiveRubricHelper] = useState<string | null>(null);

  // Calculate duration penalty automatically based on minutes and seconds
  useEffect(() => {
    const totalSec = videoScore.durationMinutes * 60 + videoScore.durationSeconds;
    // Wajib: 5 s/d 10 menit (300 s/d 600 detik)
    if (totalSec < 300 || totalSec > 600) {
      // Penalti 5-10 poin. Default 5 poin if slightly off, 10 if way off
      const diffSec = totalSec < 300 ? 300 - totalSec : totalSec - 600;
      const penalty = diffSec > 60 ? 10 : 5;
      setVideoScore(prev => ({ ...prev, durationPenalty: penalty }));
    } else {
      setVideoScore(prev => ({ ...prev, durationPenalty: 0 }));
    }
  }, [videoScore.durationMinutes, videoScore.durationSeconds]);

  // Realtime calculated values
  const totalArticle = calculateSingleArticleScore(articleScore);
  const totalVideo = calculateSingleVideoScore(videoScore);
  const totalFinal = calculateSingleFinalScore(finalScore);

  // Priority Values
  const p1_sains = (
    ((articleScore.a1_1 * 2) + (articleScore.a1_2 * 3) + (articleScore.a1_3 * 2.5)) +
    ((videoScore.v1_1 * 3.75) + (videoScore.v1_2 * 3.75))
  ) / 2;

  const p2_bisnis = (
    ((articleScore.a2_1 * 2) + (articleScore.a2_2 * 2.5) + (articleScore.a2_3 * 3)) +
    ((videoScore.v2_1 * 3) + (videoScore.v2_2 * 3) + (videoScore.v2_3 * 1.5))
  ) / 2;

  const p3_lokal = (
    ((articleScore.a3_1 * 2.5) + (articleScore.a3_2 * 2.5)) +
    ((videoScore.v3_1 * 3) + (videoScore.v3_2 * 2))
  ) / 2;

  const p4_pres = Math.max(0, (
    ((articleScore.a4_1 * 2.5) + (articleScore.a4_2 * 2.5)) +
    ((videoScore.v4_1 * 2.5) + (videoScore.v4_2 * 2.5))
  ) / 2 - (videoScore.durationPenalty / 2));

  const totalCalculatedOverall = Number((p1_sains + p2_bisnis + p3_lokal + p4_pres).toFixed(2));

  const handleAdminToggle = (id: number, status: 'Ya' | 'Tidak') => {
    setAdminChecks(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleAdminNoteChange = (id: number, keterangan: string) => {
    setAdminChecks(prev =>
      prev.map(item => (item.id === id ? { ...item, keterangan } : item))
    );
  };

  const buildCurrentEvaluation = (status: 'draft' | 'submitted'): Evaluation => ({
    id: existingEvaluation?.id || `eval-${team.id}-${judge.id}`,
    teamId: team.id,
    judgeId: existingEvaluation?.judgeId || judge.id,
    judgeName: judge.name,
    tahap: team.tahap,
    adminCheck: adminChecks,
    articleScore,
    videoScore,
    finalScore: team.tahap === 'Final' ? finalScore : undefined,
    feedback,
    status,
    updatedAt: new Date().toISOString()
  });

  const handleSaveEvaluation = async (status: 'draft' | 'submitted') => {
    setIsSavingToDb(true);
    const evaluation = buildCurrentEvaluation(status);
    await onSave(evaluation);
    setIsSavingToDb(false);
  };

  const handleSaveDirectToDb = async () => {
    setIsSavingToDb(true);
    const evaluation = buildCurrentEvaluation('submitted');
    Storage.saveEvaluation(evaluation);
    const res = await CloudSync.pushSingleEvaluation(evaluation);
    setIsSavingToDb(false);
    const timeStr = new Date().toLocaleTimeString('id-ID');
    setDbSaveBanner(
      res.success
        ? `BERHASIL DISIMPAN KE DB SPREADSHEET (Pukul ${timeStr} • Skor Akhir: ${totalCalculatedOverall.toFixed(2)})`
        : res.message
    );
  };

  const handleDownloadPDF = async () => {
    const currentEvaluation = buildCurrentEvaluation('submitted');
    await generateSchoolPDF(team, currentEvaluation, [currentEvaluation], judge);
  };

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-900 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Tim</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live blinking green indicator for DB connection */}
          <DbLiveIndicator size="sm" variant="light" showLatency={false} />

          <button
            onClick={() => handleSaveEvaluation('draft')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save size={15} />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            disabled={isSavingToDb}
            onClick={handleSaveDirectToDb}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title={`Simpan langsung ke DB Spreadsheet ID: ${GOOGLE_SPREADSHEET_ID}`}
          >
            <Database size={15} />
            <span>{isSavingToDb ? 'Menyimpan ke DB...' : 'Simpan ke DB Spreadsheet'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak/Unduh Lembar Penilaian Resmi Sekolah dalam Bentuk PDF"
          >
            <Download size={15} />
            <span>Unduh PDF</span>
          </button>
          <button
            disabled={isSavingToDb}
            onClick={() => handleSaveEvaluation('submitted')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-700/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send size={15} />
            <span>{isSavingToDb ? 'Menulis ke DB...' : 'Kirim & Simpan DB'}</span>
          </button>
        </div>
      </div>

      {dbSaveBanner && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-emerald-600 flex-shrink-0" />
            <span>{dbSaveBanner}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={ACTIVE_DRIVE_SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg inline-flex items-center gap-1.5"
            >
              <Database size={12} />
              <span>Buka DB Spreadsheet Aktif</span>
              <ExternalLink size={11} />
            </a>
            <a
              href={GOOGLE_SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 rounded-lg inline-flex items-center gap-1.5"
            >
              <span>ID 1iRtT9aZ...</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}

      {/* Header Info Tim */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-900 text-white font-black text-xs px-2.5 py-0.5 rounded-md">
                {team.code}
              </span>
              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-md">
                {team.tahap}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Juri Penilai: <strong className="text-slate-800">{judge.name}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {team.school}
            </h2>
            <div className="text-sm font-semibold text-blue-800 mt-0.5">
              {team.productTitle}
            </div>
          </div>

          {/* Quick Score Counter */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-3.5 rounded-xl shadow-inner text-right">
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-200">Total Akumulasi</div>
              <div className="text-2xl font-black text-amber-300">{totalCalculatedOverall.toFixed(2)}</div>
            </div>
            <div className="border-l border-white/20 pl-3 text-left text-[11px] leading-tight">
              <div>Artikel: <strong>{totalArticle}</strong> / 100</div>
              <div>Video: <strong>{totalVideo}</strong> / 100</div>
              {videoScore.durationPenalty > 0 && (
                <div className="text-rose-300 font-bold">Penalti: -{videoScore.durationPenalty}</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-700">Nama Tim:</span> {team.name}
          </div>
          <div>
            <span className="font-bold text-slate-700">Ketua Tim:</span> {team.leader}
          </div>
          <div>
            <span className="font-bold text-slate-700">Guru Pendamping:</span> {team.mentorTeacher}
          </div>
          <div className="sm:col-span-3 bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-blue-900">Bahan Lokal Khas Pasuruan:</span> {team.localResource}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={directArticleUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                title={`Buka langsung file makalah PDF (${articleFileName}) di Google Drive`}
              >
                <FileText size={14} />
                <span>File Makalah (PDF Drive)</span>
                <ExternalLink size={12} />
              </a>
              <a
                href={directVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                title={`Buka langsung file video (${videoFileName}) di Google Drive`}
              >
                <Play size={14} className="fill-white" />
                <span>File Video (MP4 Drive)</span>
                <ExternalLink size={12} />
              </a>
              <a
                href={directFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                title={`Buka folder Google Drive peserta ${team.school}`}
              >
                <FolderOpen size={14} className="text-amber-600" />
                <span>Folder Peserta</span>
              </a>
            </div>
          </div>
        </div>

        {/* Video Thumbnail & Direct Google Drive File Access Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-48 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-300 group">
            {driveThumbUrl ? (
              <img
                src={driveThumbUrl}
                alt={videoFileName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                Video Drive
              </div>
            )}
            <a
              href={directVideoUrl}
              target="_blank"
              rel="noreferrer"
              title={`Klik untuk membuka langsung file video ${videoFileName} di Google Drive`}
              className="absolute inset-0 bg-black/35 hover:bg-black/15 flex flex-col items-center justify-center text-white transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-lg">
                <Play size={16} className="fill-white ml-0.5" />
              </div>
              <span className="mt-1 text-[10px] font-bold bg-black/75 px-2 py-0.5 rounded">
                Buka Video di Drive
              </span>
            </a>
          </div>

          <div className="flex-1 text-xs w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">
                Berkas Karya Asli Peserta (Google Drive)
              </span>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Tersinkronisasi Folder Peserta
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <a
                href={directVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Play size={14} className="text-emerald-600 flex-shrink-0 fill-emerald-600" />
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">File Video (.MP4)</div>
                    <div className="font-bold text-slate-800 group-hover:text-emerald-800 truncate">{videoFileName}</div>
                  </div>
                </div>
                <ExternalLink size={13} className="text-slate-400 group-hover:text-emerald-700 flex-shrink-0" />
              </a>

              <a
                href={directArticleUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-blue-700 flex-shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">File Makalah (.PDF)</div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-800 truncate">{articleFileName}</div>
                  </div>
                </div>
                <ExternalLink size={13} className="text-slate-400 group-hover:text-blue-700 flex-shrink-0" />
              </a>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setInlineMediaMode(inlineMediaMode === 'video' ? 'none' : 'video')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                  inlineMediaMode === 'video'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                }`}
              >
                <Play size={12} />
                <span>{inlineMediaMode === 'video' ? 'Tutup Pemutar Video' : 'Putar Video di Halaman Ini'}</span>
              </button>

              <button
                type="button"
                onClick={() => setInlineMediaMode(inlineMediaMode === 'article' ? 'none' : 'article')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                  inlineMediaMode === 'article'
                    ? 'bg-blue-800 text-white'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-900'
                }`}
              >
                <Eye size={12} />
                <span>{inlineMediaMode === 'article' ? 'Tutup Pembaca Makalah' : 'Baca Makalah PDF di Halaman Ini'}</span>
              </button>

              {onOpenArticlePreview && (
                <button
                  type="button"
                  onClick={onOpenArticlePreview}
                  className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer"
                >
                  Layar Penuh Makalah
                </button>
              )}

              {onOpenVideoPreview && (
                <button
                  type="button"
                  onClick={onOpenVideoPreview}
                  className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer"
                >
                  Layar Penuh Video
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inline Embedded Google Drive Player (Video or Makalah PDF) so judge can evaluate while viewing */}
        {inlineMediaMode !== 'none' && (
          <div className="mt-4 rounded-2xl overflow-hidden border-2 border-blue-900 bg-slate-900 shadow-lg">
            <div className="bg-blue-950 text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold">
                {inlineMediaMode === 'video' ? (
                  <>
                    <Play size={14} className="text-emerald-400 fill-emerald-400" />
                    <span>Pemutar Video Langsung Google Drive — {videoFileName}</span>
                  </>
                ) : (
                  <>
                    <FileText size={14} className="text-amber-400" />
                    <span>Pembaca Makalah PDF Google Drive — {articleFileName}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={inlineMediaMode === 'video' ? directVideoUrl : directArticleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-bold flex items-center gap-1"
                >
                  <span>Buka Tab Baru Google Drive</span>
                  <ExternalLink size={11} />
                </a>
                <button
                  type="button"
                  onClick={() => setInlineMediaMode('none')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 rounded text-[11px] font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
            <iframe
              src={
                inlineMediaMode === 'video'
                  ? `https://drive.google.com/file/d/${videoDriveId}/preview`
                  : `https://drive.google.com/file/d/${articleDriveId}/preview`
              }
              title={inlineMediaMode === 'video' ? videoFileName : articleFileName}
              className="w-full h-[460px] border-0 bg-slate-950"
              allow="autoplay; fullscreen"
            />
          </div>
        )}
      </div>

      {/* Tabs Bagian A, B, C, D, E */}
      <div className="flex overflow-x-auto gap-2 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('A')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'A'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Bagian A: Kepatuhan Administrasi
        </button>
        <button
          onClick={() => setActiveTab('B')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'B'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Bagian B: Artikel Ide Bisnis ({totalArticle} Poin)
        </button>
        <button
          onClick={() => setActiveTab('C')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'C'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Bagian C: Video Pembuatan ({totalVideo} Poin)
        </button>
        <button
          onClick={() => setActiveTab('D')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'D'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Bagian D: Babak Final
        </button>
        <button
          onClick={() => setActiveTab('E')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'E'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Bagian E: Rekap & Tie-Breaker
        </button>
      </div>

      {/* ---------------- TAB A: KEPATUHAN ADMINISTRASI ---------------- */}
      {activeTab === 'A' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Bagian A. Verifikasi Kepatuhan Administrasi
              </h3>
              <p className="text-xs text-slate-500">
                Periksa berkas persyaratan administrasi sesuai petunjuk pelaksanaan lomba.
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-md">
              4 Butir Verifikasi
            </span>
          </div>

          <div className="space-y-4">
            {adminChecks.map(check => (
              <div
                key={check.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">
                    {check.id}. {check.item}
                  </div>
                  <input
                    type="text"
                    value={check.keterangan}
                    onChange={e => handleAdminNoteChange(check.id, e.target.value)}
                    placeholder="Keterangan / Catatan verifikasi..."
                    className="mt-2 w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdminToggle(check.id, 'Ya')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      check.status === 'Ya'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    [✓] Ya
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminToggle(check.id, 'Tidak')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      check.status === 'Tidak'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    [✗] Tidak
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setActiveTab('B')}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all"
            >
              Lanjut ke Bagian B (Artikel) &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ---------------- TAB B: ARTIKEL IDE BISNIS ---------------- */}
      {activeTab === 'B' && (
        <div className="space-y-6">
          {/* Guide Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <Info size={18} className="text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Panduan Konversi Skor (Skala 1–4 ke Nilai Terbobot Maksimal 100):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5 font-semibold text-slate-700">
                <span className="bg-white px-2 py-1 rounded border border-blue-100">
                  Skor 4 (Sangat Baik) = 100% Bobot
                </span>
                <span className="bg-white px-2 py-1 rounded border border-blue-100">
                  Skor 3 (Baik) = 75% Bobot
                </span>
                <span className="bg-white px-2 py-1 rounded border border-blue-100">
                  Skor 2 (Cukup) = 50% Bobot
                </span>
                <span className="bg-white px-2 py-1 rounded border border-blue-100">
                  Skor 1 (Kurang) = 25% Bobot
                </span>
              </div>
            </div>
          </div>

          {ARTICLE_RUBRIC.map(item => {
            const currentScore = (articleScore as any)[item.id] || 3;
            const currentPoints = item.levels[currentScore as 1 | 2 | 3 | 4]?.points || 0;
            const isHelperOpen = activeRubricHelper === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Bobot: {item.weight}%
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveRubricHelper(isHelperOpen ? null : item.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <HelpCircle size={14} />
                      <span>{isHelperOpen ? 'Tutup Rubrik' : 'Lihat Rubrik'}</span>
                    </button>
                    <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-xs font-black">
                      Nilai: <span className="text-blue-700">{currentPoints.toFixed(2)}</span> / {item.weight}
                    </div>
                  </div>
                </div>

                {/* Score Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {([4, 3, 2, 1] as const).map(scoreNum => {
                    const isSelected = currentScore === scoreNum;
                    const pts = item.levels[scoreNum].points;
                    const labels = { 4: '4 - Sangat Baik', 3: '3 - Baik', 2: '2 - Cukup', 1: '1 - Kurang' };

                    return (
                      <button
                        key={scoreNum}
                        type="button"
                        onClick={() => setArticleScore(prev => ({ ...prev, [item.id]: scoreNum }))}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-500/30 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{labels[scoreNum]}</span>
                          <span className={isSelected ? 'text-amber-300' : 'text-blue-700'}>
                            {pts} Poin
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Rubric Descriptor Description */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900">Deskripsi Capaian Terpilih (Skor {currentScore}): </span>
                  {item.levels[currentScore as 1 | 2 | 3 | 4]?.desc}
                </div>

                {/* Expanded Rubric Reference if toggled */}
                {isHelperOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Rubrik Penilaian Lengkap ({item.code}):
                    </div>
                    {([4, 3, 2, 1] as const).map(s => (
                      <div
                        key={s}
                        className={`p-2 rounded-lg ${
                          currentScore === s ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                        }`}
                      >
                        <strong className="text-blue-900">Skor {s} ({item.levels[s].points} Poin):</strong>{' '}
                        {item.levels[s].desc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('A')}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              &larr; Kembali ke Bagian A
            </button>
            <div className="text-sm font-black text-blue-950">
              Total Nilai Artikel: <span className="text-blue-700">{totalArticle}</span> / 100 Poin
            </div>
            <button
              onClick={() => setActiveTab('C')}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all"
            >
              Lanjut ke Bagian C (Video) &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ---------------- TAB C: VIDEO PEMBUATAN PRODUK ---------------- */}
      {activeTab === 'C' && (
        <div className="space-y-6">
          {/* Duration Counter & Penalty Box */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-700" />
                  <span className="font-extrabold text-amber-900 text-sm">
                    Ketentuan Durasi Video & Pengurangan Poin
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Durasi wajib video adalah <strong>5 sampai 10 menit</strong>. Jika kurang dari 5 menit atau melebihi 10 menit, dikenakan penalti 5 hingga 10 poin.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={videoScore.durationMinutes}
                    onChange={e =>
                      setVideoScore(prev => ({
                        ...prev,
                        durationMinutes: Math.max(0, parseInt(e.target.value) || 0)
                      }))
                    }
                    className="w-14 p-1.5 text-center bg-white border border-slate-300 rounded-lg text-sm font-bold text-blue-950"
                  />
                  <span>menit</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={videoScore.durationSeconds}
                    onChange={e =>
                      setVideoScore(prev => ({
                        ...prev,
                        durationSeconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                      }))
                    }
                    className="w-14 p-1.5 text-center bg-white border border-slate-300 rounded-lg text-sm font-bold text-blue-950"
                  />
                  <span>detik</span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                    videoScore.durationPenalty > 0
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {videoScore.durationPenalty > 0
                    ? `Penalti: -${videoScore.durationPenalty} Poin`
                    : 'Durasi Valid (0 Penalti)'}
                </div>
              </div>
            </div>
          </div>

          {VIDEO_RUBRIC.map(item => {
            const currentScore = (videoScore as any)[item.id] || 3;
            const currentPoints = item.levels[currentScore as 1 | 2 | 3 | 4]?.points || 0;
            const isHelperOpen = activeRubricHelper === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Bobot: {item.weight}%
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveRubricHelper(isHelperOpen ? null : item.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <HelpCircle size={14} />
                      <span>{isHelperOpen ? 'Tutup Rubrik' : 'Lihat Rubrik'}</span>
                    </button>
                    <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-xs font-black">
                      Nilai: <span className="text-blue-700">{currentPoints.toFixed(2)}</span> / {item.weight}
                    </div>
                  </div>
                </div>

                {/* Score Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {([4, 3, 2, 1] as const).map(scoreNum => {
                    const isSelected = currentScore === scoreNum;
                    const pts = item.levels[scoreNum].points;
                    const labels = { 4: '4 - Sangat Baik', 3: '3 - Baik', 2: '2 - Cukup', 1: '1 - Kurang' };

                    return (
                      <button
                        key={scoreNum}
                        type="button"
                        onClick={() => setVideoScore(prev => ({ ...prev, [item.id]: scoreNum }))}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-500/30 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{labels[scoreNum]}</span>
                          <span className={isSelected ? 'text-amber-300' : 'text-blue-700'}>
                            {pts} Poin
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Rubric Descriptor Description */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900">Deskripsi Capaian Terpilih (Skor {currentScore}): </span>
                  {item.levels[currentScore as 1 | 2 | 3 | 4]?.desc}
                </div>

                {/* Expanded Rubric Reference if toggled */}
                {isHelperOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Rubrik Penilaian Lengkap ({item.code}):
                    </div>
                    {([4, 3, 2, 1] as const).map(s => (
                      <div
                        key={s}
                        className={`p-2 rounded-lg ${
                          currentScore === s ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                        }`}
                      >
                        <strong className="text-blue-900">Skor {s} ({item.levels[s].points} Poin):</strong>{' '}
                        {item.levels[s].desc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('B')}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              &larr; Kembali ke Bagian B
            </button>
            <div className="text-sm font-black text-blue-950">
              Total Nilai Video: <span className="text-blue-700">{totalVideo}</span> / 100 Poin
            </div>
            <button
              onClick={() => setActiveTab('E')}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all"
            >
              Lihat Rekapitulasi &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ---------------- TAB D: BABAK FINAL ---------------- */}
      {activeTab === 'D' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
            <span className="font-bold">Instrumen Babak Final (Pameran & Presentasi Langsung 18 Nov 2026):</span>
            <p className="mt-1">
              Bagian ini digunakan dewan juri untuk menilai 10 Besar Finalis saat pameran produk fisik dan uji materi langsung.
            </p>
          </div>

          {FINAL_RUBRIC.map(item => {
            const currentScore = (finalScore as any)[item.id] || 3;
            const pts = (item.levels as any)[currentScore]?.points || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="font-black text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h4>
                    <span className="text-xs text-slate-500">Bobot: {item.weight}%</span>
                  </div>
                  <div className="text-sm font-black text-blue-900">
                    Nilai: {pts.toFixed(2)} / {item.weight}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {([4, 3, 2, 1] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFinalScore(prev => ({ ...prev, [item.id]: s }))}
                      className={`p-2.5 rounded-xl text-left border ${
                        currentScore === s
                          ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">Skor {s}</div>
                      <div className="text-[11px] font-medium opacity-90">
                        {item.levels[s].points} Poin
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                  <strong>Rubrik:</strong> {item.levels[currentScore as 1 | 2 | 3 | 4].desc}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- TAB E: REKAPITULASI & CATATAN DEWAN JURI ---------------- */}
      {activeTab === 'E' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-base mb-1">
              BAGIAN E. Rekapitulasi Nilai Akhir & Urutan Prioritas Penentu Pemenang
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Sesuai ketentuan tie-breaker resmi Lomba Sainspreneur Pasuruan Science Festival 2026.
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-blue-900 text-white font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Prioritas Tie Breaker</th>
                    <th className="py-2.5 px-4">Kriteria Penilaian</th>
                    <th className="py-2.5 px-3 text-center">Bobot</th>
                    <th className="py-2.5 px-4 text-center">Nilai Akhir Kriteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-blue-50/50">
                    <td className="py-2.5 px-3 font-bold text-blue-900">Prioritas 1</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">1. Sains & Inovasi</td>
                    <td className="py-2.5 px-3 text-center font-bold">30%</td>
                    <td className="py-2.5 px-4 text-center font-black text-blue-950 text-sm">
                      {p1_sains.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td className="py-2.5 px-3 font-bold text-emerald-900">Prioritas 2</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">2. Kelayakan Bisnis & Kemasan</td>
                    <td className="py-2.5 px-3 text-center font-bold">30%</td>
                    <td className="py-2.5 px-4 text-center font-black text-emerald-950 text-sm">
                      {p2_bisnis.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="py-2.5 px-3 font-bold text-amber-900">Prioritas 3</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">3. Pemanfaatan Bahan Lokal Pasuruan</td>
                    <td className="py-2.5 px-3 text-center font-bold">20%</td>
                    <td className="py-2.5 px-4 text-center font-black text-amber-950 text-sm">
                      {p3_lokal.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-purple-50/50">
                    <td className="py-2.5 px-3 font-bold text-purple-900">Non-Prioritas</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">4. Presentasi & Sistematika Penulisan</td>
                    <td className="py-2.5 px-3 text-center font-bold">20%</td>
                    <td className="py-2.5 px-4 text-center font-black text-purple-950 text-sm">
                      {p4_pres.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-blue-950 text-white font-bold">
                    <td colSpan={3} className="py-3 px-4 text-right text-sm">
                      TOTAL NILAI AKHIR TIM PESERTA (100%):
                    </td>
                    <td className="py-3 px-4 text-center text-lg font-black text-amber-400">
                      {totalCalculatedOverall.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Catatan Juri (Maksimal 200 Karakter sesuai Kisi-kisi & Pedoman Penilaian) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800 uppercase">
                  Catatan Evaluasi & Analisis Kisi-kisi Dewan Juri (Maks. 200 Karakter):
                </label>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    feedback.length > 190
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {feedback.length} / 200 karakter
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                value={feedback}
                onChange={e => setFeedback(e.target.value.slice(0, 200))}
                placeholder="Tuliskan catatan analisis sesuai kisi-kisi & pedoman penilaian (maks. 200 karakter)..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
