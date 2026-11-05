export interface RubricLevel {
  score: number;
  label: string;
  points: number;
  desc: string;
}

export interface RubricItem {
  id: string;
  code: string;
  name: string;
  category: string;
  weight: number; // in percent (e.g. 8 for 8%)
  levels: Record<1 | 2 | 3 | 4, { points: number; desc: string }>;
}

export const ARTICLE_RUBRIC: RubricItem[] = [
  // KRITERIA 1: SAINS & INOVASI (30%)
  {
    id: 'a1_1',
    code: 'A1.1',
    name: 'Rumusan Masalah & Tujuan Proyek (Pendahuluan)',
    category: '1. Sains & Inovasi (30%)',
    weight: 8,
    levels: {
      4: {
        points: 8,
        desc: 'Alur latar belakang deduktif sangat tajam membedah masalah nyata; rumusan masalah berupa kalimat tanya kritis dan tujuan bisnis sangat relevan.'
      },
      3: {
        points: 6,
        desc: 'Alur latar belakang deduktif cukup jelas; memuat kalimat tanya rumusan masalah dan tujuan bisnis yang sesuai.'
      },
      2: {
        points: 4,
        desc: 'Latar belakang kurang berpola deduktif; rumusan masalah atau tujuan proyek kurang spesifik.'
      },
      1: {
        points: 2,
        desc: 'Latar belakang tidak fokus pada masalah nyata dan tidak memuat rumusan masalah/tujuan.'
      }
    }
  },
  {
    id: 'a1_2',
    code: 'A1.2',
    name: 'Kedalaman Teori IPA & Orisinalitas Inovasi (Tinjauan Pustaka)',
    category: '1. Sains & Inovasi (30%)',
    weight: 12,
    levels: {
      4: {
        points: 12,
        desc: 'Membuktikan ide secara ilmiah dengan konsep Fisika/Kimia/Biologi dan zat aktif secara mendalam; produk orisinal, aman, dan berdaya inovasi tinggi.'
      },
      3: {
        points: 9,
        desc: 'Menjelaskan konsep IPA dan kandungan zat aktif bahan utama dengan benar; produk orisinal dan aman digunakan/dikonsumsi.'
      },
      2: {
        points: 6,
        desc: 'Penjelasan konsep IPA masih dangkal/umum; tingkat kebaruan produk tergolong modifikasi sederhana.'
      },
      1: {
        points: 3,
        desc: 'Konsep IPA tidak tepat/keliru secara ilmiah atau terindikasi plagiasi karya lain.'
      }
    }
  },
  {
    id: 'a1_3',
    code: 'A1.3',
    name: 'Metodologi & Alur Produksi (Metodologi)',
    category: '1. Sains & Inovasi (30%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Alat dan bahan dirinci lengkap dengan satuan ukuran ilmiah; prosedur kerja kronologis menggunakan kata kerja aktif baku dan dilengkapi diagram alur yang jelas.'
      },
      3: {
        points: 7.5,
        desc: 'Alat dan bahan mencantumkan satuan ukuran; prosedur kerja kronologis dengan kata kerja aktif baku namun diagram alur kurang detail.'
      },
      2: {
        points: 5.0,
        desc: 'Sebagian bahan tidak mencantumkan satuan ukuran ilmiah; prosedur kerja kurang sistematis dan tanpa diagram alur.'
      },
      1: {
        points: 2.5,
        desc: 'Alat, bahan, dan prosedur kerja ditulis secara asal-asalan sehingga produk tidak dapat direplikasi.'
      }
    }
  },
  // KRITERIA 2: KELAYAKAN BISNIS & KEMASAN (30%)
  {
    id: 'a2_1',
    code: 'A2.1',
    name: 'Analisis Kompetitor & Hasil Uji Coba',
    category: '2. Kelayakan Bisnis & Kemasan (30%)',
    weight: 8,
    levels: {
      4: {
        points: 8,
        desc: 'Membandingkan keunggulan kesehatan, lingkungan, dan harga terhadap kompetitor secara tajam; disertai data objektif dan testimoni responden atas kualitas fisik produk.'
      },
      3: {
        points: 6,
        desc: 'Memuat analisis kompetitor dan hasil uji coba/testimoni responden, namun salah satu aspek keunggulan kurang diuraikan.'
      },
      2: {
        points: 4,
        desc: 'Hanya memuat salah satu antara analisis kompetitor atau hasil uji coba sederhana tanpa data responden yang jelas.'
      },
      1: {
        points: 2,
        desc: 'Tidak memuat analisis kompetitor maupun bukti hasil uji coba produk.'
      }
    }
  },
  {
    id: 'a2_2',
    code: 'A2.2',
    name: 'Strategi Pemasaran 4P & Desain Kemasan Eco-Friendly',
    category: '2. Kelayakan Bisnis & Kemasan (30%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Strategi 4P (Product, Price, Place, Promotion digital) sangat terukur; desain kemasan/label menarik, praktis, aman, dan ramah lingkungan (eco-friendly).'
      },
      3: {
        points: 7.5,
        desc: 'Strategi 4P dijelaskan lengkap; foto kemasan/label menarik dan ramah lingkungan namun aspek kepraktisan masih standar.'
      },
      2: {
        points: 5.0,
        desc: 'Penjelasan 4P tidak lengkap (hanya 2–3 elemen); desain kemasan kurang menarik atau belum memperhatikan aspek ramah lingkungan.'
      },
      1: {
        points: 2.5,
        desc: 'Tidak menggunakan kerangka 4P dan tidak menampilkan wujud/desain kemasan produk.'
      }
    }
  },
  {
    id: 'a2_3',
    code: 'A2.3',
    name: 'Rencana Keuangan & Perhitungan HPP',
    category: '2. Kelayakan Bisnis & Kemasan (30%)',
    weight: 12,
    levels: {
      4: {
        points: 12,
        desc: 'Menghitung Biaya Produksi Total satu siklus (bahan + kemasan), HPP per unit, Harga Jual, dan proyeksi laba bersih secara akurat, logis, dan layak secara ekonomi.'
      },
      3: {
        points: 9,
        desc: 'Memuat Biaya Produksi Total, HPP per unit, Harga Jual, dan proyeksi laba, namun terdapat sedikit ketidaktepatan rincian komponen biaya.'
      },
      2: {
        points: 6,
        desc: 'Perhitungan HPP dan harga jual dicantumkan tetapi tidak merinci biaya kemasan atau proyeksi laba bersih kurang logis.'
      },
      1: {
        points: 3,
        desc: 'Rencana keuangan tidak mencantumkan perhitungan HPP atau salah hitung secara mendasar.'
      }
    }
  },
  // KRITERIA 3: PEMANFAATAN BAHAN LOKAL PASURUAN (20%)
  {
    id: 'a3_1',
    code: 'A3.1',
    name: 'Relevansi & Porsi Bahan Baku Lokal Pasuruan',
    category: '3. Pemanfaatan Bahan Lokal Pasuruan (20%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Bahan baku utama (agrikultur, maritim, perkebunan, susu, atau limbah lokal) murni mengangkat potensi khas Kabupaten Pasuruan secara langsung.'
      },
      3: {
        points: 7.5,
        desc: 'Menggunakan bahan baku yang tersedia di Kabupaten Pasuruan, namun keterkaitan dengan kekhasan daerah dijelaskan secara umum.'
      },
      2: {
        points: 5.0,
        desc: 'Bahan baku lokal Pasuruan hanya digunakan sebagai bahan tambahan/pendukung dengan porsi kecil.'
      },
      1: {
        points: 2.5,
        desc: 'Bahan baku tidak memiliki keterkaitan dengan potensi sumber daya lokal Kabupaten Pasuruan.'
      }
    }
  },
  {
    id: 'a3_2',
    code: 'A3.2',
    name: 'Nilai Tambah & Keberlanjutan Lingkungan',
    category: '3. Pemanfaatan Bahan Lokal Pasuruan (20%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Produk memberikan lonjakan nilai ekonomi tinggi pada komoditas/limbah lokal Pasuruan serta mendukung pelestarian lingkungan secara berkelanjutan.'
      },
      3: {
        points: 7.5,
        desc: 'Produk memberikan nilai tambah ekonomi pada bahan lokal dan ramah lingkungan, namun refleksi dampak keberlanjutannya masih terbatas.'
      },
      2: {
        points: 5.0,
        desc: 'Nilai tambah ekonomi terhadap bahan mentah lokal relatif kecil dan dampak lingkungan kurang dibahas.'
      },
      1: {
        points: 2.5,
        desc: 'Produk tidak memberikan nilai tambah pada bahan lokal atau berpotensi menghasilkan limbah pencemar baru.'
      }
    }
  },
  // KRITERIA 4: SISTEMATIKA & KERAPIAN PENULISAN (20%)
  {
    id: 'a4_1',
    code: 'A4.1',
    name: 'Kelengkapan Abstrak, Penutup & Referensi',
    category: '4. Sistematika & Kerapian Penulisan (20%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Abstrak 1 paragraf (150–200 kata) memuat 4 poin urut + 3–5 kata kunci miring; Kesimpulan menjawab rumusan masalah; Saran reflektif; Referensi sesuai format ilmiah.'
      },
      3: {
        points: 7.5,
        desc: 'Abstrak, Kesimpulan, Saran, dan Referensi lengkap, namun jumlah kata abstrak atau format penulisan daftar pustaka sedikit kurang presisi.'
      },
      2: {
        points: 5.0,
        desc: 'Abstrak tidak memuat 4 poin lengkap; Saran atau Referensi ditulis seadanya tanpa mengikuti format baku.'
      },
      1: {
        points: 2.5,
        desc: 'Tidak ada Abstrak/Kata Kunci atau tidak mencantumkan Daftar Referensi sama sekali.'
      }
    }
  },
  {
    id: 'a4_2',
    code: 'A4.2',
    name: 'Kepatuhan Format Teknis & Lampiran 1',
    category: '4. Sistematika & Kerapian Penulisan (20%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Kertas A4, margin (3-3-4-3 cm), maksimal 5 hal isi + maks 2 hal lampiran (foto produk/logo/label, proses tim), TNR (14/12/10 pt), spasi 1,5 justify, penamaan PDF tepat.'
      },
      3: {
        points: 7.5,
        desc: 'Memenuhi hampir seluruh aturan tipografi, margin, batas halaman, dan lampiran foto; hanya terdapat 1–2 kesalahan teknis minor.'
      },
      2: {
        points: 5.0,
        desc: 'Melebihi batas maksimal 5 halaman isi atau 2 halaman lampiran, serta terdapat beberapa ketidaksesuaian ukuran huruf/margin.'
      },
      1: {
        points: 2.5,
        desc: 'Format dokumen tidak mengikuti ketentuan Lampiran 1 (salah ukuran kertas, font, dan tanpa lampiran foto).'
      }
    }
  }
];

export const VIDEO_RUBRIC: RubricItem[] = [
  // KRITERIA 1: SAINS & INOVASI DALAM VIDEO (30%)
  {
    id: 'v1_1',
    code: 'V1.1',
    name: 'Pemaparan Teori Sains & Cara Kerja',
    category: '1. Sains & Inovasi dalam Video (30%)',
    weight: 15,
    levels: {
      4: {
        points: 15,
        desc: 'Memaparkan dasar teori IPA (Fisika/Kimia/Biologi) secara akurat, komunikatif, dan membuktikan cara kerja produk dalam memecahkan masalah di awal.'
      },
      3: {
        points: 11.25,
        desc: 'Menjelaskan konsep sains dan cara kerja produk dengan benar, namun penyampaian masih terkesan menghafal teks.'
      },
      2: {
        points: 7.5,
        desc: 'Penjelasan teori sains terlalu singkat/kurang mendalam dan kaitan dengan pemecahan masalah kurang jelas.'
      },
      1: {
        points: 3.75,
        desc: 'Tidak menjelaskan konsep sains atau penjelasan ilmiah keliru.'
      }
    }
  },
  {
    id: 'v1_2',
    code: 'V1.2',
    name: 'Demonstrasi Prosedur Pembuatan',
    category: '1. Sains & Inovasi dalam Video (30%)',
    weight: 15,
    levels: {
      4: {
        points: 15,
        desc: 'Menampilkan langkah pembuatan secara berurutan, jelas (memanfaatkan time-lapse secara efektif untuk proses lama), serta tertib menggunakan jas lab/seragam dan APD lengkap.'
      },
      3: {
        points: 11.25,
        desc: 'Langkah pembuatan ditampilkan berurutan dan mengenakan seragam/jas lab serta APD, namun transisi visual proses produksi agak lambat/kurang rapi.'
      },
      2: {
        points: 7.5,
        desc: 'Ada tahapan pembuatan yang terlewat secara visual atau peserta kurang lengkap mengenakan APD saat menangani bahan kimia/api/alat tajam.'
      },
      1: {
        points: 3.75,
        desc: 'Proses pembuatan tidak didemonstrasikan secara nyata dan mengabaikan keselamatan kerja.'
      }
    }
  },
  // KRITERIA 2: KELAYAKAN BISNIS & KEMASAN DALAM VIDEO (30%)
  {
    id: 'v2_1',
    code: 'V2.1',
    name: 'Visualisasi Wujud Final & Kemasan Siap Jual',
    category: '2. Kelayakan Bisnis & Kemasan dalam Video (30%)',
    weight: 12,
    levels: {
      4: {
        points: 12,
        desc: 'Menampilkan wujud final produk yang dikemas sangat rapi, menarik, praktis, ramah lingkungan, aman, dan benar-benar siap dipasarkan.'
      },
      3: {
        points: 9,
        desc: 'Menampilkan wujud final produk dalam kemasan rapi dan siap jual, namun desain visual kemasan masih sederhana.'
      },
      2: {
        points: 6,
        desc: 'Produk ditampilkan tetapi kemasan belum rapi atau kurang layak untuk langsung dipasarkan ke konsumen.'
      },
      1: {
        points: 3,
        desc: 'Tidak menampilkan wujud final produk yang sudah dikemas.'
      }
    }
  },
  {
    id: 'v2_2',
    code: 'V2.2',
    name: 'Rincian Modal, HPP, Harga Jual & Target Pasar',
    category: '2. Kelayakan Bisnis & Kemasan dalam Video (30%)',
    weight: 12,
    levels: {
      4: {
        points: 12,
        desc: 'Menjelaskan rincian Modal Awal, HPP, Harga Jual konsumen, proyeksi keuntungan, dan sasaran pembeli secara lengkap, jelas, dan sinkron dengan artikel.'
      },
      3: {
        points: 9,
        desc: 'Menjelaskan Modal Awal, HPP, Harga Jual, proyeksi keuntungan, dan sasaran pembeli dengan jelas namun tanpa visualisasi pendukung di layar.'
      },
      2: {
        points: 6,
        desc: 'Hanya menyebutkan sebagian komponen (misal harga jual dan target pasar tanpa rincian modal awal/HPP).'
      },
      1: {
        points: 3,
        desc: 'Tidak memaparkan perhitungan ekonomi/HPP dan sasaran pembeli di dalam video.'
      }
    }
  },
  {
    id: 'v2_3',
    code: 'V2.3',
    name: 'Penutup & Jargon Pemasaran',
    category: '2. Kelayakan Bisnis & Kemasan dalam Video (30%)',
    weight: 6,
    levels: {
      4: {
        points: 6,
        desc: 'Durasi penutup proporsional (30–60 detik), ditutup dengan jargon pemasaran orisinal yang sangat berkesan dan ajakan persuasif mendukung produk lokal.'
      },
      3: {
        points: 4.5,
        desc: 'Memuat rangkuman penutup, jargon pemasaran, dan ajakan mendukung produk lokal, namun kurang ekspresif.'
      },
      2: {
        points: 3,
        desc: 'Penutup terlalu cepat/lama dan tidak menyertakan jargon pemasaran yang khas.'
      },
      1: {
        points: 1.5,
        desc: 'Video berhenti tiba-tiba tanpa segmen penutup dan tanpa jargon pemasaran.'
      }
    }
  },
  // KRITERIA 3: PEMANFAATAN BAHAN LOKAL PASURUAN DALAM VIDEO (20%)
  {
    id: 'v3_1',
    code: 'V3.1',
    name: 'Identifikasi Potensi SDA Lokal & Visualisasi Bahan',
    category: '3. Pemanfaatan Bahan Lokal Pasuruan dalam Video (20%)',
    weight: 12,
    levels: {
      4: {
        points: 12,
        desc: 'Mengidentifikasi masalah/potensi SDA lokal Pasuruan dengan sangat kuat dan menunjukkan wujud asli bahan baku lokal serta alat secara jelas.'
      },
      3: {
        points: 9,
        desc: 'Menjelaskan latar belakang potensi SDA lokal Pasuruan dan menunjukkan alat serta bahan baku secara visual.'
      },
      2: {
        points: 6,
        desc: 'Menyebutkan bahan lokal secara lisan namun tidak menampilkan wujud bahan baku dan alat secara jelas.'
      },
      1: {
        points: 3,
        desc: 'Tidak mengaitkan produk dengan potensi lokal Pasuruan dan tidak menunjukkan bahan baku.'
      }
    }
  },
  {
    id: 'v3_2',
    code: 'V3.2',
    name: 'Rangkuman Dampak Ekonomi & Lingkungan Pasuruan',
    category: '3. Pemanfaatan Bahan Lokal Pasuruan dalam Video (20%)',
    weight: 8,
    levels: {
      4: {
        points: 8,
        desc: 'Merangkum dampak positif produk bagi peningkatan ekonomi dan pelestarian lingkungan Kabupaten Pasuruan secara konkret dan meyakinkan.'
      },
      3: {
        points: 6,
        desc: 'Menyampaikan dampak positif produk bagi ekonomi dan lingkungan Pasuruan secara cukup jelas di bagian penutup.'
      },
      2: {
        points: 4,
        desc: 'Hanya menyebutkan dampak ekonomi atau lingkungan secara sepintas tanpa dikaitkan dengan konteks Kabupaten Pasuruan.'
      },
      1: {
        points: 2,
        desc: 'Tidak menyampaikan rangkuman dampak produk bagi ekonomi dan lingkungan.'
      }
    }
  },
  // KRITERIA 4: PENYAJIAN, KOMUNIKASI & SPESIFIKASI TEKNIS VIDEO (20%)
  {
    id: 'v4_1',
    code: 'V4.1',
    name: 'Pembukaan, Komunikasi & Kerjasama Tim',
    category: '4. Penyajian, Komunikasi & Spesifikasi Teknis Video (20%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Perkenalan lengkap (nama inovasi, anggota tim, sekolah); pembagian peran anggota merata, artikulasi lancar, mengenakan seragam resmi/jas lab.'
      },
      3: {
        points: 7.5,
        desc: 'Perkenalan lengkap dan berseragam sesuai aturan; komunikasi lancar namun didominasi oleh 1–2 anggota tim saja.'
      },
      2: {
        points: 5.0,
        desc: 'Perkenalan kurang lengkap dan penyampaian kurang lancar.'
      },
      1: {
        points: 2.5,
        desc: 'Perkenalan tidak dilakukan, anggota tidak mengenakan seragam/jas lab yang ditentukan.'
      }
    }
  },
  {
    id: 'v4_2',
    code: 'V4.2',
    name: 'Kualitas Audio-Visual, Orisinalitas & Spesifikasi YouTube',
    category: '4. Penyajian, Komunikasi & Spesifikasi Teknis Video (20%)',
    weight: 10,
    levels: {
      4: {
        points: 10,
        desc: 'Format 16:9 (landscape), resolusi 720p (HD), MP4 di YouTube; voice over sangat jernih tanpa tertutup angin/musik no-copyright; 100% rekaman asli tim.'
      },
      3: {
        points: 7.5,
        desc: 'Format 16:9, resolusi 720p, 100% rekaman asli; suara cukup jelas meski backsound sesekali agak keras.'
      },
      2: {
        points: 5.0,
        desc: 'Kualitas visual di bawah 720p atau format vertikal pada sebagian klip; suara siswa sering tertutup derau angin/musik latar.'
      },
      1: {
        points: 2.5,
        desc: 'Menggunakan potongan video milik orang lain dari internet (dikenakan sanksi orisinalitas).'
      }
    }
  }
];

export const FINAL_RUBRIC: RubricItem[] = [
  {
    id: 'f1',
    code: 'F1',
    name: 'Sains & Inovasi Produk Fisik',
    category: 'Babak Final (100%)',
    weight: 30,
    levels: {
      4: { points: 30, desc: 'Bukti sangat nyata penerapan konsep Fisika/Kimia/Biologi pada produk akhir, fungsionalitas prima, keamanan konsumsi/pakai teruji, dan kebaruan inovasi istimewa.' },
      3: { points: 22.5, desc: 'Penerapan konsep IPA jelas pada purwarupa, fungsi produk bekerja baik, aman digunakan, dan terdapat inovasi orisinal.' },
      2: { points: 15, desc: 'Penerapan konsep IPA masih sederhana, produk bekerja terbatas, atau keamanan masih memerlukan perbaikan.' },
      1: { points: 7.5, desc: 'Bukti penerapan konsep IPA tidak tampak atau produk tidak dapat berfungsi sebagaimana mestinya.' }
    }
  },
  {
    id: 'f2',
    code: 'F2',
    name: 'Kelayakan Bisnis & Kemasan Fisik',
    category: 'Babak Final (100%)',
    weight: 30,
    levels: {
      4: { points: 30, desc: 'Daya tarik estetika & kepraktisan kemasan fisik istimewa, prinsip ramah lingkungan (eco friendly) terbukti nyata, kelayakan harga jual & ketepatan HPP akurat, kesiapan pasar tinggi.' },
      3: { points: 22.5, desc: 'Kemasan menarik dan rapi, mengusung konsep ramah lingkungan, perhitungan HPP tepat, dan layak jual.' },
      2: { points: 15, desc: 'Kemasan standar, konsep eco-friendly kurang maksimal, atau HPP masih kurang terperinci.' },
      1: { points: 7.5, desc: 'Kemasan tidak layak jual, tidak ramah lingkungan, dan tidak ada perhitungan bisnis yang dapat dipertanggungjawabkan.' }
    }
  },
  {
    id: 'f3',
    code: 'F3',
    name: 'Pemanfaatan Bahan Lokal Pasuruan',
    category: 'Babak Final (100%)',
    weight: 20,
    levels: {
      4: { points: 20, desc: 'Keaslian pemanfaatan komoditas lokal Kabupaten Pasuruan sangat dominan & orisinal, nilai tambah ekonomi sangat tinggi & dampak lingkungan positif nyata.' },
      3: { points: 15, desc: 'Bahan lokal Pasuruan menjadi komponen kunci dengan nilai tambah ekonomi memadai dan ramah lingkungan.' },
      2: { points: 10, desc: 'Bahan lokal hanya sebagai pelengkap sekunder, nilai tambah ekonomi biasa saja.' },
      1: { points: 5, desc: 'Tidak memanfaatkan potensi komoditas khas Kabupaten Pasuruan.' }
    }
  },
  {
    id: 'f4',
    code: 'F4',
    name: 'Presentasi, Penguasaan Materi & Tim',
    category: 'Babak Final (100%)',
    weight: 20,
    levels: {
      4: { points: 20, desc: 'Kelancaran komunikasi saat pemaparan sangat baik, ketepatan menjawab pertanyaan penguji kritis dan mantap, penguasaan sains-bisnis mendalam, kerjasama tim sangat kompak.' },
      3: { points: 15, desc: 'Pemaparan lancar, mampu menjawab sebagian besar pertanyaan dewan juri, kerjasama tim terlihat baik.' },
      2: { points: 10, desc: 'Penyampaian presentasi terbata-bata, jawaban kurang mengena, dan didominasi hanya oleh satu siswa.' },
      1: { points: 5, desc: 'Tidak mampu mempresentasikan karya dan gagal menjawab pertanyaan dasar dewan juri.' }
    }
  }
];

export const ADMIN_CHECKLIST_TEMPLATE = [
  {
    id: 1,
    item: 'Pendaftaran, Mengirim Artikel Maksimal 5 Lembar dan Lampiran (foto produk/pembuatan) serta Video Minimal 5 menit Maksimal 10 Menit',
    status: 'Ya' as const,
    keterangan: 'Lengkap sesuai ketentuan panduan'
  },
  {
    id: 2,
    item: 'Surat Pernyataan Orisinalitas Karya (Lampiran 3) ditandatangani Guru Pendamping & Ketua Tim',
    status: 'Ya' as const,
    keterangan: 'Ada & bermaterai/asli'
  },
  {
    id: 3,
    item: 'Biodata Peserta (Lampiran 4) terisi lengkap & ditandatangani Kepala Sekolah',
    status: 'Ya' as const,
    keterangan: 'Lengkap dengan stempel sekolah'
  },
  {
    id: 4,
    item: 'Produk aman dikonsumsi (makanan/minuman) atau aman digunakan (barang/alat) serta ramah lingkungan',
    status: 'Ya' as const,
    keterangan: 'Terverifikasi aman dan ramah lingkungan'
  }
];
