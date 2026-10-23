import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, CheckCircle2, AlertCircle, X, DollarSign, UploadCloud, FileText } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, wallet, submitVerificationRequest } = useApp();

  const [channelUrl, setChannelUrl] = useState(`https://mrjo1.vercel.app/@${currentUser.username}`);
  const [nationalId, setNationalId] = useState('29901011234567');
  const [category, setCategory] = useState('Entertainment & Tech Media');
  const [fullName, setFullName] = useState(currentUser.displayName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!channelUrl.trim() || !nationalId.trim() || !fullName.trim()) {
      setErrorMsg('يرجى استيفاء كافة البيانات الرسمية المطلوبة للتحقق المؤسسي.');
      return;
    }

    setIsSubmitting(true);

    try {
      submitVerificationRequest({
        creatorId: currentUser.id,
        creatorName: fullName,
        creatorUsername: currentUser.username,
        creatorAvatar: currentUser.avatarUrl,
        feeEgp: 200,
        feeCoins: 4000,
        channelUrl: channelUrl.trim(),
        category,
        nationalIdMasked: nationalId.slice(0, 3) + '********' + nationalId.slice(-3),
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'فشلت معالجة الطلب، يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-cyan-500/40 p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">طلب التوثيق المؤسسي المعتمد</h3>
            <p className="text-xs text-neutral-400">
              Enterprise Broadcaster Verification Program
            </p>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto mb-4 flex items-center justify-center text-emerald-400 animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">تم تقديم طلب التوثيق بنجاح!</h4>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto mb-5">
              تم تسجيل الرسوم الرسمية (200 ج.م) وإرسال ملفك إلى لوحة التحكم الإدارية (Backstage)
              لمالك المنصة. سيتم مراجعة القناة واعتماد الشارة الرسمية لك فوراً.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all"
            >
              تم، العودة إلى الحساب
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Verification Fee Notice */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border border-amber-400/30 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-amber-300 block">رسوم التوثيق والتدقيق القانوني</span>
                <span className="text-[11px] text-neutral-400">
                  تدفع مرة واحدة لتوثيق الحساب ومنح الشارة السيادية مدى الحياة
                </span>
              </div>
              <div className="text-left shrink-0 font-mono">
                <span className="text-base font-black text-amber-400">200 ج.م</span>
                <span className="text-[10px] text-neutral-500 block">($4.00 USD)</span>
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">الاسم القانوني الكامل (المطابق للهوية):</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-cyan-400"
                placeholder="أدخل اسمك الثلاثي"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">الرقم القومي / جواز السفر المعتمد:</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-cyan-400 font-mono"
                placeholder="14 رقم"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">رابط قناة البث أو حساب المذيع:</label>
              <input
                type="url"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-cyan-400"
                placeholder="https://mrjo1.vercel.app/@yourname"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">تصنيف المحتوى والتخصص:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Entertainment & Tech Media">الترفيه والتقنية (Tech & Media)</option>
                <option value="Gaming & Esports">الألعاب الإلكترونية (Gaming Arena)</option>
                <option value="Education & Science">التعليم والمعرفة (Education)</option>
                <option value="Art & Cinema">الفنون والسينما (Art & Cinema)</option>
                <option value="Business & Commerce">الأعمال والاستثمار (Business)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-950/60 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال طلب التوثيق وسداد 200 ج.م'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
