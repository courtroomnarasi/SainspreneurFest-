import React, { useState } from 'react';
import { Trophy, Award, School, Sparkles, Calendar, FileText, CheckCircle2, ChevronRight, Download, Search, Shield, UserCheck, BookOpen, Clock } from 'lucide-react';
import { TeamAggregatedScore, Team, Evaluation } from '../types';
import { TopTenLeaderboard } from './TopTenLeaderboard';
import { generateSchoolPDF } from '../utils/pdfGenerator';

interface LandingPageProps {
  aggregatedScores: TeamAggregatedScore[];
  teams: Team[];
  allEvaluations: Evaluation[];
  isPublished: boolean;
  isAdmin?: boolean;
  onOpenLogin: (role?: 'admin' | 'judge') => void;
  onOpenRubric: () => void;
  onSelectSchool: (team: Team) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  aggregatedScores,
  teams,
  allEvaluations,
  isPublished,
  isAdmin = false,
  onOpenLogin,
  onOpenRubric,
  onSelectSchool
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredTeams = aggregatedScores.filter(item =>
    item.team.school.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.team.productTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.team.localResource.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.team.code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const showScores = isPublished || isAdmin;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner Section: Hanya Gambar Banner Resmi tanpa tambahan logo atau tulisan di atas area biru */}
      <section className="relative overflow-hidden bg-blue-950 border-b border-blue-900 shadow-xl">
        <div className="max-w-7xl mx-auto w-full">
          <img
            src="https://lh3.googleusercontent.com/d/1nRAZr5CqlZ42JTv-w9SM6D2850H1MDk_"
            alt="Pasuruan Science Festival 2026"
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[540px] object-contain mx-auto block select-none"
            loading="eager"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('/hero_banner.jpg')) {
                target.src = '/hero_banner.jpg';
              }
            }}
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Quick Actions & Summary Bar (Di luar area banner biru) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('klasemen-10-besar');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trophy size={16} />
              <span>Lihat 10 Besar Finalis</span>
            </button>

            <button
              onClick={() => onOpenLogin('judge')}
              className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <UserCheck size={16} />
              <span>Portal Dewan Juri</span>
            </button>

            <button
              onClick={onOpenRubric}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen size={16} />
              <span>Pedoman & Rubrik Penilaian</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200/80 text-center sm:text-left">
              <div className="text-lg sm:text-xl font-black text-blue-900">{teams.length}</div>
              <div className="text-[11px] font-semibold text-slate-500">Sekolah Peserta</div>
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200/80 text-center sm:text-left">
              <div className="text-lg sm:text-xl font-black text-emerald-700">10 Besar</div>
              <div className="text-[11px] font-semibold text-slate-500">Kandidat Finalis</div>
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200/80 text-center sm:text-left">
              <div className="text-lg sm:text-xl font-black text-amber-600">1–13 Nov</div>
              <div className="text-[11px] font-semibold text-slate-500">Penjurian Tahap 2</div>
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200/80 text-center sm:text-left">
              <div className="text-lg sm:text-xl font-black text-purple-700">18 Nov</div>
              <div className="text-[11px] font-semibold text-slate-500">Babak Final</div>
            </div>
          </div>
        </div>
        {/* 10 Besar Section Anchor */}
        <div id="klasemen-10-besar">
          <TopTenLeaderboard
            aggregatedScores={aggregatedScores}
            allEvaluations={allEvaluations}
            isPublished={isPublished}
            isAdmin={isAdmin}
            onSelectTeamForView={onSelectSchool}
          />
        </div>

        {/* 4 Pilar Kriteria Penilaian MGMP IPA */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
              Pedoman Lembar Penilaian
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              4 Kriteria Utama & Urutan Prioritas Pemenang
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Berdasarkan Instrumen Bagian B, C, D, dan E Pedoman Penilaian Lomba Sainspreneur 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-b from-blue-50/70 to-white p-5 rounded-2xl border border-blue-200">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs mb-3">
                P1
              </div>
              <div className="text-xs font-bold text-blue-700 uppercase">Prioritas 1 (Bobot 30%)</div>
              <h3 className="font-extrabold text-slate-900 text-sm mt-1">Sains & Inovasi Produk</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Kedalaman teori Fisika/Kimia/Biologi, orisinalitas inovasi, metodologi produksi ilmiah, dan pembuktian cara kerja produk.
              </p>
            </div>

            <div className="bg-gradient-to-b from-emerald-50/70 to-white p-5 rounded-2xl border border-emerald-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs mb-3">
                P2
              </div>
              <div className="text-xs font-bold text-emerald-700 uppercase">Prioritas 2 (Bobot 30%)</div>
              <h3 className="font-extrabold text-slate-900 text-sm mt-1">Kelayakan Bisnis & Kemasan</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Rencana keuangan dan ketepatan perhitungan HPP, strategi bauran 4P, analisis kompetitor, dan kemasan eco-friendly siap jual.
              </p>
            </div>

            <div className="bg-gradient-to-b from-amber-50/70 to-white p-5 rounded-2xl border border-amber-200">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                P3
              </div>
              <div className="text-xs font-bold text-amber-700 uppercase">Prioritas 3 (Bobot 20%)</div>
              <h3 className="font-extrabold text-slate-900 text-sm mt-1">Bahan Lokal Pasuruan</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Keaslian pemanfaatan potensi khas Kabupaten Pasuruan (susu Nongkojajar, mangga klonal 21, sedap malam, kopi Bromo, dsb.) serta nilai tambah ekonomi & lingkungan.
              </p>
            </div>

            <div className="bg-gradient-to-b from-purple-50/70 to-white p-5 rounded-2xl border border-purple-200">
              <div className="w-8 h-8 rounded-lg bg-purple-900 text-white flex items-center justify-center font-bold text-xs mb-3">
                P4
              </div>
              <div className="text-xs font-bold text-purple-700 uppercase">Non-Prioritas (Bobot 20%)</div>
              <h3 className="font-extrabold text-slate-900 text-sm mt-1">Presentasi & Penulisan</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sistematika kerapian artikel ilmiah, format baku TNR margin 3-3-4-3, serta komunikasi tim di video (durasi wajib 5-10 menit).
              </p>
            </div>
          </div>
        </section>

        {/* Galeri Semua Sekolah Peserta */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Profil Tim & Karya Inovasi Sainspreneur
              </h2>
              <p className="text-xs text-slate-500">
                Eksplorasi karya inovasi sains terapan dari SMP se-Kabupaten Pasuruan.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sekolah atau produk..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeams.map((item) => (
              <div
                key={item.team.id}
                className="bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-black text-xs text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">
                      {item.team.code}
                    </span>
                    {showScores && item.isTopTen ? (
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        Rank #{item.rank} (10 Besar)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Tahap 2
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {item.team.school}
                  </div>
                  <h3 className="text-sm font-black text-blue-950 mb-1 leading-snug">
                    Tim: {item.team.name || `Tim ${item.team.school}`}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2 font-medium">
                    {item.team.productTitle}
                  </p>
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 mb-3">
                    🌱 {item.team.localResource}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-600">
                    {showScores && item.totalScore > 0 ? (
                      <span>Skor: <strong className="text-blue-900">{item.totalScore.toFixed(2)}</strong></span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock size={12} />
                        <span>Penjurian Berjalan</span>
                      </span>
                    )}
                  </div>

                  {showScores && item.totalScore > 0 ? (
                    <button
                      onClick={() => {
                        const teamEvals = allEvaluations.filter(e => e.teamId === item.team.id && e.status === 'submitted');
                        generateSchoolPDF(item.team, teamEvals[0], allEvaluations, undefined, {
                          rank: item.rank || 1,
                          isTopTen: Boolean(item.isTopTen),
                          totalTeams: teams.length
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Unduh Lembar Penilaian PDF Sekolah ini"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Terdaftar Resmi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
