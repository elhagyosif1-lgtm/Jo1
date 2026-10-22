import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoCategory } from '../types';
import { Sparkles, Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { userInterests, setUserInterests } = useApp();
  const [selected, setSelected] = useState<VideoCategory[]>(
    userInterests.length > 0 ? userInterests : ['tech', 'comedy', 'education']
  );

  if (!isOpen) return null;

  const interestOptions: { id: VideoCategory; title: string; desc: string; emoji: string }[] = [
    { id: 'tech', title: 'تكنولوجيا وذكاء اصطناعي', desc: 'أحدث الابتكارات، البرمجة، والتقنيات المستقبلية', emoji: '💻' },
    { id: 'comedy', title: 'ضحك وكوميديا', desc: 'سكتشات، مقالب خفيفة، ومواقف طريفة يومية', emoji: '😂' },
    { id: 'education', title: 'تعليم ومعرفة', desc: 'حقائق علمية، نصائح تطوير الذات، ومعلومات مفيدة', emoji: '🧠' },
    { id: 'animals', title: 'حيوانات وطبيعة', desc: 'عالم الحياة البرية، طيور نادرة، ومناظر خلابة', emoji: '🐾' },
    { id: 'sports', title: 'رياضة ومغامرات', desc: 'ركوب الأمواج، مهارات كرة القدم، واللياقة البدنية', emoji: '🏄‍♂️' },
    { id: 'art', title: 'فن وإبداع وسينما', desc: 'تصوير احترافي، تصميم، وموسيقى ملهمة', emoji: '🎨' },
    { id: 'news', title: 'أخبار وتريندات عالمية', desc: 'موجز سريع لأهم أحداث وتطورات العالم', emoji: '📰' },
    { id: 'drama', title: 'دراما وقصص ملهمة', desc: 'حكايات واقعية، روايات قصيرة، ودروس في الحياة', emoji: '🎭' },
  ];

  const toggleInterest = (id: VideoCategory) => {
    if (selected.includes(id)) {
      if (selected.length > 1) {
        setSelected(selected.filter(item => item !== id));
      }
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = () => {
    setUserInterests(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 mx-auto mb-3 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1">
            ما هي المحتويات التي تفضل مشاهدتها؟
          </h3>
          <p className="text-xs text-neutral-400">
            ستقوم خوارزمية Jo1 الذكية بتخصيص خلاصة الفيديوهات (لك) وفقاً لاختياراتك
          </p>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
          {interestOptions.map(item => {
            const isChecked = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`flex items-start gap-3 p-3 rounded-2xl border text-right transition-all active:scale-98 ${
                  isChecked
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                    : 'bg-neutral-850/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    {isChecked && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-400 font-bold">
            تم تحديد {selected.length} اهتمامات
          </span>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>بدء المشاهدة المخصصة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
