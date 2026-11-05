import React from 'react';
import { Award, Shield, UserCheck, FileText, Code2, LogIn, LogOut, ExternalLink } from 'lucide-react';
import { Judge } from '../types';
import { GOOGLE_DRIVE_DB_URL } from '../data/initialData';
import { DbLiveIndicator } from './DbLiveIndicator';

interface HeaderProps {
  activeTab: 'landing' | 'judge' | 'admin' | 'gas';
  setActiveTab: (tab: 'landing' | 'judge' | 'admin' | 'gas') => void;
  currentUser: { role: 'admin' | 'judge'; judge?: Judge } | null;
  onOpenLogin: (preferredRole?: 'admin' | 'judge') => void;
  onLogout: () => void;
  onOpenRubric: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenRubric
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-900/10 shadow-sm">
      {/* Top Banner Ribbon: MGMP Official Royal Blue Gradient */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider font-sans">
              Resmi 2026
            </span>
            <span className="font-medium text-slate-200">
              Musyawarah Guru Mata Pelajaran (MGMP) IPA SMP Kabupaten Pasuruan
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span className="hidden lg:inline text-[11px] text-blue-200">📍 Tahap 2: 1–13 Nov 2026 | Final: 18 Nov</span>
            {/* Live blinking green indicator for DB connection */}
            <DbLiveIndicator size="sm" variant="glass" showLatency={false} />
            {isAdmin && (
              <a
                href={GOOGLE_DRIVE_DB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium underline underline-offset-2 transition-colors"
                title="Akses Database Google Drive (Admin)"
              >
                <span>Drive Database</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Official Header Kop */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logos & Institution Branding */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('landing')}>
          {/* Official Pemkab Pasuruan Seal */}
          <div className="w-12 h-14 sm:w-14 sm:h-16 flex-shrink-0 bg-white p-1 rounded-md shadow-xs border border-slate-200 flex items-center justify-center">
            <img
              src="/logo_pemkab.png"
              alt="Logo Pemkab Pasuruan"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>

          {/* Official MGMP IPA SMP Pasuruan Emblem */}
          <div className="w-12 h-14 sm:w-14 sm:h-16 flex-shrink-0 bg-white p-1 rounded-md shadow-xs border border-slate-200 flex items-center justify-center">
            <img
              src="/logo_mgmp.png"
              alt="Logo MGMP IPA SMP Kab. Pasuruan"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title and Tagline */}
          <div className="border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Lomba Sainspreneur
              </span>
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                10 Besar Finalis
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              PASURUAN SCIENCE FESTIVAL <span className="text-blue-700">2026</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem Penilaian Dewan Juri & Pemeringkatan Resmi Berbasis Pedoman Baku
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Role Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Beranda */}
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'landing'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
            }`}
          >
            <Award size={15} />
            <span>Beranda</span>
          </button>

          {/* Tab Juri */}
          <button
            onClick={() => {
              if (currentUser?.role === 'judge') {
                setActiveTab('judge');
              } else {
                onOpenLogin('judge');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'judge'
                ? 'bg-blue-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-800 hover:bg-slate-100'
            }`}
          >
            <UserCheck size={15} />
            <span>Ruang Juri</span>
            {currentUser?.role === 'judge' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Tab Admin */}
          <button
            onClick={() => {
              if (currentUser?.role === 'admin') {
                setActiveTab('admin');
              } else {
                onOpenLogin('admin');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield size={15} />
            <span>Panel Admin</span>
            {currentUser?.role === 'admin' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Pedoman & Rubrik */}
          <button
            onClick={onOpenRubric}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
            title="Buka Pedoman & Rubrik Penilaian Lengkap"
          >
            <FileText size={15} className="text-blue-600" />
            <span className="hidden sm:inline">Pedoman & Rubrik</span>
          </button>

          {/* Google Apps Script Modal Trigger - ONLY SHOWN TO ADMIN */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('gas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'gas'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
              title="Lihat Kode Apps Script (Khusus Admin)"
            >
              <Code2 size={15} />
              <span className="hidden sm:inline">Apps Script</span>
            </button>
          )}

          {/* User Session Badge / Login button */}
          <div className="border-l border-slate-200 pl-2 ml-1">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.role === 'admin' ? 'Administrator' : currentUser.judge?.name || 'Dewan Juri'}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">
                    {currentUser.role === 'admin' ? 'Akses Penuh' : 'Juri Penilai'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  title="Keluar (Logout)"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenLogin()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shadow-blue-700/20"
              >
                <LogIn size={14} />
                <span>Masuk Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
