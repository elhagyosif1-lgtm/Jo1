import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  Phone,
  Building2,
  CheckCircle2,
  History,
  X,
  ShieldCheck,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  HelpCircle,
  Send,
  RefreshCw,
  Zap,
  Check,
  BadgeAlert,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import {
  validateEgyptianPhoneNumber,
  processVodafoneCashTransaction,
  generateVodafoneCashUSSD,
  USD_TO_EGP_RATE,
  OFFICIAL_VODAFONE_MERCHANT_WALLET,
  MASKED_VODAFONE_MERCHANT_WALLET,
  VodafoneCashError
} from '../services/vodafoneCashService';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallet, depositCoins, withdrawCash } = useApp();

  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw' | 'study' | 'history'>('balance');
  const [withdrawMethod, setWithdrawMethod] = useState<'vodafone_cash' | 'bank_iban'>('vodafone_cash');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('25');
  const [showFullPhone, setShowFullPhone] = useState(false);

  // Deposit state
  const [selectedDepositPkg, setSelectedDepositPkg] = useState<{ coins: number; priceUsd: number; label: string } | null>(null);
  const [customCoins, setCustomCoins] = useState<string>('2000');
  const [senderPhone, setSenderPhone] = useState<string>(OFFICIAL_VODAFONE_MERCHANT_WALLET);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [depositStep, setDepositStep] = useState<number>(1);
  const [depositReceipt, setDepositReceipt] = useState<{
    ref: string;
    coins: number;
    fiatUsd: number;
    fiatEgp: number;
    sender: string;
    timestamp: string;
    ussd: string;
  } | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Withdraw state
  const [withdrawPhone, setWithdrawPhone] = useState<string>(OFFICIAL_VODAFONE_MERCHANT_WALLET);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<number>(1);
  const [withdrawReceipt, setWithdrawReceipt] = useState<{
    ref: string;
    fiatUsd: number;
    fiatEgp: number;
    coins: number;
    account: string;
    timestamp: string;
  } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Toast / Copy state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const playErrorTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const rechargePackages = [
    { coins: 1000, priceUsd: 5, label: 'باقة المبتدئين (1,000 عملة)' },
    { coins: 3000, priceUsd: 15, label: 'باقة الفضة (3,000 عملة)' },
    { coins: 6000, priceUsd: 30, label: 'باقة الذهب (6,000 عملة)' },
    { coins: 10000, priceUsd: 50, label: 'باقة البلاتينيوم (10,000 عملة)', popular: true },
    { coins: 20000, priceUsd: 100, label: 'باقة كبار الداعمين VIP (20,000 عملة)', vip: true },
  ];

  // Dynamic carrier validation for sender
  const senderValidation = useMemo(() => {
    return validateEgyptianPhoneNumber(senderPhone);
  }, [senderPhone]);

  // Dynamic carrier validation for withdraw target
  const withdrawValidation = useMemo(() => {
    return validateEgyptianPhoneNumber(withdrawPhone);
  }, [withdrawPhone]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Robust Deposit execution with step progression and fail-safe handling
  const handleConfirmDeposit = async () => {
    setDepositError(null);
    const coinsToDeposit = selectedDepositPkg ? selectedDepositPkg.coins : Number(customCoins);
    const usdPrice = selectedDepositPkg ? selectedDepositPkg.priceUsd : Number((coinsToDeposit * 0.005).toFixed(2));

    try {
      setIsProcessingDeposit(true);
      setDepositStep(1); // Step 1: Validating parameters

      const result = await processVodafoneCashTransaction('deposit', {
        amountUsd: usdPrice,
        phone: senderPhone,
        availableBalanceUsd: wallet.fiatBalance,
      });

      setDepositStep(2); // Step 2: Atomic Database update
      await new Promise(r => setTimeout(r, 200));

      depositCoins(
        coinsToDeposit,
        usdPrice,
        `شحن فودافون كاش فوري من (${senderValidation.formattedNumber.slice(0, 3)}*****${senderValidation.formattedNumber.slice(-3)})`,
        result.transactionReference
      );

      setDepositStep(3); // Step 3: Receipt generated
      playSuccessChime();
      setIsProcessingDeposit(false);
      setDepositReceipt({
        ref: result.transactionReference,
        coins: coinsToDeposit,
        fiatUsd: usdPrice,
        fiatEgp: result.amountEgp,
        sender: senderValidation.formattedNumber,
        timestamp: result.timestamp,
        ussd: result.ussdCode,
      });
    } catch (err: any) {
      setIsProcessingDeposit(false);
      playErrorTone();
      if (err instanceof VodafoneCashError) {
        setDepositError(err.arabicMessage);
      } else {
        setDepositError(err.message || 'فشلت عملية الإيداع. يرجى التأكد من صحة رقم فودافون كاش والمحاولة ثانية.');
      }
    }
  };

  // Robust Withdrawal execution with step progression and fail-safe handling
  const handleConfirmWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amount = Number(withdrawAmount);

    try {
      setIsProcessingWithdraw(true);
      setWithdrawStep(1); // Step 1: Verification

      const targetPhone = withdrawMethod === 'vodafone_cash' ? withdrawPhone : OFFICIAL_VODAFONE_MERCHANT_WALLET;

      const result = await processVodafoneCashTransaction('withdraw', {
        amountUsd: amount,
        phone: targetPhone,
        availableBalanceUsd: wallet.fiatBalance,
      });

      setWithdrawStep(2); // Step 2: Database atomic balance deduction
      await new Promise(r => setTimeout(r, 200));

      const provider = withdrawMethod === 'vodafone_cash' ? 'فودافون كاش مصر' : 'تحويل بنكي IBAN';
      withdrawCash(amount, targetPhone, provider, result.transactionReference);

      setWithdrawStep(3); // Step 3: Stamped receipt
      playSuccessChime();
      setIsProcessingWithdraw(false);
      setWithdrawReceipt({
        ref: result.transactionReference,
        fiatUsd: amount,
        fiatEgp: result.amountEgp,
        coins: result.amountCoins,
        account: withdrawMethod === 'vodafone_cash' ? `${withdrawValidation.formattedNumber.slice(0, 3)}*****${withdrawValidation.formattedNumber.slice(-3)}` : wallet.linkedIban,
        timestamp: result.timestamp,
      });
    } catch (err: any) {
      setIsProcessingWithdraw(false);
      playErrorTone();
      if (err instanceof VodafoneCashError) {
        setWithdrawError(err.arabicMessage);
      } else {
        setWithdrawError(err.message || 'فشلت عملية السحب. تأكد من توفر الرصيد الكافي وصحة رقم المحفظة.');
      }
    }
  };

  const setWithdrawPercentage = (pct: number) => {
    setWithdrawError(null);
    const calculated = (wallet.fiatBalance * pct).toFixed(2);
    setWithdrawAmount(calculated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                <span>محفظة فودافون كاش الحقيقية</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
                  سعر الصرف الرسمي: 1$ = {USD_TO_EGP_RATE} ج.م
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">سحب وإيداع نقدي فوري مع ضمان تحديث قاعدة البيانات لحظياً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl my-3 text-[11px] font-bold">
          <button
            onClick={() => {
              setActiveTab('balance');
              setSelectedDepositPkg(null);
              setDepositReceipt(null);
              setWithdrawReceipt(null);
              setDepositError(null);
              setWithdrawError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'balance' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            الرصيد
          </button>
          <button
            onClick={() => {
              setActiveTab('deposit');
              setDepositReceipt(null);
              setDepositError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'deposit' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            شحن كاش
          </button>
          <button
            onClick={() => {
              setActiveTab('withdraw');
              setWithdrawReceipt(null);
              setWithdrawError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'withdraw' ? 'bg-rose-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            سحب أرباح
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'study' ? 'bg-cyan-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            دراسة الأرباح
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            السجل
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {/* TAB 1: Balance Overview */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-rose-700 via-neutral-900 to-black border border-rose-500/40 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-rose-200">الرصيد الإجمالي المعتمد في قاعدة البيانات</span>
                    <h2 className="text-3xl font-black text-white tabular-nums mt-1">
                      {wallet.coinsBalance.toLocaleString()} <span className="text-lg">عملة</span>
                    </h2>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-300">مربوطة لحظياً</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-white/90 pt-3 border-t border-white/15">
                  <div>
                    <span className="text-[10px] text-white/70 block">المعادل النقدي (1,000 عملة = $5)</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-extrabold text-base text-emerald-400 font-mono">
                        ${(wallet.coinsBalance * 0.005).toFixed(2)} USD
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono">
                        (~{Math.round(wallet.coinsBalance * 0.005 * USD_TO_EGP_RATE).toLocaleString()} ج.م)
                      </span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-white/70 block">محفظة فودافون كاش المعتمدة</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-amber-300 font-bold justify-end mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-rose-400" />
                      <span>{showFullPhone ? OFFICIAL_VODAFONE_MERCHANT_WALLET : MASKED_VODAFONE_MERCHANT_WALLET}</span>
                      <button
                        type="button"
                        onClick={() => setShowFullPhone(!showFullPhone)}
                        className="text-neutral-400 hover:text-white p-0.5"
                        title="إظهار / إخفاء"
                      >
                        {showFullPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('deposit');
                    setSelectedDepositPkg(rechargePackages[0]);
                  }}
                  className="p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 flex flex-col items-center gap-2 text-center group active:scale-95 transition-all shadow-md"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">إيداع وشحن عملات</span>
                  <span className="text-[10px] text-amber-300">كود فودافون كاش السريع</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('withdraw');
                    setWithdrawAmount((wallet.fiatBalance * 0.5).toFixed(2));
                  }}
                  className="p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 flex flex-col items-center gap-2 text-center group active:scale-95 transition-all shadow-md"
                >
                  <div className="w-11 h-11 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpFromLine className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">سحب أرباح فودافون كاش</span>
                  <span className="text-[10px] text-rose-300">تحويل كاش فوري مضمون</span>
                </button>
              </div>

              {/* Security & Reliability Banner */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="text-[11px] text-neutral-300 leading-relaxed">
                  <strong className="text-white font-bold block mb-0.5">حماية مالية فائقة ومزامنة فورية:</strong>
                  جميع العمليات المالية محمية بقفل عدم التكرار (Idempotency Lock) وتحدث تلقائياً في قاعدة البيانات مع حفظ كامل للإيصالات المعتمدة.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Deposit / Recharge */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              {/* Error Banner */}
              {depositError && (
                <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500 text-red-200 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="block">{depositError}</span>
                    <button
                      type="button"
                      onClick={() => setDepositError(null)}
                      className="text-[10px] text-red-300 underline mt-1"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              )}

              {depositReceipt ? (
                /* Stamped Official Receipt Screen */
                <div className="p-5 rounded-2xl bg-neutral-950 border-2 border-emerald-500/80 text-center space-y-3.5 animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">تم شحن الرصيد وتحديث قاعدة البيانات بنجاح!</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      تمت إضافة <strong className="text-emerald-400 font-mono">+{depositReceipt.coins.toLocaleString()} عملة</strong> لحسابك فورياً.
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs font-mono space-y-2 text-right">
                    <div className="flex justify-between text-neutral-400">
                      <span>رقم المعاملة المرجعي:</span>
                      <span className="text-emerald-400 font-bold">{depositReceipt.ref}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>المبلغ بالدولار:</span>
                      <span className="text-white">${depositReceipt.fiatUsd.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>المعادل بفودافون كاش:</span>
                      <span className="text-amber-300 font-bold">{depositReceipt.fiatEgp.toLocaleString()} جنيه مصري</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>محفظة الإرسال:</span>
                      <span className="text-neutral-200">{depositReceipt.sender}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>وقت المعاملة:</span>
                      <span className="text-neutral-200">{depositReceipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-800 pt-2 text-neutral-300">
                      <span>الرصيد الكلي الجديد:</span>
                      <span className="text-emerald-400 font-bold">{wallet.coinsBalance.toLocaleString()} عملة</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(depositReceipt.ref, 'كود العملية')}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{copiedText === 'كود العملية' ? 'تم النسخ!' : 'نسخ كود العملية'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setDepositReceipt(null);
                        setSelectedDepositPkg(null);
                        setActiveTab('balance');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
                    >
                      العودة لشاشة الرصيد
                    </button>
                  </div>

                  {/* Direct Mobile SMS & WhatsApp Notification Links to phone */}
                  <div className="pt-3 border-t border-neutral-800 space-y-2 text-right">
                    <span className="text-[11px] font-bold text-neutral-400 block">
                      📲 إرسال إشعار فوري وتأكيد المعاملة لرقم هاتفك:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={`sms:${depositReceipt.sender}?&body=${encodeURIComponent(
                          `منصة Jo1 - تم إيداع ${depositReceipt.coins.toLocaleString()} عملة ($${depositReceipt.fiatUsd.toFixed(2)} = ${depositReceipt.fiatEgp.toLocaleString()} ج.م) بنجاح عبر فودافون كاش. كود المعاملة: ${depositReceipt.ref} - ${depositReceipt.timestamp}`
                        )}`}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>إرسال رسالة SMS لهاتفي</span>
                      </a>

                      <a
                        href={`https://wa.me/2${depositReceipt.sender.replace(/^0/, '')}?text=${encodeURIComponent(
                          `*إيصال شحن فودافون كاش رسمي - Jo1*\n\n✅ تم الشحن بنجاح:\n• المبلغ: $${depositReceipt.fiatUsd.toFixed(2)} USD\n• المعادل: ${depositReceipt.fiatEgp.toLocaleString()} جنيه مصري\n• رصيد العملات المضاف: +${depositReceipt.coins.toLocaleString()} عملة\n• رقم المعاملة: ${depositReceipt.ref}\n• الوقت: ${depositReceipt.timestamp}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>إرسال إشعار واتساب للرقم</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : selectedDepositPkg ? (
                /* Confirmation Screen for Selected Package */
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-rose-500" />
                      <span>تأكيد الإيداع عبر فودافون كاش مصر</span>
                    </span>
                    <button
                      onClick={() => setSelectedDepositPkg(null)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      تغيير الباقة
                    </button>
                  </div>

                  {/* Summary card */}
                  <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">الباقة المختارة:</span>
                      <span className="font-bold text-white">{selectedDepositPkg.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">المبلغ المطلوب بالدولار:</span>
                      <span className="font-bold text-emerald-400 font-mono">${selectedDepositPkg.priceUsd} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">المعادل بفودافون كاش (رسمي):</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {Math.round(selectedDepositPkg.priceUsd * USD_TO_EGP_RATE)} جنيه مصري
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-800 pt-2">
                      <span className="text-neutral-400">محفظة المنصة المعتمدة:</span>
                      <span className="font-bold font-mono text-white">{OFFICIAL_VODAFONE_MERCHANT_WALLET}</span>
                    </div>
                  </div>

                  {/* Quick USSD Dial Code */}
                  <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>كود فودافون كاش السريع للتحويل المباشر:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            generateVodafoneCashUSSD(selectedDepositPkg.priceUsd * USD_TO_EGP_RATE),
                            'كود التحويل'
                          )
                        }
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedText === 'كود التحويل' ? 'تم النسخ!' : 'نسخ الكود'}</span>
                      </button>
                    </div>
                    <div className="bg-black/40 px-3 py-2 rounded-lg font-mono text-xs text-amber-300 font-bold text-left">
                      {generateVodafoneCashUSSD(selectedDepositPkg.priceUsd * USD_TO_EGP_RATE)}
                    </div>
                    <a
                      href={`tel:${encodeURIComponent(generateVodafoneCashUSSD(selectedDepositPkg.priceUsd * USD_TO_EGP_RATE))}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                    >
                      <Smartphone className="w-4 h-4 text-black" />
                      <span>اتصال مباشر بالكود من هاتفك لتشغيل الخدمة واستلام رسالة فودافون 📱</span>
                    </a>
                  </div>

                  {/* Sender phone input with operator badge */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-neutral-300">
                        رقم محفظتك التي ستقوم بالتحويل منها:
                      </label>
                      {senderValidation.isValid && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{senderValidation.carrier} Cash</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={11}
                      value={senderPhone}
                      onChange={e => {
                        setDepositError(null);
                        setSenderPhone(e.target.value);
                      }}
                      placeholder="010XXXXXXXX"
                      className="w-full bg-neutral-900 text-white font-mono text-xs rounded-xl px-4 py-3 border border-neutral-700 outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    {!senderValidation.isValid && senderPhone.length > 0 && (
                      <span className="text-[10px] text-rose-400 mt-1 block">
                        {senderValidation.errorMessage}
                      </span>
                    )}
                  </div>

                  {/* Processing Step Indicator */}
                  {isProcessingDeposit && (
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span>
                          {depositStep === 1
                            ? '1/3 التحقق من محفظة فودافون كاش وشبكة الاتصال...'
                            : depositStep === 2
                            ? '2/3 تحديث رصيد العملات في قاعدة البيانات لحظياً...'
                            : '3/3 إصدار الإيصال وتأكيد المعاملة...'}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleConfirmDeposit}
                    disabled={isProcessingDeposit || !senderValidation.isValid}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-black text-xs shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingDeposit ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري إتمام المعاملة وتحديث الرصيد...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد الإيداع وإضافة {selectedDepositPkg.coins.toLocaleString()} عملة فورياً</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Select Package List + Custom Input */
                <div className="space-y-3">
                  <p className="text-xs text-neutral-400 font-semibold">
                    اختر باقة شحن العملات (1,000 عملة = $5 دولار فقط = {Math.round(5 * USD_TO_EGP_RATE)} ج.م دون أي عمولات):
                  </p>

                  <div className="space-y-2">
                    {rechargePackages.map((pkg, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedDepositPkg(pkg)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
                          pkg.vip
                            ? 'bg-amber-950/40 border-amber-500/80 shadow-lg'
                            : pkg.popular
                            ? 'bg-rose-950/30 border-rose-500/80'
                            : 'bg-neutral-850 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Coins className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm font-black text-white tabular-nums block">
                              {pkg.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              {Math.round(pkg.priceUsd * USD_TO_EGP_RATE).toLocaleString()} جنيه مصري
                            </span>
                          </div>
                        </div>

                        <button className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md">
                          ${pkg.priceUsd} USD
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Custom Coin Recharge */}
                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                    <span className="text-xs font-bold text-neutral-300 block">أو أدخل عدد عملات مخصص:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="200"
                        step="200"
                        value={customCoins}
                        onChange={e => setCustomCoins(e.target.value)}
                        className="flex-1 bg-neutral-900 text-white text-xs font-mono font-bold rounded-xl px-3 py-2.5 border border-neutral-700 outline-none"
                      />
                      <span className="text-xs text-amber-400 font-bold whitespace-nowrap font-mono">
                        = ${(Number(customCoins || 0) * 0.005).toFixed(2)} USD (~{Math.round(Number(customCoins || 0) * 0.005 * USD_TO_EGP_RATE)} ج.م)
                      </span>
                      <button
                        onClick={() => {
                          const c = Number(customCoins);
                          if (c >= 200) {
                            setSelectedDepositPkg({
                              coins: c,
                              priceUsd: Number((c * 0.005).toFixed(2)),
                              label: `باقة مخصصة (${c.toLocaleString()} عملة)`,
                            });
                          } else {
                            alert('الحد الأدنى للشحن هو 200 عملة ($1.00)');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-md"
                      >
                        متابعة
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Withdraw to Vodafone Cash */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              {/* Error Banner */}
              {withdrawError && (
                <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500 text-red-200 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="block">{withdrawError}</span>
                    <button
                      type="button"
                      onClick={() => setWithdrawError(null)}
                      className="text-[10px] text-red-300 underline mt-1"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              )}

              {withdrawReceipt ? (
                /* Withdrawal Receipt Screen */
                <div className="p-5 rounded-2xl bg-neutral-950 border-2 border-rose-500/80 text-center space-y-3.5 animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">تم تحويل الأرباح بنجاح وفورياً!</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      تم تحويل مبلغ <strong className="text-emerald-400 font-mono">${withdrawReceipt.fiatUsd.toFixed(2)} USD</strong> (~{withdrawReceipt.fiatEgp.toLocaleString()} ج.م) لحسابك.
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs font-mono space-y-2 text-right">
                    <div className="flex justify-between text-neutral-400">
                      <span>كود العملية المرجعي:</span>
                      <span className="text-rose-400 font-bold">{withdrawReceipt.ref}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>العملات المقتطعة:</span>
                      <span className="text-neutral-200">-{withdrawReceipt.coins.toLocaleString()} عملة</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>محفظة الاستلام:</span>
                      <span className="text-neutral-200">{withdrawReceipt.account}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>وقت التحويل:</span>
                      <span className="text-neutral-200">{withdrawReceipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-800 pt-2 text-neutral-300">
                      <span>الرصيد المتبقي المحدث:</span>
                      <span className="text-emerald-400 font-bold">${wallet.fiatBalance.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(withdrawReceipt.ref, 'كود السحب')}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{copiedText === 'كود السحب' ? 'تم النسخ!' : 'نسخ كود العملية'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setWithdrawReceipt(null);
                        setActiveTab('history');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
                    >
                      عرض في السجل
                    </button>
                  </div>

                  {/* Direct Mobile SMS & WhatsApp Notification Links for withdrawal */}
                  <div className="pt-3 border-t border-neutral-800 space-y-2 text-right">
                    <span className="text-[11px] font-bold text-neutral-400 block">
                      📲 إرسال إشعار السحب المباشر لهاتفك:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={`sms:${OFFICIAL_VODAFONE_MERCHANT_WALLET}?&body=${encodeURIComponent(
                          `منصة Jo1 - تم سحب أرباح بقيمة $${withdrawReceipt.fiatUsd.toFixed(2)} (${withdrawReceipt.fiatEgp.toLocaleString()} ج.م) لمحفظتك. كود العملية المعتمد: ${withdrawReceipt.ref} - ${withdrawReceipt.timestamp}`
                        )}`}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>إرسال إشعار SMS لرقمي</span>
                      </a>

                      <a
                        href={`https://wa.me/201090718514?text=${encodeURIComponent(
                          `*إيصال سحب أرباح فودافون كاش - Jo1*\n\n✅ تم السحب بنجاح:\n• المبلغ: $${withdrawReceipt.fiatUsd.toFixed(2)} USD\n• المعادل: ${withdrawReceipt.fiatEgp.toLocaleString()} جنيه مصري\n• العملات المقتطعة: -${withdrawReceipt.coins.toLocaleString()} عملة\n• كود العملية: ${withdrawReceipt.ref}\n• الوقت: ${withdrawReceipt.timestamp}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>إرسال إشعار واتساب للرقم</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmWithdraw} className="space-y-4">
                  {/* Method Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('vodafone_cash')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        withdrawMethod === 'vodafone_cash'
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md'
                          : 'bg-neutral-850 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Phone className="w-4 h-4 text-rose-500" />
                      <span>فودافون كاش مصر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('bank_iban')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        withdrawMethod === 'bank_iban'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
                          : 'bg-neutral-850 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>تحويل بنكي IBAN</span>
                    </button>
                  </div>

                  {/* Quick percentage buttons */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between mb-1.5">
                      <span>حدد نسبة السحب السريعة:</span>
                      <span className="text-neutral-400 text-[10px]">
                        الرصيد المتاح: ${(wallet.fiatBalance).toFixed(2)} USD (~{Math.round(wallet.fiatBalance * USD_TO_EGP_RATE).toLocaleString()} ج.م)
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0.25, 0.5, 0.75, 1.0].map((pct, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setWithdrawPercentage(pct)}
                          className="py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-all active:scale-95"
                        >
                          {pct === 1.0 ? 'سحب الكل 100%' : `${pct * 100}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      المبلغ المطلوب سحبه ($ USD):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        max={wallet.fiatBalance}
                        value={withdrawAmount}
                        onChange={e => {
                          setWithdrawError(null);
                          setWithdrawAmount(e.target.value);
                        }}
                        className="w-full bg-neutral-800 text-white text-sm font-mono font-bold rounded-xl px-4 py-3 border border-neutral-700 outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-mono font-bold">
                        = {Math.round(Number(withdrawAmount || 0) * USD_TO_EGP_RATE).toLocaleString()} ج.م ({Math.round(Number(withdrawAmount || 0) / 0.005).toLocaleString()} عملة)
                      </span>
                    </div>
                  </div>

                  {/* Target account */}
                  {withdrawMethod === 'vodafone_cash' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-neutral-300">
                          رقم محفظة فودافون كاش المستلمة:
                        </label>
                        {withdrawValidation.isValid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{withdrawValidation.carrier} Cash</span>
                          </span>
                        )}
                      </div>
                      <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center justify-between text-xs font-mono text-white">
                        <input
                          type="text"
                          maxLength={11}
                          value={withdrawPhone}
                          onChange={e => {
                            setWithdrawError(null);
                            setWithdrawPhone(e.target.value);
                          }}
                          className="bg-transparent font-bold text-rose-400 outline-none font-mono flex-1 text-xs"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowFullPhone(!showFullPhone)}
                            className="text-neutral-400 hover:text-white p-1"
                            title="إظهار / إخفاء"
                          >
                            {showFullPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-[10px] text-emerald-400 font-bold">✓ محفظة موثقة</span>
                        </div>
                      </div>
                      {!withdrawValidation.isValid && withdrawPhone.length > 0 && (
                        <span className="text-[10px] text-rose-400 mt-1 block">
                          {withdrawValidation.errorMessage}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        رقم الحساب البنكي الدولي (IBAN):
                      </label>
                      <input
                        type="text"
                        defaultValue={wallet.linkedIban}
                        className="w-full bg-neutral-800 text-white font-mono text-xs rounded-xl px-4 py-2.5 border border-neutral-700 outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  )}

                  {/* Step status */}
                  {isProcessingWithdraw && (
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        <span>
                          {withdrawStep === 1
                            ? '1/3 التحقق من رصيد المحفظة وشبكة فودافون كاش...'
                            : withdrawStep === 2
                            ? '2/3 خصم الرصيد وتحديث قاعدة البيانات لحظياً...'
                            : '3/3 إتمام التحويل وتوليد الإيصال المعتمد...'}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessingWithdraw || wallet.fiatBalance <= 0 || !withdrawValidation.isValid}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-black text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingWithdraw ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري إرسال التحويل إلى فودافون كاش...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 text-white" />
                        <span>تأكيد سحب الأرباح الفوري لمحفظة فودافون كاش</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: Comprehensive Profit & Monetization Study */}
          {activeTab === 'study' && (
            <div className="space-y-3 p-1">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-neutral-900 to-black border border-cyan-500/40 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-black">
                  <TrendingUp className="w-4 h-4" />
                  <span>دراسة الأرباح الهادئة والعادلة (دون أي إزعاج للمبدعين أو لك)</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  تم وضع نموذج توزيع أرباح يعتمد على تقديم أفضل نسبة في العالم لصناع المحتوى (70%)، مما يجذب آلاف المبدعين من تيك توك، مع تحقيق 30% صافي أرباح تشغيلية للمنصة تصب في محفظتك تلقائياً.
                </p>
              </div>

              {/* Profit Pillars */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-neutral-850 border border-neutral-800">
                  <div className="flex items-center justify-between text-cyan-300 font-black mb-1">
                    <span>نسبة المذيع / المبدع</span>
                    <span>70%</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    أعلى بنسبة 40% من تيك توك! يحصل صانع المحتوى على $3.50 من كل 1,000 عملة تصله في البث.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-850 border border-neutral-800">
                  <div className="flex items-center justify-between text-rose-400 font-black mb-1">
                    <span>أرباح المنصة الصافية</span>
                    <span>30%</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    عائد مباشر لك قدره $1.50 لكل 1,000 عملة يتم تداولها عبر فودافون كاش دون أي اقتطاعات إضافية.
                  </p>
                </div>
              </div>

              {/* Financial Simulation Table */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px]">
                <h5 className="font-bold text-white mb-2">محاكاة الدخل التقديري للهدايا الشهيرة:</h5>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between text-neutral-300">
                    <span>🌌 يونيفيرس (20,000 عملة = $100):</span>
                    <span className="text-emerald-400">أنت: $30 (~1,515 ج.م) | المبدع: $70</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>🦁 الأسد (18,000 عملة = $90):</span>
                    <span className="text-emerald-400">أنت: $27 (~1,363 ج.م) | المبدع: $63</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>✈️ طائرة خاصة (10,000 عملة = $50):</span>
                    <span className="text-emerald-400">أنت: $15 (~757 ج.م) | المبدع: $35</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: History */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 mb-2 flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                <span>سجل الحركات الموثقة مع فودافون كاش</span>
              </h4>
              {wallet.transactions.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  لا توجد حركات مالية مسجلة بعد.
                </div>
              ) : (
                wallet.transactions.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-neutral-850 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{t.note}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-neutral-500">{t.timestamp}</span>
                        {t.referenceNumber && (
                          <span className="text-[10px] text-neutral-400 font-mono">#{t.referenceNumber}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <span
                        className={`font-black font-mono block ${
                          t.type === 'deposit' || t.type === 'gift_received'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'deposit' || t.type === 'gift_received' ? '+' : '-'}
                        {t.amountCoins.toLocaleString()} عملة
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold">
                        {t.status === 'completed' ? '✓ تم التحويل لفودافون كاش' : 'قيد المعالجة'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
