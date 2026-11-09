import React from 'react';
import { Trophy, Medal, Star, Download, School, Sparkles, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { TeamAggregatedScore, Team, Evaluation } from '../types';
import { generateSchoolPDF, generateTopTenSummaryPDF } from '../utils/pdfGenerator';

interface TopTenLeaderboardProps {
  aggregatedScores: TeamAggregatedScore[];
  allEvaluations: Evaluation[];
  isPublished: boolean;
  isAdmin?: boolean;
  onSelectTeamForView?: (team: Team) => void;
}

export const TopTenLeaderboard: React.FC<TopTenLeaderboardProps> = ({
  aggregatedScores,
  allEvaluations,
  isPublished,
  isAdmin = false,
  onSelectTeamForView
}) => {
  const evaluatedTeams = aggregatedScores.filter(item => item.totalScore > 0);
  const hasEvaluations = evaluatedTeams.length > 0;
  const showScores = isPublished || isAdmin;

  const topTen = aggregatedScores.slice(0, 10);
  const podiumTopThree = topTen.slice(0, 3);
  const restOfTopTen = topTen.slice(3, 10);

  const handleDownloadSinglePdf = async (item: TeamAggregatedScore) => {
    const teamEvals = allEvaluations.filter(e => e.teamId === item.team.id && e.status === 'submitted');
    const latestEval = teamEvals[0];
    await generateSchoolPDF(item.team, latestEval, allEvaluations, undefined, {
      rank: item.rank || 1,
      isTopTen: true,
      totalTeams: aggregatedScores.length
    });
  };

  const handleDownloadTopTenSummary = async () => {
    await generateTopTenSummaryPDF(topTen);
  };

  return (
    <section className="my-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 border border-blue-800/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-radial from-amber-400/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy size={14} className="text-amber-400" />
              <span>Fokus Utama Penjurian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Klasemen 10 Besar Finalis Sainspreneur
            </h2>
            <p className="text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Daftar 10 sekolah dengan akumulasi skor tertinggi berdasar pedoman penilaian resmi MGMP IPA SMP Kab. Pasuruan, lengkap dengan urutan prioritas tie-breaker (Sains & Inovasi 30% &gt; Kelayakan Bisnis 30% &gt; Bahan Lokal 20%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showScores && hasEvaluations && (
              <button
                onClick={handleDownloadTopTenSummary}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download size={16} />
                <span>Unduh Rekap 10 Besar (PDF)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unpublished Notice for Public */}
      {!showScores && (
        <div className="bg-white rounded-3xl border border-blue-200 p-8 shadow-sm text-center max-w-3xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="animate-spin-slow" />
          </div>
          <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            Tahap Penjurian Sedang Berlangsung (1–13 November 2026)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
            Rekapitulasi Nilai Menunggu Penilaian Aktual Dewan Juri
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
            Dewan Juri sedang melakukan verifikasi kepatuhan administrasi, naskah artikel, dan video pembuatan produk. Nilai resmi dan penetapan <strong>10 Besar Finalis</strong> akan dipublikasikan oleh Panitia setelah seluruh penilaian tuntas.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-blue-900 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
            <Lock size={14} className="text-blue-700" />
            <span>Kerahasiaan nilai terjaga hingga rapat pleno dewan juri selesai.</span>
          </div>
        </div>
      )}

      {/* When Scores are Available & Published (or Viewed by Admin) */}
      {showScores && (
        <>
          {!hasEvaluations ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              Belum ada penilaian yang disubmit oleh Dewan Juri. Masuk ke Ruang Juri untuk memulai penilaian aktual.
            </div>
          ) : (
            <>
              {/* Top 3 Podium Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {podiumTopThree.map((item, idx) => {
                  const rank = idx + 1;
                  const isFirst = rank === 1;
                  const isSecond = rank === 2;
                  const isThird = rank === 3;

                  const badgeBg = isFirst
                    ? 'from-amber-500 to-yellow-600 border-amber-300'
                    : isSecond
                    ? 'from-slate-400 to-slate-600 border-slate-300'
                    : 'from-amber-700 to-amber-900 border-amber-600';

                  return (
                    <div
                      key={item.team.id}
                      className={`bg-white rounded-2xl shadow-md border overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl relative ${
                        isFirst
                          ? 'border-amber-400 ring-2 ring-amber-400/30 md:-translate-y-2'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Card Ribbon */}
                      <div className={`p-4 bg-gradient-to-r ${badgeBg} text-white flex items-center justify-between`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xl shadow-inner">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                              {isFirst ? 'Peringkat 1' : isSecond ? 'Peringkat 2' : 'Peringkat 3'}
                            </div>
                            <div className="text-sm font-black">{item.team.code}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] uppercase font-semibold text-white/80">Total Skor</div>
                          <div className="text-2xl font-black">{item.totalScore.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold mb-1">
                            <School size={14} />
                            <span>{item.team.school}</span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mb-2">
                            {item.team.productTitle}
                          </h3>
                          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-600 mb-4">
                            <span className="font-bold text-slate-700">Bahan Lokal Khas:</span> {item.team.localResource}
                          </div>

                          {/* Priority Breakdown Pills */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                            <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-2">
                              <div className="text-slate-500 font-medium">1. Sains & Inovasi (30%)</div>
                              <div className="font-bold text-blue-900 text-sm">{item.scoreSainsInovasi.toFixed(2)} / 30</div>
                            </div>
                            <div className="bg-emerald-50/80 border border-emerald-100 rounded-lg p-2">
                              <div className="text-slate-500 font-medium">2. Bisnis & Kemasan (30%)</div>
                              <div className="font-bold text-emerald-900 text-sm">{item.scoreKelayakanBisnis.toFixed(2)} / 30</div>
                            </div>
                            <div className="bg-amber-50/80 border border-amber-100 rounded-lg p-2">
                              <div className="text-slate-500 font-medium">3. Bahan Lokal (20%)</div>
                              <div className="font-bold text-amber-900 text-sm">{item.scoreBahanLokal.toFixed(2)} / 20</div>
                            </div>
                            <div className="bg-purple-50/80 border border-purple-100 rounded-lg p-2">
                              <div className="text-slate-500 font-medium">4. Presentasi (20%)</div>
                              <div className="font-bold text-purple-900 text-sm">{item.scorePresentasiPenulisan.toFixed(2)} / 20</div>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-500">
                            Penilai: <span className="font-bold text-slate-700">{item.evaluationsCount} Juri</span>
                          </div>
                          <button
                            onClick={() => handleDownloadSinglePdf(item)}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                            title="Unduh Lembar Penilaian PDF Resmi Sekolah ini"
                          >
                            <Download size={13} />
                            <span>PDF Sekolah</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ranks 4 to 10 Table */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Peringkat 4 s/d 10 (Finalis Lolos Babak Final)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tim dengan kualifikasi lolos ke babak presentasi langsung dan display produk pada 18 November 2026.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                    Status: 10 Besar Terverifikasi
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 text-center">Rank</th>
                        <th className="py-3 px-3">Kode</th>
                        <th className="py-3 px-4">Asal Sekolah & Nama Tim</th>
                        <th className="py-3 px-4">Judul Inovasi Produk</th>
                        <th className="py-3 px-3 text-center">Sains (30%)</th>
                        <th className="py-3 px-3 text-center">Bisnis (30%)</th>
                        <th className="py-3 px-3 text-center">Lokal (20%)</th>
                        <th className="py-3 px-3 text-center">Pres (20%)</th>
                        <th className="py-3 px-4 text-center">Total Skor</th>
                        <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {restOfTopTen.map(item => (
                        <tr key={item.team.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-4 text-center font-black text-slate-800">
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center text-xs">
                              {item.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-blue-900">{item.team.code}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{item.team.school}</div>
                            <div className="text-[11px] text-slate-500">{item.team.name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 max-w-xs truncate" title={item.team.productTitle}>
                              {item.team.productTitle}
                            </div>
                            <div className="text-[10px] text-amber-700 font-medium truncate">
                              🌱 {item.team.localResource}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-blue-900">
                            {item.scoreSainsInovasi.toFixed(1)}
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-emerald-900">
                            {item.scoreKelayakanBisnis.toFixed(1)}
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-amber-900">
                            {item.scoreBahanLokal.toFixed(1)}
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-purple-900">
                            {item.scorePresentasiPenulisan.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-blue-950 text-sm">
                            {item.totalScore.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDownloadSinglePdf(item)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Unduh Lembar Penilaian PDF Persekolah"
                            >
                              <Download size={13} />
                              <span>PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pengesahan Tim Juri */}
                <div className="px-6 py-5 bg-slate-50/90 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700">
                  <div>
                    <div className="text-slate-500 font-medium">Mengetahui,</div>
                    <div className="font-bold text-slate-800 uppercase tracking-wide mb-3">
                      Ketua Tim Juri
                    </div>
                    <div className="font-black text-blue-950 text-sm">
                      Drs. Joni Suparman, M.Pd
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Pengawas Dinas Pendidikan
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 mt-0.5">
                      NIP. 196706131999031004
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-slate-500 font-medium">Kabupaten Pasuruan, 13 November 2026</div>
                    <div className="font-bold text-slate-800 uppercase tracking-wide mb-3">
                      Dewan Juri Penilai
                    </div>
                    <div className="font-black text-blue-950 text-sm">
                      Akhmad Nasor, M.Pd
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Kepala Sekolah
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 mt-0.5">
                      NIP. 198704082019031001
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
};
