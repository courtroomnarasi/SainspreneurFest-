/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { JuriPortal } from './components/JuriPortal';
import { AdminPortal } from './components/AdminPortal';
import { LoginModal } from './components/LoginModal';
import { RubricModal } from './components/RubricModal';
import { GasExportModal } from './components/GasExportModal';
import { Storage } from './utils/storage';
import { CloudSync } from './utils/cloudSync';
import { aggregateTeamsScores } from './utils/tieBreaker';
import { Team, Judge, Evaluation, BackgroundConfig } from './types';
import { GOOGLE_DRIVE_DB_URL } from './data/initialData';
import { ExternalLink, Heart, Shield, Award } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'judge' | 'admin' | 'gas'>('landing');
  const [currentUser, setCurrentUser] = useState<{ role: 'admin' | 'judge'; judge?: Judge } | null>(null);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isResultsPublished, setIsResultsPublished] = useState<boolean>(false);
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(() => Storage.getBackgroundConfig());

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPreferredRole, setLoginPreferredRole] = useState<'admin' | 'judge'>('judge');
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);

  // Load persistent data & check cloud sync
  useEffect(() => {
    setTeams(Storage.getTeams());
    setJudges(Storage.getJudges());
    setEvaluations(Storage.getEvaluations());
    setIsResultsPublished(Storage.getIsResultsPublished());
    const session = Storage.getUserSession();
    if (session) {
      setCurrentUser(session);
    }

    // Auto-sync pull in background if enabled
    const cfg = CloudSync.getConfig();
    if (cfg.autoSyncEnabled) {
      CloudSync.pullDataFromDb().then(res => {
        if (res.success && (res.teams?.length || res.judges?.length)) {
          setTeams(Storage.getTeams());
          setJudges(Storage.getJudges());
          setEvaluations(Storage.getEvaluations());
        }
      });
    }
  }, []);

  // Compute live scores and ranking with official tie-breaker
  const aggregatedScores = aggregateTeamsScores(teams, evaluations);

  const handleOpenLogin = (role: 'admin' | 'judge' = 'judge') => {
    setLoginPreferredRole(role);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (session: { role: 'admin' | 'judge'; judge?: Judge }) => {
    setCurrentUser(session);
    Storage.saveUserSession(session);
    if (session.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('judge');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    Storage.saveUserSession(null);
    setActiveTab('landing');
  };

  // Evaluation Handler - Saves locally and pushes to Cloud DB
  const handleSaveEvaluation = (evaluation: Evaluation) => {
    Storage.saveEvaluation(evaluation);
    setEvaluations(Storage.getEvaluations());
    // Push single evaluation to Cloud DB
    CloudSync.pushSingleEvaluation(evaluation);
  };

  // Judge Handlers - Saves locally and pushes to Cloud DB
  const handleAddJudge = (newJudge: Judge) => {
    const updated = [...judges, newJudge];
    setJudges(updated);
    Storage.saveJudges(updated);
    // Push new judge to Cloud DB
    CloudSync.pushNewJudge(newJudge);
  };

  const handleUpdateJudge = (updatedJudge: Judge) => {
    const updated = judges.map(j => (j.id === updatedJudge.id ? updatedJudge : j));
    setJudges(updated);
    Storage.saveJudges(updated);
    CloudSync.pushNewJudge(updatedJudge);
  };

  const handleDeleteJudge = (id: string) => {
    const judgeToDelete = judges.find(j => j.id === id);
    if (window.confirm(`Yakin ingin menghapus akun juri "${judgeToDelete?.name || id}" dari sistem dan database?`)) {
      const updated = judges.filter(j => j.id !== id);
      setJudges(updated);
      Storage.saveJudges(updated);
      CloudSync.pushDeleteJudge(id, judgeToDelete?.username);
    }
  };

  // Team Handlers - Tersambung Langsung ke DB Google Sheets
  const handleAddTeam = (newTeam: Team) => {
    const updated = [...teams, newTeam];
    setTeams(updated);
    Storage.saveTeams(updated);
    CloudSync.pushNewTeam(newTeam);
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    const updated = teams.map(t => (t.id === updatedTeam.id ? updatedTeam : t));
    setTeams(updated);
    Storage.saveTeams(updated);
    CloudSync.pushUpdateTeam(updatedTeam);
  };

  const handleDeleteTeam = (id: string) => {
    const teamToDelete = teams.find(t => t.id === id);
    if (window.confirm(`Yakin ingin menghapus tim "${teamToDelete?.name || id}" dari sistem dan database?`)) {
      const updated = teams.filter(t => t.id !== id);
      setTeams(updated);
      Storage.saveTeams(updated);
      CloudSync.pushDeleteTeam(id);
    }
  };

  const handleResetDefaults = () => {
    Storage.resetAllToDefault();
    setTeams(Storage.getTeams());
    setJudges(Storage.getJudges());
    setEvaluations(Storage.getEvaluations());
    setBgConfig(Storage.getBackgroundConfig());
    alert('Seluruh data berhasil direset ke data default awal!');
  };

  const handleUpdateBgConfig = (newConfig: BackgroundConfig) => {
    setBgConfig(newConfig);
    Storage.saveBackgroundConfig(newConfig);
  };

  // Cloud Sync Two-Way Handlers
  const handlePullDataFromCloud = async () => {
    const res = await CloudSync.pullDataFromDb();
    if (res.success) {
      setTeams(Storage.getTeams());
      setJudges(Storage.getJudges());
      setEvaluations(Storage.getEvaluations());
    }
    return res;
  };

  const handlePushDataToCloud = async () => {
    return await CloudSync.pushAllDataToDb({ teams, judges, evaluations });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-900 selection:text-white">
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Main Official Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={(tab) => {
              if (tab === 'gas') {
                setIsGasModalOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            currentUser={currentUser}
            onOpenLogin={handleOpenLogin}
            onLogout={handleLogout}
            onOpenRubric={() => setIsRubricModalOpen(true)}
          />

        {/* Dynamic View by Tab */}
        <main>
          {activeTab === 'landing' && (
            <LandingPage
              aggregatedScores={aggregatedScores}
              teams={teams}
              allEvaluations={evaluations}
              isPublished={isResultsPublished}
              isAdmin={currentUser?.role === 'admin'}
              onOpenLogin={handleOpenLogin}
              onOpenRubric={() => setIsRubricModalOpen(true)}
              onSelectSchool={() => {}}
            />
          )}

          {activeTab === 'judge' && (
            <>
              {currentUser?.role === 'judge' && currentUser.judge ? (
                <JuriPortal
                  judge={currentUser.judge}
                  teams={teams}
                  evaluations={evaluations}
                  onSaveEvaluation={handleSaveEvaluation}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto mb-4">
                    <Award size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Autentikasi Dewan Juri</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Silakan masuk dengan akun juri yang telah terdaftar untuk mengisi lembar penilaian dan rubrik resmi.
                  </p>
                  <button
                    onClick={() => handleOpenLogin('judge')}
                    className="mt-6 w-full py-3 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Masuk ke Ruang Juri
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'admin' && (
            <>
              {currentUser?.role === 'admin' ? (
                <AdminPortal
                  judges={judges}
                  teams={teams}
                  evaluations={evaluations}
                  aggregatedScores={aggregatedScores}
                  isPublished={isResultsPublished}
                  onTogglePublish={(val) => {
                    setIsResultsPublished(val);
                    Storage.saveIsResultsPublished(val);
                  }}
                  onAddJudge={handleAddJudge}
                  onUpdateJudge={handleUpdateJudge}
                  onDeleteJudge={handleDeleteJudge}
                  onAddTeam={handleAddTeam}
                  onUpdateTeam={handleUpdateTeam}
                  onDeleteTeam={handleDeleteTeam}
                  onResetDefaults={handleResetDefaults}
                  bgConfig={bgConfig}
                  onUpdateBgConfig={handleUpdateBgConfig}
                  onPullData={handlePullDataFromCloud}
                  onPushData={handlePushDataToCloud}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4">
                    <Shield size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Akses Khusus Administrator</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Masuk sebagai admin untuk menambah akun juri, mengelola tim, dan mencetak rekapitulasi 10 besar. (Username: <code>admin</code>, Password: <code>@1</code>)
                  </p>
                  <button
                    onClick={() => handleOpenLogin('admin')}
                    className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Masuk sebagai Admin
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Official Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Col 1: About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <img src="/logo_pemkab.png" alt="Pemkab Pasuruan" className="w-8 h-10 object-contain bg-white rounded p-0.5" />
                <img src="/logo_mgmp.png" alt="MGMP IPA SMP Pasuruan" className="w-8 h-10 object-contain bg-white rounded p-0.5" />
                <div>
                  <h4 className="font-black text-white text-sm">PASURUAN SCIENCE FESTIVAL 2026</h4>
                  <p className="text-[11px] text-slate-400">MGMP IPA SMP Kabupaten Pasuruan</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Wadah kompetisi sains terapan dan inovasi kewirausahaan (Sainspreneur) tingkat SMP se-Kabupaten Pasuruan yang mengangkat potensi komoditas unggulan lokal berbasis sains ramah lingkungan.
              </p>
            </div>

            {/* Col 2: Jadwal & Tahapan */}
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Jadwal Tahapan</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-amber-400 font-bold">1–13 Nov 2026:</span> Penjurian Tahap 2 (Artikel & Video)
                </li>
                <li>
                  <span className="text-amber-400 font-bold">14 Nov 2026:</span> Penetapan & Pengumuman 10 Besar
                </li>
                <li>
                  <span className="text-amber-400 font-bold">18 Nov 2026:</span> Babak Final & Pameran Produk Fisik
                </li>
              </ul>
            </div>

            {/* Col 3: Repositori & Link */}
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Tautan Informasi</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setIsRubricModalOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Pedoman Rubrik Penilaian
                  </button>
                </li>
                {currentUser?.role === 'admin' && (
                  <>
                    <li>
                      <a
                        href={GOOGLE_DRIVE_DB_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <span>Folder Google Drive DB</span>
                        <ExternalLink size={12} />
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={() => setIsGasModalOpen(true)}
                        className="hover:text-white transition-colors cursor-pointer text-left"
                      >
                        Kode Google Apps Script
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 MGMP IPA SMP Kabupaten Pasuruan & Dinas Pendidikan dan Kebudayaan Kab. Pasuruan.
            </div>
            <div className="flex items-center gap-1">
              <span>Sistem Penilaian Resmi Sainspreneur</span>
            </div>
          </div>
        </div>
      </footer>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        judges={judges}
        onLoginSuccess={handleLoginSuccess}
        initialRole={loginPreferredRole}
      />

      <RubricModal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
      />

      <GasExportModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />
    </div>
  );
}
