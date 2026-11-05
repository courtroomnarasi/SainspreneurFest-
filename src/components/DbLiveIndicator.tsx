import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getDbConnectionState, subscribeDbConnection, pingDatabase, DbConnectionState } from '../utils/dbConnection';

interface DbLiveIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'glass';
  showLabel?: boolean;
  showLatency?: boolean;
  interactive?: boolean;
  className?: string;
}

export const DbLiveIndicator: React.FC<DbLiveIndicatorProps> = ({
  size = 'md',
  variant = 'glass',
  showLabel = true,
  showLatency = false,
  interactive = true,
  className = ''
}) => {
  const [conn, setConn] = useState<DbConnectionState>(getDbConnectionState());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    return subscribeDbConnection((state) => {
      setConn(state);
    });
  }, []);

  const handleManualPing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await pingDatabase();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const isConnected = conn.status === 'connected';
  const isChecking = conn.status === 'checking' || isRefreshing;

  // Base styling for variant
  let containerStyles = '';
  if (variant === 'glass') {
    containerStyles = isConnected
      ? 'bg-emerald-950/70 border-emerald-400/50 text-emerald-200'
      : isChecking
      ? 'bg-amber-950/70 border-amber-400/50 text-amber-200'
      : 'bg-rose-950/70 border-rose-400/50 text-rose-200';
  } else if (variant === 'light') {
    containerStyles = isConnected
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
      : isChecking
      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
      : 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs';
  } else {
    // dark
    containerStyles = isConnected
      ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
      : isChecking
      ? 'bg-slate-900 border-amber-500/40 text-amber-300'
      : 'bg-slate-900 border-rose-500/40 text-rose-300';
  }

  const dotSize = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5';
  const textPadding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-md font-bold transition-all ${containerStyles} ${textPadding} ${className}`}
      title={`Status Database: ${isConnected ? 'Terhubung (Online)' : isChecking ? 'Sedang Memeriksa...' : 'Terputus'} • Klik untuk cek ulang`}
    >
      {/* Live Blinking Indicator Light */}
      <span className={`relative flex ${dotSize}`}>
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
        )}
        {isChecking && (
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
        )}
        <span
          className={`relative inline-flex rounded-full ${dotSize} ${
            isConnected
              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
              : isChecking
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
              : 'bg-rose-500'
          }`}
        />
      </span>

      {showLabel && (
        <span className="flex items-center gap-1 uppercase tracking-wider font-extrabold font-mono">
          <span>{isConnected ? 'LIVE DB' : isChecking ? 'SYNC DB...' : 'DB OFFLINE'}</span>
          {isConnected && <span className="font-sans lowercase font-semibold hidden md:inline">• terhubung</span>}
        </span>
      )}

      {showLatency && conn.latencyMs && (
        <span className="text-[10px] opacity-75 font-mono">
          ({conn.latencyMs}ms)
        </span>
      )}

      {interactive && (
        <button
          type="button"
          onClick={handleManualPing}
          className="hover:rotate-180 transition-transform duration-300 p-0.5 cursor-pointer opacity-80 hover:opacity-100"
          title="Segarkan / Ping Ulang Koneksi Database"
        >
          <RefreshCw size={size === 'sm' ? 10 : 12} className={isChecking ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
};
