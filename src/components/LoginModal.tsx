import React, { useState } from 'react';
import { X, Shield, UserCheck, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Judge } from '../types';
import { DbLiveIndicator } from './DbLiveIndicator';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  judges: Judge[];
  onLoginSuccess: (session: { role: 'admin' | 'judge'; judge?: Judge }) => void;
  initialRole?: 'admin' | 'judge';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  judges,
  onLoginSuccess,
  initialRole = 'judge'
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'judge'>(initialRole);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (selectedRole === 'admin') {
      if (u === 'admin' && p === '@1') {
        onLoginSuccess({ role: 'admin' });
        onClose();
      } else {
        setErrorMsg('Username atau Password Administrator salah. Silakan periksa kembali.');
      }
    } else {
      const foundJudge = judges.find(
        j => j.username.toLowerCase() === u && (j.password || '@juri123') === p
      );
      if (foundJudge) {
        if (!foundJudge.isActive) {
          setErrorMsg('Akun juri ini sedang dinonaktifkan oleh Administrator.');
          return;
        }
        onLoginSuccess({ role: 'judge', judge: foundJudge });
        onClose();
      } else {
        setErrorMsg('Username atau Password Dewan Juri tidak terdaftar di database.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              {selectedRole === 'admin' ? <Shield size={24} className="text-amber-400" /> : <UserCheck size={24} className="text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                  PSF 2026
                </span>
                <DbLiveIndicator size="sm" variant="glass" showLatency={false} />
              </div>
              <h3 className="text-xl font-black">
                {selectedRole === 'admin' ? 'Portal Administrator' : 'Portal Dewan Juri'}
              </h3>
            </div>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('judge');
              setUsername('');
              setPassword('');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              selectedRole === 'judge'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dewan Juri
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setUsername('');
              setPassword('');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Administrator
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'Masukkan username admin...' : 'Masukkan username juri...'}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-800/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
