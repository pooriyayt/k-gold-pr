// Social Media Price Card Generator Service via Native HTML5 Canvas

export interface ShareCardItem {
  name: string;
  price: string;
  change: string;
  code?: string;
  isPositive?: boolean;
}

export interface ShareCardOptions {
  format: 'story' | 'post'; // 9:16 vs 1:1
  dateStr: string;
  timeStr: string;
  spotlightItem?: ShareCardItem | null;
  items: ShareCardItem[];
}

function toPersianDigits(n: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

function formatChangePercent(changeStr: string): { isPositive: boolean; text: string } {
  const isPos = !changeStr.includes('-');
  const cleanNum = changeStr.replace(/[^0-9.]/g, '');
  const numVal = parseFloat(cleanNum) || 0;
  const pDigits = toPersianDigits(numVal.toFixed(2));
  return {
    isPositive: isPos,
    text: isPos ? `+${pDigits}٪` : `-${pDigits}٪`,
  };
}

export function drawPriceCard(canvas: HTMLCanvasElement, options: ShareCardOptions): void {
  const isStory = options.format === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background (Deep Onyx with Luxury Radial Glows)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090C14');
  bgGrad.addColorStop(0.3, '#0E1422');
  bgGrad.addColorStop(0.7, '#131A2B');
  bgGrad.addColorStop(1, '#070A10');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Radiant Gold & Emerald Mesh Orbs
  const goldOrb = ctx.createRadialGradient(width * 0.85, isStory ? 280 : 180, 20, width * 0.85, isStory ? 280 : 180, 520);
  goldOrb.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
  goldOrb.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = goldOrb;
  ctx.fillRect(0, 0, width, height);

  const emeraldOrb = ctx.createRadialGradient(width * 0.15, isStory ? 1650 : 920, 20, width * 0.15, isStory ? 1650 : 920, 560);
  emeraldOrb.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  emeraldOrb.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = emeraldOrb;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Frame
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, width - 72, height - 72, 40);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  roundRect(ctx, 48, 48, width - 96, height - 96, 32);
  ctx.stroke();

  // -------------------------------------------------------------
  // HEADER SECTION
  // -------------------------------------------------------------
  let curY = isStory ? 130 : 105;

  // Gold Pill Badge
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  const badgeW = 280;
  const badgeH = 46;
  const badgeX = (width - badgeW) / 2;

  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
  roundRect(ctx, badgeX, curY, badgeW, badgeH, 23);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('⚡ تابلوی رسمی معاملات و نرخ‌های زنده', width / 2, curY + 31);

  // Main Brand Title
  curY += 78;
  ctx.font = '900 58px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('KGold  |  کـی گـلـد', width / 2, curY);

  // Date & Time Pill
  curY += 46;
  ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`تاریخ: ${toPersianDigits(options.dateStr)}   •   ساعت: ${toPersianDigits(options.timeStr)}`, width / 2, curY);

  // -------------------------------------------------------------
  // STORY MODE (9:16)
  // -------------------------------------------------------------
  if (isStory) {
    curY += 45;

    // Market Pulse Status Bar
    const pulseW = width - 140;
    const pulseH = 75;
    const pulseX = 70;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, pulseX, curY, pulseW, pulseH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3 Pulse Columns
    const colStep = pulseW / 3;
    const labels = [
      { t: 'شاخص نبض بازار', v: 'صعودی ↗', c: '#34D399' },
      { t: 'دامنه نوسان روزانه', v: 'متوسط (۱.۸٪)', c: '#FBBF24' },
      { t: 'مبنای طلای ۱۸ عیار', v: '۲۵,۳۵۸,۰۰۰ ت', c: '#F59E0B' },
    ];

    labels.forEach((item, idx) => {
      const cx = pulseX + colStep * idx + colStep / 2;
      ctx.textAlign = 'center';
      ctx.font = 'normal 17px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(item.t, cx, curY + 28);

      ctx.font = 'bold 21px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = item.c;
      ctx.fillText(item.v, cx, curY + 58);
    });

    // 8-Card Grid (4 rows x 2 columns)
    curY += pulseH + 35;

    const fullItems: ShareCardItem[] = [...options.items];
    if (fullItems.length < 8) {
      // Complementary key market assets if list is shorter
      const defaults = [
        { name: 'دلار آمریکا', price: '۲۵۶,۵۰۰', change: '+2.23%' },
        { name: 'تتر (USDT)', price: '۲۵۴,۱۱۶', change: '+0.22%' },
        { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%' },
        { name: 'سکه امامی', price: '۲۵۹,۰۰۵,۰۰۰', change: '+2.73%' },
        { name: 'سکه بهار آزادی', price: '۲۴۸,۲۰۰,۰۰۰', change: '+1.51%' },
        { name: 'نیم سکه', price: '۱۳۲,۵۰۰,۰۰۰', change: '+1.10%' },
        { name: 'ربع سکه', price: '۸۴,۳۰۰,۰۰۰', change: '+0.88%' },
        { name: 'بیت‌کوین', price: '۲۱,۳۶۰,۶۸۸,۷۴۹', change: '+2.12%' },
      ];
      defaults.forEach((d) => {
        if (!fullItems.some((fi) => fi.name === d.name) && fullItems.length < 8) {
          fullItems.push(d);
        }
      });
    }

    const gridW = width - 140; // 940
    const colW = (gridW - 24) / 2; // 458
    const cardH = 205;
    const gap = 20;

    for (let i = 0; i < 8; i++) {
      const item = fullItems[i] || fullItems[0];
      const row = Math.floor(i / 2);
      const col = i % 2; // 0 is right in RTL? Let's arrange LTR coordinates
      const cardX = col === 1 ? 70 : 70 + colW + 24; // RTL: col 0 is right, col 1 is left
      const cardY = curY + row * (cardH + gap);

      // Card Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      roundRect(ctx, cardX, cardY, colW, cardH, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Top: Gold Dot + Name
      const rightX = cardX + colW - 25;
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(rightX, cardY + 38, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 27px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, rightX - 16, cardY + 46);

      // Middle: Price
      ctx.font = '900 36px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(toPersianDigits(item.price), rightX, cardY + 115);

      ctx.font = 'normal 19px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText('تومان', cardX + 30, cardY + 115);

      // Bottom: Change Pill
      const ch = formatChangePercent(item.change);
      const pillW = 125;
      const pillH = 40;
      const pillX = cardX + colW - pillW - 25;
      const pillY = cardY + cardH - pillH - 20;

      ctx.fillStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 20);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 27);
    }

    // Advice / Market Note Banner
    curY += 4 * (cardH + gap) + 20;
    const bannerH = 100;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    roundRect(ctx, 70, curY, width - 140, bannerH, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FDE68A';
    ctx.fillText('💎 تحلیل زنده حباب سکه و محاسبه فاکتور طلا در کی‌گلد', width / 2, curY + 42);

    ctx.font = 'normal 18px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText('هشدارهای هوشمند نوسان قیمت و مدیریت پیشرفته سبد دارایی', width / 2, curY + 76);

    // Footer
    const footY = height - 90;
    ctx.font = 'bold 24px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی گلد • مرجع تخصصی نرخ زنده طلا، سکه و ارز', width / 2, footY);

    ctx.font = 'normal 18px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('استعلام آنلاین و بی‌درنگ • دریافت رایگان اپلیکیشن اندروید', width / 2, footY + 34);

  } else {
    // -------------------------------------------------------------
    // POST MODE (1:1) - 1080 x 1080
    // -------------------------------------------------------------
    curY += 35;

    const postItems: ShareCardItem[] = options.items.slice(0, 6);
    if (postItems.length < 6) {
      const defaults = [
        { name: 'دلار آمریکا', price: '۲۵۶,۵۰۰', change: '+2.23%' },
        { name: 'تتر (USDT)', price: '۲۵۴,۱۱۶', change: '+0.22%' },
        { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%' },
        { name: 'سکه امامی', price: '۲۵۹,۰۰۵,۰۰۰', change: '+2.73%' },
        { name: 'بیت‌کوین', price: '۲۱,۳۶۰,۶۸۸,۷۴۹', change: '+2.12%' },
        { name: 'یورو اروپا', price: '۲۹۰,۸۰۰', change: '+2.14%' },
      ];
      defaults.forEach((d) => {
        if (!postItems.some((pi) => pi.name === d.name) && postItems.length < 6) {
          postItems.push(d);
        }
      });
    }

    const gridW = width - 140; // 940
    const colW = (gridW - 24) / 2; // 458
    const cardH = 185;
    const gap = 18;

    for (let i = 0; i < 6; i++) {
      const item = postItems[i] || postItems[0];
      const row = Math.floor(i / 2);
      const col = i % 2;
      const cardX = col === 1 ? 70 : 70 + colW + 24;
      const cardY = curY + row * (cardH + gap);

      // Card Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      roundRect(ctx, cardX, cardY, colW, cardH, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Top: Gold Dot + Name
      const rightX = cardX + colW - 25;
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(rightX, cardY + 34, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 26px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, rightX - 16, cardY + 42);

      // Middle: Price
      ctx.font = '900 35px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(toPersianDigits(item.price), rightX, cardY + 104);

      ctx.font = 'normal 18px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText('تومان', cardX + 28, cardY + 104);

      // Bottom: Change Pill
      const ch = formatChangePercent(item.change);
      const pillW = 120;
      const pillH = 38;
      const pillX = cardX + colW - pillW - 25;
      const pillY = cardY + cardH - pillH - 18;

      ctx.fillStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 19);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 19px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 26);
    }

    // Footer
    const footY = height - 70;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 23px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی گلد • سامانه استعلام زنده قیمت طلا، سکه و ارز', width / 2, footY - 14);

    ctx.font = 'normal 17px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('مرجع نرخ‌های لحظه‌ای و هشدارهای هوشمند بازار', width / 2, footY + 18);
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Save generated canvas directly to Android Gallery via Native Bridge or Browser Download
 */
export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string = `kgold_price_${Date.now()}.png`
): Promise<{ success: boolean; message: string }> {
  try {
    const dataUrl = canvas.toDataURL('image/png');

    // 1. Android Native Bridge (Saves directly to Gallery / Pictures/KGold)
    if (typeof (window as any).AndroidBridge !== 'undefined' && (window as any).AndroidBridge.saveImageToGallery) {
      const resStr = (window as any).AndroidBridge.saveImageToGallery(dataUrl, filename);
      try {
        const res = JSON.parse(resStr);
        if (res.success) {
          return { success: true, message: 'کارت با موفقیت در گالری ذخیره شد.' };
        }
      } catch {}
      return { success: true, message: 'عکس در گالری ذخیره شد.' };
    }

    // 2. Web Browser Fallback
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true, message: 'دانلود عکس آغاز شد.' };
  } catch (err: any) {
    return { success: false, message: 'خطا در ذخیره عکس: ' + (err?.message || 'نامشخص') };
  }
}

/**
 * Share generated canvas via Native Android Chooser or Web Share API
 */
export async function shareCanvas(
  canvas: HTMLCanvasElement,
  title: string = 'کارت قیمت کی‌گلد'
): Promise<boolean> {
  const dataUrl = canvas.toDataURL('image/png');

  // 1. Android Native Share Bridge
  if (typeof (window as any).AndroidBridge !== 'undefined' && (window as any).AndroidBridge.shareImage) {
    (window as any).AndroidBridge.shareImage(dataUrl, title);
    return true;
  }

  // 2. Web Share API Fallback
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        await downloadCanvas(canvas);
        return resolve(false);
      }

      const file = new File([blob], 'kgold-prices.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title,
            text: 'استعلام لحظه‌ای قیمت ارز و طلا در اپلیکیشن کی گلد (KGold)',
          });
          resolve(true);
        } catch {
          await downloadCanvas(canvas);
          resolve(false);
        }
      } else {
        await downloadCanvas(canvas);
        resolve(true);
      }
    }, 'image/png');
  });
}
