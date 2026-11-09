import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, ExternalLink, Folder, Database } from 'lucide-react';
import { GOOGLE_DRIVE_DB_URL, GOOGLE_SPREADSHEET_ID, GOOGLE_SPREADSHEET_URL } from '../data/initialData';

interface GasExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasExportModal: React.FC<GasExportModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'Index.html'>('Code.gs');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeGsContent = `/**
 * PASURUAN SCIENCE FESTIVAL 2026 - LOMBA SAINSPRENEUR
 * MGMP IPA SMP KABUPATEN PASURUAN
 * Backend Google Apps Script (Code.gs)
 *
 * Folder Database Google Drive:
 * https://drive.google.com/drive/folders/1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb?usp=sharing
 * Spreadsheet Database ID:
 * ${GOOGLE_SPREADSHEET_ID}
 */

const CONFIG = {
  DRIVE_FOLDER_ID: '1BfYaK-fIoJlfZNRhTzngN-pRzYv_7Ubb',
  SPREADSHEET_ID: '${GOOGLE_SPREADSHEET_ID}',
  SPREADSHEET_NAME: 'DB_Sainspreneur_Pasuruan_Festival_2026',
  ADMIN_USER: 'admin',
  ADMIN_PASS: '@1',
  APP_TITLE: 'Pasuruan Science Festival 2026 - Penilaian Sainspreneur'
};

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.folderId = CONFIG.DRIVE_FOLDER_ID;
  return template.evaluate()
    .setTitle(CONFIG.APP_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getOrCreateDatabaseSheet() {
  try {
    var ssById = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    initSheets(ssById);
    return ssById;
  } catch (errById) {}

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
      initSheets(ss);
    }
    return ss;
  } catch (err) {
    var ssDefault = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    initSheets(ssDefault);
    return ssDefault;
  }
}

function initSheets(ss) {
  var sheetTeams = ss.getSheetByName('Teams') || ss.insertSheet('Teams');
  if (sheetTeams.getLastRow() === 0) {
    sheetTeams.appendRow(['ID', 'Kode', 'Nama Tim', 'Asal Sekolah', 'Judul Inovasi Produk', 'Bahan Lokal', 'Ketua', 'Guru Pendamping']);
  }
  var sheetJudges = ss.getSheetByName('Judges') || ss.insertSheet('Judges');
  if (sheetJudges.getLastRow() === 0) {
    sheetJudges.appendRow(['ID', 'Username', 'Password', 'Nama Juri', 'NIP', 'Instansi', 'Keahlian']);
  }
}

function apiGetAppData() {
  var ss = getOrCreateDatabaseSheet();
  return {
    success: true,
    spreadsheetId: CONFIG.SPREADSHEET_ID,
    folderId: CONFIG.DRIVE_FOLDER_ID,
    folderUrl: 'https://drive.google.com/drive/folders/' + CONFIG.DRIVE_FOLDER_ID
  };
}`;

  const indexHtmlContent = `<!-- Index.html untuk Google Apps Script -->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pasuruan Science Festival 2026 - Penilaian Sainspreneur</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
</head>
<body class="bg-slate-50 text-slate-800">
  <!-- Template Web App Google Apps Script -->
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-black text-blue-950">PASURUAN SCIENCE FESTIVAL 2026</h1>
    <p class="text-slate-600 text-xs">Penilaian Sainspreneur MGMP IPA SMP Kab. Pasuruan</p>
  </div>
</body>
</html>`;

  const currentContent = activeFile === 'Code.gs' ? codeGsContent : indexHtmlContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-950 p-6 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Code2 size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300">
                Google Apps Script Deployment
              </span>
              <h3 className="text-lg font-black">
                File Code.gs & Index.html untuk Apps Script
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Drive & Spreadsheet Info Ribbon */}
        <div className="bg-emerald-900/40 p-4 px-6 border-b border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-emerald-200">
            <Database size={16} className="text-amber-400" />
            <span>ID Spreadsheet DB:</span>
            <code className="text-amber-300 font-mono text-[11px] bg-black/30 px-2 py-0.5 rounded">
              {GOOGLE_SPREADSHEET_ID}
            </code>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={GOOGLE_SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-amber-300 hover:text-white inline-flex items-center gap-1 underline"
            >
              <span>Buka Spreadsheet DB</span>
              <ExternalLink size={12} />
            </a>
            <a
              href={GOOGLE_DRIVE_DB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-200 hover:text-white inline-flex items-center gap-1 underline"
            >
              <span>Folder Drive</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFile('Code.gs')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFile === 'Code.gs' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
              }`}
            >
              Code.gs
            </button>
            <button
              onClick={() => setActiveFile('Index.html')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFile === 'Index.html' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
              }`}
            >
              Index.html
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download size={14} />
              <span>Unduh {activeFile}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          <pre className="font-mono text-xs text-emerald-400 whitespace-pre leading-relaxed">
            {currentContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
