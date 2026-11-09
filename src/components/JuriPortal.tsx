import React, { useState } from 'react';
import { UserCheck, CheckCircle2, Clock, AlertCircle, FileEdit, Download, Search, School, ExternalLink, Play, FileText, Video, FolderOpen, Eye } from 'lucide-react';
import { Team, Judge, Evaluation } from '../types';
import { EvaluationForm } from './EvaluationForm';
import { ArticlePreviewModal } from './ArticlePreviewModal';
import { generateSchoolPDF } from '../utils/pdfGenerator';
import { calculateSingleArticleScore, calculateSingleVideoScore } from '../utils/tieBreaker';
import { DbLiveIndicator } from './DbLiveIndicator';
import { INITIAL_TEAMS } from '../data/initialData';

interface JuriPortalProps {
  judge: Judge;
  teams: Team[];
  evaluations: Evaluation[];
  onSaveEvaluation: (evaluation: Evaluation) => void;
}

export const JuriPortal: React.FC<JuriPortalProps> = ({
  judge,
  teams,
  evaluations,
  onSaveEvaluation
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [previewModalState, setPreviewModalState] = useState<{ team: Team; mode: 'pdf' | 'video' | 'summary' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unrated' | 'draft' | 'submitted'>('all');

  const judgeEvaluations = evaluations.filter(
    e =>
      e.judgeId === judge.id ||
      (judge.username.toLowerCase() === 'juri-002' &&
        (e.judgeId === 'juri-1794186758033' ||
          e.judgeName.toLowerCase().includes('akhmad nasor')))
  );

  const getTeamEvaluation = (teamId: string) => {
    return judgeEvaluations.find(e => e.teamId === teamId);
  };

  // Enrich team with exact Drive file IDs from INITIAL_TEAMS if needed
  const getEnrichedTeam = (t: Team): Team => {
    const official = INITIAL_TEAMS.find(it => it.id === t.id || it.code === t.code);
    if (!official) return t;
    const hasInvalidVideo = !t.videoUrl || t.videoUrl.includes('youtube.com') || t.videoUrl.includes('youtu.be');
    const hasGenericArticle = !t.articleUrl || t.articleUrl.includes('/folders/');
    return {
      ...official,
      ...t,
      folderId: t.folderId || official.folderId,
      folderUrl: t.folderUrl || official.folderUrl,
      videoFileId: t.videoFileId || official.videoFileId,
      videoFileName: t.videoFileName || official.videoFileName,
      videoUrl: hasInvalidVideo ? official.videoUrl : t.videoUrl,
      videoThumbnailUrl: (!t.videoThumbnailUrl || t.videoThumbnailUrl.includes('unsplash.com')) ? official.videoThumbnailUrl : t.videoThumbnailUrl,
      articleFileId: t.articleFileId || official.articleFileId,
      articleFileName: t.articleFileName || official.articleFileName,
      articleUrl: hasGenericArticle ? official.articleUrl : t.articleUrl
    };
  };

  const enrichedTeams = teams.map(getEnrichedTeam);

  const filteredTeams = enrichedTeams.filter(team => {
    const matchesSearch =
      team.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const ev = getTeamEvaluation(team.id);
    if (statusFilter === 'all') return true;
    if (statusFilter === 'unrated') return !ev;
    if (statusFilter === 'draft') return ev?.status === 'draft';
    if (statusFilter === 'submitted') return ev?.status === 'submitted';
    return true;
  });

  const submittedCount = judgeEvaluations.filter(e => e.status === 'submitted').length;
  const draftCount = judgeEvaluations.filter(e => e.status === 'draft').length;
  const unratedCount = Math.max(0, teams.length - judgeEvaluations.length);

  if (selectedTeam) {
    const enrichedSelected = getEnrichedTeam(selectedTeam);
    const existingEval = getTeamEvaluation(enrichedSelected.id);
    return (
      <>
        <EvaluationForm
          team={enrichedSelected}
          judge={judge}
          existingEvaluation={existingEval}
          onSave={(ev) => {
            onSaveEvaluation(ev);
            setSelectedTeam(null);
          }}
          onBack={() => setSelectedTeam(null)}
          onOpenArticlePreview={() => setPreviewModalState({ team: enrichedSelected, mode: 'pdf' })}
          onOpenVideoPreview={() => setPreviewModalState({ team: enrichedSelected, mode: 'video' })}
        />
        <ArticlePreviewModal
          team={previewModalState?.team || null}
          initialMode={previewModalState?.mode || 'pdf'}
          onClose={() => setPreviewModalState(null)}
        />
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome & Judge Profile Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden border border-blue-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-amber-400 shadow-inner">
              <UserCheck size={32} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  <span>Dewan Juri Terverifikasi</span>
                </div>
                <DbLiveIndicator size="sm" variant="glass" showLatency={true} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black">{judge.name}</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {judge.institution} {judge.nip ? `• NIP: ${judge.nip}` : ''} • Username: <span className="font-mono text-amber-300 font-bold">{judge.username}</span>
              </p>
              <div className="text-[11px] text-amber-300 font-semibold mt-1">
                Keahlian: {judge.field}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-center px-3 py-1">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{submittedCount}</div>
              <div className="text-[11px] text-blue-100">Selesai Dinilai</div>
            </div>
            <div className="text-center px-3 py-1 border-x border-white/15">
              <div className="text-xl sm:text-2xl font-black text-amber-300">{draftCount}</div>
              <div className="text-[11px] text-blue-100">Draft Tersimpan</div>
            </div>
            <div className="text-center px-3 py-1">
              <div className="text-xl sm:text-2xl font-black text-white">{unratedCount}</div>
              <div className="text-[11px] text-blue-100">Belum Dinilai</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode tim, nama tim, sekolah SMP, atau judul inovasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({teams.length})
          </button>
          <button
            onClick={() => setStatusFilter('unrated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'unrated'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Belum Dinilai ({unratedCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Draft ({draftCount})
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'submitted'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Selesai Dinilai ({submittedCount})
          </button>
        </div>
      </div>

      {/* Grid of Teams with Real Google Drive Video Thumbnail & Makalah Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map(team => {
          const ev = getTeamEvaluation(team.id);
          const isSubmitted = ev?.status === 'submitted';
          const isDraft = ev?.status === 'draft';

          const artScore = ev ? calculateSingleArticleScore(ev.articleScore) : 0;
          const vidScore = ev ? calculateSingleVideoScore(ev.videoScore) : 0;
          const approxTotal = ev ? Number(((artScore + vidScore) / 2).toFixed(2)) : null;

          const directVideoUrl = team.videoFileId
            ? `https://drive.google.com/file/d/${team.videoFileId}/view?usp=drive_web`
            : team.videoUrl;
          const directArticleUrl = team.articleFileId
            ? `https://drive.google.com/file/d/${team.articleFileId}/view?usp=drive_web`
            : team.articleUrl;
          const directFolderUrl = team.folderId
            ? `https://drive.google.com/drive/folders/${team.folderId}`
            : team.folderUrl;

          const thumbnail = team.videoFileId
            ? `https://drive.google.com/thumbnail?id=${team.videoFileId}&sz=w800`
            : (team.videoThumbnailUrl || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=640&q=80');

          return (
            <div
              key={team.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-lg flex flex-col justify-between ${
                isSubmitted
                  ? 'border-emerald-200 hover:border-emerald-400'
                  : isDraft
                  ? 'border-amber-200 hover:border-amber-400'
                  : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              {/* Video Thumbnail Header (Diambil Langsung dari File Video Google Drive Peserta) */}
              <div className="relative h-48 bg-slate-950 group overflow-hidden">
                <img
                  src={thumbnail}
                  alt={team.videoFileName || team.productTitle}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=640&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-black/30" />

                {/* Team Code & Status Badge over Thumbnail */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs bg-blue-900 text-white px-2.5 py-1 rounded-md shadow-md">
                      {team.code}
                    </span>
                    {directFolderUrl && (
                      <a
                        href={directFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-black/65 hover:bg-amber-400 text-amber-300 hover:text-blue-950 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-colors"
                        title="Buka Folder Google Drive Peserta"
                      >
                        <FolderOpen size={11} />
                        <span>Folder Drive</span>
                      </a>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                      isSubmitted
                        ? 'bg-emerald-600 text-white'
                        : isDraft
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-black/65 text-white backdrop-blur-xs'
                    }`}
                  >
                    {isSubmitted ? '✓ Selesai Dinilai' : isDraft ? '⏳ Draft' : 'Belum Dinilai'}
                  </span>
                </div>

                {/* Center Video Play Buttons: Direct Drive File & Inline Modal Player */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
                  <a
                    href={directVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer border-2 border-white/80"
                    title={`Buka Langsung File Video Peserta di Google Drive: ${team.videoFileName || ''}`}
                  >
                    <Play size={20} className="ml-0.5 fill-white" />
                  </a>
                </div>

                {/* Bottom Thumbnail Direct Links Bar */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-white">
                  <button
                    type="button"
                    onClick={() => setPreviewModalState({ team, mode: 'video' })}
                    className="bg-red-600/90 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    title="Putar Video Karya langsung di dalam Portal"
                  >
                    <Video size={12} />
                    <span>Putar Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewModalState({ team, mode: 'pdf' })}
                    className="bg-blue-600/95 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    title="Baca & Preview File Makalah PDF Peserta di dalam Portal"
                  >
                    <Eye size={12} />
                    <span>Preview Makalah</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1.5 text-xs text-blue-700 font-bold mb-1">
                    <div className="flex items-center gap-1.5">
                      <School size={14} />
                      <span>{team.school}</span>
                    </div>
                  </div>

                  <div className="text-sm font-black text-blue-950 mb-1">
                    Tim: {team.name || `Tim ${team.school}`}
                  </div>

                  <h3 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2 mb-2.5">
                    {team.productTitle}
                  </h3>

                  {/* Direct Google Drive Files Box (Klik Langsung Menuju File Video & Makalah Peserta) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 space-y-1.5 text-[11px]">
                    <div className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                      <span>Berkas Asli Peserta (Google Drive)</span>
                      {directFolderUrl && (
                        <a
                          href={directFolderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline font-bold flex items-center gap-0.5"
                        >
                          <span>Buka Folder</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    {/* Direct Link to Video File */}
                    <a
                      href={directVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-800 hover:text-red-700 transition-colors group/file"
                      title="Klik untuk membuka langsung file video (.mp4) peserta di Google Drive"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Video size={13} className="text-red-600 flex-shrink-0" />
                        <span className="truncate font-semibold">
                          {team.videoFileName || 'File Video Karya Peserta.mp4'}
                        </span>
                      </div>
                      <ExternalLink size={12} className="flex-shrink-0 text-slate-400 group-hover/file:text-red-600" />
                    </a>

                    {/* Direct Link to Makalah PDF File */}
                    <a
                      href={directArticleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-800 transition-colors group/file"
                      title="Klik untuk membuka langsung file makalah (.pdf) peserta di Google Drive"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText size={13} className="text-blue-700 flex-shrink-0" />
                        <span className="truncate font-semibold">
                          {team.articleFileName || 'File Makalah Peserta.pdf'}
                        </span>
                      </div>
                      <ExternalLink size={12} className="flex-shrink-0 text-slate-400 group-hover/file:text-blue-700" />
                    </a>
                  </div>

                  {/* Score details & Catatan Evaluasi Juri if evaluated */}
                  {ev ? (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 text-xs mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium">Artikel & Video</div>
                          <div className="font-bold text-slate-800">
                            {artScore} / {vidScore} Poin
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-blue-700 font-bold uppercase">Skor Anda</div>
                          <div className="text-base font-black text-blue-900">{approxTotal}</div>
                        </div>
                      </div>
                      {ev.feedback && (
                        <div className="pt-2 border-t border-blue-200/60 text-[11px] text-slate-700 leading-relaxed">
                          <div className="flex items-center justify-between text-[10px] font-bold text-blue-900 mb-0.5">
                            <span>Catatan Analisis Rubrik:</span>
                            <span className="text-emerald-700">{ev.feedback.length}/200 kar.</span>
                          </div>
                          <p className="italic text-slate-700">{ev.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2 text-[11px] text-amber-900 mb-3 flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-700 flex-shrink-0" />
                      <span>Menunggu penilaian artikel dan video oleh Anda.</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTeam(team)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSubmitted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                    }`}
                  >
                    <FileEdit size={14} />
                    <span>{isSubmitted ? 'Edit Penilaian' : 'Buka Lembar Penilaian'}</span>
                  </button>

                  <a
                    href={directArticleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 transition-colors"
                    title="Buka File Makalah PDF Peserta di Tab Baru"
                  >
                    <FileText size={16} />
                  </a>

                  <a
                    href={directVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition-colors"
                    title="Buka File Video MP4 Peserta di Tab Baru"
                  >
                    <Video size={16} />
                  </a>

                  {isSubmitted && (
                    <button
                      onClick={() => generateSchoolPDF(team, ev, evaluations, judge)}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                      title="Unduh Lembar Penilaian PDF Sekolah ini"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article & Video Preview Modal */}
      <ArticlePreviewModal
        team={previewModalState?.team || null}
        initialMode={previewModalState?.mode || 'pdf'}
        onClose={() => setPreviewModalState(null)}
      />
    </div>
  );
};
