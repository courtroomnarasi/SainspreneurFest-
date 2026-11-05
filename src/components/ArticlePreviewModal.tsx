import React, { useState } from 'react';
import { X, FileText, ExternalLink, School, Video, FolderOpen, BookOpen, Play } from 'lucide-react';
import { Team } from '../types';

interface ArticlePreviewModalProps {
  team: Team | null;
  onClose: () => void;
  initialMode?: 'pdf' | 'video' | 'summary';
}

export const ArticlePreviewModal: React.FC<ArticlePreviewModalProps> = ({
  team,
  onClose,
  initialMode = 'pdf'
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'video' | 'summary'>(initialMode);

  if (!team) return null;

  // Extract Google Drive file IDs safely
  const getDriveId = (id?: string, url?: string) => {
    if (id) return id;
    if (!url) return '';
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  };

  const articleDriveId = getDriveId(team.articleFileId, team.articleUrl);
  const videoDriveId = getDriveId(team.videoFileId, team.videoUrl);

  const directArticleUrl = articleDriveId
    ? `https://drive.google.com/file/d/${articleDriveId}/view?usp=drive_web`
    : team.articleUrl;
  const embedArticleUrl = articleDriveId
    ? `https://drive.google.com/file/d/${articleDriveId}/preview`
    : '';

  const directVideoUrl = videoDriveId
    ? `https://drive.google.com/file/d/${videoDriveId}/view?usp=drive_web`
    : team.videoUrl;
  const embedVideoUrl = videoDriveId
    ? `https://drive.google.com/file/d/${videoDriveId}/preview`
    : '';

  const directFolderUrl = team.folderId
    ? `https://drive.google.com/drive/folders/${team.folderId}`
    : team.folderUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-4 sm:p-5 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 flex-shrink-0">
              {viewMode === 'video' ? <Video size={22} /> : <FileText size={22} />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-400 text-blue-950">
                  {team.code}
                </span>
                <span className="text-xs font-extrabold text-amber-300 truncate">
                  {team.school} — {team.name}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black leading-tight line-clamp-1 mt-0.5">
                {team.productTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation & Direct File Links Ribbon */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'pdf'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <FileText size={14} />
              <span>📄 File Makalah PDF Asli</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('video')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'video'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Play size={14} />
              <span>🎬 Putar Video Karya (.mp4)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'summary'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <BookOpen size={14} />
              <span>📋 Ringkasan & Abstrak</span>
            </button>
          </div>

          {/* Direct External Drive File Links */}
          <div className="flex flex-wrap items-center gap-2">
            {directArticleUrl && (
              <a
                href={directArticleUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                title={team.articleFileName || 'Buka File Makalah PDF di Google Drive'}
              >
                <FileText size={13} />
                <span>Buka File Makalah</span>
                <ExternalLink size={12} />
              </a>
            )}
            {directVideoUrl && (
              <a
                href={directVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                title={team.videoFileName || 'Buka File Video MP4 di Google Drive'}
              >
                <Video size={13} />
                <span>Buka File Video</span>
                <ExternalLink size={12} />
              </a>
            )}
            {directFolderUrl && (
              <a
                href={directFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                title="Buka Folder Google Drive Peserta"
              >
                <FolderOpen size={13} />
                <span>Folder Peserta</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* File Info Bar */}
        <div className="bg-blue-50/80 border-b border-blue-200/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-950">
          <div className="flex items-center gap-2 truncate">
            <School size={14} className="text-blue-700 flex-shrink-0" />
            <span className="font-bold">{team.school}</span>
            <span>•</span>
            <span className="truncate">
              {viewMode === 'video' ? (
                <>Berkas Video: <strong className="font-mono">{team.videoFileName || 'Video_Karya_Peserta.mp4'}</strong></>
              ) : (
                <>Berkas Makalah: <strong className="font-mono">{team.articleFileName || 'Makalah_Sainspreneur.pdf'}</strong></>
              )}
            </span>
          </div>
          <div className="text-slate-600 font-medium">
            Ketua: <strong>{team.leader}</strong> | Pembimbing: <strong>{team.mentorTeacher}</strong>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-900 relative">
          {viewMode === 'pdf' && embedArticleUrl ? (
            <iframe
              src={embedArticleUrl}
              title={`Makalah ${team.school}`}
              className="w-full h-full border-0 bg-white"
              allow="autoplay"
            />
          ) : viewMode === 'video' && embedVideoUrl ? (
            <iframe
              src={embedVideoUrl}
              title={`Video ${team.school}`}
              className="w-full h-full border-0 bg-black"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="bg-white min-h-full p-6 space-y-6 text-xs text-slate-700 font-serif leading-relaxed">
              {/* Title and Author in Paper format */}
              <div className="text-center font-sans border-b border-slate-200 pb-5">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {team.productTitle.toUpperCase()}
                </h1>
                <div className="text-xs font-bold text-blue-900 mt-2">
                  {team.members.join(', ')}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Guru Pendamping: {team.mentorTeacher} | {team.school}
                </div>
              </div>

              {/* Abstrak */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 font-sans">
                <div className="text-center font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">
                  Abstrak
                </div>
                <p className="text-xs text-slate-700 text-justify italic">
                  {team.articleAbstract ||
                    'Penelitian dan rekayasa produk Sainspreneur ini mengeksplorasi potensi komoditas lokal Kabupaten Pasuruan dengan pendekatan sains terapan yang ramah lingkungan. Dilakukan serangkaian uji formulasi, karakteristik fisik dan keamanan, serta analisis ekonomi kelayakan bisnis dengan target pasar terukur.'}
                </p>
                <div className="text-[11px] font-bold text-blue-900 mt-2">
                  Kata Kunci: <span className="font-normal italic">Sainspreneur, {team.localResource}, Pasuruan, Inovasi Produk</span>
                </div>
              </div>

              {/* Section 1: Latar Belakang */}
              <section className="space-y-1.5 font-sans">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  1. Latar Belakang & Rumusan Masalah
                </h4>
                <p className="text-justify leading-relaxed text-slate-700">
                  {team.articleSummary?.background}
                </p>
              </section>

              {/* Section 2: Teori Sains */}
              <section className="space-y-1.5 font-sans">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  2. Kedalaman Teori IPA & Orisinalitas Inovasi
                </h4>
                <p className="text-justify leading-relaxed text-slate-700">
                  {team.articleSummary?.scienceTheory}
                </p>
              </section>

              {/* Section 3: Metodologi */}
              <section className="space-y-1.5 font-sans">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  3. Metodologi & Alur Produksi
                </h4>
                <p className="text-justify leading-relaxed text-slate-700">
                  {team.articleSummary?.methodology}
                </p>
              </section>

              {/* Section 4: Kelayakan Bisnis */}
              <section className="space-y-1.5 font-sans">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  4. Kelayakan Bisnis 4P & Perhitungan HPP
                </h4>
                <p className="text-justify leading-relaxed text-slate-700">
                  {team.articleSummary?.businessModel}
                </p>
              </section>

              {/* Section 5: Pemanfaatan Bahan Lokal */}
              <section className="space-y-1.5 font-sans">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  5. Pemanfaatan Bahan Lokal & Dampak Lingkungan
                </h4>
                <p className="text-justify leading-relaxed text-slate-700">
                  {team.articleSummary?.localImpact}
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-3 px-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-600 font-medium">
            Sumber Resmi: Folder Google Drive Peserta ({team.code} - {team.school})
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
