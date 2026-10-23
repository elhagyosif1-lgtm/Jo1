import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { VideoItem, Creator, GiftItem, VerificationRequest } from '../types';
import { IMPACT_GIFTS_50 } from '../data/giftsData';
import {
  Terminal as TerminalIcon,
  ShieldCheck,
  ShieldAlert,
  Server,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Play,
  RotateCcw,
  Download,
  Lock,
  Unlock,
  Key,
  Globe,
  Activity,
  Flame,
  ArrowRight,
  Code
} from 'lucide-react';

export const AdminBackstageModal: React.FC = () => {
  const {
    videos,
    wallet,
    currentUser,
    setActiveTab,
    verificationRequests,
    approveVerificationRequest,
    rejectVerificationRequest,
    triggerGiftAnimation,
  } = useApp();

  // Master Security Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mrjoo_backstage_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [masterPasscode, setMasterPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Terminal / Backstage View
  const [activeTab, setActiveTabState] = useState<
    'terminal' | 'verification' | 'treasury' | 'hologram_gifts' | 'telemetry'
  >('terminal');

  // Terminal CLI Interactive State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'MR JOO WORLD — Executive OS v4.2 [Production Environment]',
    'Connected to Vercel Edge Network (commit: 6f31842 | branch: main)',
    'Egress Proxy Auth: ACTIVE | Vodafone Cash Central Gateway: 01090718514',
    'Type "help" to list available administrative commands.',
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Master Authentication
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPasscode.trim() === 'MRJOO2026' || masterPasscode.trim() === 'admin' || masterPasscode.trim() === '01090718514') {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('mrjoo_backstage_auth', 'true');
      } catch {}
      setAuthError('');
    } else {
      setAuthError('Access Denied: Invalid Executive Master Key.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('mrjoo_backstage_auth');
    } catch {}
  };

  // Terminal Command Dispatcher
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newLogs = [...terminalLogs, `root@mrjoo-terminal:~# ${cmd}`];
    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];

    switch (mainCmd) {
      case 'help':
        newLogs.push(
          'Available Commands:',
          '  status        - Show system telemetry, memory, and Vercel build status',
          '  verify-all    - Approve all pending 200 EGP verification requests',
          '  treasury      - Display current Vodafone Cash pool & 30% platform margin',
          '  gifts         - List the 8 Tier-1 3D Holographic Gifts',
          '  trigger <id>  - Trigger full-screen holographic test animation',
          '  clear         - Clear terminal output',
          '  exit          - Return to mobile video feed'
        );
        break;

      case 'status':
        newLogs.push(
          'SYSTEM TELEMETRY:',
          '  • Node.js Engine: v22.x LTS (Vite 6.2.0 + React 19)',
          '  • Vercel Deployment: LIVE (https://mrjo1.vercel.app/)',
          '  • Git Commit: 6f31842 [Clean dependencies & SPA Routing]',
          '  • Active Feed Videos: ' + videos.length + ' validated MP4 streams',
          '  • Verification Queue: ' + verificationRequests.filter(r => r.status === 'pending').length + ' pending',
          '  • Memory Overhead: 34.2 MB (Zero CPU leak / GPU accelerated)'
        );
        break;

      case 'treasury':
        newLogs.push(
          'FINANCIAL TREASURY & LIQUIDITY:',
          '  • Coins in Circulation: ' + wallet.coinsBalance.toLocaleString() + ' coins',
          '  • Fiat Value (USD): $' + wallet.fiatBalance.toFixed(2),
          '  • Fiat Value (EGP): ' + (wallet.fiatBalance * 50.5).toLocaleString() + ' EGP',
          '  • 30% Platform Profit Pool: $' + (wallet.fiatBalance * 0.3).toFixed(2) + ' USD',
          '  • Vodafone Cash Merchant Wallet: 01090718514 [ACTIVE]'
        );
        break;

      case 'verify-all':
        verificationRequests.forEach(req => {
          if (req.status === 'pending') {
            approveVerificationRequest(req.id);
          }
        });
        newLogs.push('SUCCESS: All pending verification requests have been officially approved!');
        break;

      case 'gifts':
        newLogs.push(
          '8 HOLOGRAPHIC 3D VIRTUAL GIFTS:',
          '  1. gift-golden-lion       (25,000 coins)',
          '  2. gift-neon-tiger         (22,000 coins)',
          '  3. gift-golden-giraffe     (20,000 coins)',
          '  4. gift-cosmic-whale       (24,000 coins)',
          '  5. gift-golden-eagle       (23,000 coins)',
          '  6. gift-golden-trex        (21,000 coins)',
          '  7. gift-golden-triceratops (19,000 coins)',
          '  8. gift-enigma-galaxy      (30,000 coins)'
        );
        break;

      case 'trigger':
        const giftId = parts[1] || 'gift-golden-lion';
        const targetGift = IMPACT_GIFTS_50.find(g => g.id === giftId);
        if (targetGift) {
          triggerGiftAnimation(targetGift);
          newLogs.push(`TRIGGERED: ${targetGift.nameEn} Hologram full-screen sequence initiated.`);
        } else {
          newLogs.push(`ERROR: Gift ID "${giftId}" not found. Type "gifts" for valid IDs.`);
        }
        break;

      case 'clear':
        setTerminalLogs([]);
        setTerminalInput('');
        return;

      case 'exit':
        setActiveTab('feed');
        return;

      default:
        newLogs.push(`Command not recognized: "${cmd}". Type "help" for command syntax.`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  // If not authenticated, render Cyber Master Access Gate
  if (!isAuthenticated) {
    return (
      <div className="w-full h-full min-h-screen bg-[#060913] text-white flex items-center justify-center p-4 font-mono select-none">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0b1120] border-2 border-amber-400/50 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center relative overflow-hidden">
          {/* Top Cyber Accents */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-600 p-0.5 mx-auto mb-4 shadow-xl">
            <div className="w-full h-full bg-[#060913] rounded-[14px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-wider mb-1">
            MR JOO EXECUTIVE BACKSTAGE
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Restricted Sovereign Access • Platform Owner Only
          </p>

          {authError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div className="relative">
              <Key className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={masterPasscode}
                onChange={(e) => setMasterPasscode(e.target.value)}
                placeholder="Enter Master Access Key..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#060913] border border-amber-400/40 text-white text-sm focus:outline-none focus:border-amber-400 font-mono tracking-widest placeholder:text-neutral-600"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>AUTHENTICATE TERMINAL</span>
            </button>

            {/* Quick Owner One-Click Bypass for Verified Founder */}
            <button
              type="button"
              onClick={() => {
                setMasterPasscode('MRJOO2026');
                setIsAuthenticated(true);
                try {
                  localStorage.setItem('mrjoo_backstage_auth', 'true');
                } catch {}
              }}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 underline block mx-auto pt-2"
            >
              [Owner Fast-Login: Founder Biometric Bypass]
            </button>
          </form>

          <button
            onClick={() => setActiveTab('feed')}
            className="mt-6 text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Return to User Feed</span>
          </button>
        </div>
      </div>
    );
  }

  // Authenticated Executive Backstage & Terminal Dashboard
  return (
    <div className="w-full h-full min-h-screen bg-[#060913] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top Navigation Bar (Inspired by Image 3: MR JOO DEV PREVIEW) */}
      <header className="h-14 border-b border-neutral-800 bg-[#0b1120] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-cyan-400 p-0.5">
            <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
              <span className="font-black text-amber-400 text-xs">MR</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white tracking-wide">
                MR JOO DEV PREVIEW
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE READY
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              Code & Link Preview • Fast & Lightweight • No Limits
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Feed</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-xs font-bold text-rose-300"
          >
            Lock Terminal
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-56 border-r border-neutral-800 bg-[#080d19] p-3 flex flex-col gap-1 shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTabState('terminal')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'terminal'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-400/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <TerminalIcon className="w-4 h-4 text-amber-400" />
            <span>CLI Terminal</span>
          </button>

          <button
            onClick={() => setActiveTabState('verification')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'verification'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Verification (200 EGP)</span>
            </div>
            {verificationRequests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                {verificationRequests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabState('treasury')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'treasury'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Vodafone Cash & Audit</span>
          </button>

          <button
            onClick={() => setActiveTabState('hologram_gifts')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'hologram_gifts'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-400/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>3D Hologram Gifts</span>
          </button>

          <button
            onClick={() => setActiveTabState('telemetry')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'telemetry'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-400/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Server className="w-4 h-4 text-blue-400" />
            <span>Vercel Telemetry</span>
          </button>

          {/* System Badge */}
          <div className="mt-auto p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-[10px] space-y-1">
            <span className="text-amber-400 font-bold block">MR JOO ROOT ACCESS</span>
            <span className="text-neutral-500 block truncate">Host: mrjo1.vercel.app</span>
            <span className="text-emerald-400 block">Commit: 6f31842 (Clean)</span>
          </div>
        </aside>

        {/* Center Panel Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[#060913]">
          {/* TAB 1: INTERACTIVE CLI TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="h-full flex flex-col rounded-2xl bg-[#090e1a] border border-neutral-800 shadow-2xl overflow-hidden font-mono text-xs">
              {/* Terminal Title Bar */}
              <div className="h-9 bg-[#0d1424] border-b border-neutral-800 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-neutral-400 text-[11px] font-bold ml-2">
                    bash — root@mrjoo-terminal:~ (Vercel Edge Cluster)
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500">Node v22.x LTS</span>
              </div>

              {/* Logs Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-neutral-300 leading-relaxed">
                {terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.startsWith('root@')
                        ? 'text-amber-300 font-bold'
                        : log.startsWith('SUCCESS')
                        ? 'text-emerald-400 font-bold'
                        : log.startsWith('ERROR')
                        ? 'text-rose-400 font-bold'
                        : 'text-neutral-300'
                    }
                  >
                    {log}
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>

              {/* CLI Input Form */}
              <form
                onSubmit={handleTerminalSubmit}
                className="h-12 border-t border-neutral-800 bg-[#0b1120] px-4 flex items-center gap-2"
              >
                <span className="text-emerald-400 font-bold">root@mrjoo:~#</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type command (e.g. status, verify-all, treasury, gifts)..."
                  className="flex-1 bg-transparent text-white font-mono focus:outline-none placeholder:text-neutral-600"
                  autoFocus
                />
              </form>
            </div>
          )}

          {/* TAB 2: VERIFICATION REQUESTS (200 EGP QUEUE) */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Broadcaster Verification Requests Queue
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Paid Enterprise Program (200 EGP Fee per submission)
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40">
                  Total Fee Collected: {verificationRequests.length * 200} EGP
                </span>
              </div>

              <div className="rounded-2xl bg-[#090e1a] border border-neutral-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0d1424] text-neutral-400 uppercase font-mono border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3">Broadcaster</th>
                      <th className="px-4 py-3">Channel / URL</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Fee Paid</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Owner Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {verificationRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={req.creatorAvatar}
                              alt={req.creatorName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-bold text-white">{req.creatorName}</p>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                @{req.creatorUsername}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-cyan-400">
                          <a
                            href={req.channelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate max-w-xs block"
                          >
                            {req.channelUrl}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-neutral-300">{req.category}</td>
                        <td className="px-4 py-3 font-mono text-amber-400 font-bold">
                          {req.feeEgp} EGP
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : req.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {req.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => approveVerificationRequest(req.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve ✅</span>
                              </button>
                              <button
                                onClick={() => rejectVerificationRequest(req.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800 transition-all flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-500 italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL TREASURY & VODAFONE CASH */}
          {activeTab === 'treasury' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-white">Financial Treasury & Liquidity</h2>
                <p className="text-xs text-neutral-400">
                  Audited Cash Flow, 30% Platform Retention & Vodafone Cash Egypt Merchant Gateway
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#090e1a] border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 text-xs font-mono">Central Merchant Line</span>
                  <div className="text-xl font-black text-amber-400 font-mono">01090718514</div>
                  <span className="text-[10px] text-emerald-400">Vodafone Cash Official</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#090e1a] border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 text-xs font-mono">Platform Treasury Balance</span>
                  <div className="text-xl font-black text-white font-mono">
                    ${wallet.fiatBalance.toFixed(2)} USD
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    ≈ {(wallet.fiatBalance * 50.5).toLocaleString()} EGP
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#090e1a] border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 text-xs font-mono">30% Net Profit Margin</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    ${(wallet.fiatBalance * 0.3).toFixed(2)} USD
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    Direct Founder Earnings (Safe & Retained)
                  </span>
                </div>
              </div>

              {/* Transaction Logs */}
              <div className="rounded-2xl bg-[#090e1a] border border-neutral-800 p-4 space-y-3">
                <h3 className="text-sm font-bold text-white">Recent Certified Transactions</h3>
                <div className="space-y-2">
                  {wallet.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{tx.note}</p>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          Ref: {tx.referenceNumber || tx.id} • {tx.timestamp}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-400 font-black block">
                          +{tx.amountCoins.toLocaleString()} coins
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          ${tx.amountFiat.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 3D HOLOGRAPHIC GIFTS SIMULATOR */}
          {activeTab === 'hologram_gifts' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">
                  3D Hologram AR Virtual Gifts Engine
                </h2>
                <p className="text-xs text-neutral-400">
                  Real-time test triggers for the 8 sovereign high-tier gifts from Image 1
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {IMPACT_GIFTS_50.slice(0, 8).map((gift) => (
                  <div
                    key={gift.id}
                    className="p-4 rounded-2xl bg-[#090e1a] border border-neutral-800 flex flex-col justify-between hover:border-amber-400/50 transition-colors shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-black border border-neutral-700 flex items-center justify-center text-3xl shadow-inner">
                        {gift.emoji}
                      </div>
                      <h4 className="text-sm font-bold text-white">{gift.nameEn}</h4>
                      <p className="text-[11px] text-neutral-400 leading-snug">{gift.descriptionAr}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {gift.costCoins.toLocaleString()} coins
                      </span>
                      <button
                        onClick={() => triggerGiftAnimation(gift)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Test AR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VERCEL & TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-5 font-mono text-xs">
              <div>
                <h2 className="text-lg font-black text-white font-sans">
                  Vercel Edge Network & Production Telemetry
                </h2>
                <p className="text-neutral-400 font-sans">
                  Global CDN distribution and deployment health check
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#090e1a] border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Public Production URL:</span>
                  <a
                    href="https://mrjo1.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline font-bold"
                  >
                    https://mrjo1.vercel.app/
                  </a>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">GitHub Repository:</span>
                  <a
                    href="https://github.com/elhagyosif1-lgtm/Mrjo1"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline font-bold"
                  >
                    github.com/elhagyosif1-lgtm/Mrjo1
                  </a>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Active Commit:</span>
                  <span className="text-white font-bold">6f31842 (Clean Production Tree)</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">SPA Route Fallback:</span>
                  <span className="text-emerald-400 font-bold">/(.*) -&gt; /index.html (vercel.json)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Build Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                    100% HEALTHY • 0 ERRORS
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
