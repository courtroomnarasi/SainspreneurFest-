/**
 * PASURUAN SCIENCE FESTIVAL 2026 - LOMBA SAINSPRENEUR
 * MGMP IPA SMP KABUPATEN PASURUAN
 * Backend Google Apps Script (Code.gs)
 *
 * Folder Database Google Drive:
 * https://drive.google.com/drive/folders/1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb?usp=sharing
 */

const CONFIG = {
  DRIVE_FOLDER_ID: '1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb',
  SPREADSHEET_NAME: 'DB_Sainspreneur_Pasuruan_Festival_2026',
  ADMIN_USER: 'admin',
  ADMIN_PASS: '@1',
  APP_TITLE: 'Pasuruan Science Festival 2026 - Penilaian Sainspreneur'
};

/**
 * Handle HTTP GET Request
 * Mendukung respons JSON untuk sinkronisasi live Web App serta tampilan HTML
 */
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  var action = p.action;

  // 1. Ambil data aplikasi
  if (action === 'getAppData' || p.format === 'json') {
    var data = apiGetAppData();
    return createJsonResponse(data);
  }

  // 2. Bersihkan akun juri dummy di DB
  if (action === 'clearDummyJudges') {
    var cleanRes = apiClearDummyJudges();
    return createJsonResponse(cleanRes);
  }

  // 3. Tambah Juri Baru via GET (CORS friendly)
  if (action === 'addJudge') {
    var jData = {
      id: p.id || ('juri-' + Date.now()),
      username: p.username || '',
      password: p.password || '@juri123',
      name: p.name || '',
      nip: p.nip || '-',
      institution: p.institution || 'MGMP IPA Pasuruan',
      field: p.field || 'Sains & Bisnis',
      isActive: p.isActive !== 'false'
    };
    if (p.judgeData) {
      try { jData = JSON.parse(p.judgeData); } catch (err) {}
    }
    var addJRes = apiAddJudge(jData);
    return createJsonResponse(addJRes);
  }

  // 4. Hapus Akun Juri via GET
  if (action === 'deleteJudge') {
    var delJRes = apiDeleteJudge(p.id || p.judgeId || p.username);
    return createJsonResponse(delJRes);
  }

  // 5. Tambah Tim Baru via GET
  if (action === 'addTeam') {
    var tData = {
      id: p.id || ('team-' + Date.now()),
      code: p.code || 'TIM-NEW',
      name: p.name || '',
      school: p.school || '',
      productTitle: p.productTitle || '',
      localResource: p.localResource || '',
      leader: p.leader || '',
      members: [p.leader, p.member1, p.member2].filter(Boolean),
      mentorTeacher: p.mentorTeacher || '',
      tahap: p.tahap || 'Tahap 2',
      videoUrl: p.videoUrl || '',
      articleUrl: p.articleUrl || ''
    };
    if (p.teamData) {
      try { tData = JSON.parse(p.teamData); } catch (err) {}
    }
    var addTRes = apiAddTeam(tData);
    return createJsonResponse(addTRes);
  }

  // 6. Update Tim (Nama Tim, Judul, Sekolah) via GET
  if (action === 'updateTeam') {
    var upData = {};
    if (p.teamData) {
      try { upData = JSON.parse(p.teamData); } catch (err) {}
    } else {
      upData = {
        id: p.id,
        code: p.code,
        name: p.name,
        school: p.school,
        productTitle: p.productTitle,
        localResource: p.localResource,
        leader: p.leader,
        mentorTeacher: p.mentorTeacher,
        tahap: p.tahap,
        videoUrl: p.videoUrl,
        articleUrl: p.articleUrl
      };
    }
    var upTRes = apiUpdateTeam(upData);
    return createJsonResponse(upTRes);
  }

  // 7. Hapus Tim via GET
  if (action === 'deleteTeam') {
    var delTRes = apiDeleteTeam(p.id || p.teamId);
    return createJsonResponse(delTRes);
  }

  // 8. Simpan Penilaian via GET
  if (action === 'saveEvaluation' && p.evaluationData) {
    try {
      var evData = JSON.parse(p.evaluationData);
      var evRes = apiSaveEvaluation(evData);
      return createJsonResponse(evRes);
    } catch (err) {
      return createJsonResponse({ success: false, error: err.toString() });
    }
  }

  // 9. Default: Tampilkan antarmuka HTML
  try {
    var template = HtmlService.createTemplateFromFile('Index');
    template.folderId = CONFIG.DRIVE_FOLDER_ID;
    return template.evaluate()
      .setTitle(CONFIG.APP_TITLE)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // Fallback ramah jika pengguna belum membuat file 'Index.html' di editor Apps Script
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + CONFIG.APP_TITLE + '</title>' +
      '<style>body{font-family:sans-serif;margin:0;padding:24px;background:#f8fafc;color:#1e293b;text-align:center;}' +
      '.card{max-width:640px;margin:30px auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 10px 25px rgba(0,0,0,0.08);border:1px solid #e2e8f0;}' +
      'h1{color:#0f2b5c;font-size:20px;margin-bottom:8px;}' +
      '.badge{display:inline-block;padding:4px 12px;background:#e0f2fe;color:#0369a1;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:16px;}' +
      'p{font-size:14px;line-height:1.6;color:#475569;margin:8px 0;}' +
      '.btn{display:inline-block;margin:12px 6px;padding:10px 18px;background:#0f2b5c;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:13px;}' +
      '.btn-amber{background:#f59e0b;color:#0f2b5c;}' +
      '.guide{background:#f1f5f9;border-radius:12px;padding:14px;text-align:left;font-size:12px;margin-top:20px;}' +
      '</style></head><body>' +
      '<div class="card">' +
      '<span class="badge">Google Apps Script Backend Active</span>' +
      '<h1>Pasuruan Science Festival 2026</h1>' +
      '<p><strong>Lomba Sainspreneur MGMP IPA SMP Kab. Pasuruan</strong></p>' +
      '<p>Backend database Google Apps Script dan integrasi Google Drive telah aktif dan siap melayani 19 sekolah peserta resmi.</p>' +
      '<div style="margin:20px 0;">' +
      '<a class="btn btn-amber" href="?format=json" target="_blank">Lihat Output Data JSON</a>' +
      '<a class="btn" href="https://drive.google.com/drive/folders/' + CONFIG.DRIVE_FOLDER_ID + '" target="_blank">Buka Folder Google Drive</a>' +
      '</div>' +
      '<div class="guide">' +
      '<strong>Langkah untuk Mengaktifkan UI Penuh di Apps Script:</strong>' +
      '<ol style="margin:8px 0 0 16px;padding:0;">' +
      '<li>Di Editor Google Apps Script, klik tombol <strong>+</strong> di panel File lalu pilih <strong>HTML</strong>.</li>' +
      '<li>Beri nama file: <strong>Index</strong> (tanpa ekstensi .html).</li>' +
      '<li>Salin seluruh kode dari file <code>gas_Index.html</code> lalu klik Simpan dan Deploy Ulang.</li>' +
      '</ol>' +
      '</div>' +
      '</div>' +
      '</body></html>'
    ).setTitle(CONFIG.APP_TITLE).addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Inisialisasi atau dapatkan Spreadsheet database di Google Drive folder
 */
function getOrCreateDatabaseSheet() {
  try {
    var folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    var files = folder.getFilesByName(CONFIG.SPREADSHEET_NAME);
    var ss;
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
      var file = DriveApp.getFileById(ss.getId());
      file.moveTo(folder);
    }
    // Pastikan struktur sheet dan 19 tim awal selalu terisi jika kosong
    initSheets(ss);
    return ss;
  } catch (err) {
    Logger.log('Error opening folder, creating standalone sheet: ' + err.toString());
    var ssDefault = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    initSheets(ssDefault);
    return ssDefault;
  }
}

/**
 * Inisialisasi Sheet dan Seed 19 Tim Resmi (TANPA JURI DUMMY)
 */
function initSheets(ss) {
  var sheetTeams = ss.getSheetByName('Teams') || ss.insertSheet('Teams');
  if (sheetTeams.getLastRow() === 0) {
    sheetTeams.appendRow(['ID', 'Kode', 'Nama Tim', 'Asal Sekolah', 'Judul Inovasi Produk', 'Bahan Lokal', 'Ketua', 'Anggota 1', 'Anggota 2', 'Guru Pendamping', 'Tahap', 'Video URL', 'Artikel URL']);
  }
  if (sheetTeams.getLastRow() <= 1) {
    // 19 Tim Resmi sesuai 19 Folder Google Drive & File Video/Makalah Asli Masing-Masing Peserta
    var officialTeams = [
      ['team-1', 'TIM-01', 'Tim Esperogen (METASUB)', 'SMPN 2 Prigen', 'METASUB-ESPEROGEN: Inovasi Media Tanam Substitusi Komposit Limbah Tebu dan Daun Pinus untuk Mendukung Green Economy UMKM Tanaman Hias Prigen', 'Limbah Tebu & Daun Pinus Prigen', 'Fredella Emily Abdillah', 'Danish Mirza Brilian', 'Julio Alfiansyah', 'Amar Abdillah, M.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/1_AIYkWy9oihBJ17R7LlwdVYWy1hjGP2-/view?usp=drive_web', 'https://drive.google.com/file/d/1X7eJr4Zjqdqc0WKeDWxdqmuCLElyztmM/view?usp=drive_web'],
      ['team-2', 'TIM-02', 'Tim Mangocent Rejoso', 'SMPN 2 Rejoso', 'MANGOCENT: Inovasi Pemanfaatan Limbah Kulit Mangga di Lingkungan Sekolah menjadi Parfum Ramah Lingkungan', 'Limbah Kulit Mangga Rejoso', 'Uswatun Chasanah', 'Cinta Syafira Adelita', 'Agam Abdillah Manfi', 'Wahdaniah Putri Aryani, S.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1lsqe4xp7Rx_6Za22SNvYb2x42Vhb9sR5/view?usp=drive_web', 'https://drive.google.com/file/d/1sQtklN7wE5fTNTgIulx_X4x7W-PXXEzr/view?usp=drive_web'],
      ['team-3', 'TIM-03', 'Tim Reokies Kejayan', 'SMPN 1 Kejayan', 'REOKIES: Inovasi Cookies Tepung Rebung Bambu Lokal Pasuruan sebagai Camilan Kaya Serat dan Ramah Lingkungan', 'Rebung Bambu Lokal Kejayan', 'Sulfiatul Rohma', 'Nuril Ilmiah Riski H', 'Sinta', 'Evy Priastutik, S.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1fgPkaTFhCNVMB4rCnZR7qYhhP4cWj4dv/view?usp=drive_web', 'https://drive.google.com/file/d/1W2dXShH2e0T4mkwVfUbwedK9a9Z2Wj71/view?usp=drive_web'],
      ['team-4', 'TIM-04', 'Tim Axiom Gempol', 'SMPN 1 Gempol', 'AXIOM: Inovasi Produk Sainspreneur SMPN 1 Gempol Berbasis Potensi Lokal Ramah Lingkungan', 'Kearifan Lokal Gempol', 'Firza Devi Puji Rahayu', 'Anis Rokhila', 'Fandi Alfiano', 'Ika Sugiarti Ningsih, S.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1ECAa1kJbWdj2zMfLAFDTvvRl5TiVhRkz/view?usp=drive_web', 'https://drive.google.com/file/d/1_oFH54qlT0fd2oBqQvSZ95DlqKBi5JzC/view?usp=drive_web'],
      ['team-5', 'TIM-05', 'Tim Nanova (Shinga)', 'SMPN 1 Bangil', 'SHINGA (Shrimp & Moringa LIT): Olah Kulit Udang Vaname dan Daun Kelor sebagai Alternatif Camilan Sehat Bernilai Ekonomis', 'Udang Vaname & Daun Kelor Pasuruan', 'Qonita Aliesya Ulum', 'Naura Balqis Maulidyah', 'Adelia Nadine Helga El Frida', 'Suryaningsasi, S.Pd., M.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/1ztB2fV_Gk3KVwouVQzVZW7NRY9xxe70f/view?usp=drive_web', 'https://drive.google.com/file/d/1g_mh5s4n2kQSV-BsCvH4VZE0PNgxEbEr/view?usp=drive_web'],
      ['team-6', 'TIM-06', 'Tim Saluvia (Sempbada Preneur)', 'SMPN 2 Bangil', 'SALUVIA: Inovasi Hand Sanitizer Berbahan Ekstrak Daun Sirih (Piper betle L.) dan Lidah Buaya (Aloe vera) sebagai Produk Sanitasi Alami', 'Daun Sirih & Lidah Buaya Bangil', 'Fatimah Azzahra', 'Sanniyah \'Ifti Islamiyah', 'Khayla Afsheen Myesha Ramadhani', 'Pujawati, S.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/1zwyI5TiY9N1Ogy7K6_ZksOnjKChKz_R4/view?usp=drive_web', 'https://drive.google.com/file/d/1vs5wR1tZUxD597M_Azf3cCSEYd1WHCSY/view?usp=drive_web'],
      ['team-7', 'TIM-07', 'Tim Bantal Eco-Enzyme', 'SMPN 2 Gondangwetan', 'Inovasi Pemanfaatan Ampas Eco-Enzyme sebagai Produk Bantal Terapi Eco Enzym melalui Pendekatan STEAM dan ESD', 'Ampas Eco-Enzyme Gondangwetan', 'Illiyyah Ainishillah', 'Intan Nor Aini', 'Dafa Achmad Sadad', 'Dra. Siti Kosidah', 'Tahap 2', 'https://drive.google.com/file/d/1LEwituUDjpbs0B4lix4TGxiwcDzAarq6/view?usp=drive_web', 'https://drive.google.com/file/d/1Sa47BhaBSb7PZK8IkS-8WVSY2JA8Hyxj/view?usp=drive_web'],
      ['team-8', 'TIM-08', 'Tim Mangcleann Sukorejo', 'SMPN 1 Sukorejo', 'MANGCLEANN: Inovasi Sabun Kertas Berbasis Ekstrak Daun Mangga sebagai Pembersih Praktis Portabel Ramah Lingkungan', 'Daun Mangga Sukorejo', 'Rizka Zea Aufa Dabit', 'Putri Denok Jelita', 'Niken Rahmadhani', 'Staniatul Masruroh, S.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/18LD3cyuW0RW9Mapp6euGXgwolyH-JsBp/view?usp=drive_web', 'https://drive.google.com/file/d/1kTpUtK9BdZsFZgTJjxBZCxrQ2Mmxw7sN/view?usp=drive_web'],
      ['team-9', 'TIM-09', 'Tim Nasha Preneur (MANGLOOP)', 'SMPN 1 Bangil', 'MANGLOOP: Inovasi Roll-On Berbasis Ekstrak Kulit Mangga (Mangifera indica L.) sebagai Produk Perawatan Kulit Alami', 'Limbah Kulit Mangga Bangil', 'Muhammad Reza Pahlevi Albaihaqi', 'Kayla Khanza Shalooma', 'Zevanna Farzana Qurrota\'ayun', 'Iftitachiatur Rusda, S.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1pMbvGt1-HuA7ItHaCRvreFof0-dGnE3B/view?usp=drive_web', 'https://drive.google.com/file/d/1qmPoDAHHgMfbQXQ0iQ2CmFWl4NcTt-AP/view?usp=drive_web'],
      ['team-10', 'TIM-10', 'Tim Noctura Kraton', 'SMPN 2 Kraton', 'NOCTURA: Multifunctional Night Lotion dari Ekstrak Daun Sedap Malam Khas Pasuruan', 'Bunga & Daun Sedap Malam Kraton', 'M. Alfiyanto Romadhoni', 'Ibnaty Raniah Muyassarah', 'Wajihatus Zahra Arashy', 'Fadiatul Ainiah, S.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1N5iXakGWz5StzQyRm7lSCFyYTGbzlzzK/view?usp=drive_web', 'https://drive.google.com/file/d/1SAEQrAQbUnSrvwcdnb4wHGm0YUVHl2HO/view?usp=drive_web'],
      ['team-11', 'TIM-11', 'Tim GoBar (Maulana Ibrahim)', 'SMPN 2 Grati', 'GOBAR: Inovasi Produk Sainspreneur Solutif Berbasis Sumber Daya Hayati Lokal Grati', 'Biomassa Hayati & Komoditas Lokal Grati', 'Maulana Ibrahim', 'Siti Roikhatul Jannah', 'Anindita Belani Ramadhan', 'Dewi Anjarsari, S.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/18mNam822S6jgIAopyJjwmWlesZFUF5vj/view?usp=drive_web', 'https://drive.google.com/file/d/19ERYrjzySYAe6k43BhmOqf0q6icY7hyt/view?usp=drive_web'],
      ['team-12', 'TIM-12', 'Tim DeoSole Patch (M. Ihsanuddin)', 'SMPN 2 Grati', 'DEOSOLE PATCH: Pengembangan Patch Deodoran Sepatu & Kaki Berbasis Bahan Alami Antibakteri Lokal Grati', 'Flora Antibakteri & Bahan Alami Lokal Grati', 'Muhammad Ihsanuddin Syams', 'Ilham Riffat Afzari', 'Muhammad Rafandra Muhyiddin', 'Dewi Anjarsari, S.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/1pxWGLfJNN6Q-qWISI4R_apbbLv0CPcJW/view?usp=drive_web', 'https://drive.google.com/file/d/1gjauWt5g6laKy6igou2aF-fdDmhLCXED/view?usp=drive_web'],
      ['team-13', 'TIM-13', 'Tim Mangofit Grati', 'SMPN 1 Grati', 'MANGOFIT: Pengembangan Yoghurt Mangga Pasuruan untuk Pangan Sehat Kaya Antioksidan dan Probiotik', 'Mangga & Susu Sapi Grati', 'Ahmad Abid Abiyyu', 'Anindia Nova Ilmia Sari', 'Laila Najwa Shakila', 'Aulia Pratamadita, S.Pd', 'Tahap 2', 'https://drive.google.com/file/d/16NEesIiKB08zNf57s3mpxBgHptkR_arQ/view?usp=drive_web', 'https://drive.google.com/file/d/1EQk3MfKfNSaFHSzKGTNLWmGA2hhIvkSC/view?usp=drive_web'],
      ['team-14', 'TIM-14', 'Tim A SPENSABA (Bio-Pouch)', 'SMPN 1 Bangil', 'BIO-POUCH ANTIBAKTERI: Inovasi Kantong Herbal Cengkeh, Serai, Pala, dan Karbon Aktif untuk Menghambat Bakteri Penyebab Bau Kaos Kaki', 'Rempah Cengkeh, Serai, Pala & Karbon Aktif Bangil', 'M. Hisyam Al Hafizh', 'Bintari Arselia', 'Nada Fajriya Salsabila', 'Umdatul Milla, S.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/1vMcbxmZL-AN-ZAVOaRk2FlCxpG-2iLtw/view?usp=drive_web', 'https://drive.google.com/file/d/1qLhYSUMCkKzwtyeqpwaIEoxTPIVkNBOl/view?usp=drive_web'],
      ['team-15', 'TIM-15', 'Tim Tami.Lab (POC MBG)', 'SMPN 1 Pandaan', 'Inovasi Pengolahan Limbah Kulit Buah MBG sebagai Pupuk Organik Cair (POC) Ramah Lingkungan', 'Limbah Kulit Buah MBG Pandaan', 'Azaria Renata Vira Irawan', 'Nathasya Zaviena Ramadhani', 'Lilik Fauziah Nurfitria', 'Adelia Rizqi Hariadi, S.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/1kN5t1vbf5xsZJsuk_VDLrpTxsXpIpjOc/view?usp=drive_web', 'https://drive.google.com/file/d/185TwBEQSqIdoFJykaEU4j-5D4E2_QwHG/view?usp=drive_web'],
      ['team-16', 'TIM-16', 'Tim Briket Daun Mangga Alma', 'SMP Al Ma\'hadul Islami', 'Briket Arang Ramah Lingkungan dari Limbah Daun Mangga Kering sebagai Energi Terbarukan Alternatif', 'Limbah Daun Mangga Kering', 'Sajjida Zaenab Marsaoly', 'Haira Hasan Fatah', 'Fathimah Syahrbanu Hazed', 'Hadhijah Assegaff, S.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1ubQcdYpbyzcXIV5RBfWgatDT3anmY27n/view?usp=drive_web', 'https://drive.google.com/file/d/1TkHR_vG0_Oi7v5GObTqxV6QG5PHfNwcG/view?usp=drive_web'],
      ['team-17', 'TIM-17', 'Tim CowcoPot Nguling', 'SMPN 2 Nguling', 'COWCOPOT: Inovasi Pot Biodegradable Berbahan Limbah Serabut Kelapa dan Kotoran Sapi Perah Grati Pengganti Polybag Plastik', 'Serabut Kelapa & Kotoran Sapi Nguling', 'Ayunda Shafitri', 'M. Hafizuddin Tsaqib', 'Meuthia Aghniya\' Fuad', 'Wulan Suci Ramadhani, M.Pd.', 'Tahap 2', 'https://drive.google.com/file/d/1arj1fvqQGv7H4ywZ5UHOvbWYKat9ZFQ0/view?usp=drive_web', 'https://drive.google.com/file/d/12C5oduy1gKB8a6WFffhZAmtuMD5vglmP/view?usp=drive_web'],
      ['team-18', 'TIM-18', 'Tim Ecoclean Sukorejo', 'SMPN 2 Sukorejo', 'ECOCLEAN: Pengembangan Cairan Pembersih Peralatan Makan Berbasis Eco-Enzyme Buatan Siswa Ramah Lingkungan', 'Limbah Kulit Buah Sukorejo', 'Rendy Dicky Syaputra', 'Mukhammad Raga Ridho Ramadhan', 'Moh. Rizqillah Khoiruddin', 'Khoirotul Islakhiyah, M.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1zVNiFhZ7X42ImOp-F8xY6hGdMxkgQmKD/view?usp=drive_web', 'https://drive.google.com/file/d/1nD-NvMr5bW8ryeYkApNhF1sH3nxBjFbk/view?usp=drive_web'],
      ['team-19', 'TIM-19', 'Tim D Pandaan (Tinta Kulit Pisang)', 'SMPN 1 Pandaan', 'Pemanfaatan Limbah Kulit Buah Pisang menjadi Tinta Alami Ramah Lingkungan (Tinta Alami Kulit Pisang)', 'Limbah Kulit Buah Pisang Lokal Pandaan', 'Diandra Kayla Putri', 'Zaskia Asyabania', 'Febrian Sandi Bramantyo', 'Reny Mufidah, M.Pd', 'Tahap 2', 'https://drive.google.com/file/d/1xxLZJPCI0JLwnGcG83wILHAVVBQ7R2qy/view?usp=drive_web', 'https://drive.google.com/file/d/1Uqd2C_6PGdfn3uUfg93XxH8vRnTIiVb0/view?usp=drive_web']
    ];

    for (var i = 0; i < officialTeams.length; i++) {
      sheetTeams.appendRow(officialTeams[i]);
    }
  }

  // Judges Sheet: Bersih tanpa akun dummy bawaan
  var sheetJudges = ss.getSheetByName('Judges') || ss.insertSheet('Judges');
  if (sheetJudges.getLastRow() === 0) {
    sheetJudges.appendRow(['ID', 'Username', 'Password', 'Nama Juri', 'NIP', 'Instansi', 'Keahlian', 'Status Aktif']);
  }

  // Evaluations Sheet: Bersih tanpa penilaian palsu
  var sheetEvals = ss.getSheetByName('Evaluations') || ss.insertSheet('Evaluations');
  if (sheetEvals.getLastRow() === 0) {
    sheetEvals.appendRow(['EvalID', 'TeamID', 'JudgeID', 'JudgeName', 'Tahap', 'NilaiArtikel', 'NilaiVideo', 'PenaltiDurasi', 'TotalSkor', 'Catatan', 'Status', 'Timestamp', 'RawPayload']);
  }
}

/**
 * Hapus Semua Akun Juri Dummy dari Spreadsheet Database
 */
function apiClearDummyJudges() {
  var ss = getOrCreateDatabaseSheet();
  var sheetJudges = ss.getSheetByName('Judges');
  if (!sheetJudges || sheetJudges.getLastRow() <= 1) {
    return { success: true, count: 0, message: 'Tidak ada juri yang perlu dibersihkan.' };
  }

  var data = sheetJudges.getDataRange().getValues();
  var dummyIdentifiers = ['juri1', 'juri2', 'juri3', 'juri-1', 'juri-2', 'juri-3'];
  var removed = 0;

  // Hapus dari baris terbawah ke atas agar index baris tidak bergeser
  for (var i = data.length - 1; i >= 1; i--) {
    var id = String(data[i][0]).toLowerCase();
    var user = String(data[i][1]).toLowerCase();
    var name = String(data[i][3]).toLowerCase();

    var isDummy = dummyIdentifiers.indexOf(id) !== -1 ||
                  dummyIdentifiers.indexOf(user) !== -1 ||
                  name.indexOf('bambang hermanto') !== -1 ||
                  name.indexOf('siti nurjanah') !== -1 ||
                  name.indexOf('rahmat hidayat') !== -1;

    if (isDummy) {
      sheetJudges.deleteRow(i + 1);
      removed++;
    }
  }

  return {
    success: true,
    count: removed,
    message: 'Berhasil membersihkan ' + removed + ' akun juri dummy dari database.'
  };
}

/**
 * API untuk Frontend Apps Script & Web App React
 */
function apiGetAppData() {
  var ss = getOrCreateDatabaseSheet();
  var sheetTeams = ss.getSheetByName('Teams');
  var sheetJudges = ss.getSheetByName('Judges');
  var sheetEvals = ss.getSheetByName('Evaluations');

  var teamsData = [];
  var judgesData = [];
  var evalsData = [];

  // Read teams
  if (sheetTeams && sheetTeams.getLastRow() > 1) {
    var tVals = sheetTeams.getRange(2, 1, sheetTeams.getLastRow() - 1, 13).getValues();
    for (var i = 0; i < tVals.length; i++) {
      var r = tVals[i];
      teamsData.push({
        id: String(r[0]),
        code: String(r[1]),
        name: String(r[2]),
        school: String(r[3]),
        productTitle: String(r[4]),
        localResource: String(r[5]),
        leader: String(r[6]),
        members: [String(r[6]), String(r[7]), String(r[8])].filter(Boolean),
        mentorTeacher: String(r[9]),
        tahap: String(r[10]),
        videoUrl: String(r[11]),
        articleUrl: String(r[12])
      });
    }
  }

  // Read judges (filter dummy accounts automatically)
  if (sheetJudges && sheetJudges.getLastRow() > 1) {
    var jVals = sheetJudges.getRange(2, 1, sheetJudges.getLastRow() - 1, 8).getValues();
    for (var j = 0; j < jVals.length; j++) {
      var jr = jVals[j];
      var jUser = String(jr[1]).toLowerCase();
      var jId = String(jr[0]).toLowerCase();
      if (jUser === 'juri1' || jUser === 'juri2' || jUser === 'juri3' ||
          jId === 'juri-1' || jId === 'juri-2' || jId === 'juri-3') {
        continue; // abaikan dummy
      }
      judgesData.push({
        id: String(jr[0]),
        username: String(jr[1]),
        password: String(jr[2]),
        name: String(jr[3]),
        nip: String(jr[4]),
        institution: String(jr[5]),
        field: String(jr[6]),
        isActive: jr[7] === 'Aktif' || jr[7] === true
      });
    }
  }

  // Read evaluations (hanya yang sudah dinilai secara aktual oleh juri)
  if (sheetEvals && sheetEvals.getLastRow() > 1) {
    var eVals = sheetEvals.getRange(2, 1, sheetEvals.getLastRow() - 1, 13).getValues();
    for (var k = 0; k < eVals.length; k++) {
      var er = eVals[k];
      evalsData.push({
        id: String(er[0]),
        teamId: String(er[1]),
        judgeId: String(er[2]),
        judgeName: String(er[3]),
        tahap: String(er[4]),
        articleScore: Number(er[5]),
        videoScore: Number(er[6]),
        durationPenalty: Number(er[7]),
        totalWeightedScore: Number(er[8]),
        generalFeedback: String(er[9]),
        status: String(er[10]),
        updatedAt: String(er[11]),
        rawPayload: String(er[12] || '')
      });
    }
  }

  return {
    success: true,
    teams: teamsData,
    judges: judgesData,
    evaluations: evalsData,
    folderId: CONFIG.DRIVE_FOLDER_ID,
    spreadsheetUrl: ss ? ss.getUrl() : '',
    timestamp: new Date().toISOString()
  };
}

/**
 * Handle Login
 */
function apiLogin(username, password) {
  if (username === CONFIG.ADMIN_USER && password === CONFIG.ADMIN_PASS) {
    return { success: true, role: 'admin' };
  }

  var data = apiGetAppData();
  var foundJudge = data.judges.find(function(j) {
    return j.username.toLowerCase() === username.toLowerCase() && j.password === password && j.isActive;
  });

  if (foundJudge) {
    return { success: true, role: 'judge', judge: foundJudge };
  }

  return { success: false, message: 'Username atau Password salah!' };
}

/**
 * Simpan atau Perbarui Penilaian Juri
 */
function apiSaveEvaluation(evaluationData) {
  var ss = getOrCreateDatabaseSheet();
  var sheet = ss.getSheetByName('Evaluations') || ss.insertSheet('Evaluations');
  
  var rows = sheet.getDataRange().getValues();
  var foundRow = -1;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === evaluationData.teamId && rows[i][2] === evaluationData.judgeId) {
      foundRow = i + 1;
      break;
    }
  }

  var evalId = evaluationData.id || ('eval-' + Date.now());
  var rowValues = [
    evalId,
    evaluationData.teamId,
    evaluationData.judgeId,
    evaluationData.judgeName || '',
    evaluationData.tahap || 'Tahap 2',
    evaluationData.articleScore || 0,
    evaluationData.videoScore || 0,
    evaluationData.durationPenalty || 0,
    evaluationData.totalWeightedScore || 0,
    evaluationData.generalFeedback || '',
    evaluationData.status || 'submitted',
    new Date().toISOString(),
    JSON.stringify(evaluationData)
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true, evalId: evalId };
}

/**
 * Tambah Akun Juri Baru (Akses Admin)
 */
function apiAddJudge(judgeData) {
  var ss = getOrCreateDatabaseSheet();
  var sheet = ss.getSheetByName('Judges') || ss.insertSheet('Judges');
  
  var judgeId = judgeData.id || ('juri-' + Date.now());
  var username = (judgeData.username || '').toLowerCase();
  
  // Cek apakah username sudah ada
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === username) {
      // Update data juri
      sheet.getRange(i + 1, 1, 1, 8).setValues([[
        rows[i][0],
        username,
        judgeData.password || rows[i][2],
        judgeData.name || rows[i][3],
        judgeData.nip || rows[i][4],
        judgeData.institution || rows[i][5],
        judgeData.field || rows[i][6],
        judgeData.isActive !== false ? 'Aktif' : 'Nonaktif'
      ]]);
      return { success: true, judgeId: rows[i][0], updated: true };
    }
  }

  sheet.appendRow([
    judgeId,
    username,
    judgeData.password || '@juri123',
    judgeData.name,
    judgeData.nip || '-',
    judgeData.institution || 'MGMP IPA Pasuruan',
    judgeData.field || 'Sains & Bisnis',
    judgeData.isActive !== false ? 'Aktif' : 'Nonaktif'
  ]);

  return { success: true, judgeId: judgeId };
}

/**
 * Hapus Akun Juri
 */
function apiDeleteJudge(idOrUsername) {
  var ss = getOrCreateDatabaseSheet();
  var sheet = ss.getSheetByName('Judges');
  if (!sheet) return { success: false, message: 'Sheet Judges tidak ditemukan' };

  var rows = sheet.getDataRange().getValues();
  var target = String(idOrUsername).toLowerCase();

  for (var i = 1; i < rows.length; i++) {
    var rowId = String(rows[i][0]).toLowerCase();
    var rowUser = String(rows[i][1]).toLowerCase();
    if (rowId === target || rowUser === target) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Juri berhasil dihapus dari DB' };
    }
  }

  return { success: false, message: 'Akun juri tidak ditemukan' };
}

/**
 * Tambah Tim Baru ke Spreadsheet
 */
function apiAddTeam(teamData) {
  var ss = getOrCreateDatabaseSheet();
  var sheet = ss.getSheetByName('Teams') || ss.insertSheet('Teams');

  var teamId = teamData.id || ('team-' + Date.now());
  var members = Array.isArray(teamData.members) ? teamData.members : [teamData.leader];

  sheet.appendRow([
    teamId,
    teamData.code || 'TIM-NEW',
    teamData.name || '',
    teamData.school || '',
    teamData.productTitle || '',
    teamData.localResource || '',
    teamData.leader || '',
    members[1] || '',
    members[2] || '',
    teamData.mentorTeacher || '',
    teamData.tahap || 'Tahap 2',
    teamData.videoUrl || '',
    teamData.articleUrl || ''
  ]);

  return { success: true, teamId: teamId };
}

/**
 * Perbarui Data Tim (Nama Tim, Judul Produk, Sekolah, dll.)
 */
function apiUpdateTeam(teamData) {
  var ss = getOrCreateDatabaseSheet();
  var sheet = ss.getSheetByName('Teams');
  if (!sheet) return { success: false, message: 'Sheet Teams tidak ditemukan' };

  var rows = sheet.getDataRange().getValues();
  var foundRow = -1;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === teamData.id || rows[i][1] === teamData.code) {
      foundRow = i + 1;
      break;
    }
  }

  var members = Array.isArray(teamData.members) ? teamData.members : [teamData.leader];
  var rowValues = [
    teamData.id,
    teamData.code,
    teamData.name || '',
    teamData.school || '',
    teamData.productTitle || '',
    teamData.localResource || '',
    teamData.leader || '',
    members[1] || '',
    members[2] || '',
    teamData.mentorTeacher || '',
    teamData.tahap || 'Tahap 2',
    teamData.videoUrl || '',
    teamData.articleUrl || ''
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    return { success: true, message: 'Data tim berhasil diperbarui di DB', teamId: teamData.id };
  } else {
    sheet.appendRow(rowValues);
    return { success: true, message: 'Data tim baru berhasil ditambahkan ke DB', teamId: teamData.id };
  }
}

/**
 * Hapus Tim dari Spreadsheet
 */
function apiDeleteTeam(teamId) {
  var ss = getOrCreateDatabaseSheet();
  var sheet = ss.getSheetByName('Teams');
  if (!sheet) return { success: false, message: 'Sheet Teams tidak ditemukan' };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === teamId || rows[i][1] === teamId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Tim berhasil dihapus dari DB' };
    }
  }

  return { success: false, message: 'Tim tidak ditemukan di DB' };
}

/**
 * Handle HTTP POST Request
 * Menerima pengiriman data (Push) dari Web App React untuk sinkronisasi live
 */
function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : '';
    var payload = {};
    if (contents) {
      try {
        payload = JSON.parse(contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    var action = payload.action;

    if (action === 'saveEvaluation' && payload.evaluationData) {
      var evalRes = apiSaveEvaluation(payload.evaluationData);
      return createJsonResponse(evalRes);
    }

    if (action === 'addJudge' && payload.judgeData) {
      var judgeRes = apiAddJudge(payload.judgeData);
      return createJsonResponse(judgeRes);
    }

    if (action === 'deleteJudge' && (payload.id || payload.judgeId)) {
      var delJRes = apiDeleteJudge(payload.id || payload.judgeId);
      return createJsonResponse(delJRes);
    }

    if (action === 'clearDummyJudges') {
      var cleanRes = apiClearDummyJudges();
      return createJsonResponse(cleanRes);
    }

    if (action === 'addTeam' && payload.teamData) {
      var addTRes = apiAddTeam(payload.teamData);
      return createJsonResponse(addTRes);
    }

    if (action === 'updateTeam' && payload.teamData) {
      var upTRes = apiUpdateTeam(payload.teamData);
      return createJsonResponse(upTRes);
    }

    if (action === 'deleteTeam' && payload.id) {
      var delTRes = apiDeleteTeam(payload.id);
      return createJsonResponse(delTRes);
    }

    if (action === 'pushAll') {
      var pushRes = apiPushAllData(payload);
      return createJsonResponse(pushRes);
    }

    return createJsonResponse({ success: true, message: 'Data diterima di backend' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Sinkronisasi Massal Seluruh Data ke Spreadsheet
 */
function apiPushAllData(payload) {
  var ss = getOrCreateDatabaseSheet();

  // Sinkronkan Teams jika ada
  if (payload.teams && Array.isArray(payload.teams)) {
    for (var t = 0; t < payload.teams.length; t++) {
      apiUpdateTeam(payload.teams[t]);
    }
  }

  // Sinkronkan Evaluations jika ada
  if (payload.evaluations && Array.isArray(payload.evaluations)) {
    for (var i = 0; i < payload.evaluations.length; i++) {
      apiSaveEvaluation(payload.evaluations[i]);
    }
  }

  // Sinkronkan Judges jika ada (hanya akun asli bukan dummy)
  if (payload.judges && Array.isArray(payload.judges)) {
    for (var k = 0; k < payload.judges.length; k++) {
      var judge = payload.judges[k];
      var u = String(judge.username).toLowerCase();
      if (u !== 'juri1' && u !== 'juri2' && u !== 'juri3') {
        apiAddJudge(judge);
      }
    }
  }

  return {
    success: true,
    message: 'Seluruh data berhasil disinkronkan ke Spreadsheet Google Drive',
    timestamp: new Date().toISOString()
  };
}
