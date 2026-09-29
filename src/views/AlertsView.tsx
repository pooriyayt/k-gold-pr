import React from 'react';
import { Bell, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'جهش قیمت طلا',
      desc: 'طلای ۱۸ عیار از مرز ۳۳,۸۰۰,۰۰۰ تومان عبور کرد.',
      time: '۱۰ دقیقه پیش',
      type: 'up',
    },
    {
      id: 2,
      title: 'بیت‌کوین در کانال جدید',
      desc: 'بیت‌کوین سقف تاریخی جدیدی در محدوده ۸۵,۹۰۰ دلار ثبت کرد.',
      time: '۱ ساعت پیش',
      type: 'up',
    },
    {
      id: 3,
      title: 'بازگشایی بازار ارز و طلا',
      desc: 'نرخ‌های روزانه صرافی ملی و اتحادیه طلا بروزرسانی شدند.',
      time: '۳ ساعت پیش',
      type: 'info',
    },
    {
      id: 4,
      title: 'قیمت‌گذاری جدید خودروها',
      desc: 'لیست قیمت جدید خودروهای ایران‌خودرو و سایپا منتشر شد.',
      time: 'دیروز',
      type: 'info',
    },
  ];

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      <div className="flex items-center justify-end gap-2">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">اعلان‌ها و هشدارها</h2>
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
          <Bell className="w-4 h-4" />
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
        آخرین اخبار، نوسانات مهم و هشدارهای تغییر قیمت
      </p>

      <div className="space-y-2.5">
        {notifications.map((n) => (
          <div key={n.id} className="chatgpt-card p-3.5 flex items-start gap-3">
            <div className="flex-1 text-right">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{n.time}</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{n.desc}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 shrink-0">
              {n.type === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
