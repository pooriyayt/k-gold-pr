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

function getAssetIcon(name: string): string {
  if (name.includes('دلار')) return '🇺🇸';
  if (name.includes('یورو')) return '🇪🇺';
  if (name.includes('درهم')) return '🇦🇪';
  if (name.includes('پوند')) return '🇬🇧';
  if (name.includes('تتر')) return '₮';
  if (name.includes('بیت')) return '₿';
  if (name.includes('سکه')) return '🪙';
  if (name.includes('طلا')) return '👑';
  return '⚡';
}

function getAssetCode(name: string, explicitCode?: string): string {
  if (explicitCode) return explicitCode;
  if (name.includes('دلار')) return 'USD';
  if (name.includes('تتر')) return 'USDT';
  if (name.includes('۱۸')) return '18K';
  if (name.includes('امامی')) return 'EMAMI';
  if (name.includes('بهار')) return 'BAHAR';
  if (name.includes('نیم')) return 'HALF';
  if (name.includes('ربع')) return 'QUARTER';
  if (name.includes('گرمی')) return 'GERAMI';
  if (name.includes('یورو')) return 'EUR';
  if (name.includes('درهم')) return 'AED';
  if (name.includes('پوند')) return 'GBP';
  if (name.includes('بیت')) return 'BTC';
  return '';
}

export function drawPriceCard(canvas: HTMLCanvasElement, options: ShareCardOptions): void {
  const isStory = options.format === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background (Deep Luxury Onyx Gradient)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#070A12');
  bgGrad.addColorStop(0.35, '#0B111F');
  bgGrad.addColorStop(0.7, '#0F172B');
  bgGrad.addColorStop(1, '#06080E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Radiant Gold & Emerald Mesh Orbs
  const goldOrb = ctx.createRadialGradient(width * 0.85, isStory ? 260 : 160, 20, width * 0.85, isStory ? 260 : 160, 500);
  goldOrb.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  goldOrb.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = goldOrb;
  ctx.fillRect(0, 0, width, height);

  const emeraldOrb = ctx.createRadialGradient(width * 0.15, isStory ? 1680 : 940, 20, width * 0.15, isStory ? 1680 : 940, 520);
  emeraldOrb.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
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
  let curY = isStory ? 120 : 90;

  // Gold Pill Badge
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  const badgeW = 320;
  const badgeH = 46;
  const badgeX = (width - badgeW) / 2;

  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  roundRect(ctx, badgeX, curY, badgeW, badgeH, 23);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 21px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('⚡ تابلوی رسمی معاملات و نرخ‌های زنده', width / 2, curY + 31);

  // Main Brand Title
  curY += 76;
  ctx.font = '900 56px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('KGold  |  کـی گـلـد', width / 2, curY);

  // Date & Time Pill
  curY += 44;
  ctx.font = 'bold 21px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`تاریخ: ${toPersianDigits(options.dateStr)}   •   ساعت: ${toPersianDigits(options.timeStr)}`, width / 2, curY);

  // -------------------------------------------------------------
  // STORY MODE (9:16) - 1080 x 1920
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

    // 8 Full-Width Clean Luxury Rows (Unified, perfectly balanced)
    curY += pulseH + 35;

    const fullItems: ShareCardItem[] = [...options.items];
    const defaultFallbacks = [
      { name: 'دلار آمریکا', price: '۲۵۶,۵۰۰', change: '+2.23%' },
      { name: 'تتر (USDT)', price: '۲۵۴,۱۱۶', change: '+0.22%' },
      { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%' },
      { name: 'سکه امامی', price: '۲۵۹,۰۰۵,۰۰۰', change: '+2.73%' },
      { name: 'سکه بهار آزادی', price: '۲۴۸,۲۰۰,۰۰۰', change: '+1.51%' },
      { name: 'نیم سکه بهار آزادی', price: '۱۳۲,۵۰۰,۰۰۰', change: '+1.10%' },
      { name: 'ربع سکه', price: '۸۴,۳۰۰,۰۰۰', change: '+0.88%' },
      { name: 'بیت‌کوین', price: '۲۱,۳۶۰,۶۸۸,۷۴۹', change: '+2.12%' },
    ];
    defaultFallbacks.forEach((d) => {
      if (!fullItems.some((fi) => fi.name === d.name) && fullItems.length < 8) {
        fullItems.push(d);
      }
    });

    const rowW = width - 140; // 940px
    const rowH = 98;
    const gap = 14;

    for (let i = 0; i < 8; i++) {
      const item = fullItems[i] || defaultFallbacks[i];
      const rowX = 70;
      const rowY = curY + i * (rowH + gap);

      // Row Card Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      roundRect(ctx, rowX, rowY, rowW, rowH, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Right Section: Asset Emoji/Icon + Name + Code
      const icon = getAssetIcon(item.name);
      const code = getAssetCode(item.name, item.code);

      // Icon circle badge on right
      const iconCircleX = rowX + rowW - 48;
      const iconCircleY = rowY + rowH / 2;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.beginPath();
      ctx.arc(iconCircleX, iconCircleY, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = '22px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(icon, iconCircleX, iconCircleY + 8);

      // Name & Ticker
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.font = 'bold 25px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, iconCircleX - 34, iconCircleY - 4);

      if (code) {
        ctx.font = 'normal 17px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(code, iconCircleX - 34, iconCircleY + 22);
      }

      // Left Section: 24h Change Pill Badge
      const ch = formatChangePercent(item.change);
      const pillW = 125;
      const pillH = 42;
      const pillX = rowX + 24;
      const pillY = rowY + (rowH - pillH) / 2;

      ctx.fillStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 21);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 28);

      // Center Section: Price + "تومان" UNIFIED AND INSEPARABLE
      const priceText = toPersianDigits(item.price);
      ctx.textAlign = 'left';
      ctx.direction = 'rtl';

      // We calculate exact positioning between pill and asset info
      const priceStartX = pillX + pillW + 28;

      ctx.font = '900 31px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(priceText, priceStartX, iconCircleY + 9);

      // Draw "تومان" immediately after the price digits
      const priceWidth = ctx.measureText(priceText).width;
      ctx.font = 'normal 18px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText('تومان', priceStartX + priceWidth + 10, iconCircleY + 7);
    }

    // Advice / Market Note Banner
    curY += 8 * (rowH + gap) + 15;
    const bannerH = 92;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    roundRect(ctx, 70, curY, width - 140, bannerH, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 21px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FDE68A';
    ctx.fillText('💎 تحلیل زنده حباب سکه و محاسبه فاکتور طلا در کی‌گلد', width / 2, curY + 38);

    ctx.font = 'normal 17px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText('هشدارهای هوشمند نوسان قیمت و مدیریت پیشرفته سبد دارایی', width / 2, curY + 70);

    // Footer
    const footY = height - 85;
    ctx.font = 'bold 23px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی گلد • مرجع تخصصی نرخ زنده طلا، سکه و ارز', width / 2, footY);

    ctx.font = 'normal 17px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('استعلام آنلاین و بی‌درنگ • دریافت رایگان اپلیکیشن اندروید', width / 2, footY + 32);

  } else {
    // -------------------------------------------------------------
    // POST MODE (1:1) - 1080 x 1080
    // -------------------------------------------------------------
    curY += 30;

    const postItems: ShareCardItem[] = options.items.slice(0, 6);
    const defaultFallbacks = [
      { name: 'دلار آمریکا', price: '۲۵۶,۵۰۰', change: '+2.23%' },
      { name: 'تتر (USDT)', price: '۲۵۴,۱۱۶', change: '+0.22%' },
      { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%' },
      { name: 'سکه امامی', price: '۲۵۹,۰۰۵,۰۰۰', change: '+2.73%' },
      { name: 'بیت‌کوین', price: '۲۱,۳۶۰,۶۸۸,۷۴۹', change: '+2.12%' },
      { name: 'یورو اروپا', price: '۲۹۰,۸۰۰', change: '+2.14%' },
    ];
    defaultFallbacks.forEach((d) => {
      if (!postItems.some((pi) => pi.name === d.name) && postItems.length < 6) {
        postItems.push(d);
      }
    });

    const rowW = width - 140; // 940px
    const rowH = 88;
    const gap = 12;

    for (let i = 0; i < 6; i++) {
      const item = postItems[i] || defaultFallbacks[i];
      const rowX = 70;
      const rowY = curY + i * (rowH + gap);

      // Row Card Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      roundRect(ctx, rowX, rowY, rowW, rowH, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Right Section: Icon + Name + Code
      const icon = getAssetIcon(item.name);
      const code = getAssetCode(item.name, item.code);

      const iconCircleX = rowX + rowW - 44;
      const iconCircleY = rowY + rowH / 2;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.beginPath();
      ctx.arc(iconCircleX, iconCircleY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = '20px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(icon, iconCircleX, iconCircleY + 7);

      // Name & Ticker
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.font = 'bold 23px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, iconCircleX - 32, iconCircleY - 3);

      if (code) {
        ctx.font = 'normal 16px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(code, iconCircleX - 32, iconCircleY + 20);
      }

      // Left Section: 24h Change Pill Badge
      const ch = formatChangePercent(item.change);
      const pillW = 120;
      const pillH = 38;
      const pillX = rowX + 22;
      const pillY = rowY + (rowH - pillH) / 2;

      ctx.fillStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 19);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 19px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 26);

      // Center Section: Unified Price & Unit
      const priceText = toPersianDigits(item.price);
      ctx.textAlign = 'left';
      ctx.direction = 'rtl';

      const priceStartX = pillX + pillW + 26;

      ctx.font = '900 29px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(priceText, priceStartX, iconCircleY + 8);

      const priceWidth = ctx.measureText(priceText).width;
      ctx.font = 'normal 17px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText('تومان', priceStartX + priceWidth + 10, iconCircleY + 6);
    }

    // Footer
    const footY = height - 72;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی گلد • سامانه استعلام زنده قیمت طلا، سکه و ارز', width / 2, footY - 14);

    ctx.font = 'normal 16px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('مرجع نرخ‌های لحظه‌ای و هشدارهای هوشمند بازار', width / 2, footY + 16);
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
          return { success: true, message: 'کارت با موفقیت در گالری ذخیره شد ✓' };
        } else {
          return { success: false, message: 'خطا در ذخیره: ' + (res.error || 'دسترسی تأیید نشد') };
        }
      } catch {
        return { success: true, message: 'درخواست ذخیره در گالری ارسال شد.' };
      }
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
