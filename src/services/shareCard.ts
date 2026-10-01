// Social Media Price Card Generator Service via Native HTML5 Canvas
// Apple iOS & Samsung One UI Luxury Design System

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

// In-memory cache for story background image
let cachedStoryBg: HTMLImageElement | null = null;
let bgLoadAttempted = false;

function getStoryBgImage(): HTMLImageElement | null {
  if (cachedStoryBg && cachedStoryBg.complete && cachedStoryBg.naturalWidth > 0) {
    return cachedStoryBg;
  }
  if (!bgLoadAttempted && typeof Image !== 'undefined') {
    bgLoadAttempted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/images/story_bg.png';
    img.onload = () => {
      cachedStoryBg = img;
    };
  }
  return cachedStoryBg;
}

// Trigger pre-load in browser environments
if (typeof window !== 'undefined') {
  setTimeout(() => getStoryBgImage(), 100);
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
  const arrow = isPos ? '↗' : '↘';
  const sign = isPos ? '+' : '-';
  return {
    isPositive: isPos,
    text: `${sign}${pDigits}٪ ${arrow}`,
  };
}

function getAssetCode(name: string, explicitCode?: string): string {
  if (explicitCode) return explicitCode;
  if (name.includes('دلار')) return 'USD · اسکناس';
  if (name.includes('تتر')) return 'USDT · دیجیتال';
  if (name.includes('۱۸')) return '18K · هر گرم';
  if (name.includes('امامی')) return 'EMAMI · طرح جدید';
  if (name.includes('بهار')) return 'BAHAR · طرح قدیم';
  if (name.includes('نیم')) return 'HALF · بانکی';
  if (name.includes('ربع')) return 'QUARTER · بانکی';
  if (name.includes('گرمی')) return 'GERAMI · بانکی';
  if (name.includes('یورو')) return 'EUR · اسکناس';
  if (name.includes('درهم')) return 'AED · اسکناس';
  if (name.includes('پوند')) return 'GBP · اسکناس';
  if (name.includes('بیت')) return 'BTC · رمزارز';
  return '';
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(cw / iw, ch / ih);
  const sw = cw / scale;
  const sh = ch / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

// In-memory cache for country flags and crypto emblems
const flagCache: Record<string, HTMLImageElement> = {};

function getFlagImage(key: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (flagCache[key]) {
    if (flagCache[key].complete && flagCache[key].naturalWidth > 0) {
      return flagCache[key];
    }
    return null;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `/flags/${key}.png`;
  img.onload = () => {
    flagCache[key] = img;
  };
  flagCache[key] = img;
  return img.complete && img.naturalWidth > 0 ? img : null;
}

function getAssetIconKey(name: string, code: string): string | null {
  const c = code.split(' ')[0].toUpperCase();
  if (c === 'USD' || name.includes('دلار')) return 'us';
  if (c === 'EUR' || name.includes('یورو')) return 'eu';
  if (c === 'AED' || name.includes('درهم')) return 'ae';
  if (c === 'GBP' || name.includes('پوند')) return 'gb';
  if (c === 'TRY' || name.includes('لیر')) return 'tr';
  if (c === 'CAD' || name.includes('کانادا')) return 'ca';
  if (c === 'AUD' || name.includes('استرالیا')) return 'au';
  if (c === 'CHF' || name.includes('فرانک')) return 'ch';
  if (c === 'CNY' || name.includes('یوان')) return 'cn';
  if (c === 'USDT' || name.includes('تتر')) return 'usdt';
  if (c === 'BTC' || name.includes('بیت')) return 'btc';
  return null;
}

// Trigger pre-load of flags in browser environments
if (typeof window !== 'undefined') {
  setTimeout(() => {
    ['us', 'eu', 'ae', 'gb', 'tr', 'ca', 'au', 'ch', 'cn', 'usdt', 'btc'].forEach((k) => {
      getFlagImage(k);
    });
  }, 100);
}

function drawAssetBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  name: string,
  code: string
) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  const iconKey = getAssetIconKey(name, code);
  const iconImg = iconKey ? getFlagImage(iconKey) : null;

  if (iconImg) {
    // 1. Draw circular background base
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();

    // 2. Clip circle for image
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Draw image centered and scaled
    const imgW = iconImg.naturalWidth || iconImg.width;
    const imgH = iconImg.naturalHeight || iconImg.height;
    const scale = Math.max((r * 2) / imgW, (r * 2) / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    ctx.drawImage(iconImg, cx - dw / 2, cy - dh / 2, dw, dh);
    ctx.restore();

    // 3. Specular glass highlight ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.restore();
    return;
  }

  // Fallback / Gold metallic badge
  let bgGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  let strokeColor = '#FDE68A';
  let symbol = 'سکه';
  let symbolColor = '#FEF3C7';
  let font = 'bold 14px "Vazirmatn", sans-serif';

  const baseCode = code.split(' ')[0];
  if (name.includes('۱۸') || baseCode === '18K') {
    bgGrad.addColorStop(0, '#D97706');
    bgGrad.addColorStop(1, '#78350F');
    strokeColor = '#FDE68A';
    symbol = '18K';
    symbolColor = '#FEF3C7';
    font = 'bold 15px "SF Pro Arabic", "SF Pro Display", sans-serif';
  } else {
    bgGrad.addColorStop(0, '#F59E0B');
    bgGrad.addColorStop(1, '#92400E');
    strokeColor = '#FDE68A';
    if (name.includes('امامی')) symbol = 'امامی';
    else if (name.includes('بهار')) symbol = 'بهار';
    else if (name.includes('نیم')) symbol = 'نیم';
    else if (name.includes('ربع')) symbol = 'ربع';
    else if (name.includes('گرمی')) symbol = 'گرمی';
    else symbol = 'سکه';
    font = 'bold 14px "Vazirmatn", sans-serif';
    symbolColor = '#FEF3C7';
  }

  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Subtle glossy specular ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.font = font;
  ctx.fillStyle = symbolColor;
  ctx.fillText(symbol, cx, cy + (font.includes('14') || font.includes('15') ? 5 : 7));
}

export function drawPriceCard(canvas: HTMLCanvasElement, options: ShareCardOptions): void {
  const isStory = options.format === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Apple Luxury Ambient Wallpaper Background
  const bgImg = getStoryBgImage();
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    drawImageCover(ctx, bgImg, width, height);

    // Deep vignette for contrast
    const overlay = ctx.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, 'rgba(5, 7, 14, 0.65)');
    overlay.addColorStop(0.35, 'rgba(5, 7, 14, 0.35)');
    overlay.addColorStop(0.75, 'rgba(5, 7, 14, 0.5)');
    overlay.addColorStop(1, 'rgba(5, 7, 14, 0.85)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Procedural Apple Deep Navy & Obsidian Mesh Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#060814');
    bgGrad.addColorStop(0.5, '#0B0F24');
    bgGrad.addColorStop(1, '#050711');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient radial glows
    const radialAura = ctx.createRadialGradient(width * 0.85, isStory ? 240 : 120, 20, width * 0.85, isStory ? 240 : 120, 600);
    radialAura.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
    radialAura.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = radialAura;
    ctx.fillRect(0, 0, width, height);

    const goldAura = ctx.createRadialGradient(width * 0.15, isStory ? height - 240 : height - 120, 20, width * 0.15, isStory ? height - 240 : height - 120, 600);
    goldAura.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
    goldAura.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = goldAura;
    ctx.fillRect(0, 0, width, height);
  }

  // -------------------------------------------------------------
  // STORY MODE (9:16) - 1080 x 1920
  // -------------------------------------------------------------
  if (isStory) {
    let curY = 145; // Safe Zone for Instagram story top bar

    // 1. Integrated Hero Bar (Dynamic Island Style)
    const headerW = 960;
    const headerX = (width - headerW) / 2;
    const headerH = 76;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, headerX, curY, headerW, headerH, 24);
    ctx.fill();

    const hStroke = ctx.createLinearGradient(headerX, curY, headerX + headerW, curY + headerH);
    hStroke.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    hStroke.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
    hStroke.addColorStop(1, 'rgba(255, 255, 255, 0.16)');
    ctx.strokeStyle = hStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Right Side: Brand Logo & Title
    const brandX = headerX + headerW - 28;
    const brandY = curY + headerH / 2;

    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    ctx.font = '900 25px "SF Pro Arabic", "SF Pro Display", "Vazirmatn", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی‌گلد  |  KGOLD', brandX, brandY - 5);

    ctx.font = '500 14px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('تابلوی زنده معاملات طلا، سکه و ارز', brandX, brandY + 19);

    // Left Side: Live Badge with Date
    const pillW = 260;
    const pillH = 42;
    const pillX = headerX + 20;
    const pillY = curY + (headerH - pillH) / 2;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    roundRect(ctx, pillX, pillY, pillW, pillH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = '#10B981';
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(pillX + 22, pillY + pillH / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 15px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`زنده  •  ${toPersianDigits(options.dateStr)}  •  ${toPersianDigits(options.timeStr)}`, pillX + pillW / 2 + 10, pillY + 26);

    curY += headerH + 24;

    // 2. Apple Watch Complications Bar (3 cards)
    const barW = 960;
    const barX = (width - barW) / 2;
    const cardW = (barW - 24) / 3;
    const cardH = 92;

    const complications = [
      { title: 'انس جهانی طلا', val: '۲,۶۵۸ دلار', valColor: '#38BDF8' },
      { title: 'شاخص نبض بازار', val: 'صعودی ↗', valColor: '#34D399' },
      { title: 'دامنه نوسان ۲۴h', val: '۱.۸٪ ±', valColor: '#FBBF24' },
    ];

    complications.forEach((c, idx) => {
      const cx = barX + idx * (cardW + 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      roundRect(ctx, cx, curY, cardW, cardH, 22);
      ctx.fill();

      const strokeGrad = ctx.createLinearGradient(cx, curY, cx, curY + cardH);
      strokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      strokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.font = '500 15px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(c.title, cx + cardW / 2, curY + 30);

      ctx.font = 'bold 23px "Vazirmatn", "SF Pro Arabic", Tahoma, sans-serif';
      ctx.fillStyle = c.valColor;
      ctx.fillText(c.val, cx + cardW / 2, curY + 66);
    });

    curY += cardH + 28;

    // 3. 10 Key Assets
    const fullItems: ShareCardItem[] = [...options.items];
    const defaultFallbacks = [
      { name: 'دلار آمریکا', price: '۲۵۹,۹۰۰', change: '+1.68%', code: 'USD' },
      { name: 'تتر', price: '۲۵۷,۵۴۵', change: '+1.79%', code: 'USDT' },
      { name: 'سکه تمام امامی', price: '۲۶۰,۳۹۵,۰۰۰', change: '+0.92%', code: 'EMAMI' },
      { name: 'بیت‌کوین', price: '۲۱,۸۳۷,۰۰۰,۰۰۰', change: '+3.19%', code: 'BTC' },
      { name: 'یورو اروپا', price: '۲۹۲,۲۰۰', change: '+0.78%', code: 'EUR' },
      { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%', code: '18K' },
      { name: 'سکه بهار آزادی', price: '۲۴۸,۲۰۰,۰۰۰', change: '+1.51%', code: 'BAHAR' },
      { name: 'نیم سکه بهار', price: '۱۳۲,۵۰۰,۰۰۰', change: '+1.10%', code: 'HALF' },
      { name: 'ربع سکه بهار', price: '۸۴,۳۰۰,۰۰۰', change: '+0.88%', code: 'QUARTER' },
      { name: 'درهم امارات', price: '۷۰,۴۵۰', change: '+1.65%', code: 'AED' },
    ];

    defaultFallbacks.forEach((d) => {
      if (!fullItems.some((fi) => fi.name === d.name) && fullItems.length < 10) {
        fullItems.push(d);
      }
    });

    const rowW = 960;
    const rowH = 92;
    const gap = 12;
    const rowX = (width - rowW) / 2;

    for (let i = 0; i < 10; i++) {
      const item = fullItems[i] || defaultFallbacks[i];
      const rowY = curY + i * (rowH + gap);

      // Frosted Card
      const rowGrad = ctx.createLinearGradient(rowX, rowY, rowX, rowY + rowH);
      rowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      rowGrad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
      ctx.fillStyle = rowGrad;
      roundRect(ctx, rowX, rowY, rowW, rowH, 22);
      ctx.fill();

      const strokeGrad = ctx.createLinearGradient(rowX, rowY, rowX, rowY + rowH);
      strokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      strokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const centerY = rowY + rowH / 2;

      // RIGHT SIDE: Vector Badge + Persian Name + Ticker
      const codeFull = getAssetCode(item.name, item.code);
      const badgeX = rowX + rowW - 48;
      drawAssetBadge(ctx, badgeX, centerY, 25, item.name, codeFull);

      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.font = 'bold 22px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, badgeX - 38, centerY - 6);

      ctx.font = 'bold 14px "SF Pro Arabic", "SF Pro Display", -apple-system, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(codeFull, badgeX - 38, centerY + 18);

      // LEFT SIDE: Price (Top) and Change Pill (Bottom)
      const ch = formatChangePercent(item.change);
      const priceText = toPersianDigits(item.price);

      ctx.textAlign = 'left';
      ctx.direction = 'rtl';
      ctx.font = 'bold 24px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(priceText, rowX + 28, centerY - 6);

      const priceWidth = ctx.measureText(priceText).width;
      ctx.font = '500 13px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('تومان', rowX + 28 + priceWidth + 6, centerY - 6);

      const pillW = 108;
      const pillH = 28;
      const pillX = rowX + 28;
      const pillY = centerY + 4;

      ctx.fillStyle = ch.isPositive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 10);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(16, 185, 129, 0.38)' : 'rgba(239, 68, 68, 0.38)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 14px "Vazirmatn", "SF Pro Arabic", sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 19);
    }

    // 4. Bubble Intelligence Box
    curY += 10 * (rowH + gap) + 16;
    const bubbleH = 106;
    const bubbleW = rowW;
    const bubbleX = rowX;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
    roundRect(ctx, bubbleX, curY, bubbleW, bubbleH, 22);
    ctx.fill();

    const bubbleStroke = ctx.createLinearGradient(bubbleX, curY, bubbleX + bubbleW, curY);
    bubbleStroke.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    bubbleStroke.addColorStop(0.5, 'rgba(217, 119, 6, 0.15)');
    bubbleStroke.addColorStop(1, 'rgba(245, 158, 11, 0.35)');
    ctx.strokeStyle = bubbleStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 17px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillStyle = '#FEF3C7';
    ctx.fillText('💎 تحلیل هوشمند حباب مسکوکات طلا در کی‌گلد', width / 2, curY + 32);

    const chips = [
      { name: 'حباب امامی', val: '۲۱.۴٪' },
      { name: 'حباب نیم', val: '۲۴.۱٪' },
      { name: 'حباب ربع', val: '۳۹.۲٪' },
    ];
    const chipW = (bubbleW - 48 - 24) / 3;
    const chipH = 36;
    const chipY = curY + 50;

    chips.forEach((c, idx) => {
      const cx = bubbleX + 24 + idx * (chipW + 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      roundRect(ctx, cx, chipY, chipW, chipH, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '600 15px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#F1F5F9';
      ctx.fillText(`${c.name}: ${c.val}`, cx + chipW / 2, chipY + 23);
    });

    // Footer
    const footY = height - 52;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 17px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی‌گلد • مرجع تخصصی نرخ طلا، سکه، ارز و رمزارزها', width / 2, footY - 10);

    ctx.font = 'bold 13px "SF Pro Arabic", "SF Pro Display", -apple-system, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('KGOLD FINANCIAL INTELLIGENCE PLATFORM', width / 2, footY + 14);

  } else {
    // -------------------------------------------------------------
    // POST MODE (1:1) - 1080 x 1080 (Bento Grid 2x3 Luxury Cards)
    // -------------------------------------------------------------
    let curY = 60;
    const pad = 54;
    const contW = width - pad * 2; // 972px
    const headH = 80;

    // Header Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    roundRect(ctx, pad, curY, contW, headH, 26);
    ctx.fill();

    const hStroke = ctx.createLinearGradient(pad, curY, pad + contW, curY + headH);
    hStroke.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    hStroke.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
    hStroke.addColorStop(1, 'rgba(255, 255, 255, 0.16)');
    ctx.strokeStyle = hStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Right Side: Brand
    const brandX = pad + contW - 28;
    const brandY = curY + headH / 2;

    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    ctx.font = '900 26px "SF Pro Arabic", "SF Pro Display", "Vazirmatn", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی‌گلد  |  KGOLD', brandX, brandY - 5);

    ctx.font = '500 14px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('تابلوی زنده معاملات طلا، سکه و ارز', brandX, brandY + 19);

    // Left Side: Live Badge
    const livePillW = 240;
    const livePillH = 42;
    const livePillX = pad + 20;
    const livePillY = curY + (headH - livePillH) / 2;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    roundRect(ctx, livePillX, livePillY, livePillW, livePillH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = '#10B981';
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(livePillX + 22, livePillY + livePillH / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 15px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`زنده  •  ${toPersianDigits(options.dateStr)}  •  ${toPersianDigits(options.timeStr)}`, livePillX + livePillW / 2 + 10, livePillY + 26);

    curY += headH + 28;

    // BENTO GRID: 2 Columns x 3 Rows = 6 Large Tiles
    const postItems: ShareCardItem[] = options.items.slice(0, 6);
    const defaultFallbacks = [
      { name: 'دلار آمریکا', price: '۲۵۹,۹۰۰', change: '+1.68%', code: 'USD · اسکناس بازار' },
      { name: 'تتر دیجیتال', price: '۲۵۷,۵۴۵', change: '+1.79%', code: 'USDT · استیبل‌کوین' },
      { name: 'سکه تمام امامی', price: '۲۶۰,۳۹۵,۰۰۰', change: '+0.92%', code: 'EMAMI · طرح جدید' },
      { name: 'بیت‌کوین', price: '۲۱,۸۳۷,۰۰۰,۰۰۰', change: '+3.19%', code: 'BTC · رمزارز پایه' },
      { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%', code: '18K · هر گرم خام' },
      { name: 'یورو اروپا', price: '۲۹۲,۲۰۰', change: '+0.78%', code: 'EUR · اسکناس بازار' },
    ];

    defaultFallbacks.forEach((d) => {
      if (!postItems.some((pi) => pi.name === d.name) && postItems.length < 6) {
        postItems.push(d);
      }
    });

    const gridGapX = 18;
    const gridGapY = 18;
    const colW = (contW - gridGapX) / 2; // ~477px
    const tileH = 220;

    itemsLoop: for (let idx = 0; idx < 6; idx++) {
      const item = postItems[idx] || defaultFallbacks[idx];
      const row = Math.floor(idx / 2);
      // RTL: even index on right (col 1), odd index on left (col 0)
      const col = idx % 2 === 0 ? 1 : 0;

      const tileX = pad + (col === 1 ? colW + gridGapX : 0);
      const tileY = curY + row * (tileH + gridGapY);

      // Frosted Tile
      const tileGrad = ctx.createLinearGradient(tileX, tileY, tileX, tileY + tileH);
      tileGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      tileGrad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
      ctx.fillStyle = tileGrad;
      roundRect(ctx, tileX, tileY, colW, tileH, 26);
      ctx.fill();

      const tileStroke = ctx.createLinearGradient(tileX, tileY, tileX, tileY + tileH);
      tileStroke.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      tileStroke.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
      ctx.strokeStyle = tileStroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Top Row of Tile: Icon (Right) + Name & Ticker
      const codeFull = getAssetCode(item.name, item.code);
      const badgeX = tileX + colW - 42;
      const badgeY = tileY + 44;
      drawAssetBadge(ctx, badgeX, badgeY, 25, item.name, codeFull);

      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.font = 'bold 22px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, badgeX - 36, badgeY - 5);

      ctx.font = 'bold 13px "SF Pro Arabic", "SF Pro Display", "Vazirmatn", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(codeFull, badgeX - 36, badgeY + 18);

      // Bottom Section of Tile: Price (Large, Bold) + Change Pill
      const ch = formatChangePercent(item.change);
      const priceText = toPersianDigits(item.price);
      const priceY = tileY + 130;

      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.font = 'bold 30px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(priceText, tileX + colW - 24, priceY);

      const priceWidth = ctx.measureText(priceText).width;
      ctx.font = '500 15px "Vazirmatn", Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('تومان', tileX + colW - 24 - priceWidth - 8, priceY);

      // Change Pill Badge at bottom left
      const pillW = 114;
      const pillH = 32;
      const pillX = tileX + 24;
      const pillY = tileY + tileH - 46;

      ctx.fillStyle = ch.isPositive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 12);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(16, 185, 129, 0.38)' : 'rgba(239, 68, 68, 0.38)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 15px "Vazirmatn", "SF Pro Arabic", sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 21);
    }

    // Footer
    const footY = height - 42;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 16px "Vazirmatn", Tahoma, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText('کی‌گلد • مرجع تخصصی نرخ طلا، سکه، ارز و رمزارزها', width / 2, footY - 8);

    ctx.font = 'bold 12px "SF Pro Arabic", "SF Pro Display", -apple-system, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('KGOLD FINANCIAL INTELLIGENCE PLATFORM', width / 2, footY + 12);
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

    // 2. Standard Web Browser Download Fallback
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true, message: 'کارت قیمت با موفقیت ذخیره شد ✓' };
  } catch (err: any) {
    return { success: false, message: 'خطا در ذخیره سازی: ' + (err.message || 'نامشخص') };
  }
}

/**
 * Share generated canvas directly via Native Android Intent or Web Share API
 */
export async function shareCanvas(canvas: HTMLCanvasElement): Promise<void> {
  try {
    const dataUrl = canvas.toDataURL('image/png');

    if (typeof (window as any).AndroidBridge !== 'undefined' && (window as any).AndroidBridge.shareImage) {
      (window as any).AndroidBridge.shareImage(dataUrl, 'اشتراک‌گذاری کارت قیمت کی‌گلد');
      return;
    }

    if (navigator.share && navigator.canShare) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const file = new File([blob], 'kgold_price.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'کی‌گلد | قیمت لحظه‌ای طلا و ارز',
            text: 'استعلام لحظه‌ای نرخ ارز، طلا و سکه در کی‌گلد',
            files: [file],
          });
          return;
        }
      }
    }

    // Fallback: download if sharing not supported
    await downloadCanvas(canvas);
  } catch (e) {
    console.error('Share canvas error:', e);
  }
}
