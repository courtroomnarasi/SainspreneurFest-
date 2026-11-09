import { Team, Judge, Evaluation } from '../types';

const envDriveFolderId = (import.meta as any).env?.VITE_DRIVE_FOLDER_ID || '1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb';
export const GOOGLE_SPREADSHEET_ID =
  (import.meta as any).env?.VITE_SPREADSHEET_ID ||
  '1iRtT9aZ5czwy_xQxMThzjgM2Xfc5wwJMiH4mp85mLwo';
export const GOOGLE_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/edit`;
export const GOOGLE_DRIVE_DB_URL = `https://drive.google.com/drive/folders/${envDriveFolderId}?usp=sharing`;
export const APPS_SCRIPT_API_URL =
  (import.meta as any).env?.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzu0sKXs_6zrBsQjAjnYYyEljVU7b4rNgfYinqpBkpF8m-hoEiWsdL6rhiGKZY8UNsyNA/exec';

export const INITIAL_JUDGES: Judge[] = [
  {
    id: 'juri-1794186497902',
    username: 'juri-001',
    password: '@juri123',
    name: 'Drs. Joni Suparman, M.Pd',
    nip: '196706131999031004',
    institution: 'Pengawas Dinas Pendidikan',
    field: 'Sains & Inovasi Teknologi',
    isActive: true
  },
  {
    id: 'juri-1794186758033',
    username: 'juri-002',
    password: '@juri123',
    name: 'Akhmad Nasor, M.Pd',
    nip: '198704082019031001',
    institution: 'Kepala Sekolah',
    field: 'Sains & Inovasi Teknologi',
    isActive: true
  }
];

/**
 * 19 Tim Resmi Peserta Lomba Sainspreneur Pasuruan Science Festival 2026
 * Seluruh tautan Folder, Video (.mp4), dan Makalah (.pdf) diambil langsung dari
 * masing-masing subfolder peserta di Google Drive:
 * https://drive.google.com/drive/folders/1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb
 */
export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    code: 'TIM-01',
    name: 'Tim Esperogen (METASUB)',
    school: 'SMPN 2 Prigen',
    productTitle: 'METASUB-ESPEROGEN: Inovasi Media Tanam Substitusi Komposit Limbah Tebu dan Daun Pinus untuk Mendukung Green Economy UMKM Tanaman Hias Prigen',
    localResource: 'Limbah Tebu & Daun Pinus Hutan Prigen',
    leader: 'Fredella Emily Abdillah',
    members: ['Fredella Emily Abdillah', 'Danish Mirza Brilian', 'Julio Alfiansyah'],
    mentorTeacher: 'Amar Abdillah, M.Pd.',
    tahap: 'Tahap 2',
    folderId: '14m-tKb7-zsSveQNP9FsQr7-khV6Qf1b3',
    folderUrl: 'https://drive.google.com/drive/folders/14m-tKb7-zsSveQNP9FsQr7-khV6Qf1b3',
    articleFileId: '1X7eJr4Zjqdqc0WKeDWxdqmuCLElyztmM',
    articleFileName: 'Sainspreneur2026_SMPN 2 Prigen_METASUB-ESPEROGEN_EMILY - amar abdillah.pdf',
    articleUrl: 'https://drive.google.com/file/d/1X7eJr4Zjqdqc0WKeDWxdqmuCLElyztmM/view?usp=drive_web',
    videoFileId: '1_AIYkWy9oihBJ17R7LlwdVYWy1hjGP2-',
    videoFileName: 'METASUB_Tim Sainspreneur Esperogen.mp4',
    videoUrl: 'https://drive.google.com/file/d/1_AIYkWy9oihBJ17R7LlwdVYWy1hjGP2-/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1_AIYkWy9oihBJ17R7LlwdVYWy1hjGP2-&sz=w800',
    registeredAt: '2026-11-02',
    articleAbstract: 'Kawasan Prigen memiliki potensi agrowisata tanaman hias bernilai tinggi, namun limbah ampas tebu dan guguran daun pinus kering sering belum terkelola optimal. Inovasi METASUB-ESPEROGEN menggabungkan kompos serat tebu kaya hara organik dan daun pinus berkadar lignin stabil sebagai media tanam porous pengganti tanah sintetis yang ramah lingkungan dan ekonomis.',
    articleSummary: {
      background: 'Tingginya permintaan media tanam berkualitas bagi florikultura Prigen di tengah menumpuknya limbah ampas tebu dan serasah pinus.',
      scienceTheory: 'Prinsip aerasi dan porositas media porous berbasis selulosa terkompos, penyeimbangan rasio C/N untuk nutrisi perakaran tanaman.',
      methodology: 'Pengomposan terkontrol limbah tebu dengan inokulan EM4, penyerbukan daun pinus kering mesh 20, dan blending homogen perbandingan 2:1:1.',
      businessModel: 'Kemasan polybag biodegradable 5 kg dengan HPP Rp 7.500 dan harga jual Rp 15.000 menyasar sentra tanaman hias Prigen dan Tretes.',
      localImpact: 'Menyerap 200 kg limbah tebu dan pinus per bulan serta membuka peluang wirausaha hijau bagi siswa sekolah.'
    }
  },
  {
    id: 'team-2',
    code: 'TIM-02',
    name: 'Tim Mangocent Rejoso',
    school: 'SMPN 2 Rejoso',
    productTitle: 'MANGOCENT: Inovasi Pemanfaatan Limbah Kulit Mangga di Lingkungan Sekolah menjadi Parfum Ramah Lingkungan',
    localResource: 'Limbah Kulit Mangga Gadung Rejoso',
    leader: 'Uswatun Chasanah',
    members: ['Uswatun Chasanah', 'Cinta Syafira Adelita', 'Agam Abdillah Manfi'],
    mentorTeacher: 'Wahdaniah Putri Aryani, S.Pd',
    tahap: 'Tahap 2',
    folderId: '1togF5Z41OuQ3Y4zQHqOGOlPliCcMBD9J',
    folderUrl: 'https://drive.google.com/drive/folders/1togF5Z41OuQ3Y4zQHqOGOlPliCcMBD9J',
    articleFileId: '1sQtklN7wE5fTNTgIulx_X4x7W-PXXEzr',
    articleFileName: 'Sainspreneur2026_SMPN 2 Rejoso_Mangocent - Putriiary.pdf',
    articleUrl: 'https://drive.google.com/file/d/1sQtklN7wE5fTNTgIulx_X4x7W-PXXEzr/view?usp=drive_web',
    videoFileId: '1lsqe4xp7Rx_6Za22SNvYb2x42Vhb9sR5',
    videoFileName: 'Vidio_MangoCent_SMPN 2 Rejoso_Sainspreneur.mp4',
    videoUrl: 'https://drive.google.com/file/d/1lsqe4xp7Rx_6Za22SNvYb2x42Vhb9sR5/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1lsqe4xp7Rx_6Za22SNvYb2x42Vhb9sR5&sz=w800',
    registeredAt: '2026-11-02',
    articleAbstract: 'Musim panen mangga di Rejoso menyisakan volume limbah kulit mangga yang cepat membusuk. MANGOCENT mengekstraksi minyak esensial aroma tropis dan senyawa flavonoid dari kulit mangga segar melalui maserasi dan destilasi hidro, diformulasikan menjadi parfum alami tahan lama tanpa alkohol sintetis keras.',
    articleSummary: {
      background: 'Melimpahnya limbah kulit mangga arum manis dan gadung di sentra perkebunan mangga Rejoso.',
      scienceTheory: 'Kandungan monoterpen dan ester volatil kulit mangga yang berkarakter fruity-floral diikat dengan fiksatif alami gliserin.',
      methodology: 'Sortasi dan pencucian kulit mangga, ekstraksi maserasi pelarut etanol nabati food-grade 70%, filtrasi bertingkat, dan maturasi aroma.',
      businessModel: 'Botol spray travel size 30 ml HPP Rp 9.000 dijual seharga Rp 20.000 dengan konsep souvenir aroma khas Pasuruan.',
      localImpact: 'Mengurangi limbah organik sekolah dan perkebunan hingga 50 kg per siklus produksi.'
    }
  },
  {
    id: 'team-3',
    code: 'TIM-03',
    name: 'Tim Reokies Kejayan',
    school: 'SMPN 1 Kejayan',
    productTitle: 'REOKIES: Inovasi Cookies Tepung Rebung Bambu Lokal Pasuruan sebagai Camilan Kaya Serat dan Ramah Lingkungan',
    localResource: 'Rebung Bambu Lokal Kejayan Pasuruan',
    leader: 'Sulfiatul Rohma',
    members: ['Sulfiatul Rohma', 'Nuril Ilmiah Riski H', 'Sinta'],
    mentorTeacher: 'Evy Priastutik, S.Pd',
    tahap: 'Tahap 2',
    folderId: '1YXGvoitkm4krbO99-tj9NagzSsbHKtP2',
    folderUrl: 'https://drive.google.com/drive/folders/1YXGvoitkm4krbO99-tj9NagzSsbHKtP2',
    articleFileId: '1W2dXShH2e0T4mkwVfUbwedK9a9Z2Wj71',
    articleFileName: 'SAINSPRENEUR2026_SMPN 1 KEJAYAN_REOKIES - Kholilatul Inayah.pdf',
    articleUrl: 'https://drive.google.com/file/d/1W2dXShH2e0T4mkwVfUbwedK9a9Z2Wj71/view?usp=drive_web',
    videoFileId: '1fgPkaTFhCNVMB4rCnZR7qYhhP4cWj4dv',
    videoFileName: 'video REOKIES.mp4',
    videoUrl: 'https://drive.google.com/file/d/1fgPkaTFhCNVMB4rCnZR7qYhhP4cWj4dv/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1fgPkaTFhCNVMB4rCnZR7qYhhP4cWj4dv&sz=w800',
    registeredAt: '2026-11-03',
    articleAbstract: 'Bambu tumbuh subur di bantaran sungai Kejayan. Rebung muda kaya serat larut (dietary fiber) dan kalium namun memiliki daya simpan singkat. REOKIES mengeringkan dan menepung rebung untuk mensubstitusi 40% tepung terigu dalam pembuatan kukis renyah sehat rendah indeks glikemik.',
    articleSummary: {
      background: 'Potensi rebung liar melimpah di Kejayan yang belum diolah menjadi produk olahan bernilai tambah tinggi.',
      scienceTheory: 'Kandungan serat pangan selulosa dan lignin rebung membantu peristaltik usus serta mengontrol penyerapan kolesterol.',
      methodology: 'Perebusan rebung untuk menghilangkan aroma langu, pengeringan oven kabinet suhu 60°C, penepungan mesh 80, dan pemanggangan cookies.',
      businessModel: 'Standing pouch 120g HPP Rp 6.000 dijual Rp 14.000 dengan target pasar camilan diet sehat dan penderita diabetes.',
      localImpact: 'Meningkatkan pendapatan petani pemotong rebung lokal Kejayan.'
    }
  },
  {
    id: 'team-4',
    code: 'TIM-04',
    name: 'Tim Axiom Gempol',
    school: 'SMPN 1 Gempol',
    productTitle: 'AXIOM: Inovasi Produk Sainspreneur SMPN 1 Gempol Berbasis Potensi Lokal Ramah Lingkungan',
    localResource: 'Bahan Alami Lokal Industri Gempol',
    leader: 'Firza Devi Puji Rahayu',
    members: ['Firza Devi Puji Rahayu', 'Anis Rokhila', 'Fandi Alfiano'],
    mentorTeacher: 'Ika Sugiarti Ningsih, S.Pd',
    tahap: 'Tahap 2',
    folderId: '1cAmH-9W7Ohjz0z9HSfordKDk8nVbej0l',
    folderUrl: 'https://drive.google.com/drive/folders/1cAmH-9W7Ohjz0z9HSfordKDk8nVbej0l',
    articleFileId: '1_oFH54qlT0fd2oBqQvSZ95DlqKBi5JzC',
    articleFileName: 'Sainspreneur SMPN 1 Gempol 2026 - Ika Sugiarti.pdf',
    articleUrl: 'https://drive.google.com/file/d/1_oFH54qlT0fd2oBqQvSZ95DlqKBi5JzC/view?usp=drive_web',
    videoFileId: '1ECAa1kJbWdj2zMfLAFDTvvRl5TiVhRkz',
    videoFileName: 'Tim Axiom SMPN 1 Gempol - Sci Preneur Pas Fest 2026.mp4',
    videoUrl: 'https://drive.google.com/file/d/1ECAa1kJbWdj2zMfLAFDTvvRl5TiVhRkz/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1ECAa1kJbWdj2zMfLAFDTvvRl5TiVhRkz&sz=w800',
    registeredAt: '2026-11-03',
    articleAbstract: 'Kawasan Gempol yang dinamis memiliki tantangan pengelolaan lingkungan yang membutuhkan solusi inovatif pelajar. Tim Axiom menyajikan terobosan produk terapan berbasis sains yang memanfaatkan material terbarukan lokal menjadi barang pakai bernilai komersial tinggi.',
    articleSummary: {
      background: 'Tuntutan penerapan green industry dan daur ulang bahan sisa di koridor Gempol.',
      scienceTheory: 'Prinsip biokomposit dan reaksi kimia ramah lingkungan dalam pembentukan produk berkelanjutan.',
      methodology: 'Karakterisasi bahan baku lokal, perlakuan fisis, pengujian ketahanan, dan kalkulasi keekonomian produk.',
      businessModel: 'Distribusi bertahap ke koperasi sekolah dan marketplace lokal Pasuruan.',
      localImpact: 'Membangun kesadaran saintifik dan wirausaha mandiri bagi siswa SMPN 1 Gempol.'
    }
  },
  {
    id: 'team-5',
    code: 'TIM-05',
    name: 'Tim Nanova (Shinga)',
    school: 'SMPN 1 Bangil',
    productTitle: 'SHINGA (Shrimp & Moringa LIT): Olah Kulit Udang Vaname dan Daun Kelor sebagai Alternatif Camilan Sehat Bernilai Ekonomis',
    localResource: 'Udang Vaname Tambak Bangil & Daun Kelor Pasuruan',
    leader: 'Qonita Aliesya Ulum',
    members: ['Qonita Aliesya Ulum', 'Naura Balqis Maulidyah', 'Adelia Nadine Helga El Frida'],
    mentorTeacher: 'Suryaningsasi, S.Pd., M.Pd.',
    tahap: 'Tahap 2',
    folderId: '178VH1BERPsU0h1dZuP7j90zUUZEVm9yA',
    folderUrl: 'https://drive.google.com/drive/folders/178VH1BERPsU0h1dZuP7j90zUUZEVm9yA',
    articleFileId: '1g_mh5s4n2kQSV-BsCvH4VZE0PNgxEbEr',
    articleFileName: 'Sainspreneur2026_SMPN1Bangil_Shinga_Olah Kulit Udang dan Daun Kelor - Qonita Aliyesa.pdf',
    articleUrl: 'https://drive.google.com/file/d/1g_mh5s4n2kQSV-BsCvH4VZE0PNgxEbEr/view?usp=drive_web',
    videoFileId: '1ztB2fV_Gk3KVwouVQzVZW7NRY9xxe70f',
    videoFileName: 'OLAH KULIT UDANG DAN DAUN KELOR SEBAGAI ALTERNATIF CAMILAN SEHAT BERNILAI EKONOMIS -SMPN 1 Bangil.mp4',
    videoUrl: 'https://drive.google.com/file/d/1ztB2fV_Gk3KVwouVQzVZW7NRY9xxe70f/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1ztB2fV_Gk3KVwouVQzVZW7NRY9xxe70f&sz=w800',
    registeredAt: '2026-11-03',
    articleAbstract: 'Wilayah pesisir Bangil terkenal dengan budidaya udang vaname bermutu tinggi. Tim Nanova memadukan daging dan kulit udang berkitin tinggi bersama daun kelor (Moringa oleifera) kaya mikronutrien menjadi stik camilan gurih renyah tinggi kalsium dan bebas pengawet buatan untuk pencegahan stunting pada remaja.',
    articleSummary: {
      background: 'Melimpahnya komoditas udang vaname Bangil serta tingginya kandungan nutrisi kelor yang belum dikemas secara kekinian.',
      scienceTheory: 'Pengkayaan kalsium dari kitosan udang dan senyawa antioksidan quercetin daun kelor dalam matriks pati.',
      methodology: 'Penghalusan bahan segar, pencampuran adonan tapioka dan rempah khas Pasuruan, pemotongan stik, dan pemanggangan oven.',
      businessModel: 'Kemasan foil kedap udara 80g HPP Rp 5.800 dipasarkan Rp 13.000 menyasar anak sekolah dan keluarga.',
      localImpact: 'Mendukung program penuntasan stunting dan memberdayakan hasil tambak lokal Bangil.'
    }
  },
  {
    id: 'team-6',
    code: 'TIM-06',
    name: 'Tim Saluvia (Sempbada Preneur)',
    school: 'SMPN 2 Bangil',
    productTitle: 'SALUVIA: Inovasi Hand Sanitizer Berbahan Ekstrak Daun Sirih (Piper betle L.) dan Lidah Buaya (Aloe vera) sebagai Produk Sanitasi Alami',
    localResource: 'Daun Sirih Hijau & Gel Lidah Buaya Bangil',
    leader: 'Fatimah Azzahra',
    members: ['Fatimah Azzahra', 'Sanniyah \'Ifti Islamiyah', 'Khayla Afsheen Myesha Ramadhani'],
    mentorTeacher: 'Pujawati, S.Pd.',
    tahap: 'Tahap 2',
    folderId: '1cnIvLgI7ekMCZ0ivphRVTqjPTismSWb8',
    folderUrl: 'https://drive.google.com/drive/folders/1cnIvLgI7ekMCZ0ivphRVTqjPTismSWb8',
    articleFileId: '1vs5wR1tZUxD597M_Azf3cCSEYd1WHCSY',
    articleFileName: 'Sainspreneur2026_SMPN2Bangil_HandsanitizerSALUVIA - KINARA Channel.pdf',
    articleUrl: 'https://drive.google.com/file/d/1vs5wR1tZUxD597M_Azf3cCSEYd1WHCSY/view?usp=drive_web',
    videoFileId: '1zwyI5TiY9N1Ogy7K6_ZksOnjKChKz_R4',
    videoFileName: 'SEMPBADA PRENEUR __ SMPN 2 BANGIL __ Pasuruan Science Festival 2026 __ Produk Hand sanitizer SALUVIA.mp4',
    videoUrl: 'https://drive.google.com/file/d/1zwyI5TiY9N1Ogy7K6_ZksOnjKChKz_R4/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1zwyI5TiY9N1Ogy7K6_ZksOnjKChKz_R4&sz=w800',
    registeredAt: '2026-11-03',
    articleAbstract: 'Hand sanitizer berbasis alkohol kimiawi tinggi kerap menyebabkan kulit tangan kering dan iritasi. SALUVIA diformulasikan dari zat antiseptik alami kavikol dan eugenol daun sirih hijau yang dipadukan dengan gel lidah buaya lokal sebagai pelembap alami yang lembut dan terbukti efektif menghambat bakteri pathogen.',
    articleSummary: {
      background: 'Kebutuhan sanitasi harian siswa dan guru di sekolah tanpa efek samping iritasi kulit.',
      scienceTheory: 'Aktivitas antibakteri senyawa fenolik sirih mendenaturasi protein bakteri dan pelembap polisakarida lidah buaya.',
      methodology: 'Ekstraksi dekoksi daun sirih suhu 90°C selama 15 menit, pemurnian gel lidah buaya segar, pencampuran dan pengujian daya hambat kuman.',
      businessModel: 'Botol spray 60ml HPP Rp 4.200, harga jual Rp 10.000 untuk kebutuhan sekolah, perkantoran, dan masyarakat.',
      localImpact: 'Pemanfaatan tanaman obat keluarga (TOGA) pekarangan warga Bangil.'
    }
  },
  {
    id: 'team-7',
    code: 'TIM-07',
    name: 'Tim Bantal Eco-Enzyme',
    school: 'SMPN 2 Gondangwetan',
    productTitle: 'Inovasi Pemanfaatan Ampas Eco-Enzyme sebagai Produk Bantal Terapi Eco Enzym melalui Pendekatan STEAM dan ESD',
    localResource: 'Ampas Eco-Enzyme Fermentasi Buah Gondangwetan',
    leader: 'Illiyyah Ainishillah',
    members: ['Illiyyah Ainishillah', 'Intan Nor Aini', 'Dafa Achmad Sadad'],
    mentorTeacher: 'Dra. Siti Kosidah / Siti Kosidah, S.Pd',
    tahap: 'Tahap 2',
    folderId: '1mWWM_OwsgAUaSkwCheVM5iFSgT6vctAZ',
    folderUrl: 'https://drive.google.com/drive/folders/1mWWM_OwsgAUaSkwCheVM5iFSgT6vctAZ',
    articleFileId: '1Sa47BhaBSb7PZK8IkS-8WVSY2JA8Hyxj',
    articleFileName: 'BANTAL ECO ENZYME ALAMI - Kirana Nur Hayati.pdf',
    articleUrl: 'https://drive.google.com/file/d/1Sa47BhaBSb7PZK8IkS-8WVSY2JA8Hyxj/view?usp=drive_web',
    videoFileId: '1LEwituUDjpbs0B4lix4TGxiwcDzAarq6',
    videoFileName: 'Video_Bantal Eco Enzyme SMPN 2 GONDANGWETAN.mp4',
    videoUrl: 'https://drive.google.com/file/d/1LEwituUDjpbs0B4lix4TGxiwcDzAarq6/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1LEwituUDjpbs0B4lix4TGxiwcDzAarq6&sz=w800',
    registeredAt: '2026-11-04',
    articleAbstract: 'Pembuatan cairan eco-enzyme di sekolah menghasilkan residu ampas padat buah yang cukup banyak. Menggunakan integrasi STEAM dan Education for Sustainable Development (ESD), ampas tersebut dikeringkan higienis, diberi rempah aromaterapi, dan dijadikan isian bantal leher terapi pereda ketegangan otot dan stres.',
    articleSummary: {
      background: 'Optimalisasi sisa padat fermentasi eco-enzyme agar berprinsip zero-waste komprehensif.',
      scienceTheory: 'Pelepasan uap minyak atsiri sisa fermentasi buah dan rempah memberikan efek relaksasi pada sistem saraf otonom.',
      methodology: 'Pengeringan ampas higienis dengan solar dryer, desinfeksi termal, pencampuran aromaterapi, penjahitan sarung bantal ergonomis.',
      businessModel: 'Bantal leher terapi HPP Rp 18.000 dijual Rp 38.000 untuk pasar kesehatan dan cinderamata edukatif.',
      localImpact: 'Zero-waste program sekolah ramah lingkungan Adiwiyata Gondangwetan.'
    }
  },
  {
    id: 'team-8',
    code: 'TIM-08',
    name: 'Tim Mangcleann Sukorejo',
    school: 'SMPN 1 Sukorejo',
    productTitle: 'MANGCLEANN: Inovasi Sabun Kertas (Paper Soap) Berbasis Ekstrak Daun Mangga sebagai Pembersih Praktis Portabel Ramah Lingkungan',
    localResource: 'Daun Mangga Sukorejo Pasuruan',
    leader: 'Rizka Zea Aufa Dabit',
    members: ['Rizka Zea Aufa Dabit', 'Putri Denok Jelita', 'Niken Rahmadhani'],
    mentorTeacher: 'Staniatul Masruroh, S.Pd.',
    tahap: 'Tahap 2',
    folderId: '1z8egDdO4BTqy2727MTFekmyy65vwqOgC',
    folderUrl: 'https://drive.google.com/drive/folders/1z8egDdO4BTqy2727MTFekmyy65vwqOgC',
    articleFileId: '1kTpUtK9BdZsFZgTJjxBZCxrQ2Mmxw7sN',
    articleFileName: 'Sainspreneur2026_SMPN1Sukorejo_Mangcleann.pptx - Putri denok Jelita1212.pdf',
    articleUrl: 'https://drive.google.com/file/d/1kTpUtK9BdZsFZgTJjxBZCxrQ2Mmxw7sN/view?usp=drive_web',
    videoFileId: '18LD3cyuW0RW9Mapp6euGXgwolyH-JsBp',
    videoFileName: 'MANGCLEANN (PAPER SOAP BERBASIS EKSTRAK DAUN MANGGA) SMPN 1 SUKOREJO Sci-Preneur PaS-Fest 26.mp4',
    videoUrl: 'https://drive.google.com/file/d/18LD3cyuW0RW9Mapp6euGXgwolyH-JsBp/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=18LD3cyuW0RW9Mapp6euGXgwolyH-JsBp&sz=w800',
    registeredAt: '2026-11-04',
    articleAbstract: 'Kebutuhan mencuci tangan saat bepergian sering terkendala sabun cair yang mudah tumpah. MANGCLEANN mengolah ekstrak tanin dan flavonoid daun pohon mangga Sukorejo menjadi lapisan sabun kertas larut air sekali pakai yang tipis, praktis dikantongi, serta ramah bagi biota air.',
    articleSummary: {
      background: 'Melimpahnya pohon mangga di pekarangan sekolah dan rumah warga Sukorejo yang daun gugurnya sering dibakar.',
      scienceTheory: 'Tanin daun mangga berperan sebagai zat antimikroba alami yang disatukan dengan surfaktan biodegradable pada selulosa larut.',
      methodology: 'Ekstraksi daun mangga tua, pencampuran formula sabun cair busa lembut, pelapisan merata pada kertas larut, pemotongan presisi.',
      businessModel: 'Kotak saku isi 30 lembar HPP Rp 3.000 dijual Rp 8.000 menyasar pelajar dan traveler.',
      localImpact: 'Mencegah polusi asap pembakaran sampah daun mangga di kawasan permukiman.'
    }
  },
  {
    id: 'team-9',
    code: 'TIM-09',
    name: 'Tim Nasha Preneur (MANGLOOP)',
    school: 'SMPN 1 Bangil',
    productTitle: 'MANGLOOP: Inovasi Roll-On Berbasis Ekstrak Kulit Mangga (Mangifera indica L.) sebagai Produk Perawatan Kulit Alami',
    localResource: 'Limbah Kulit Mangga Harum Manis Bangil',
    leader: 'Muhammad Reza Pahlevi Albaihaqi',
    members: ['Muhammad Reza Pahlevi Albaihaqi', 'Kayla Khanza Shalooma', 'Zevanna Farzana Qurrota\'ayun'],
    mentorTeacher: 'Iftitachiatur Rusda, S.Pd',
    tahap: 'Tahap 2',
    folderId: '1OnhwUjmPLnYZOlw-rEja8kKmkYNIdQB3',
    folderUrl: 'https://drive.google.com/drive/folders/1OnhwUjmPLnYZOlw-rEja8kKmkYNIdQB3',
    articleFileId: '1qmPoDAHHgMfbQXQ0iQ2CmFWl4NcTt-AP',
    articleFileName: 'Sainspreneur2026_SMPN1Bangil_MANGLOOP - nadafajriya.s 30.pdf',
    articleUrl: 'https://drive.google.com/file/d/1qmPoDAHHgMfbQXQ0iQ2CmFWl4NcTt-AP/view?usp=drive_web',
    videoFileId: '1pMbvGt1-HuA7ItHaCRvreFof0-dGnE3B',
    videoFileName: 'Sainspreneur SMPN 1 Bangil, MANGLOOP_ Roll-On Berbasis Ekstrak Kulit Mangga Tim NASHA Preneur.mp4',
    videoUrl: 'https://drive.google.com/file/d/1pMbvGt1-HuA7ItHaCRvreFof0-dGnE3B/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1pMbvGt1-HuA7ItHaCRvreFof0-dGnE3B&sz=w800',
    registeredAt: '2026-11-04',
    articleAbstract: 'Kulit buah mangga yang tebal sering dibuang begitu saja di pedagang jus dan pasar buah Bangil. MANGLOOP mengolah senyawa mangiferin aktif dari kulit mangga menjadi formula roll-on deodoran dan serum perawat kulit yang mencerahkan secara alami dan mencegah bau badan tanpa aluminium klorida.',
    articleSummary: {
      background: 'Limbah organik pedagang buah Bangil mencapai ratusan kilogram per hari saat musim mangga.',
      scienceTheory: 'Senyawa polifenol mangiferin terbukti memiliki aktivitas anti-inflamasi, anti-tirosinase pencerah, dan antibakteri terhadap Corynebacterium.',
      methodology: 'Ekstraksi ultrasonikasi terpandu suhu rendah, formulasi basis roll-on non-lengket, dan pengujian stabilitas fisik 14 hari.',
      businessModel: 'Kemasan botol roll-on 50ml HPP Rp 7.000 dijual Rp 16.000 dengan positioning produk personal care ramah remaja.',
      localImpact: 'Mengurangi beban tempat pembuangan sampah pasar Bangil dan mendaur ulang residu organik.'
    }
  },
  {
    id: 'team-10',
    code: 'TIM-10',
    name: 'Tim Noctura Kraton',
    school: 'SMPN 2 Kraton',
    productTitle: 'NOCTURA: Multifunctional Night Lotion dari Ekstrak Daun Sedap Malam Khas Pasuruan',
    localResource: 'Bunga & Daun Sedap Malam Rembang-Kraton',
    leader: 'M. Alfiyanto Romadhoni',
    members: ['M. Alfiyanto Romadhoni', 'Ibnaty Raniah Muyassarah', 'Wajihatus Zahra Arashy'],
    mentorTeacher: 'Fadiatul Ainiah, S.Pd',
    tahap: 'Tahap 2',
    folderId: '1j0xYLpANOhKDdIxFJEb8iovHoMmQQGGv',
    folderUrl: 'https://drive.google.com/drive/folders/1j0xYLpANOhKDdIxFJEb8iovHoMmQQGGv',
    articleFileId: '1SAEQrAQbUnSrvwcdnb4wHGm0YUVHl2HO',
    articleFileName: 'Sainspreneur2026_SMPN2Kraton_Noctura - xxx yyy.pdf',
    articleUrl: 'https://drive.google.com/file/d/1SAEQrAQbUnSrvwcdnb4wHGm0YUVHl2HO/view?usp=drive_web',
    videoFileId: '1N5iXakGWz5StzQyRm7lSCFyYTGbzlzzK',
    videoFileName: 'NOCTURA _ Multifunction Night Lotion Berbasis Daun Sedap Malam _ Pasuruan Science Festival 2026.mp4',
    videoUrl: 'https://drive.google.com/file/d/1N5iXakGWz5StzQyRm7lSCFyYTGbzlzzK/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1N5iXakGWz5StzQyRm7lSCFyYTGbzlzzK&sz=w800',
    registeredAt: '2026-11-04',
    articleAbstract: 'Pasuruan merupakan salah satu produsen bunga sedap malam terbesar di Indonesia. Tim NOCTURA memanfaatkan bagian daun dan bunga sortiran untuk diekstrak senyawa relaksan dan antioksidannya, diracik menjadi losion malam pelembap kulit yang sekaligus memberikan efek tidur nyenyak (sleep aid).',
    articleSummary: {
      background: 'Petani sedap malam Kraton dan Rembang sering membuang daun pangkasan dan bunga yang tidak lolos sortir pasar.',
      scienceTheory: 'Senyawa linalool dan metil benzoat memberikan efek sedatif ringan dan meregenerasi sel epidermis pada malam hari.',
      methodology: 'Maserasi daun segar, emulsi minyak dalam air dengan pengemulsi asam stearat nabati, uji pH dan kelembapan kulit.',
      businessModel: 'Botol pump 100ml HPP Rp 11.000 dijual Rp 25.000 dengan branding kosmetik herbal ikonik Pasuruan.',
      localImpact: 'Memberdayakan kelompok tani bunga sedap malam lokal dengan pemanfaatan biomassa sampingan.'
    }
  },
  {
    id: 'team-11',
    code: 'TIM-11',
    name: 'Tim GoBar (Maulana Ibrahim)',
    school: 'SMPN 2 Grati',
    productTitle: 'GOBAR: Inovasi Produk Sainspreneur Solutif Berbasis Sumber Daya Hayati Lokal Grati',
    localResource: 'Biomassa Hayati & Komoditas Lokal Grati',
    leader: 'Maulana Ibrahim',
    members: ['Maulana Ibrahim', 'Siti Roikhatul Jannah', 'Anindita Belani Ramadhan'],
    mentorTeacher: 'Dewi Anjarsari, S.Pd.',
    tahap: 'Tahap 2',
    folderId: '1BfDbqC3XjM1AzpaGKCslrKeaXvd1n0sB',
    folderUrl: 'https://drive.google.com/drive/folders/1BfDbqC3XjM1AzpaGKCslrKeaXvd1n0sB',
    articleFileId: '19ERYrjzySYAe6k43BhmOqf0q6icY7hyt',
    articleFileName: 'Sainspreneur2026_SMPN2Grati_GoBar - Dewi Anjarsari.pdf',
    articleUrl: 'https://drive.google.com/file/d/19ERYrjzySYAe6k43BhmOqf0q6icY7hyt/view?usp=drive_web',
    videoFileId: '18mNam822S6jgIAopyJjwmWlesZFUF5vj',
    videoFileName: 'Sainspreneur2026_SMPN2Grati_GoBar.mp4',
    videoUrl: 'https://drive.google.com/file/d/18mNam822S6jgIAopyJjwmWlesZFUF5vj/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=18mNam822S6jgIAopyJjwmWlesZFUF5vj&sz=w800',
    registeredAt: '2026-11-04',
    articleAbstract: 'Kawasan Grati memiliki potensi sumber daya hayati dan hasil pertanian lokal yang melimpah. Tim GoBar SMPN 2 Grati merancang inovasi produk sains terapan bernilai tambah ekonomis tinggi yang ramah lingkungan.',
    articleSummary: {
      background: 'Optimalisasi potensi bahan baku lokal Grati menjadi produk inovatif berdaya saing tinggi.',
      scienceTheory: 'Pemanfaatan kandungan nutrisi dan bioaktif bahan alam lokal untuk formulasi produk fungsional.',
      methodology: 'Pengolahan higienis di laboratorium sekolah, uji organoleptik dan stabilitas formula, serta pengemasan modern.',
      businessModel: 'Pemasaran melalui koperasi binaan sekolah dan bazar UMKM Kabupaten Pasuruan.',
      localImpact: 'Meningkatkan nilai ekonomi komoditas lokal Grati dan melatih kewirausahaan sains siswa.'
    }
  },
  {
    id: 'team-12',
    code: 'TIM-12',
    name: 'Tim DeoSole Patch (M. Ihsanuddin)',
    school: 'SMPN 2 Grati',
    productTitle: 'DEOSOLE PATCH: Pengembangan Patch Deodoran Sepatu & Kaki Berbasis Bahan Alami Antibakteri Lokal Grati',
    localResource: 'Flora Antibakteri & Bahan Alami Lokal Grati',
    leader: 'Muhammad Ihsanuddin Syams',
    members: ['Muhammad Ihsanuddin Syams', 'Ilham Riffat Afzari', 'Muhammad Rafandra Muhyiddin'],
    mentorTeacher: 'Dewi Anjarsari, S.Pd.',
    tahap: 'Tahap 2',
    folderId: '1n-nLsHqJVKsjZRJ8YObFGnE9A_WWigNR',
    folderUrl: 'https://drive.google.com/drive/folders/1n-nLsHqJVKsjZRJ8YObFGnE9A_WWigNR',
    articleFileId: '1gjauWt5g6laKy6igou2aF-fdDmhLCXED',
    articleFileName: 'Sainspreneur2026_SMPN2Grati_DeoSolePatch - Dewi Anjarsari.pdf',
    articleUrl: 'https://drive.google.com/file/d/1gjauWt5g6laKy6igou2aF-fdDmhLCXED/view?usp=drive_web',
    videoFileId: '1pxWGLfJNN6Q-qWISI4R_apbbLv0CPcJW',
    videoFileName: 'DeoSole_(SCI-Prenuer).mp4',
    videoUrl: 'https://drive.google.com/file/d/1pxWGLfJNN6Q-qWISI4R_apbbLv0CPcJW/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1pxWGLfJNN6Q-qWISI4R_apbbLv0CPcJW&sz=w800',
    registeredAt: '2026-11-04',
    articleAbstract: 'Masalah kelembapan dan bau pada sol sepatu membutuhkan solusi praktis. Tim SMPN 2 Grati mengembangkan DeoSole Patch berbasis ekstrak bahan alam lokal yang efektif menyerap bau dan menghambat pertumbuhan bakteri pada alas kaki.',
    articleSummary: {
      background: 'Kebutuhan produk penyerap bau sepatu berbentuk patch tempel praktis bagi pelajar.',
      scienceTheory: 'Pelepasan senyawa volatil antibakteri alami dan adsorpsi kelembapan pada permukaan sol sepatu.',
      methodology: 'Ekstraksi bahan aktif tanaman lokal, impregnasi pada matriks patch berpori, dan uji efektivitas penghilang bau.',
      businessModel: 'Penjualan kemasan saku ekonomis ke pelajar, olahragawan, dan masyarakat umum.',
      localImpact: 'Mendorong inovasi produk kesehatan lingkungan berbasis potensi flora lokal Grati.'
    }
  },
  {
    id: 'team-13',
    code: 'TIM-13',
    name: 'Tim Mangofit Grati',
    school: 'SMPN 1 Grati',
    productTitle: 'MANGOFIT: Pengembangan Yoghurt Mangga Pasuruan untuk Pangan Sehat Kaya Antioksidan dan Probiotik',
    localResource: 'Mangga Klonal Pasuruan & Susu Sapi Segar Grati',
    leader: 'Ahmad Abid Abiyyu',
    members: ['Ahmad Abid Abiyyu', 'Anindia Nova Ilmia Sari', 'Laila Najwa Shakila'],
    mentorTeacher: 'Aulia Pratamadita, S.Pd',
    tahap: 'Tahap 2',
    folderId: '1ZFWOWtVsc5o0uh7cqvflch2y1ymagdrb',
    folderUrl: 'https://drive.google.com/drive/folders/1ZFWOWtVsc5o0uh7cqvflch2y1ymagdrb',
    articleFileId: '1EQk3MfKfNSaFHSzKGTNLWmGA2hhIvkSC',
    articleFileName: 'Sainspreneur2026_SMPN1GRATI_MANGOFIT - AULIA PRATAMADITA.pdf',
    articleUrl: 'https://drive.google.com/file/d/1EQk3MfKfNSaFHSzKGTNLWmGA2hhIvkSC/view?usp=drive_web',
    videoFileId: '16NEesIiKB08zNf57s3mpxBgHptkR_arQ',
    videoFileName: 'Vidio - Mangofit.mp4',
    videoUrl: 'https://drive.google.com/file/d/16NEesIiKB08zNf57s3mpxBgHptkR_arQ/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=16NEesIiKB08zNf57s3mpxBgHptkR_arQ&sz=w800',
    registeredAt: '2026-11-04',
    articleAbstract: 'Kawasan Grati memiliki peternakan sapi perah yang produktif serta perkebunan mangga yang luas. MANGOFIT mensinergikan susu sapi segar Grati dan sari buah mangga matang pohon yang diinokulasi bakteri Lactobacillus bulgaricus dan Streptococcus thermophilus menjadi minuman yoghurt probiotik lezat penunjang imunitas tubuh.',
    articleSummary: {
      background: 'Melimpahnya pasokan susu murni di Grati yang rentan basi bila tidak cepat diproses menjadi produk tahan simpan.',
      scienceTheory: 'Fermentasi asam laktat menurunkan pH hingga 4.2 menghambat bakteri pembusuk, mempertahankan beta-karoten mangga.',
      methodology: 'Pasteurisasi susu 85°C 15 menit, pendinginan hingga 43°C, inokulasi starter yoghurt 3%, inkubasi 8 jam, dan penambahan puree mangga pasteurisasi.',
      businessModel: 'Botol 250ml HPP Rp 5.500 dijual Rp 12.000 dengan sistem pesanan langganan sekolah dan kedai minuman sehat.',
      localImpact: 'Menyerap susu segar peternak sapi lokal Grati dengan harga beli yang menguntungkan.'
    }
  },
  {
    id: 'team-14',
    code: 'TIM-14',
    name: 'Tim A SPENSABA (Bio-Pouch)',
    school: 'SMPN 1 Bangil',
    productTitle: 'BIO-POUCH ANTIBAKTERI: Inovasi Kantong Herbal Cengkeh, Serai, Pala, dan Karbon Aktif untuk Menghambat Bakteri Penyebab Bau Kaos Kaki',
    localResource: 'Rempah Cengkeh, Serai, Pala & Karbon Aktif Bangil',
    leader: 'M. Hisyam Al Hafizh',
    members: ['M. Hisyam Al Hafizh', 'Bintari Arselia', 'Nada Fajriya Salsabila'],
    mentorTeacher: 'Umdatul Milla, S.Pd.',
    tahap: 'Tahap 2',
    folderId: '19inyLFhX8qbXl3aKwebQiAPPs7zGfoST',
    folderUrl: 'https://drive.google.com/drive/folders/19inyLFhX8qbXl3aKwebQiAPPs7zGfoST',
    articleFileId: '1qLhYSUMCkKzwtyeqpwaIEoxTPIVkNBOl',
    articleFileName: 'Sains Preneur SPENSABA - Kayla Khanza Shalooma.pdf',
    articleUrl: 'https://drive.google.com/file/d/1qLhYSUMCkKzwtyeqpwaIEoxTPIVkNBOl/view?usp=drive_web',
    videoFileId: '1vMcbxmZL-AN-ZAVOaRk2FlCxpG-2iLtw',
    videoFileName: 'Bio-Pouch Antibakteri pada Kaos Kaki Tim A sains preneur SMP Negeri 1 Bangil.mp4',
    videoUrl: 'https://drive.google.com/file/d/1vMcbxmZL-AN-ZAVOaRk2FlCxpG-2iLtw/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1vMcbxmZL-AN-ZAVOaRk2FlCxpG-2iLtw&sz=w800',
    registeredAt: '2026-11-05',
    articleAbstract: 'Bau tak sedap pada sepatu dan kaos kaki siswa akibat aktivitas bakteri Brevibacterium sering mengganggu kenyamanan belajar. BIO-POUCH memadukan daya adsorpsi karbon aktif tempurung kelapa dan khasiat antibakteri minyak atsiri eugenol cengkeh serta serai ke dalam kantong kain berpori siap pakai.',
    articleSummary: {
      background: 'Masalah umum bau sepatu dan kaos kaki di kalangan pelajar aktif dan atlet sekolah.',
      scienceTheory: 'Adsorpsi gas bau asam isovalerat oleh mikropori karbon aktif dan inhibisi dinding sel kuman oleh komponen aromatik rempah.',
      methodology: 'Aktivasi fisika arang tempurung kelapa, formulasi granul rempah cengkeh dan serai, pengisian ke pouch spunbond non-woven.',
      businessModel: 'Paket twin pack (2 kantong) HPP Rp 5.000 dipasarkan Rp 12.000 ke toko perlengkapan sekolah dan minimarket.',
      localImpact: 'Meningkatkan nilai tambah rempah lokal Pasuruan dan menjaga higienitas alas kaki siswa.'
    }
  },
  {
    id: 'team-15',
    code: 'TIM-15',
    name: 'Tim Tami.Lab (POC MBG)',
    school: 'SMPN 1 Pandaan',
    productTitle: 'Inovasi Pengolahan Limbah Kulit Buah MBG sebagai Pupuk Organik Cair (POC) Ramah Lingkungan',
    localResource: 'Limbah Kulit Buah Dapur MBG Pandaan',
    leader: 'Azaria Renata Vira Irawan',
    members: ['Azaria Renata Vira Irawan', 'Nathasya Zaviena Ramadhani', 'Lilik Fauziah Nurfitria'],
    mentorTeacher: 'Adelia Rizqi Hariadi, S.Pd.',
    tahap: 'Tahap 2',
    folderId: '1tdoH7ZcF9haNNdOil1eIDeHSJVuX3Xkc',
    folderUrl: 'https://drive.google.com/drive/folders/1tdoH7ZcF9haNNdOil1eIDeHSJVuX3Xkc',
    articleFileId: '185TwBEQSqIdoFJykaEU4j-5D4E2_QwHG',
    articleFileName: 'Sainspreneur2026_SMPN1Pandaan_POC(Tami.Lab) - Renata Vira.pdf',
    articleUrl: 'https://drive.google.com/file/d/185TwBEQSqIdoFJykaEU4j-5D4E2_QwHG/view?usp=drive_web',
    videoFileId: '1kN5t1vbf5xsZJsuk_VDLrpTxsXpIpjOc',
    videoFileName: 'PAST FEST Science Preneur Inovasi pembuatan POC SMPN 1 Pandaan.mp4',
    videoUrl: 'https://drive.google.com/file/d/1kN5t1vbf5xsZJsuk_VDLrpTxsXpIpjOc/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1kN5t1vbf5xsZJsuk_VDLrpTxsXpIpjOc&sz=w800',
    registeredAt: '2026-11-05',
    articleAbstract: 'Program Makan Bergizi Gratis (MBG) menghasilkan volume limbah kulit buah segar setiap harinya di sekolah. Tim SMPN 1 Pandaan menginisiasi siklus sirkular dengan mengolah limbah kulit melon, pepaya, dan pisang menjadi Pupuk Organik Cair (POC) kaya kalium dan nitrogen bagi tanaman kebun sekolah dan petani Pandaan.',
    articleSummary: {
      background: 'Sinergi nyata pemanfaatan sisa bahan program Makan Bergizi Gratis (MBG) di lingkungan sekolah.',
      scienceTheory: 'Fermentasi anaerob fakultatif mendekomposisi bahan organik menjadi asam amino dan unsur hara esensial makro-mikro siap serap.',
      methodology: 'Pencacahan limbah buah, penambahan molase tetes tebu dan mikroba fermentor, masa pemeraman 21 hari dengan degassing rutin.',
      businessModel: 'Jerigen 1 liter HPP Rp 4.500 dipasarkan Rp 12.000 ke paguyuban tanaman hias dan hidroponik Pandaan.',
      localImpact: 'Menghadirkan solusi zero-waste holistik program MBG tingkat sekolah menengah di Jawa Timur.'
    }
  },
  {
    id: 'team-16',
    code: 'TIM-16',
    name: 'Tim Briket Daun Mangga Alma',
    school: 'SMP Al Ma\'hadul Islami',
    productTitle: 'Briket Arang Ramah Lingkungan dari Limbah Daun Mangga Kering sebagai Energi Terbarukan Alternatif',
    localResource: 'Limbah Daun Mangga Kering Bangil-Beji',
    leader: 'Sajjida Zaenab Marsaoly',
    members: ['Sajjida Zaenab Marsaoly', 'Haira Hasan Fatah', 'Fathimah Syahrbanu Hazed'],
    mentorTeacher: 'Hadhijah Assegaff, S.Pd',
    tahap: 'Tahap 2',
    folderId: '12RZMjpCXRdZMzrCaBT7GywUkQPNhv1xr',
    folderUrl: 'https://drive.google.com/drive/folders/12RZMjpCXRdZMzrCaBT7GywUkQPNhv1xr',
    articleFileId: '1TkHR_vG0_Oi7v5GObTqxV6QG5PHfNwcG',
    articleFileName: 'Sainspreneur2026_SMP Al Ma\'hadul Islami_briketdaunmangga - Mar\'atus Solikha.pdf',
    articleUrl: 'https://drive.google.com/file/d/1TkHR_vG0_Oi7v5GObTqxV6QG5PHfNwcG/view?usp=drive_web',
    videoFileId: '1ubQcdYpbyzcXIV5RBfWgatDT3anmY27n',
    videoFileName: 'Vidio_lv_0_20261031181640.mp4',
    videoUrl: 'https://drive.google.com/file/d/1ubQcdYpbyzcXIV5RBfWgatDT3anmY27n/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1ubQcdYpbyzcXIV5RBfWgatDT3anmY27n&sz=w800',
    registeredAt: '2026-11-05',
    articleAbstract: 'Daun mangga yang gugur di area pesantren dan perkebunan kerap dibakar menimbulkan kabut asap. Inovasi briket arang daun mangga mengonversi biomassa daun kering melalui pirolisis lambat (karbonisasi), dicetak silindris dengan perekat tapioka, menghasilkan briket bara stabil tanpa asap pekat dan bebas emisi belerang.',
    articleSummary: {
      background: 'Volume daun mangga kering di pesantren mencapai puluhan kilogram per hari yang membutuhkan solusi energi terbarukan.',
      scienceTheory: 'Konversi termokimia pirolisis biomassa menjadi fixed carbon berkalori bakar lebih dari 5.200 kkal/kg.',
      methodology: 'Karbonisasi dalam drum pirolisis kedap udara, penghalusan abu arang mesh 60, mixing perekat tapioka 8%, pengepresan hidrolik manual.',
      businessModel: 'Kemasan box 1 kg HPP Rp 4.000 dijual Rp 10.000 untuk kebutuhan pedagang sate dan BBQ ramah lingkungan.',
      localImpact: 'Mengurangi kebiasaan pembakaran sampah liar serta memberikan energi hemat bagi dapur asrama.'
    }
  },
  {
    id: 'team-17',
    code: 'TIM-17',
    name: 'Tim CowcoPot Nguling',
    school: 'SMPN 2 Nguling',
    productTitle: 'COWCOPOT: Inovasi Pot Biodegradable Berbahan Limbah Serabut Kelapa dan Kotoran Sapi Perah Grati Pengganti Polybag Plastik',
    localResource: 'Serabut Kelapa Pesisir Nguling & Kotoran Sapi Grati',
    leader: 'Ayunda Shafitri',
    members: ['Ayunda Shafitri', 'M. Hafizuddin Tsaqib', 'Meuthia Aghniya\' Fuad'],
    mentorTeacher: 'Wulan Suci Ramadhani, M.Pd.',
    tahap: 'Tahap 2',
    folderId: '1NW_mX69KAD5nyMJVLG8F9C0i4WXhMkCm',
    folderUrl: 'https://drive.google.com/drive/folders/1NW_mX69KAD5nyMJVLG8F9C0i4WXhMkCm',
    articleFileId: '12C5oduy1gKB8a6WFffhZAmtuMD5vglmP',
    articleFileName: 'Sainspreneur2026_SMPN2Nguling_CowcoPot - Msbeyz.pdf',
    articleUrl: 'https://drive.google.com/file/d/12C5oduy1gKB8a6WFffhZAmtuMD5vglmP/view?usp=drive_web',
    videoFileId: '1arj1fvqQGv7H4ywZ5UHOvbWYKat9ZFQ0',
    videoFileName: 'CowcoPot - Pot Biodegredable Pengganti Polybag Plastik __ Scipreneur SMPN 2 Nguling __ PasFest2026.mp4',
    videoUrl: 'https://drive.google.com/file/d/1arj1fvqQGv7H4ywZ5UHOvbWYKat9ZFQ0/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1arj1fvqQGv7H4ywZ5UHOvbWYKat9ZFQ0&sz=w800',
    registeredAt: '2026-11-05',
    articleAbstract: 'Bibit tanaman yang dipindahkan dari polybag plastik kerap menyisakan sampah plastik tidak terurai dan merusak akar saat dibuka. COWCO POT memadukan sabut kelapa pantai Nguling dan pupuk kotoran sapi Grati menjadi pot tanam padat yang langsung ditanam bersama bibit ke dalam tanah dan terurai menjadi pupuk organik penyubur.',
    articleSummary: {
      background: 'Pencemaran mikroplastik dari jutaan polybag pembibitan tanaman di kawasan pertanian Pasuruan.',
      scienceTheory: 'Serat sabut kelapa (cocopeat) mengikat air dan struktur pot, kotoran sapi matang menyediakan unsur NPK saat terdekomposisi di tanah.',
      methodology: 'Pencucian tanin sabut kelapa, pencampuran perekat pati alami dan kotoran sapi fermentasi, pencetakan cetakan mangkok, pengeringan terik matahari.',
      businessModel: 'Dijual per bundle isi 10 pot seharga Rp 12.000 (HPP Rp 5.000) ke pembibit tanaman kehutanan dan buah Pasuruan.',
      localImpact: 'Menggantikan 100% plastik polybag dan mengentaskan limbah peternakan sapi Grati-Nguling.'
    }
  },
  {
    id: 'team-18',
    code: 'TIM-18',
    name: 'Tim Ecoclean Sukorejo',
    school: 'SMPN 2 Sukorejo',
    productTitle: 'ECOCLEAN: Pengembangan Cairan Pembersih Peralatan Makan Berbasis Eco-Enzyme Buatan Siswa Ramah Lingkungan',
    localResource: 'Limbah Kulit Buah Fermentasi Sukorejo',
    leader: 'Rendy Dicky Syaputra',
    members: ['Rendy Dicky Syaputra', 'Mukhammad Raga Ridho Ramadhan', 'Moh. Rizqillah Khoiruddin'],
    mentorTeacher: 'Khoirotul Islakhiyah, M.Pd',
    tahap: 'Tahap 2',
    folderId: '1U08EFLxiwbRRKLoa-5VJBX5ZgZapDpVB',
    folderUrl: 'https://drive.google.com/drive/folders/1U08EFLxiwbRRKLoa-5VJBX5ZgZapDpVB',
    articleFileId: '1nD-NvMr5bW8ryeYkApNhF1sH3nxBjFbk',
    articleFileName: 'Sainspreneur2026_SMPN2Sukorejo_ECOCLEAN - Khoirotul Islakhiyah.pdf',
    articleUrl: 'https://drive.google.com/file/d/1nD-NvMr5bW8ryeYkApNhF1sH3nxBjFbk/view?usp=drive_web',
    videoFileId: '1zVNiFhZ7X42ImOp-F8xY6hGdMxkgQmKD',
    videoFileName: 'Vidio __ SMPN 2 SUKOREJO.mp4',
    videoUrl: 'https://drive.google.com/file/d/1zVNiFhZ7X42ImOp-F8xY6hGdMxkgQmKD/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1zVNiFhZ7X42ImOp-F8xY6hGdMxkgQmKD&sz=w800',
    registeredAt: '2026-11-05',
    articleAbstract: 'Sabun cuci piring komersial sering mengandung surfaktan sintetis keras dan detergen yang mencemari saluran air pemukiman. ECOCLEAN memanfaatkan enzim protease, amilase, dan lipase dari fermentasi eco-enzyme kulit jeruk dan nanas yang dicampur ekstrak lerak untuk menghasilkan sabun cuci piring yang ampuh meluruhkan lemak minyak namun biodegradable.',
    articleSummary: {
      background: 'Tingginya limbah busa sabun fosfat yang mencemari selokan dan tambak di Sukorejo.',
      scienceTheory: 'Katalisis biokimiawi oleh enzim alami mendegradasi rantai lipid minyak dan saponin lerak mengangkat kotoran secara lembut.',
      methodology: 'Fermentasi eco-enzyme 3 bulan, dekantasi cairan bening, pencampuran ekstrak lerak rebus dan garam pengental alami, pewadahan higienis.',
      businessModel: 'Botol refill 450ml HPP Rp 5.000 dijual Rp 11.000 ke kantin sekolah, warung makan, dan rumah tangga.',
      localImpact: 'Membersihkan limbah cair sekolah dan mengedukasi siswa membuat cairan pembersih mandiri.'
    }
  },
  {
    id: 'team-19',
    code: 'TIM-19',
    name: 'Tim D Pandaan (Tinta Kulit Pisang)',
    school: 'SMPN 1 Pandaan',
    productTitle: 'Pemanfaatan Limbah Kulit Buah Pisang menjadi Tinta Alami Ramah Lingkungan (Tinta Alami Kulit Pisang)',
    localResource: 'Limbah Kulit Buah Pisang Lokal Pandaan',
    leader: 'Diandra Kayla Putri',
    members: ['Diandra Kayla Putri', 'Zaskia Asyabania', 'Febrian Sandi Bramantyo'],
    mentorTeacher: 'Reny Mufidah, M.Pd',
    tahap: 'Tahap 2',
    folderId: '1U5j-Q0uHuR5s00tbujeDMaqFtffOlua4',
    folderUrl: 'https://drive.google.com/drive/folders/1U5j-Q0uHuR5s00tbujeDMaqFtffOlua4',
    articleFileId: '1Uqd2C_6PGdfn3uUfg93XxH8vRnTIiVb0',
    articleFileName: 'Sainspreneur2026_SMPN1Pandaan_TintahAlamiKulitPisang.pdf',
    articleUrl: 'https://drive.google.com/file/d/1Uqd2C_6PGdfn3uUfg93XxH8vRnTIiVb0/view?usp=drive_web',
    videoFileId: '1xxLZJPCI0JLwnGcG83wILHAVVBQ7R2qy',
    videoFileName: 'Pemanfaatan limbah kulit buah pisang menjadi tinta saninspreneur2026-TIM D SMPN 1Pandaan.mp4',
    videoUrl: 'https://drive.google.com/file/d/1xxLZJPCI0JLwnGcG83wILHAVVBQ7R2qy/view?usp=drive_web',
    videoThumbnailUrl: 'https://drive.google.com/thumbnail?id=1xxLZJPCI0JLwnGcG83wILHAVVBQ7R2qy&sz=w800',
    registeredAt: '2026-11-05',
    articleAbstract: 'Limbah kulit buah pisang mengandung senyawa tanin dan karbon organik yang dapat diolah menjadi pigmen warna gelap alami. Tim D SMPN 1 Pandaan mengolah limbah kulit pisang menjadi tinta spidol dan pena ramah lingkungan bebas pelarut toksik VOC.',
    articleSummary: {
      background: 'Tingginya konsumsi pisang menghasilkan limbah kulit pisang yang kaya tanin namun belum dimanfaatkan untuk kebutuhan alat tulis sekolah.',
      scienceTheory: 'Senyawa polifenol dan tanin pada kulit pisang membentuk kompleks warna pekat stabil serta karbonisasi ringan menghasilkan pigmen hitam alami.',
      methodology: 'Ekstraksi dan karbonisasi kulit pisang, pencampuran pelarut air-gliserin dan gum arabik sebagai pengikat viskositas tinta, penyaringan mikro.',
      businessModel: 'Kemasan botol isi ulang tinta spidol sekolah 30ml dengan harga terjangkau untuk sekolah-sekolah di Kabupaten Pasuruan.',
      localImpact: 'Mengurangi limbah organik kulit pisang dan menyediakan tinta isi ulang bebas bahan kimia berbahaya bagi pelajar.'
    }
  }
];

const DEFAULT_ADMIN_VERIFIED = [
  { id: 1, item: 'Peserta adalah siswa aktif SMP/MTs di Kabupaten Pasuruan (Maks. 3 orang/tim)', status: 'Ya' as const, keterangan: 'Terverifikasi sesuai biodata resmi peserta' },
  { id: 2, item: 'Karya orisinal dan belum pernah menjuarai lomba sejenis tingkat Kabupaten/Provinsi', status: 'Ya' as const, keterangan: 'Orisinalitas terverifikasi lembar pernyataan' },
  { id: 3, item: 'Format Artikel sesuai ketentuan (Kertas A4, Font Times New Roman 12pt, Spasi 1,5, PDF)', status: 'Ya' as const, keterangan: 'Format makalah PDF sesuai pedoman' },
  { id: 4, item: 'Tautan Video dapat diakses dengan jelas (Resolusi minimal 720p, suara jernih)', status: 'Ya' as const, keterangan: 'Video MP4 Google Drive jernih & lancar' }
];

/**
 * Penilaian Resmi Dewan Juri 2: Akhmad Nasor, M.Pd (username: juri-002, pass: @juri123)
 * Mencakup seluruh 19 tim peserta (TIM-01 s/d TIM-19) berdasarkan analisis kisi-kisi & pedoman rubrik
 * dengan catatan evaluasi <= 200 karakter per peserta.
 */
export const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-team-1-juri-1794186758033',
    teamId: 'team-1',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 3,
      a2_1: 4, a2_2: 3, a2_3: 4,
      a3_1: 4, a3_2: 4,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 4, v2_2: 3, v2_3: 4,
      v3_1: 4, v3_2: 4,
      v4_1: 3, v4_2: 4,
      durationMinutes: 7,
      durationSeconds: 20,
      durationPenalty: 0
    },
    feedback: 'Sains komposit tebu-pinus (C/N rasio) sangat kuat & solutif bagi florikultura Prigen. Kalkulasi HPP Rp7.500 realistis, prototipe fungsional. Tingkatkan uji daya simpan kemasan biodegradable.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:15:00.000Z'
  },
  {
    id: 'eval-team-2-juri-1794186758033',
    teamId: 'team-2',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 3, a1_3: 4,
      a2_1: 3, a2_2: 4, a2_3: 3,
      a3_1: 4, a3_2: 4,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 4, v1_2: 3,
      v2_1: 4, v2_2: 3, v2_3: 4,
      v3_1: 4, v3_2: 3,
      v4_1: 4, v4_2: 3,
      durationMinutes: 6,
      durationSeconds: 45,
      durationPenalty: 0
    },
    feedback: 'Ekstraksi maserasi kulit mangga Gadung Rejoso ke parfum bebas alkohol keras sangat inovatif. Konsep souvenir khas Pasuruan potensial. Perkuat uji ketahanan wangi & segel botol spray.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:20:00.000Z'
  },
  {
    id: 'eval-team-3-juri-1794186758033',
    teamId: 'team-3',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 3, a2_2: 4, a2_3: 4,
      a3_1: 4, a3_2: 3,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 4, v2_2: 4, v2_3: 3,
      v3_1: 4, v3_2: 3,
      v4_1: 3, v4_2: 4,
      durationMinutes: 7,
      durationSeconds: 10,
      durationPenalty: 0
    },
    feedback: 'Substitusi tepung rebung Kejayan 40% pada kukis rendah glikemik sangat tepat ilmiah. Prosedur penghilangan langu di video jelas, kemasan pouch menarik. Lengkapi tabel informasi nilai gizi.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:25:00.000Z'
  },
  {
    id: 'eval-team-4-juri-1794186758033',
    teamId: 'team-4',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 3, a1_2: 3, a1_3: 3,
      a2_1: 3, a2_2: 3, a2_3: 3,
      a3_1: 4, a3_2: 3,
      a4_1: 3, a4_2: 3
    },
    videoScore: {
      v1_1: 3, v1_2: 4,
      v2_1: 3, v2_2: 3, v2_3: 3,
      v3_1: 3, v3_2: 4,
      v4_1: 3, v4_2: 3,
      durationMinutes: 6,
      durationSeconds: 30,
      durationPenalty: 0
    },
    feedback: 'Pemanfaatan material ramah lingkungan lokal Gempol aplikatif. Tahapan pembuatan di video runtut & sesuai K3. Perjelas rincian HPP, analisis BEP, serta standarisasi estetika label kemasan.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:30:00.000Z'
  },
  {
    id: 'eval-team-5-juri-1794186758033',
    teamId: 'team-5',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 4, a2_2: 4, a2_3: 4,
      a3_1: 4, a3_2: 4,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 4, v2_2: 4, v2_3: 4,
      v3_1: 4, v3_2: 4,
      v4_1: 4, v4_2: 3,
      durationMinutes: 7,
      durationSeconds: 45,
      durationPenalty: 0
    },
    feedback: 'Sinergi kitosan udang vaname Bangil & antioksidan kelor sangat unggul untuk cegah stunting. Video higienis, tekstur stik renyah, margin bisnis sehat. Siap hilirisasi ke UMKM lokal.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:35:00.000Z'
  },
  {
    id: 'eval-team-6-juri-1794186758033',
    teamId: 'team-6',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 3, a1_2: 4, a1_3: 4,
      a2_1: 4, a2_2: 3, a2_3: 3,
      a3_1: 4, a3_2: 3,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 3, v2_2: 4, v2_3: 3,
      v3_1: 4, v3_2: 3,
      v4_1: 3, v4_2: 4,
      durationMinutes: 6,
      durationSeconds: 50,
      durationPenalty: 0
    },
    feedback: 'Formulasi fenolik sirih hijau & polisakarida lidah buaya efektif sebagai sanitizer non-iritasi. Tahapan dekoksi 90°C terukur, kemasan botol spray ergonomis. Tambahkan data uji organoleptik.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:40:00.000Z'
  },
  {
    id: 'eval-team-7-juri-1794186758033',
    teamId: 'team-7',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 3,
      a2_1: 3, a2_2: 3, a2_3: 4,
      a3_1: 4, a3_2: 4,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 4, v1_2: 3,
      v2_1: 4, v2_2: 3, v2_3: 3,
      v3_1: 4, v3_2: 4,
      v4_1: 4, v4_2: 3,
      durationMinutes: 7,
      durationSeconds: 15,
      durationPenalty: 0
    },
    feedback: 'Pendekatan STEAM & ESD pada upcycling ampas eco-enzyme jadi bantal terapi aromaterapi sangat orisinal (zero-waste). Jahitan prototipe rapi; optimalkan kerapatan kemas dalam agar wangi awet.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:45:00.000Z'
  },
  {
    id: 'eval-team-8-juri-1794186758033',
    teamId: 'team-8',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 4, a2_2: 4, a2_3: 3,
      a3_1: 4, a3_2: 4,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 4, v2_2: 3, v2_3: 4,
      v3_1: 4, v3_2: 4,
      v4_1: 4, v4_2: 3,
      durationMinutes: 6,
      durationSeconds: 55,
      durationPenalty: 0
    },
    feedback: 'Inovasi paper soap ekstrak tanin daun mangga Sukorejo sangat praktis & solutif cegah bakar sampah daun. Kelarutan kertas sabun baik, HPP Rp3.000 ekonomis. Tingkatkan ketahanan lembap kotak.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:50:00.000Z'
  },
  {
    id: 'eval-team-9-juri-1794186758033',
    teamId: 'team-9',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 3, a2_2: 4, a2_3: 3,
      a3_1: 4, a3_2: 3,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 3,
      v2_1: 4, v2_2: 4, v2_3: 3,
      v3_1: 4, v3_2: 3,
      v4_1: 3, v4_2: 4,
      durationMinutes: 7,
      durationSeconds: 5,
      durationPenalty: 0
    },
    feedback: 'Pemanfaatan mangiferin kulit mangga Bangil pada roll-on deodoran non-aluminium sangat ilmiah. Uji stabilitas 14 hari terstruktur, tekstur tidak lengket. Perkuat desain segel kemasan botol.',
    status: 'submitted',
    updatedAt: '2026-11-08T08:55:00.000Z'
  },
  {
    id: 'eval-team-10-juri-1794186758033',
    teamId: 'team-10',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 4, a2_2: 4, a2_3: 4,
      a3_1: 4, a3_2: 4,
      a4_1: 4, a4_2: 4
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 4, v2_2: 4, v2_3: 4,
      v3_1: 4, v3_2: 4,
      v4_1: 4, v4_2: 4,
      durationMinutes: 7,
      durationSeconds: 30,
      durationPenalty: 0
    },
    feedback: 'Pengangkatan komoditas ikonik bunga sedap malam Kraton menjadi night lotion relaksasi bernilai ekonomi tinggi. Emulsi stabil pH aman, kemasan pump higienis & siap bersaing di pasar kosmetik.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:00:00.000Z'
  },
  {
    id: 'eval-team-11-juri-1794186758033',
    teamId: 'team-11',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 3, a1_2: 3, a1_3: 3,
      a2_1: 3, a2_2: 3, a2_3: 3,
      a3_1: 4, a3_2: 3,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 3, v1_2: 3,
      v2_1: 3, v2_2: 3, v2_3: 4,
      v3_1: 4, v3_2: 3,
      v4_1: 3, v4_2: 3,
      durationMinutes: 6,
      durationSeconds: 40,
      durationPenalty: 0
    },
    feedback: 'Optimalisasi sumber daya hayati lokal Grati disajikan sistematis. Proses pengolahan di laboratorium higienis & komunikatif. Pertajam diferensiasi nilai unik produk serta rincian proyeksi BEP.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:05:00.000Z'
  },
  {
    id: 'eval-team-12-juri-1794186758033',
    teamId: 'team-12',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 3, a1_3: 3,
      a2_1: 3, a2_2: 4, a2_3: 3,
      a3_1: 4, a3_2: 3,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 3, v1_2: 4,
      v2_1: 4, v2_2: 3, v2_3: 3,
      v3_1: 4, v3_2: 3,
      v4_1: 3, v4_2: 4,
      durationMinutes: 6,
      durationSeconds: 50,
      durationPenalty: 0
    },
    feedback: 'Konsep patch penyerap bau sepatu berbasis flora antibakteri Grati fungsional bagi pelajar. Mekanisme adsorpsi & pelepasan volatil logis. Tingkatkan daya rekat matriks patch pada sol sepatu.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:10:00.000Z'
  },
  {
    id: 'eval-team-13-juri-1794186758033',
    teamId: 'team-13',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 4, a2_2: 4, a2_3: 4,
      a3_1: 4, a3_2: 4,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 4, v2_2: 4, v2_3: 3,
      v3_1: 4, v3_2: 4,
      v4_1: 4, v4_2: 4,
      durationMinutes: 7,
      durationSeconds: 40,
      durationPenalty: 0
    },
    feedback: 'Integrasi susu sapi segar Grati & mangga klonal melalui fermentasi asam laktat sangat tepat ilmiah. Prosedur pasteurisasi & inokulasi di video presisi, kelayakan bisnis & dampak lokal unggul.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:15:00.000Z'
  },
  {
    id: 'eval-team-14-juri-1794186758033',
    teamId: 'team-14',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 3,
      a2_1: 4, a2_2: 3, a2_3: 4,
      a3_1: 4, a3_2: 3,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 4, v1_2: 3,
      v2_1: 4, v2_2: 3, v2_3: 4,
      v3_1: 4, v3_2: 3,
      v4_1: 4, v4_2: 3,
      durationMinutes: 7,
      durationSeconds: 0,
      durationPenalty: 0
    },
    feedback: 'Kombinasi adsorpsi karbon aktif & eugenol cengkeh-serai efektif hambat bakteri bau kaos kaki. Formulasi granul dalam pouch spunbond rapi & ekonomis. Tambahkan indikator masa pakai kantong.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:20:00.000Z'
  },
  {
    id: 'eval-team-15-juri-1794186758033',
    teamId: 'team-15',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 4, a2_2: 3, a2_3: 4,
      a3_1: 4, a3_2: 4,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 3, v2_2: 4, v2_3: 4,
      v3_1: 4, v3_2: 4,
      v4_1: 3, v4_2: 4,
      durationMinutes: 7,
      durationSeconds: 25,
      durationPenalty: 0
    },
    feedback: 'Sangat kontekstual mengolah limbah kulit buah program MBG sekolah menjadi POC lewat fermentasi anaerob 21 hari. Solusi zero-waste nyata; lengkapi parameter pH/TDS akhir pada label jerigen.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:25:00.000Z'
  },
  {
    id: 'eval-team-16-juri-1794186758033',
    teamId: 'team-16',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 3, a1_3: 4,
      a2_1: 3, a2_2: 4, a2_3: 3,
      a3_1: 4, a3_2: 4,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 3, v2_2: 4, v2_3: 3,
      v3_1: 4, v3_2: 3,
      v4_1: 3, v4_2: 4,
      durationMinutes: 6,
      durationSeconds: 35,
      durationPenalty: 0
    },
    feedback: 'Konversi pirolisis serasah daun mangga pesantren menjadi briket berkalori tinggi sangat solutif tekan polusi asap. Proses karbonisasi & pengepresan jelas. Perkuat kemasan box anti-lembap.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:30:00.000Z'
  },
  {
    id: 'eval-team-17-juri-1794186758033',
    teamId: 'team-17',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 4,
      a2_1: 4, a2_2: 4, a2_3: 3,
      a3_1: 4, a3_2: 4,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 4,
      v2_1: 4, v2_2: 3, v2_3: 4,
      v3_1: 4, v3_2: 4,
      v4_1: 4, v4_2: 3,
      durationMinutes: 7,
      durationSeconds: 15,
      durationPenalty: 0
    },
    feedback: 'Inovasi pot biodegradable sabut kelapa Nguling & kotoran sapi Grati sangat aplikatif gantikan polybag plastik. Struktur pot kokoh & menyuburkan tanah. Standarisasi ketebalan cetak pot.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:35:00.000Z'
  },
  {
    id: 'eval-team-18-juri-1794186758033',
    teamId: 'team-18',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 3, a1_3: 4,
      a2_1: 4, a2_2: 3, a2_3: 4,
      a3_1: 4, a3_2: 3,
      a4_1: 3, a4_2: 4
    },
    videoScore: {
      v1_1: 4, v1_2: 3,
      v2_1: 4, v2_2: 4, v2_3: 3,
      v3_1: 4, v3_2: 3,
      v4_1: 4, v4_2: 3,
      durationMinutes: 6,
      durationSeconds: 50,
      durationPenalty: 0
    },
    feedback: 'Sinergi enzim hidrolitik eco-enzyme & saponin lerak menghasilkan cairan pencuci piring ramah biota air. Efektivitas angkat lemak terbukti di video, HPP kompetitif. Tingkatkan viskositas.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:40:00.000Z'
  },
  {
    id: 'eval-team-19-juri-1794186758033',
    teamId: 'team-19',
    judgeId: 'juri-1794186758033',
    judgeName: 'Akhmad Nasor, M.Pd',
    tahap: 'Tahap 2',
    adminCheck: DEFAULT_ADMIN_VERIFIED,
    articleScore: {
      a1_1: 4, a1_2: 4, a1_3: 3,
      a2_1: 3, a2_2: 4, a2_3: 3,
      a3_1: 4, a3_2: 4,
      a4_1: 4, a4_2: 3
    },
    videoScore: {
      v1_1: 4, v1_2: 3,
      v2_1: 4, v2_2: 3, v2_3: 4,
      v3_1: 4, v3_2: 4,
      v4_1: 3, v4_2: 4,
      durationMinutes: 6,
      durationSeconds: 45,
      durationPenalty: 0
    },
    feedback: 'Ekstraksi tanin & karbon kulit pisang Pandaan dengan matriks gum arabik jadi tinta spidol non-VOC sangat kreatif. Kepekatan pigmen baik & aplikatif bagi sekolah. Optimalkan filtrasi mikro.',
    status: 'submitted',
    updatedAt: '2026-11-08T09:45:00.000Z'
  }
];
