import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Team, Evaluation, Judge, TeamAggregatedScore } from '../types';
import { ARTICLE_RUBRIC, VIDEO_RUBRIC } from '../data/rubricData';
import { calculateSingleArticleScore, calculateSingleVideoScore, calculateSingleFinalScore } from './tieBreaker';

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not load image for PDF:', url);
    return null;
  }
}

export async function generateSchoolPDF(
  team: Team,
  evaluation?: Evaluation,
  allEvaluations: Evaluation[] = [],
  judge?: Judge,
  rankInfo?: { rank: number; isTopTen: boolean; totalTeams: number }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pemkabLogo = await loadImageAsDataUrl('/logo_pemkab.png');
  const mgmpLogo = await loadImageAsDataUrl('/logo_mgmp.png');

  const addHeader = (pageNum: number, totalPages: number = 3) => {
    // Official Kop
    if (pemkabLogo) {
      doc.addImage(pemkabLogo, 'PNG', 20, 10, 16, 20);
    }
    if (mgmpLogo) {
      doc.addImage(mgmpLogo, 'PNG', 40, 11, 18, 18);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 35, 75); // MGMP Navy
    doc.text('MGMP IPA SMP', 62, 17);
    doc.text('Kab. Pasuruan', 62, 23);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Sekretariat: Dinas Pendidikan dan Kebudayaan Kabupaten Pasuruan - Jawa Timur', 62, 27);

    // Double rule
    doc.setDrawColor(20, 35, 75);
    doc.setLineWidth(0.8);
    doc.line(20, 32, 190, 32);
    doc.setLineWidth(0.3);
    doc.line(20, 33, 190, 33);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 45, 110);
    doc.text('PASURUAN SCIENCE FESTIVAL 2026', 105, 40, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('LEMBAR PENILAIAN DEWAN JURI — LOMBA SAINSPRENEUR', 105, 45, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Instrumen Penilaian Lomba Sainspreneur - Pasuruan Science Festival 2026 | Hal. ${pageNum} dari ${totalPages}`, 105, 290, { align: 'center' });
  };

  // ---------------- PAGE 1: BAGIAN A & BAGIAN B ----------------
  addHeader(1, 3);

  // Bagian A Title
  doc.setFillColor(235, 243, 255);
  doc.rect(20, 49, 170, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 45, 110);
  doc.text('BAGIAN A. IDENTITAS TIM PESERTA & VERIFIKASI PERSYARATAN', 22, 53.5);

  const teamData = [
    ['Nomor / Kode Tim', team.code, 'Tahap Penjurian', team.tahap === 'Final' ? '[X] Final (18 Nov 2026)' : '[X] Tahap 2 (1–13 Nov 2026)'],
    ['Nama Tim', team.name, 'Asal Sekolah', team.school],
    ['Judul Inovasi Produk', { content: team.productTitle, colSpan: 3 }],
    ['Potensi Bahan Lokal', { content: team.localResource || 'Komoditas Unggulan Kabupaten Pasuruan', colSpan: 3 }],
    ['Ketua & Anggota Tim', { content: `1. ${team.leader} (Ketua)\n2. ${team.members[1] || '-'}\n3. ${team.members[2] || '-'}`, colSpan: 3 }],
    ['Guru Pendamping', { content: team.mentorTeacher, colSpan: 3 }]
  ];

  autoTable(doc, {
    startY: 56,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.8, textColor: 30 },
    headStyles: { fillColor: [220, 230, 245], textColor: [15, 45, 110], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 50 },
      2: { cellWidth: 32, fontStyle: 'bold', fillColor: [248, 250, 252] },
      3: { cellWidth: 53 }
    },
    body: teamData as any
  });

  // Checklist Administrasi Table
  const adminRows = (evaluation?.adminCheck || [
    { id: 1, item: 'Pendaftaran, Mengirim Artikel Maks 5 Hal & Lampiran serta Video 5-10 Menit', status: 'Ya', keterangan: 'Lengkap dan tepat waktu' },
    { id: 2, item: 'Surat Pernyataan Orisinalitas Karya (Lampiran 3) ditandatangani Guru & Ketua', status: 'Ya', keterangan: 'Lengkap bermaterai' },
    { id: 3, item: 'Biodata Peserta (Lampiran 4) terisi lengkap & ditandatangani Kepala Sekolah', status: 'Ya', keterangan: 'Lengkap resmi stempel' },
    { id: 4, item: 'Produk aman dikonsumsi/digunakan serta ramah lingkungan', status: 'Ya', keterangan: 'Aman teruji' }
  ]).map(c => [c.id, c.item, c.status === 'Ya' ? '[ v ] Ya  [   ] Tidak' : '[   ] Ya  [ v ] Tidak', c.keterangan || 'Sesuai ketentuan']);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    head: [['No', 'Daftar Periksa Kepatuhan Administrasi', 'Status', 'Keterangan']],
    headStyles: { fillColor: [30, 64, 130], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 95 },
      2: { cellWidth: 32, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 35 }
    },
    body: adminRows
  });

  // BAGIAN B: ARTIKEL IDE BISNIS
  const finalYAfterAdmin = (doc as any).lastAutoTable.finalY;
  doc.setFillColor(235, 243, 255);
  doc.rect(20, finalYAfterAdmin + 4, 170, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 45, 110);
  doc.text('BAGIAN B. INSTRUMEN PENILAIAN ARTIKEL IDE BISNIS (Maksimal 100 Poin)', 22, finalYAfterAdmin + 8.5);

  const articleRows: any[] = [];
  let totalArtPoints = 0;

  ARTICLE_RUBRIC.forEach(item => {
    const rawVal = evaluation?.articleScore ? (evaluation.articleScore as any)[item.id] || 3 : 3;
    const pts = item.levels[rawVal as 1 | 2 | 3 | 4]?.points || (item.weight * 0.75);
    totalArtPoints += pts;
    articleRows.push([
      item.code,
      item.name,
      `${item.weight}%`,
      `Skor: ${rawVal} (${pts.toFixed(1)})`,
      pts.toFixed(2)
    ]);
  });

  articleRows.push([
    { content: 'TOTAL NILAI ARTIKEL IDE BISNIS (Maksimal 100 Poin)', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 244, 255] } },
    { content: totalArtPoints.toFixed(2), styles: { fontStyle: 'bold', fillColor: [220, 235, 255], textColor: [15, 45, 110] } }
  ]);

  autoTable(doc, {
    startY: finalYAfterAdmin + 11,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    styles: { fontSize: 7.2, cellPadding: 1.3 },
    head: [['Kode', 'Sub-Kriteria Penilaian Artikel', 'Bobot', 'Skor (1-4) & Konversi', 'Nilai Terbobot']],
    headStyles: { fillColor: [30, 64, 130], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 88 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 33, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
    },
    body: articleRows as any
  });

  // ---------------- PAGE 2: BAGIAN C (VIDEO) & BAGIAN D (FINAL) ----------------
  doc.addPage();
  addHeader(2, 3);

  doc.setFillColor(235, 243, 255);
  doc.rect(20, 49, 170, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 45, 110);
  doc.text('BAGIAN C. INSTRUMEN PENILAIAN VIDEO PEMBUATAN PRODUK', 22, 53.5);

  const videoRows: any[] = [];
  let totalVidSubPoints = 0;

  VIDEO_RUBRIC.forEach(item => {
    const rawVal = evaluation?.videoScore ? (evaluation.videoScore as any)[item.id] || 3 : 3;
    const pts = item.levels[rawVal as 1 | 2 | 3 | 4]?.points || (item.weight * 0.75);
    totalVidSubPoints += pts;
    videoRows.push([
      item.code,
      item.name,
      `${item.weight}%`,
      `Skor: ${rawVal} (${pts.toFixed(1)})`,
      pts.toFixed(2)
    ]);
  });

  const durMin = evaluation?.videoScore?.durationMinutes ?? 7;
  const durSec = evaluation?.videoScore?.durationSeconds ?? 30;
  const durPenalty = evaluation?.videoScore?.durationPenalty ?? 0;
  const netVideoTotal = Math.max(0, totalVidSubPoints - durPenalty);

  videoRows.push([
    { content: 'Pengurangan Poin Durasi Video\n(Wajib: 5 s/d 10 menit. Jika < 5 mnt atau > 10 mnt, kurangi 5-10 poin)', colSpan: 2 },
    '-',
    `Durasi Tercatat: ${durMin}m ${durSec}s`,
    `-${durPenalty.toFixed(2)}`
  ]);

  videoRows.push([
    { content: 'TOTAL NILAI VIDEO PEMBUATAN PRODUK (Maksimal 100 Poin)', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 244, 255] } },
    { content: netVideoTotal.toFixed(2), styles: { fontStyle: 'bold', fillColor: [220, 235, 255], textColor: [15, 45, 110] } }
  ]);

  autoTable(doc, {
    startY: 56,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    styles: { fontSize: 7.2, cellPadding: 1.3 },
    head: [['Kode', 'Sub-Kriteria Segmen Video', 'Bobot', 'Skor (1-4) & Konversi', 'Nilai Terbobot']],
    headStyles: { fillColor: [30, 64, 130], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 88 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 33, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
    },
    body: videoRows as any
  });

  // BAGIAN D: BABAK FINAL
  const finalYAfterVideo = (doc as any).lastAutoTable.finalY;
  doc.setFillColor(235, 243, 255);
  doc.rect(20, finalYAfterVideo + 4, 170, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 45, 110);
  doc.text('BAGIAN D. INSTRUMEN PENILAIAN BABAK FINAL (Verifikasi Fisik & Presentasi)', 22, finalYAfterVideo + 8.5);

  const finalScore = evaluation?.finalScore;
  const f1Pts = ((finalScore?.f1 || 3) * 7.5);
  const f2Pts = ((finalScore?.f2 || 3) * 7.5);
  const f3Pts = ((finalScore?.f3 || 3) * 5.0);
  const f4Pts = ((finalScore?.f4 || 3) * 5.0);
  const totalFinalPts = f1Pts + f2Pts + f3Pts + f4Pts;

  const finalRows: any[] = [
    ['F1', 'Sains & Inovasi Produk Fisik', '30%', `Skor: ${finalScore?.f1 || 3} (${f1Pts.toFixed(1)})`, f1Pts.toFixed(2)],
    ['F2', 'Kelayakan Bisnis & Kemasan Fisik', '30%', `Skor: ${finalScore?.f2 || 3} (${f2Pts.toFixed(1)})`, f2Pts.toFixed(2)],
    ['F3', 'Pemanfaatan Bahan Lokal Pasuruan', '20%', `Skor: ${finalScore?.f3 || 3} (${f3Pts.toFixed(1)})`, f3Pts.toFixed(2)],
    ['F4', 'Presentasi, Penguasaan Materi & Tim', '20%', `Skor: ${finalScore?.f4 || 3} (${f4Pts.toFixed(1)})`, f4Pts.toFixed(2)],
    [
      { content: 'TOTAL NILAI PRODUK & PRESENTASI BABAK FINAL (Maksimal 100 Poin)', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 244, 255] } },
      { content: totalFinalPts.toFixed(2), styles: { fontStyle: 'bold', fillColor: [220, 235, 255], textColor: [15, 45, 110] } }
    ]
  ];

  autoTable(doc, {
    startY: finalYAfterVideo + 11,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    styles: { fontSize: 7.2, cellPadding: 1.3 },
    head: [['Kode', 'Kriteria Babak Final', 'Bobot', 'Skor (1-4) & Konversi', 'Nilai Terbobot']],
    headStyles: { fillColor: [30, 64, 130], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 88 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 33, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
    },
    body: finalRows as any
  });

  // ---------------- PAGE 3: BAGIAN E (REKAPITULASI & TIE BREAKER + PENGESAHAN) ----------------
  doc.addPage();
  addHeader(3, 3);

  doc.setFillColor(235, 243, 255);
  doc.rect(20, 49, 170, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 45, 110);
  doc.text('BAGIAN E. REKAPITULASI NILAI AKHIR & URUTAN PRIORITAS PENENTU PEMENANG', 22, 53.5);

  // Calculate Priority values
  const artA1 = (evaluation?.articleScore.a1_1 || 3) * 2 + (evaluation?.articleScore.a1_2 || 3) * 3 + (evaluation?.articleScore.a1_3 || 3) * 2.5;
  const vidV1 = (evaluation?.videoScore.v1_1 || 3) * 3.75 + (evaluation?.videoScore.v1_2 || 3) * 3.75;
  const prio1Sains = (artA1 + vidV1) / 2;

  const artA2 = (evaluation?.articleScore.a2_1 || 3) * 2 + (evaluation?.articleScore.a2_2 || 3) * 2.5 + (evaluation?.articleScore.a2_3 || 3) * 3;
  const vidV2 = (evaluation?.videoScore.v2_1 || 3) * 3 + (evaluation?.videoScore.v2_2 || 3) * 3 + (evaluation?.videoScore.v2_3 || 3) * 1.5;
  const prio2Bisnis = (artA2 + vidV2) / 2;

  const artA3 = (evaluation?.articleScore.a3_1 || 3) * 2.5 + (evaluation?.articleScore.a3_2 || 3) * 2.5;
  const vidV3 = (evaluation?.videoScore.v3_1 || 3) * 3 + (evaluation?.videoScore.v3_2 || 3) * 2;
  const prio3Lokal = (artA3 + vidV3) / 2;

  const artA4 = (evaluation?.articleScore.a4_1 || 3) * 2.5 + (evaluation?.articleScore.a4_2 || 3) * 2.5;
  const vidV4 = (evaluation?.videoScore.v4_1 || 3) * 2.5 + (evaluation?.videoScore.v4_2 || 3) * 2.5;
  const prio4Pres = Math.max(0, (artA4 + vidV4) / 2 - (durPenalty / 2));

  const totalFinalRekap = prio1Sains + prio2Bisnis + prio3Lokal + prio4Pres;

  const rekapRows = [
    ['Prioritas 1', '1. Sains & Inovasi', '30%', artA1.toFixed(2), vidV1.toFixed(2), finalScore ? f1Pts.toFixed(2) : '-', prio1Sains.toFixed(2)],
    ['Prioritas 2', '2. Kelayakan Bisnis & Kemasan', '30%', artA2.toFixed(2), vidV2.toFixed(2), finalScore ? f2Pts.toFixed(2) : '-', prio2Bisnis.toFixed(2)],
    ['Prioritas 3', '3. Pemanfaatan Bahan Lokal Pasuruan', '20%', artA3.toFixed(2), vidV3.toFixed(2), finalScore ? f3Pts.toFixed(2) : '-', prio3Lokal.toFixed(2)],
    ['Non-Prioritas', '4. Presentasi & Sistematika Penulisan', '20%', artA4.toFixed(2), vidV4.toFixed(2), finalScore ? f4Pts.toFixed(2) : '-', prio4Pres.toFixed(2)],
    [
      { content: 'TOTAL NILAI AKHIR TIM PESERTA', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fillColor: [230, 240, 255] } },
      { content: totalFinalRekap.toFixed(2), styles: { fontStyle: 'bold', fillColor: [210, 230, 255], textColor: [15, 45, 110], halign: 'center' } }
    ]
  ];

  autoTable(doc, {
    startY: 56,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    head: [['Prioritas Tie Breaker', 'Kriteria Penilaian', 'Bobot', 'Skor Artikel (A)', 'Skor Video (V)', 'Skor Final (F)', 'Nilai Akhir Kriteria']],
    headStyles: { fillColor: [30, 64, 130], textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
      1: { cellWidth: 45 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    body: rekapRows as any
  });

  const finalYRekap = (doc as any).lastAutoTable.finalY;

  // Box Hasil & Status 10 Besar
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, finalYRekap + 4, 170, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Ketentuan Khusus Nilai Sama (Tie Breaker):', 23, finalYRekap + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('(1) Skor tertinggi aspek Sains dan Inovasi Produk (Bobot 30%)', 23, finalYRekap + 13.5);
  doc.text('(2) Skor tertinggi aspek Potensi/Kelayakan Bisnis dan Kemasan (Bobot 30%)', 23, finalYRekap + 17.5);
  doc.text('(3) Skor tertinggi aspek Pemanfaatan Potensi Lokal Kabupaten Pasuruan (Bobot 20%)', 23, finalYRekap + 21.5);
  doc.text('(4) Hasil Musyawarah Mufakat Dewan Juri (Keputusan Mutlak & Tidak Dapat Diganggu Gugat)', 23, finalYRekap + 25.5);

  // Rank & Status Badge on right if available
  if (rankInfo) {
    const isTop10 = rankInfo.isTopTen;
    doc.setFillColor(isTop10 ? 220 : 241, isTop10 ? 252 : 245, isTop10 ? 231 : 249);
    doc.setDrawColor(isTop10 ? 34 : 148, isTop10 ? 197 : 163, isTop10 ? 94 : 184);
    doc.roundedRect(128, finalYRekap + 7, 58, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(isTop10 ? 21 : 51, isTop10 ? 128 : 65, isTop10 ? 61 : 85);
    doc.text(`Peringkat: #${rankInfo.rank} dari ${rankInfo.totalTeams} Tim`, 157, finalYRekap + 13, { align: 'center' });

    doc.setFontSize(8);
    doc.text(isTop10 ? '[ LOLOS 10 BESAR FINALIS ]' : '[ TAHAP PENJURIAN ]', 157, finalYRekap + 19, { align: 'center' });
  }

  // Catatan Dewan Juri
  const boxCommentY = finalYRekap + 31;
  doc.setFillColor(254, 252, 232); // light amber
  doc.setDrawColor(253, 224, 71);
  doc.roundedRect(20, boxCommentY, 170, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(133, 77, 14);
  doc.text('Catatan & Rekomendasi Dewan Juri:', 23, boxCommentY + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(74, 40, 2);
  const feedbackText = evaluation?.feedback || 'Karya menunjukkan orisinalitas riset IPA tingkat SMP yang sangat potensial dikembangkan menjadi produk wirausaha bernilai ekonomi tinggi.';
  const splitFeedback = doc.splitTextToSize(`"${feedbackText}"`, 164);
  doc.text(splitFeedback, 23, boxCommentY + 9);

  // Tanda Tangan
  const sigY = boxCommentY + 23;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text('Mengetahui,', 30, sigY);
  doc.text('Ketua Panitia Pasuruan Science Festival', 30, sigY + 4);
  doc.text('Kabupaten Pasuruan, 13 November 2026', 130, sigY);
  doc.text('Dewan Juri Penilai,', 130, sigY + 4);

  // Space for signatures
  doc.setFont('helvetica', 'bold');
  doc.text('M. SYAIFUDDIN, S.Pd., M.Si', 30, sigY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Ketua MGMP IPA SMP Kab. Pasuruan', 30, sigY + 28);
  doc.text('NIP. 19720315 199802 1 004', 30, sigY + 31.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(judge ? judge.name : (evaluation?.judgeName || 'Dr. Bambang Hermanto, M.Si'), 130, sigY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(judge?.institution || 'Dewan Juri Ahli Sainspreneur', 130, sigY + 28);
  doc.text(`NIP. ${judge?.nip || '19740512 200112 1 002'}`, 130, sigY + 31.5);

  // Return generated PDF
  const filename = `Lembar_Penilaian_${team.code}_${team.school.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}

export async function generateTopTenSummaryPDF(topTenList: TeamAggregatedScore[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pemkabLogo = await loadImageAsDataUrl('/logo_pemkab.png');
  const mgmpLogo = await loadImageAsDataUrl('/logo_mgmp.png');

  if (pemkabLogo) doc.addImage(pemkabLogo, 'PNG', 18, 10, 16, 20);
  if (mgmpLogo) doc.addImage(mgmpLogo, 'PNG', 38, 11, 18, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 45, 110);
  doc.text('KLASEMEN 10 BESAR FINALIS LOMBA SAINSPRENEUR', 148, 17, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text('PASURUAN SCIENCE FESTIVAL 2026 — MGMP IPA SMP KABUPATEN PASURUAN', 148, 23, { align: 'center' });

  doc.setDrawColor(20, 35, 75);
  doc.setLineWidth(0.8);
  doc.line(18, 30, 278, 30);
  doc.setLineWidth(0.3);
  doc.line(18, 31, 278, 31);

  const rows = topTenList.slice(0, 10).map((item, idx) => [
    idx + 1 === 1 ? 'Juara 1' : idx + 1 === 2 ? 'Juara 2' : idx + 1 === 3 ? 'Juara 3' : `#${idx + 1}`,
    item.team.code,
    item.team.school,
    item.team.name,
    item.team.productTitle,
    item.scoreSainsInovasi.toFixed(2),
    item.scoreKelayakanBisnis.toFixed(2),
    item.scoreBahanLokal.toFixed(2),
    item.scorePresentasiPenulisan.toFixed(2),
    item.totalScore.toFixed(2),
    'LOLOS FINAL'
  ]);

  autoTable(doc, {
    startY: 35,
    margin: { left: 18, right: 18 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    head: [[
      'Peringkat', 'Kode', 'Asal Sekolah', 'Nama Tim', 'Judul Inovasi Produk',
      'Sains (30%)', 'Bisnis (30%)', 'Lokal (20%)', 'Pres (20%)', 'Total', 'Status'
    ]],
    headStyles: { fillColor: [30, 64, 130], textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 26 },
      4: { cellWidth: 68 },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 16, halign: 'center' },
      8: { cellWidth: 16, halign: 'center' },
      9: { cellWidth: 16, halign: 'center', fontStyle: 'bold', fillColor: [230, 240, 255] },
      10: { cellWidth: 21, halign: 'center', fontStyle: 'bold', textColor: [22, 101, 52] }
    },
    body: rows
  });

  const finalTableY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('* Penentuan urutan peringkat telah disinkronkan dengan aturan tie-breaker resmi (Sains & Inovasi -> Kelayakan Bisnis -> Pemanfaatan Bahan Lokal Pasuruan).', 18, finalTableY);

  doc.save('Klasemen_10_Besar_Sainspreneur_Pasuruan_2026.pdf');
}
