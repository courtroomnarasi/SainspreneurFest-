import React, { useState } from 'react';
import { X, BookOpen, CheckCircle, Scale, Film, FileText, AlertTriangle } from 'lucide-react';
import { ARTICLE_RUBRIC, VIDEO_RUBRIC, FINAL_RUBRIC } from '../data/rubricData';

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RubricModal: React.FC<RubricModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'article' | 'video' | 'final' | 'tiebreaker'>('article');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-6 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <BookOpen size={20} className="text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300">
                Pedoman Resmi MGMP IPA SMP Kab. Pasuruan
              </span>
              <h3 className="text-lg font-black">
                Rubrik & Instrumen Penilaian Lomba Sainspreneur 2026
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex overflow-x-auto gap-2 p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('article')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'article'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <FileText size={14} />
            <span>Rubrik Artikel (10 Kriteria)</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'video'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Film size={14} />
            <span>Rubrik Video & Durasi</span>
          </button>
          <button
            onClick={() => setActiveTab('final')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'final'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Scale size={14} />
            <span>Babak Final (F1-F4)</span>
          </button>
          <button
            onClick={() => setActiveTab('tiebreaker')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'tiebreaker'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <CheckCircle size={14} />
            <span>Urutan Prioritas Tie-Breaker</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'article' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 font-medium">
                Skala 1–4 ke Nilai Terbobot Maksimal 100: Skor 4 (100%), Skor 3 (75%), Skor 2 (50%), Skor 1 (25%).
              </div>

              {ARTICLE_RUBRIC.map(item => (
                <div key={item.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <div>
                      <span className="font-extrabold text-xs text-blue-900 bg-blue-100 px-2 py-0.5 rounded mr-2">
                        {item.code}
                      </span>
                      <strong className="text-xs text-slate-900">{item.name}</strong>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Bobot: {item.weight}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                      <div className="font-bold text-emerald-900 mb-1">
                        Skor 4 (Sangat Baik - {item.levels[4].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[4].desc}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                      <div className="font-bold text-blue-900 mb-1">
                        Skor 3 (Baik - {item.levels[3].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[3].desc}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                      <div className="font-bold text-amber-900 mb-1">
                        Skor 2 (Cukup - {item.levels[2].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[2].desc}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                      <div className="font-bold text-rose-900 mb-1">
                        Skor 1 (Kurang - {item.levels[1].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[1].desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold">Ketentuan Pengurangan Poin Khusus Video:</strong>
                <ul className="list-disc list-inside mt-1.5 space-y-1">
                  <li>
                    <strong>Pelanggaran Durasi Video:</strong> Durasi wajib adalah <strong>5 sampai 10 menit</strong>. Video kurang dari 5 menit atau melebihi 10 menit dikenakan pengurangan poin (penalti 5 hingga 10 poin).
                  </li>
                  <li>
                    <strong>Pelanggaran Orisinalitas:</strong> Apabila ditemukan potongan video milik orang lain dari internet, skor pada sub-kriteria 4.2 otomatis bernilai 1.
                  </li>
                </ul>
              </div>

              {VIDEO_RUBRIC.map(item => (
                <div key={item.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <div>
                      <span className="font-extrabold text-xs text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded mr-2">
                        {item.code}
                      </span>
                      <strong className="text-xs text-slate-900">{item.name}</strong>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Bobot: {item.weight}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                      <div className="font-bold text-emerald-900 mb-1">
                        Skor 4 ({item.levels[4].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[4].desc}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                      <div className="font-bold text-blue-900 mb-1">
                        Skor 3 ({item.levels[3].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[3].desc}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                      <div className="font-bold text-amber-900 mb-1">
                        Skor 2 ({item.levels[2].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[2].desc}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                      <div className="font-bold text-rose-900 mb-1">
                        Skor 1 ({item.levels[1].points} Pts)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.levels[1].desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'final' && (
            <div className="space-y-4">
              {FINAL_RUBRIC.map(item => (
                <div key={item.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <div>
                      <span className="font-bold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded mr-2">
                        {item.code}
                      </span>
                      <strong className="text-xs text-slate-900">{item.name}</strong>
                    </div>
                    <span className="text-xs font-bold text-purple-700">Bobot: {item.weight}%</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {([4, 3, 2, 1] as const).map(s => (
                      <div key={s} className="bg-white border border-slate-200 p-2.5 rounded-xl">
                        <strong className="text-slate-800">Skor {s} ({item.levels[s].points} Pts):</strong>
                        <p className="text-slate-600 mt-1 leading-relaxed">{item.levels[s].desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tiebreaker' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs text-blue-950">
                <h4 className="font-black text-sm mb-2 text-blue-900">
                  Ketentuan Khusus Nilai Sama (Tie-Breaker Bagian E):
                </h4>
                <p className="mb-3 leading-relaxed">
                  Jika terdapat total nilai akhir yang sama antar peserta, penentuan urutan pemenang diurutkan berdasarkan prioritas berikut:
                </p>
                <ol className="list-decimal list-inside space-y-2 font-semibold text-slate-800">
                  <li className="p-2 bg-white rounded-lg border border-blue-200">
                    <strong className="text-blue-900">Prioritas 1:</strong> Skor tertinggi aspek <strong>Sains dan Inovasi Produk</strong> (Bobot 30%)
                  </li>
                  <li className="p-2 bg-white rounded-lg border border-blue-200">
                    <strong className="text-blue-900">Prioritas 2:</strong> Skor tertinggi aspek <strong>Potensi/Kelayakan Bisnis dan Kemasan</strong> (Bobot 30%)
                  </li>
                  <li className="p-2 bg-white rounded-lg border border-blue-200">
                    <strong className="text-blue-900">Prioritas 3:</strong> Skor tertinggi aspek <strong>Pemanfaatan Potensi Bahan Lokal Pasuruan</strong> (Bobot 20%)
                  </li>
                  <li className="p-2 bg-white rounded-lg border border-blue-200">
                    <strong className="text-blue-900">Keputusan Akhir:</strong> Hasil <strong>Musyawarah Mufakat Dewan Juri</strong> (Keputusan Mutlak & Tidak Dapat Diganggu Gugat)
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
