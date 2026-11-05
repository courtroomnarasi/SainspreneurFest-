import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Users, Trophy, Download, Plus, Trash2, Edit2, Key, CheckCircle, RefreshCw, FileText, Code2, ExternalLink, Palette, Sun, Sliders, Eye, Sparkles, Image as ImageIcon, SlidersHorizontal, Check, Database, CloudDownload, CloudUpload, Activity, Settings, Terminal, Copy, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import { Judge, Team, Evaluation, TeamAggregatedScore, BackgroundConfig, DEFAULT_BACKGROUND_CONFIG } from '../types';
import { generateSchoolPDF, generateTopTenSummaryPDF } from '../utils/pdfGenerator';
import { GOOGLE_DRIVE_DB_URL } from '../data/initialData';
import { DbLiveIndicator } from './DbLiveIndicator';
import { CloudSync, SyncLogItem, CloudConfig } from '../utils/cloudSync';
import { Storage } from '../utils/storage';

interface AdminPortalProps {
  judges: Judge[];
  teams: Team[];
  evaluations: Evaluation[];
  aggregatedScores: TeamAggregatedScore[];
  isPublished: boolean;
  onTogglePublish: (isPublished: boolean) => void;
  onAddJudge: (judge: Judge) => void;
  onUpdateJudge: (judge: Judge) => void;
  onDeleteJudge: (id: string) => void;
  onAddTeam: (team: Team) => void;
  onUpdateTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
  onResetDefaults: () => void;
  bgConfig: BackgroundConfig;
  onUpdateBgConfig: (config: BackgroundConfig) => void;
  onPullData?: () => Promise<{ success: boolean; message: string; teams?: Team[]; judges?: Judge[]; evaluations?: Evaluation[] }>;
  onPushData?: () => Promise<{ success: boolean; message: string }>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  judges,
  teams,
  evaluations,
  aggregatedScores,
  isPublished,
  onTogglePublish,
  onAddJudge,
  onUpdateJudge,
  onDeleteJudge,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onResetDefaults,
  bgConfig,
  onUpdateBgConfig,
  onPullData,
  onPushData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'recap' | 'judges' | 'teams' | 'appearance' | 'gas'>('recap');

  // Background Customization State
  const [localBg, setLocalBg] = useState<BackgroundConfig>(bgConfig);
  const [bgSavedSuccess, setBgSavedSuccess] = useState(false);

  // Web Config & Cloud Sync State
  const [cloudCfg, setCloudCfg] = useState<CloudConfig>(() => CloudSync.getConfig());
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>(() => CloudSync.getLogs());
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [cfgSavedSuccess, setCfgSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setLocalBg(bgConfig);
  }, [bgConfig]);

  const handleApplyBg = (updated: Partial<BackgroundConfig>) => {
    const next = { ...localBg, ...updated };
    setLocalBg(next);
    onUpdateBgConfig(next);
    setBgSavedSuccess(true);
    setTimeout(() => setBgSavedSuccess(false), 2500);
  };

  // Two-way DB Actions
  const handleExecutePull = async () => {
    setIsPulling(true);
    setSyncFeedback(null);
    try {
      const res = onPullData ? await onPullData() : await CloudSync.pullDataFromDb();
      setSyncLogs(CloudSync.getLogs());
      setSyncFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message
      });
    } catch (e: any) {
      setSyncFeedback({ type: 'error', message: 'Gagal menarik data: ' + e.message });
    } finally {
      setIsPulling(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleExecutePush = async () => {
    setIsPushing(true);
    setSyncFeedback(null);
    try {
      const res = onPushData ? await onPushData() : await CloudSync.pushAllDataToDb({ teams, judges, evaluations });
      setSyncLogs(CloudSync.getLogs());
      setSyncFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message
      });
    } catch (e: any) {
      setSyncFeedback({ type: 'error', message: 'Gagal mengirim data: ' + e.message });
    } finally {
      setIsPushing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleSaveWebConfig = (e: React.FormEvent) => {
    e.preventDefault();
    CloudSync.saveConfig(cloudCfg);
    setSyncLogs(CloudSync.getLogs());
    setCfgSavedSuccess(true);
    setTimeout(() => setCfgSavedSuccess(false), 3000);
  };

  const handleDownloadBackupJson = () => {
    const backupData = {
      app: 'Pasuruan Science Festival 2026',
      exportedAt: new Date().toISOString(),
      config: cloudCfg,
      teams,
      judges,
      evaluations
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_psf2026_db_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    CloudSync.addLog('CONFIG', 'success', 'Cadangan JSON database berhasil diunduh secara lokal.');
    setSyncLogs(CloudSync.getLogs());
  };

  const handleImportJson = () => {
    try {
      if (!importJsonText.trim()) return;
      const parsed = JSON.parse(importJsonText);
      if (parsed.teams && Array.isArray(parsed.teams)) {
        Storage.saveTeams(parsed.teams);
      }
      if (parsed.judges && Array.isArray(parsed.judges)) {
        Storage.saveJudges(parsed.judges);
      }
      if (parsed.evaluations && Array.isArray(parsed.evaluations)) {
        Storage.saveEvaluations(parsed.evaluations);
      }
      alert('Data berhasil diimpor! Halaman akan memuat ulang data baru.');
      window.location.reload();
    } catch (err: any) {
      alert('Format JSON tidak valid: ' + err.message);
    }
  };

  // New Judge Form State
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeUsername, setNewJudgeUsername] = useState('');
  const [newJudgePassword, setNewJudgePassword] = useState('');
  const [newJudgeNip, setNewJudgeNip] = useState('');
  const [newJudgeInstitution, setNewJudgeInstitution] = useState('');
  const [newJudgeField, setNewJudgeField] = useState('Sains & Inovasi Teknologi');
  const [judgeFormSuccess, setJudgeFormSuccess] = useState('');

  // New Team Form State
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newTeamCode, setNewTeamCode] = useState(`TIM-${String(teams.length + 1).padStart(2, '0')}`);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSchool, setNewTeamSchool] = useState('');
  const [newTeamTitle, setNewTeamTitle] = useState('');
  const [newTeamLocal, setNewTeamLocal] = useState('');
  const [newTeamLeader, setNewTeamLeader] = useState('');
  const [newTeamMentor, setNewTeamMentor] = useState('');
  const [teamFormSuccess, setTeamFormSuccess] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isClearingDummies, setIsClearingDummies] = useState(false);

  const handleClearAllDummyJudges = async () => {
    if (!window.confirm('Bersihkan semua akun dummy (juri1, juri2, juri3) dari database Cloud dan lokal?')) return;
    setIsClearingDummies(true);
    await CloudSync.clearDummyJudgesOnDb();
    const filtered = judges.filter(j => {
      const u = (j.username || '').toLowerCase();
      const id = (j.id || '').toLowerCase();
      return u !== 'juri1' && u !== 'juri2' && u !== 'juri3' &&
             id !== 'juri-1' && id !== 'juri-2' && id !== 'juri-3';
    });
    Storage.saveJudges(filtered);
    setJudgeFormSuccess('Semua akun juri dummy berhasil dibersihkan dari database Cloud & lokal!');
    setIsClearingDummies(false);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleCreateJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName || !newJudgeUsername) return;

    const newJudge: Judge = {
      id: `juri-${Date.now()}`,
      username: newJudgeUsername.trim().toLowerCase(),
      password: newJudgePassword.trim() || '@juri123',
      name: newJudgeName.trim(),
      nip: newJudgeNip.trim() || '-',
      institution: newJudgeInstitution.trim() || 'Dewan Juri Sainspreneur',
      field: newJudgeField.trim(),
      isActive: true
    };

    onAddJudge(newJudge);
    setNewJudgeName('');
    setNewJudgeUsername('');
    setNewJudgePassword('');
    setNewJudgeNip('');
    setNewJudgeInstitution('');
    setJudgeFormSuccess(`Akun dewan juri "${newJudge.name}" berhasil dibuat dan langsung terhubung ke Cloud DB!`);
    setTimeout(() => setJudgeFormSuccess(''), 5000);
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamSchool || !newTeamTitle) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      code: newTeamCode,
      name: newTeamName || `Tim ${newTeamSchool}`,
      school: newTeamSchool,
      productTitle: newTeamTitle,
      localResource: newTeamLocal || 'Komoditas Khas Kabupaten Pasuruan',
      leader: newTeamLeader || 'Ketua Tim',
      members: [newTeamLeader || 'Ketua Tim'],
      mentorTeacher: newTeamMentor || 'Guru Pendamping',
      tahap: 'Tahap 2',
      registeredAt: new Date().toISOString().split('T')[0]
    };

    onAddTeam(newTeam);
    setIsAddingTeam(false);
    setNewTeamSchool('');
    setNewTeamName('');
    setNewTeamTitle('');
    setNewTeamLocal('');
    setNewTeamLeader('');
    setNewTeamMentor('');
    setTeamFormSuccess(`Tim "${newTeam.name}" (${newTeam.school}) berhasil ditambahkan dan langsung terhubung ke database Cloud!`);
    setTimeout(() => setTeamFormSuccess(''), 5000);
  };

  const handleSaveEditTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    onUpdateTeam(editingTeam);
    setTeamFormSuccess(`Nama Tim "${editingTeam.name}" (${editingTeam.school}) berhasil diperbarui dan disinkronkan ke DB!`);
    setEditingTeam(null);
    setTimeout(() => setTeamFormSuccess(''), 5000);
  };

  const handleDownloadSinglePdf = async (item: TeamAggregatedScore) => {
    const teamEvals = evaluations.filter(e => e.teamId === item.team.id && e.status === 'submitted');
    const firstEval = teamEvals[0];
    await generateSchoolPDF(item.team, firstEval, evaluations, undefined, {
      rank: item.rank || 1,
      isTopTen: Boolean(item.isTopTen),
      totalTeams: teams.length
    });
  };

  const handleDownloadBatchTopTen = async () => {
    const topTen = aggregatedScores.slice(0, 10);
    for (const item of topTen) {
      await handleDownloadSinglePdf(item);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              <Shield size={12} />
              <span>Administrator Pasuruan Science Festival 2026</span>
            </div>
            {/* Live blinking green indicator for DB connection */}
            <DbLiveIndicator size="sm" variant="dark" showLatency={true} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Panel Administrasi & Pengolahan Skor</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Kelola akun dewan juri, data tim sekolah peserta, sinkronisasi langsung dengan Spreadsheet Database Google Drive, serta cetak lembar penilaian PDF per sekolah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExecutePull}
            disabled={isPulling}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
            title="Tarik data terbaru dari Google Spreadsheet DB ke Web"
          >
            <CloudDownload size={15} className={isPulling ? 'animate-bounce' : ''} />
            <span>{isPulling ? 'Menarik DB...' : 'Tarik dari DB Spreadsheet'}</span>
          </button>
          <button
            type="button"
            onClick={handleExecutePush}
            disabled={isPushing}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
            title="Kirim dan simpan seluruh data yang tampil di Web ke Google Spreadsheet DB"
          >
            <CloudUpload size={15} className={isPushing ? 'animate-bounce' : ''} />
            <span>{isPushing ? 'Menyimpan ke DB...' : 'Simpan Web ke DB Spreadsheet'}</span>
          </button>
          <button
            onClick={() => generateTopTenSummaryPDF(aggregatedScores)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Trophy size={16} />
            <span>Cetak PDF 10 Besar</span>
          </button>
          <button
            onClick={handleDownloadBatchTopTen}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            title="Download PDF Lembar Penilaian untuk seluruh 10 Besar"
          >
            <Download size={16} />
            <span>Cetak PDF Semua 10 Besar</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold shadow-sm ${
          syncFeedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {syncFeedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-rose-600" />}
            <span>{syncFeedback.message}</span>
          </div>
          <a
            href={GOOGLE_DRIVE_DB_URL}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Buka Folder DB Drive</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Kontrol Publikasi Hasil Penilaian ke Landing Page */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm ${
        isPublished
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
            isPublished ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
          }`}>
            {isPublished ? '📢' : '🔒'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                isPublished ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
              }`}>
                {isPublished ? 'STATUS: DIPUBLIKASIKAN KE PUBLIK' : 'STATUS: DISEMBUNYIKAN DARI PUBLIK'}
              </span>
            </div>
            <h4 className="font-extrabold text-sm mt-0.5">
              {isPublished
                ? 'Hasil Klasemen 10 Besar dan Skor Tim Sedang Tayang di Beranda Publik'
                : 'Skor dan 10 Besar Masih Bersifat Internal (Hanya Terlihat oleh Admin & Juri)'}
            </h4>
            <p className="text-xs opacity-80">
              {isPublished
                ? 'Seluruh tim dan pengunjung umum dapat melihat skor terverifikasi dan daftar 10 besar finalis.'
                : 'Landing page tim hanya menampilkan profil sekolah terdaftar tanpa memunculkan skor sebelum pleno.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onTogglePublish(!isPublished)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap ${
            isPublished
              ? 'bg-slate-800 hover:bg-slate-900 text-white'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
          }`}
        >
          {isPublished ? 'Tarik Publikasi (Sembunyikan)' : 'Publikasikan 10 Besar Sekarang'}
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('recap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'recap'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🏆 Rekapitulasi & 10 Besar ({teams.length} Sekolah)
        </button>
        <button
          onClick={() => setActiveSubTab('judges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'judges'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          👥 Manajemen Akun Juri ({judges.length} Juri)
        </button>
        <button
          onClick={() => setActiveSubTab('teams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'teams'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🏫 Data Peserta & Tim ({teams.length})
        </button>
        <button
          onClick={() => setActiveSubTab('appearance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'appearance'
              ? 'bg-amber-500 text-blue-950 shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Palette size={14} />
          <span>🎨 Pengaturan Background & Tampilan</span>
        </button>
        <button
          onClick={() => setActiveSubTab('gas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'gas'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Database size={14} />
          <span>⚡ Web Config & Sinkronisasi DB</span>
        </button>
      </div>

      {/* ---------------- SUB TAB 1: REKAPITULASI & 10 BESAR ---------------- */}
      {activeSubTab === 'recap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Rekapitulasi Nilai Seluruh Peserta & Penentuan 10 Besar
                </h3>
                <p className="text-xs text-slate-500">
                  Data otomatis terurut berdasarkan total skor dan urutan prioritas tie-breaker resmi.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                  Total Evaluasi Masuk: {evaluations.filter(e => e.status === 'submitted').length} Lembar
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center">Rank</th>
                    <th className="py-3 px-3">Kode</th>
                    <th className="py-3 px-4">Asal Sekolah & Inovasi</th>
                    <th className="py-3 px-2 text-center">Juri Dinilai</th>
                    <th className="py-3 px-3 text-center">Sains (30%)</th>
                    <th className="py-3 px-3 text-center">Bisnis (30%)</th>
                    <th className="py-3 px-3 text-center">Lokal (20%)</th>
                    <th className="py-3 px-3 text-center">Pres (20%)</th>
                    <th className="py-3 px-4 text-center">Total Skor</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Cetak PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aggregatedScores.map((item, idx) => {
                    const isTop10 = idx < 10 && item.totalScore > 0;
                    return (
                      <tr
                        key={item.team.id}
                        className={`transition-colors ${
                          isTop10 ? 'bg-amber-50/30 hover:bg-amber-100/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-900'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : isTop10
                                ? 'bg-blue-100 text-blue-900 font-black'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-blue-900">{item.team.code}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.team.school}</div>
                          <div className="text-[11px] text-slate-600 line-clamp-1">{item.team.productTitle}</div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="font-semibold text-slate-700">{item.evaluationsCount} Juri</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-blue-900">
                          {item.scoreSainsInovasi.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-900">
                          {item.scoreKelayakanBisnis.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-amber-900">
                          {item.scoreBahanLokal.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-purple-900">
                          {item.scorePresentasiPenulisan.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-blue-950 text-sm">
                          {item.totalScore.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isTop10 ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              10 Besar
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Tahap 2
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDownloadSinglePdf(item)}
                            className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                            title="Unduh Lembar Penilaian PDF Sekolah ini"
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB TAB 2: MANAJEMEN AKUN JURI ---------------- */}
      {activeSubTab === 'judges' && (
        <div className="space-y-6">
          {/* Add Judge Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-blue-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Tambah Akun Dewan Juri Baru
                    </h3>
                    <DbLiveIndicator size="sm" variant="light" showLatency={false} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nama dan akun juri yang Anda ketik langsung terhubung dan tersimpan ke Google Sheets Database (Tabel <code>Judges</code>).
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isClearingDummies}
                onClick={handleClearAllDummyJudges}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer text-xs self-start sm:self-auto"
                title="Hapus semua akun juri dummy (juri1, juri2, juri3) dari database Cloud dan lokal"
              >
                <Trash2 size={14} />
                <span>{isClearingDummies ? 'Membersihkan...' : 'Bersihkan Akun Dummy di DB'}</span>
              </button>
            </div>

            {judgeFormSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 animate-fadeIn">
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{judgeFormSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateJudge} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Nama Lengkap & Gelar *</span>
                  <span className="text-[10px] text-blue-800 font-bold">Sinkron DB</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Bambang Hermanto, M.Si"
                  value={newJudgeName}
                  onChange={e => setNewJudgeName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: bambang.juri"
                  value={newJudgeUsername}
                  onChange={e => setNewJudgeUsername(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password Login</label>
                <input
                  type="text"
                  placeholder="Default: @juri123"
                  value={newJudgePassword}
                  onChange={e => setNewJudgePassword(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP (Opsional)</label>
                <input
                  type="text"
                  placeholder="19800101 200501 1 001"
                  value={newJudgeNip}
                  onChange={e => setNewJudgeNip(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Asal Instansi</label>
                <input
                  type="text"
                  placeholder="Contoh: Universitas Brawijaya / Disdikbud"
                  value={newJudgeInstitution}
                  onChange={e => setNewJudgeInstitution(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bidang Keahlian Penjurian</label>
                <select
                  value={newJudgeField}
                  onChange={e => setNewJudgeField(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium"
                >
                  <option value="Sains & Inovasi Teknologi">Sains & Inovasi Teknologi Pangan/Biologi</option>
                  <option value="Kelayakan Bisnis, HPP & Kemasan">Kelayakan Bisnis, HPP & Packaging</option>
                  <option value="Pedagogik IPA & Sistematika">Pedagogik IPA & Sistematika Penulisan</option>
                  <option value="Praktisi Wirausaha & Lingkungan">Praktisi Wirausaha & Lingkungan Hidup</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Database size={13} className="text-emerald-600" />
                  <span>Akun tersimpan permanen di Google Drive Spreadsheet <strong>DB_Sainspreneur_Pasuruan_Festival_2026</strong>.</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer w-full sm:w-auto justify-center"
                >
                  <UserPlus size={16} />
                  <span>Simpan & Hubungkan ke DB</span>
                </button>
              </div>
            </form>
          </div>

          {/* Judges List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span>Daftar Dewan Juri Resmi ({judges.length} Orang)</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Semua Terhubung DB
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Bebas akun dummy</span>
            </div>

            {judges.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <Users size={24} />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Belum Ada Akun Dewan Juri</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Seluruh akun dummy bawaan telah dihapus. Silakan gunakan form di atas untuk mendaftarkan akun dewan juri penilai resmi lomba.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-4">Nama Dewan Juri</th>
                      <th className="py-3 px-4">Username & Password</th>
                      <th className="py-3 px-4">Instansi & NIP</th>
                      <th className="py-3 px-4">Bidang Keahlian</th>
                      <th className="py-3 px-3 text-center">Status DB</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {judges.map(j => (
                      <tr key={j.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{j.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {j.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-blue-900 font-bold">User: {j.username}</div>
                          <div className="font-mono text-slate-500">Pass: {j.password || '@juri123'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div>{j.institution}</div>
                          <div className="text-[11px] text-slate-400">NIP: {j.nip || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{j.field}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Terhubung DB
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onDeleteJudge(j.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun Juri dari Sistem dan Database"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- SUB TAB 3: DATA PESERTA & TIM ---------------- */}
      {activeSubTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">
                  Kelola Tim Peserta Lomba Sainspreneur
                </h3>
                <DbLiveIndicator size="sm" variant="light" showLatency={false} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {teams.length} sekolah peserta resmi. Anda dapat mengubah Nama Tim, judul produk, dan data lainnya yang langsung tersinkron ke Google Sheets <code>Teams</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isPushing}
                onClick={async () => {
                  setIsPushing(true);
                  await CloudSync.pushAllDataToDb({ teams });
                  setIsPushing(false);
                  setTeamFormSuccess(`Seluruh data ${teams.length} tim berhasil disinkronkan ke Google Sheets!`);
                  setTimeout(() => setTeamFormSuccess(''), 4000);
                }}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                title="Kirim dan perbarui data seluruh tim ke database Cloud"
              >
                <Database size={14} />
                <span>{isPushing ? 'Menyinkronkan...' : 'Sinkronkan Semua Tim ke DB'}</span>
              </button>

              <button
                onClick={() => setIsAddingTeam(!isAddingTeam)}
                className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={15} />
                <span>{isAddingTeam ? 'Tutup Form' : 'Tambah Tim Baru'}</span>
              </button>
            </div>
          </div>

          {teamFormSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{teamFormSuccess}</span>
            </div>
          )}

          {isAddingTeam && (
            <form onSubmit={handleCreateTeam} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-3 pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">Form Pendaftaran Tim Baru</h4>
                <p className="text-[11px] text-slate-500">Tim baru akan otomatis tersimpan di browser dan langsung dikirim ke Cloud DB.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Tim *</label>
                <input
                  type="text"
                  required
                  value={newTeamCode}
                  onChange={e => setNewTeamCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tim *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bio-Sphere Prigen"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full p-2.5 border border-blue-500 rounded-xl font-bold text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Asal Sekolah SMP *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMP Negeri 2 Prigen"
                  value={newTeamSchool}
                  onChange={e => setNewTeamSchool(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Judul Inovasi Produk Sainspreneur *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Inovasi Media Tanam Substitusi Komposit Limbah..."
                  value={newTeamTitle}
                  onChange={e => setNewTeamTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bahan Baku Lokal Khas Pasuruan</label>
                <input
                  type="text"
                  placeholder="Contoh: Serat Ampas Tebu & Daun Pinus Prigen"
                  value={newTeamLocal}
                  onChange={e => setNewTeamLocal(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ketua Tim Siswa</label>
                <input
                  type="text"
                  placeholder="Nama Siswa Ketua"
                  value={newTeamLeader}
                  onChange={e => setNewTeamLeader(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guru Pendamping</label>
                <input
                  type="text"
                  placeholder="Nama Guru Pembina"
                  value={newTeamMentor}
                  onChange={e => setNewTeamMentor(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTeam(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Simpan & Daftarkan ke DB</span>
                </button>
              </div>
            </form>
          )}

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[11px] bg-blue-900 text-white px-2 py-0.5 rounded font-mono">
                        {t.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        DB Sync
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTeam({ ...t })}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Data Tim & Ubah Nama Tim"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteTeam(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Tim dari Sistem dan DB"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.school}</div>
                  <div className="text-base font-black text-blue-950 mb-1 leading-tight flex items-center justify-between">
                    <span>{t.name || `Tim ${t.school}`}</span>
                    <button
                      onClick={() => setEditingTeam({ ...t })}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer ml-2 flex-shrink-0"
                    >
                      Ubah
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-2 font-medium">
                    {t.productTitle}
                  </p>

                  <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/80 mb-3">
                    🌱 <strong>Bahan Lokal:</strong> {t.localResource}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>Ketua: <strong>{t.leader}</strong></div>
                  <div>Guru: <strong>{t.mentorTeacher}</strong></div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Edit Tim */}
          {editingTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Kode: {editingTeam.code}
                    </span>
                    <h3 className="text-lg font-black text-blue-950 mt-1">Edit Tim & Nama Tim</h3>
                    <p className="text-xs text-slate-500">Perubahan akan langsung disimpan dan disinkronkan ke database Google Sheets.</p>
                  </div>
                  <button
                    onClick={() => setEditingTeam(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSaveEditTeam} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Nama Tim *</span>
                      <span className="text-blue-700 font-bold text-[10px]">Paling Utama</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTeam.name}
                      onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })}
                      className="w-full p-2.5 border-2 border-blue-600 rounded-xl font-bold text-blue-950 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="Contoh: Bio-Sphere Prigen"
                    />
                    <p className="text-[11px] text-blue-800 mt-1">Nama tim ini tampil pada landing page, lembar penilaian dewan juri, rekap 10 besar, dan berkas PDF.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Asal Sekolah SMP *</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.school}
                      onChange={e => setEditingTeam({ ...editingTeam, school: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Judul Inovasi Produk Sainspreneur *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingTeam.productTitle}
                      onChange={e => setEditingTeam({ ...editingTeam, productTitle: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Bahan Baku Lokal Khas Pasuruan</label>
                      <input
                        type="text"
                        value={editingTeam.localResource || ''}
                        onChange={e => setEditingTeam({ ...editingTeam, localResource: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Ketua Tim Siswa</label>
                      <input
                        type="text"
                        value={editingTeam.leader || ''}
                        onChange={e => setEditingTeam({ ...editingTeam, leader: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Guru Pendamping</label>
                    <input
                      type="text"
                      value={editingTeam.mentorTeacher || ''}
                      onChange={e => setEditingTeam({ ...editingTeam, mentorTeacher: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingTeam(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <Check size={16} />
                      <span>Simpan & Sinkronkan ke DB</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- SUB TAB 4: PENGATURAN TAMPILAN & BACKGROUND ---------------- */}
      {activeSubTab === 'appearance' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  <Palette size={12} />
                  <span>Kustomisasi Estetika Portal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  Pengaturan Tampilan & Banner Hero Festival
                </h3>
                <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                  Banner grafis resmi ditampilkan secara proporsional dan responsif pada area Hero Landing Page berlatar biru resmi MGMP IPA. Seluruh halaman selanjutnya (Portal Juri, Admin, Lembar Penilaian) menggunakan warna biru resmi tanpa gambar latar belakang agar data penilaian tetap fokus dan mudah dibaca.
                </p>
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 self-stretch sm:self-auto justify-between sm:justify-start">
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-blue-200">Status Banner Hero</div>
                  <div className="text-xs font-black text-amber-300">
                    {localBg.enabled ? 'AKTIF (TAMPIL)' : 'NONAKTIF'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyBg({ enabled: !localBg.enabled })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    localBg.enabled ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-blue-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      localBg.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {bgSavedSuccess && (
              <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center gap-2 text-xs text-emerald-200 font-bold animate-fadeIn">
                <Check size={16} className="text-emerald-400" />
                <span>Pengaturan berhasil disimpan! Banner hero ditampilkan responsif pada latar biru resmi MGMP.</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Control Panel (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Presets Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-amber-500" />
                  <h4 className="font-bold text-slate-900 text-sm">Preset Tampilan Cepat</h4>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Pilih preset siap pakai yang dioptimalkan untuk estetika warna tema MGMP IPA:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleApplyBg({
                      opacity: 0.18,
                      brightness: 1.15,
                      saturation: 1.35,
                      blur: 2,
                      blendMode: 'soft-light',
                      enabled: true
                    })}
                    className="p-3 text-left rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-black text-amber-900 flex items-center justify-between">
                      <span>Cerah Alami</span>
                      <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-bold">Default</span>
                    </div>
                    <div className="text-[10px] text-amber-800/80 mt-1">Transparan 18%, Kecerahan 115%, Saturasi 135%</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBg({
                      opacity: 0.24,
                      brightness: 1.15,
                      saturation: 1.65,
                      blur: 1,
                      blendMode: 'soft-light',
                      enabled: true
                    })}
                    className="p-3 text-left rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-black text-blue-900">Vivid Dinamis</div>
                    <div className="text-[10px] text-blue-800/80 mt-1">Warna lebih hidup (Saturasi 165%, Opacity 24%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBg({
                      opacity: 0.12,
                      brightness: 1.22,
                      saturation: 1.20,
                      blur: 4,
                      blendMode: 'normal',
                      enabled: true
                    })}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-black text-slate-800">Transparan Halus</div>
                    <div className="text-[10px] text-slate-500 mt-1">Sangat lembut (Opacity 12%, Blur 4px)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBg({
                      opacity: 0.08,
                      brightness: 1.05,
                      saturation: 1.10,
                      blur: 6,
                      blendMode: 'soft-light',
                      enabled: true
                    })}
                    className="p-3 text-left rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-black text-purple-900">Subtil Minimalis</div>
                    <div className="text-[10px] text-purple-800/80 mt-1">Sentuhan samar (Opacity 8%, Blur 6px)</div>
                  </button>
                </div>
              </div>

              {/* Slider Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-blue-800" />
                    <h4 className="font-bold text-slate-900 text-sm">Slider Penyesuaian Visual</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyBg(DEFAULT_BACKGROUND_CONFIG)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    Reset Nilai Default
                  </button>
                </div>

                {/* 1. Opacity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Tingkat Transparansi (Opacity)</span>
                    </label>
                    <span className="font-mono font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {Math.round(localBg.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.01"
                    value={localBg.opacity}
                    onChange={(e) => handleApplyBg({ opacity: parseFloat(e.target.value) })}
                    className="w-full accent-blue-900 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>5% (Sangat Samar)</span>
                    <span>20% (Ideal)</span>
                    <span>50% (Tegas)</span>
                  </div>
                </div>

                {/* 2. Brightness Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sun size={14} className="text-amber-500" />
                      <span>Tingkat Kecerahan (Brightness)</span>
                    </label>
                    <span className="font-mono font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {Math.round(localBg.brightness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.60"
                    step="0.05"
                    value={localBg.brightness}
                    onChange={(e) => handleApplyBg({ brightness: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>80% (Redup)</span>
                    <span>115% (Cerah Bersih)</span>
                    <span>160% (Sangat Terang)</span>
                  </div>
                </div>

                {/* 3. Saturation Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette size={14} className="text-emerald-600" />
                      <span>Penyesuaian Saturasi Warna (Saturation)</span>
                    </label>
                    <span className="font-mono font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {Math.round(localBg.saturation * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="2.50"
                    step="0.05"
                    value={localBg.saturation}
                    onChange={(e) => handleApplyBg({ saturation: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>80% (Natural Pudar)</span>
                    <span>135% (Warna Hidup & Tajam)</span>
                    <span>250% (Sangat Kaya Warna)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    💡 <em>Saturasi lebih tinggi (130%–160%) membuat warna ilustrasi banner tetap cerah dan tidak tampak pudar saat dibuat transparan.</em>
                  </p>
                </div>

                {/* 4. Blur Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Eye size={14} className="text-indigo-600" />
                      <span>Tingkat Kehalusan Blur (Blur Effect)</span>
                    </label>
                    <span className="font-mono font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {localBg.blur}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={localBg.blur}
                    onChange={(e) => handleApplyBg({ blur: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0px (Jelas Tajam)</span>
                    <span>2px (Optimal Halus)</span>
                    <span>15px (Efek Ambient Kuat)</span>
                  </div>
                </div>

                {/* 5. Blend Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Metode Pembauran Warna (Mix Blend Mode)
                  </label>
                  <select
                    value={localBg.blendMode}
                    onChange={(e) => handleApplyBg({ blendMode: e.target.value as any })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-blue-800"
                  >
                    <option value="soft-light">soft-light (Direkomendasikan - Pembauran paling natural dan cerah)</option>
                    <option value="normal">normal (Standar transparansi tanpa efek blend)</option>
                    <option value="overlay">overlay (Kontras tinggi antara terang dan gelap)</option>
                    <option value="screen">screen (Lebih terang dan berkilau)</option>
                    <option value="multiply">multiply (Mempertegas bayangan warna)</option>
                  </select>
                </div>

                {/* 6. URL Sumber Gambar */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Tautan Gambar Banner Latar
                  </label>
                  <input
                    type="text"
                    value={localBg.imageUrl}
                    onChange={(e) => handleApplyBg({ imageUrl: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl font-mono"
                    placeholder="URL gambar..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleApplyBg({ imageUrl: '/hero_banner.jpg' })}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                    >
                      📁 Gunakan Berkas Lokal (/hero_banner.jpg)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBg({ imageUrl: 'https://lh3.googleusercontent.com/d/1nRAZr5CqlZ42JTv-w9SM6D2850H1MDk_' })}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                    >
                      🌐 Gunakan URL Google Drive Asli
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-blue-900" />
                    <h4 className="font-bold text-slate-900 text-sm">Pratinjau Langsung (Live Preview)</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">
                    Aktif Real-Time
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  Simulasi tampilan kartu dan konten teks di atas background dengan konfigurasi saat ini:
                </p>

                {/* Preview Box Container */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 min-h-[380px] bg-slate-100 p-4 flex flex-col justify-between shadow-inner">
                  {/* The Simulated Background Layer */}
                  {localBg.enabled ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-all duration-300 pointer-events-none"
                      style={{
                        backgroundImage: `url('${localBg.imageUrl}')`,
                        opacity: localBg.opacity,
                        filter: `brightness(${localBg.brightness}) saturate(${localBg.saturation}) blur(${localBg.blur}px)`,
                        mixBlendMode: localBg.blendMode as any,
                        transform: 'scale(1.05)'
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-xs">
                      Background Dinonaktifkan
                    </div>
                  )}

                  {/* Ambient subtle gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-slate-100/60 pointer-events-none" />

                  {/* Sample Content Layers */}
                  <div className="relative z-10 space-y-3">
                    {/* Sample Header Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src="/logo_pemkab.png" alt="Pemkab" className="w-5 h-6 object-contain bg-white rounded p-0.5 shadow-xs" />
                        <img src="/logo_mgmp.png" alt="MGMP" className="w-5 h-6 object-contain bg-white rounded p-0.5 shadow-xs" />
                        <span className="text-[10px] font-black uppercase text-blue-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-xs">
                          PSF 2026
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded backdrop-blur-xs">
                        MGMP IPA
                      </span>
                    </div>

                    {/* Sample Simulated Card */}
                    <div className="bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                          TIM-01
                        </span>
                        <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Skor: 92.50
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mt-1">SMPN 2 Prigen</h5>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                        METASUB-ESPEROGEN: Media Tanam Limbah Tebu & Daun Pinus untuk Green Economy UMKM.
                      </p>
                    </div>

                    {/* Sample Second Mini Card */}
                    <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white rounded-xl p-3 shadow-md border border-blue-800">
                      <div className="text-[11px] font-black text-amber-400">Klasemen 10 Besar Teratas</div>
                      <div className="text-[10px] text-blue-200 mt-0.5">Kontras warna tetap terbaca sempurna di semua device.</div>
                    </div>
                  </div>

                  {/* Summary Values Bar */}
                  <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-xl p-2.5 border border-slate-200 text-[11px] text-slate-700 flex justify-between items-center mt-4">
                    <span>
                      Opacity: <strong>{Math.round(localBg.opacity * 100)}%</strong> | Sat: <strong>{Math.round(localBg.saturation * 100)}%</strong>
                    </span>
                    <span className="font-mono text-[10px] text-blue-800 font-bold">
                      {localBg.blendMode}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleApplyBg(DEFAULT_BACKGROUND_CONFIG)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    Standar MGMP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateBgConfig(localBg);
                      setBgSavedSuccess(true);
                      setTimeout(() => setBgSavedSuccess(false), 2500);
                    }}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Simpan Pengaturan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB TAB 5: WEB CONFIG & CLOUD DATABASE SYNC ---------------- */}
      {activeSubTab === 'gas' && (
        <div className="space-y-6">
          {/* Header Card: Status Koneksi Real-Time dengan Indikator Hijau Berkedip */}
          <div className="p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-blue-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
                  <Database size={30} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                      Cloud Web Config Active
                    </span>
                    {/* Indikator Hijau Berkedip */}
                    <DbLiveIndicator size="md" variant="glass" showLatency={true} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Pusat Konfigurasi & Sinkronisasi Database (Web Config)
                  </h3>
                  <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                    Kelola integrasi dua arah (kirim & tarik data) antara aplikasi penilaian dengan Google Apps Script Web App dan Spreadsheet Google Drive MGMP IPA SMP Kab. Pasuruan.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Tarik & Kirim Data */}
              <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
                <button
                  type="button"
                  onClick={handleExecutePull}
                  disabled={isPulling}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  title="Tarik data terbaru juri, tim, dan lembar nilai dari Google Sheets"
                >
                  <CloudDownload size={16} className={isPulling ? 'animate-bounce' : ''} />
                  <span>{isPulling ? 'Menarik Data...' : '📥 Tarik Data dari DB'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExecutePush}
                  disabled={isPushing}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  title="Kirim seluruh data lokal (juri, tim, penilaian) ke Google Sheets"
                >
                  <CloudUpload size={16} className={isPushing ? 'animate-bounce' : ''} />
                  <span>{isPushing ? 'Mengirim Data...' : '📤 Kirim Data ke DB'}</span>
                </button>

                <button
                  type="button"
                  disabled={isClearingDummies}
                  onClick={handleClearAllDummyJudges}
                  className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Bersihkan semua akun juri dummy di database Cloud & lokal"
                >
                  <Trash2 size={15} />
                  <span>{isClearingDummies ? 'Membersihkan...' : '🗑️ Bersihkan Dummy DB'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackupJson}
                  className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Unduh berkas JSON cadangan seluruh database"
                >
                  <FileJson size={15} />
                  <span>Cadangan JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJsonModal(!showJsonModal)}
                  className="px-3 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Impor atau tempel data JSON cadangan"
                >
                  <span>📥 Impor JSON</span>
                </button>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncFeedback && (
              <div className={`mt-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold animate-fadeIn ${
                syncFeedback.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : 'bg-rose-500/20 border-rose-400/50 text-rose-200'
              }`}>
                {syncFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{syncFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Modal / Panel Impor JSON (Opsional jika dibuka) */}
          {showJsonModal && (
            <div className="bg-white rounded-2xl border border-amber-300 p-5 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileJson size={18} className="text-amber-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">Impor / Pulihkan Database dari Teks JSON</h4>
                </div>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  Tutup ✕
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Tempelkan isi berkas JSON cadangan di bawah ini untuk memulihkan tim, juri, dan nilai:
              </p>
              <textarea
                rows={5}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"teams": [...], "judges": [...], "evaluations": [...]}'
                className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Terapkan & Pulihkan Data
                </button>
              </div>
            </div>
          )}

          {/* Metric Overview (4 Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Sekolah Peserta di DB</div>
              <div className="text-2xl font-black text-blue-900 mt-1">{teams.length} Sekolah</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">19 Folder Drive Resmi</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Dewan Juri Terdaftar</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{judges.length} Juri</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Sesuai Tabel DB 'Judges'</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Lembar Nilai Terisi</div>
              <div className="text-2xl font-black text-purple-700 mt-1">{evaluations.length} Lembar</div>
              <div className="text-[11px] text-blue-600 font-medium mt-1">Tersimpan di Sheet 'Evaluations'</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Mode Sinkronisasi</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {cloudCfg.autoSyncEnabled ? 'AUTO LIVE' : 'MANUAL'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Interval: {cloudCfg.autoSyncIntervalSec}s</div>
            </div>
          </div>

          {/* Form Pengaturan Web Config (Cloud Configuration) */}
          <form onSubmit={handleSaveWebConfig} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                  <Settings size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Parameter Web Config Cloud</h4>
                  <p className="text-xs text-slate-500">Sesuaikan endpoint Apps Script dan target spreadsheet database.</p>
                </div>
              </div>

              {cfgSavedSuccess && (
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Konfigurasi Berhasil Disimpan!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Endpoint Web App URL */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Google Apps Script Web App Endpoint URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={cloudCfg.endpointUrl}
                    onChange={(e) => setCloudCfg({ ...cloudCfg, endpointUrl: e.target.value })}
                    className="flex-1 text-xs p-3 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    required
                  />
                  <a
                    href={cloudCfg.endpointUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                  >
                    <span>Uji Endpoint</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  URL Web App yang diperoleh dari Google Apps Script Editor via menu <em>Deploy &gt; Penerapan Baru &gt; Aplikasi Web</em>.
                </p>
              </div>

              {/* ID Folder Google Drive */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Google Drive Folder ID
                </label>
                <input
                  type="text"
                  value={cloudCfg.driveFolderId}
                  onChange={(e) => setCloudCfg({ ...cloudCfg, driveFolderId: e.target.value })}
                  className="w-full text-xs p-3 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <a
                  href={`https://drive.google.com/drive/folders/${cloudCfg.driveFolderId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <span>Buka Folder Drive Database</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              {/* Nama Spreadsheet */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama File Spreadsheet Database
                </label>
                <input
                  type="text"
                  value={cloudCfg.spreadsheetName}
                  onChange={(e) => setCloudCfg({ ...cloudCfg, spreadsheetName: e.target.value })}
                  className="w-full text-xs p-3 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Spreadsheet akan otomatis dibuat di folder Google Drive jika belum ada.
                </p>
              </div>

              {/* Auto Sync Toggle */}
              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-3">
                <div>
                  <div className="font-extrabold text-xs text-slate-900">Sinkronisasi Otomatis Berkala (Auto-Sync)</div>
                  <div className="text-[11px] text-slate-500">
                    Menarik pembaruan skor dan juri baru dari database cloud secara otomatis di latar belakang setiap 60 detik.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCloudCfg({ ...cloudCfg, autoSyncEnabled: !cloudCfg.autoSyncEnabled })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    cloudCfg.autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      cloudCfg.autoSyncEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Check size={14} />
                <span>Simpan Perubahan Web Config</span>
              </button>
            </div>
          </form>

          {/* Sync Activity Log Console */}
          <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-emerald-400" />
                <h4 className="font-black text-white text-sm">Riwayat Aktivitas Sinkronisasi (Sync Activity Log)</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  CloudSync.clearLogs();
                  setSyncLogs(CloudSync.getLogs());
                }}
                className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Bersihkan Log
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-2 font-mono text-[11px]">
              {syncLogs.length === 0 ? (
                <div className="text-slate-500 italic py-4 text-center">Belum ada riwayat aktivitas sinkronisasi.</div>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 whitespace-nowrap text-[10px]">[{log.timestamp}]</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      log.action === 'PULL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                      log.action === 'PUSH' ? 'bg-blue-950 text-blue-400 border border-blue-500/40' :
                      'bg-purple-950 text-purple-400 border border-purple-500/40'
                    }`}>
                      {log.action}
                    </span>
                    <span className={`flex-1 ${
                      log.status === 'success' ? 'text-emerald-300' :
                      log.status === 'warning' ? 'text-amber-300' : 'text-rose-400'
                    }`}>
                      {log.message}
                      {log.details && <span className="block text-slate-500 text-[10px] mt-0.5">{log.details}</span>}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panduan Deployment ke Apps Script */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-black text-slate-900 text-base mb-2">
              Panduan Deployment Backend Google Apps Script (Code.gs)
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              File <code>Code.gs</code> telah dilengkapi fungsi <code>doGet(e)</code> untuk menarik data dan <code>doPost(e)</code> untuk menerima data secara live dari aplikasi ini ke Google Sheets:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mb-4">
              <li>Buka editor Google Apps Script di proyek Anda.</li>
              <li>Salin seluruh kode dari file <code>Code.gs</code> di aplikasi ini ke editor Apps Script.</li>
              <li>Pastikan file <strong>Index.html</strong> juga dibuat dengan isi dari <code>gas_Index.html</code>.</li>
              <li>Klik menu <strong>Terapkan (Deploy) &gt; Penerapan Baru (New Deployment)</strong>:
                <ul className="list-disc list-inside ml-6 mt-1 text-slate-600 space-y-1">
                  <li>Pilih jenis: <strong>Aplikasi Web (Web App)</strong></li>
                  <li>Jalankan sebagai: <strong>Saya (email Anda)</strong></li>
                  <li>Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong> <span className="text-amber-700 font-bold">(Wajib agar sinkronisasi lancar)</span></li>
                </ul>
              </li>
              <li>Salin URL Web App yang dihasilkan ke kolom <strong>Web App Endpoint URL</strong> di atas.</li>
            </ol>
          </div>

          {/* Reset Defaults */}
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-rose-950 text-xs">Reset Data ke Pengaturan Standar</div>
              <div className="text-[11px] text-rose-800">
                Kembalikan data tim, akun juri, dan contoh penilaian awal dari panduan MGMP IPA.
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi default?')) {
                  onResetDefaults();
                }
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reset Data Default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
