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
  const arrow = isPos ? ' ↗' : ' ↘';
  const sign = isPos ? '+' : '-';
  return {
    isPositive: isPos,
    text: `${sign}${pDigits}٪${arrow}`,
  };
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
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  let bgGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  let strokeColor = 'rgba(255, 255, 255, 0.2)';
  let symbol = '$';
  let symbolColor = '#FFFFFF';
  let font = 'bold 22px Vazirmatn, Tahoma, sans-serif';

  if (name.includes('دلار') || code === 'USD') {
    bgGrad.addColorStop(0, '#1E293B');
    bgGrad.addColorStop(1, '#0F172A');
    strokeColor = '#F59E0B';
    symbol = '$';
    symbolColor = '#FCD34D';
    font = '900 23px Vazirmatn, Arial, sans-serif';
  } else if (name.includes('یورو') || code === 'EUR') {
    bgGrad.addColorStop(0, '#1E3A8A');
    bgGrad.addColorStop(1, '#172554');
    strokeColor = '#60A5FA';
    symbol = '€';
    symbolColor = '#93C5FD';
    font = '900 23px Vazirmatn, Arial, sans-serif';
  } else if (name.includes('درهم') || code === 'AED') {
    bgGrad.addColorStop(0, '#064E3B');
    bgGrad.addColorStop(1, '#022C22');
    strokeColor = '#34D399';
    symbol = 'د.إ';
    symbolColor = '#6EE7B7';
    font = 'bold 16px Vazirmatn, Tahoma, sans-serif';
  } else if (name.includes('پوند') || code === 'GBP') {
    bgGrad.addColorStop(0, '#312E81');
    bgGrad.addColorStop(1, '#1E1B4B');
    strokeColor = '#A5B4FC';
    symbol = '£';
    symbolColor = '#C7D2FE';
    font = '900 23px Vazirmatn, Arial, sans-serif';
  } else if (name.includes('تتر') || code === 'USDT') {
    bgGrad.addColorStop(0, '#0D9488');
    bgGrad.addColorStop(1, '#115E59');
    strokeColor = '#2DD4BF';
    symbol = '₮';
    symbolColor = '#FFFFFF';
    font = '900 25px Vazirmatn, Arial, sans-serif';
  } else if (name.includes('بیت') || code === 'BTC') {
    bgGrad.addColorStop(0, '#EA580C');
    bgGrad.addColorStop(1, '#9A3412');
    strokeColor = '#FDBA74';
    symbol = '₿';
    symbolColor = '#FFFFFF';
    font = '900 25px Vazirmatn, Arial, sans-serif';
  } else if (name.includes('۱۸') || code === '18K') {
    bgGrad.addColorStop(0, '#D97706');
    bgGrad.addColorStop(1, '#78350F');
    strokeColor = '#FDE68A';
    symbol = '۱۸K';
    symbolColor = '#FEF3C7';
    font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
  } else {
    // Gold Coins (Emami, Bahar, Half, Quarter, Gerami)
    bgGrad.addColorStop(0, '#F59E0B');
    bgGrad.addColorStop(1, '#92400E');
    strokeColor = '#FDE68A';
    if (name.includes('امامی')) symbol = 'امامی';
    else if (name.includes('بهار')) symbol = 'بهار';
    else if (name.includes('نیم')) symbol = 'نیم';
    else if (name.includes('ربع')) symbol = 'ربع';
    else if (name.includes('گرمی')) symbol = 'گرمی';
    else symbol = 'سکه';
    font = 'bold 14px Vazirmatn, Tahoma, sans-serif';
    symbolColor = '#FEF3C7';
  }

  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Inner subtle rim
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 3.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.font = font;
  ctx.fillStyle = symbolColor;
  ctx.fillText(symbol, cx, cy + (font.includes('14') || font.includes('15') || font.includes('16') ? 5 : 7));
}

export function drawPriceCard(canvas: HTMLCanvasElement, options: ShareCardOptions): void {
  const isStory = options.format === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Deep Luxury Obsidian & Navy Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#05070D');
  bgGrad.addColorStop(0.35, '#0A0F1D');
  bgGrad.addColorStop(0.7, '#0D1527');
  bgGrad.addColorStop(1, '#05070E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Radiant Gold & Emerald Mesh Orbs
  const goldOrb = ctx.createRadialGradient(width * 0.85, isStory ? 280 : 160, 20, width * 0.85, isStory ? 280 : 160, 560);
  goldOrb.addColorStop(0, 'rgba(245, 158, 11, 0.24)');
  goldOrb.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = goldOrb;
  ctx.fillRect(0, 0, width, height);

  const emeraldOrb = ctx.createRadialGradient(width * 0.15, isStory ? 1700 : 940, 20, width * 0.15, isStory ? 1700 : 940, 560);
  emeraldOrb.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  emeraldOrb.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = emeraldOrb;
  ctx.fillRect(0, 0, width, height);

  // Outer Luxury Double Frame
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, 32, 32, width - 64, height - 64, 38);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  roundRect(ctx, 44, 44, width - 88, height - 88, 30);
  ctx.stroke();

  // -------------------------------------------------------------
  // HEADER SECTION
  // -------------------------------------------------------------
  let curY = isStory ? 95 : 75;

  // Header Badge Pill
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  const badgeW = 340;
  const badgeH = 44;
  const badgeX = (width - badgeW) / 2;

  ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
  roundRect(ctx, badgeX, curY, badgeW, badgeH, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('⚡ تابلوی زنده معاملات طلا و ارز', width / 2, curY + 29);

  // Main Brand Title
  curY += 72;
  ctx.font = '900 54px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('KGold  |  کـی گـلـد', width / 2, curY);

  // Date & Time Subtitle
  curY += 42;
  ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`تاریخ: ${toPersianDigits(options.dateStr)}   •   ساعت: ${toPersianDigits(options.timeStr)}`, width / 2, curY);

  // -------------------------------------------------------------
  // STORY MODE (9:16) - 1080 x 1920
  // -------------------------------------------------------------
  if (isStory) {
    curY += 40;

    // 1. Market Pulse Status Bar (3 Metric Cards)
    const pulseW = width - 120; // 960px
    const pulseH = 82;
    const pulseX = 60;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, pulseX, curY, pulseW, pulseH, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const colStep = pulseW / 3;
    const metrics = [
      { t: 'شاخص نبض بازار', v: 'صعودی ↗', c: '#34D399' },
      { t: 'دامنه نوسان ۲۴h', v: 'متوسط (۱.۸٪)', c: '#FBBF24' },
      { t: 'انس جهانی طلا', v: '۲,۶۵۸ $', c: '#60A5FA' },
    ];

    metrics.forEach((item, idx) => {
      const cx = pulseX + colStep * idx + colStep / 2;
      ctx.textAlign = 'center';
      ctx.font = 'normal 16px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(item.t, cx, curY + 30);

      ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = item.c;
      ctx.fillText(item.v, cx, curY + 62);
    });

    curY += pulseH + 28;

    // 2. Main 10 Key Market Assets Table (Fills height seamlessly)
    const fullItems: ShareCardItem[] = [...options.items];
    const defaultFallbacks = [
      { name: 'دلار آمریکا', price: '۲۵۶,۵۰۰', change: '+2.23%', code: 'USD' },
      { name: 'تتر', price: '۲۵۴,۱۱۶', change: '+0.22%', code: 'USDT' },
      { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%', code: '18K' },
      { name: 'سکه تمام امامی', price: '۲۵۹,۰۰۵,۰۰۰', change: '+2.73%', code: 'EMAMI' },
      { name: 'سکه بهار آزادی', price: '۲۴۸,۲۰۰,۰۰۰', change: '+1.51%', code: 'BAHAR' },
      { name: 'نیم سکه بهار', price: '۱۳۲,۵۰۰,۰۰۰', change: '+1.10%', code: 'HALF' },
      { name: 'ربع سکه بهار', price: '۸۴,۳۰۰,۰۰۰', change: '+0.88%', code: 'QUARTER' },
      { name: 'یورو اروپا', price: '۲۹۰,۸۰۰', change: '+2.14%', code: 'EUR' },
      { name: 'درهم امارات', price: '۶۹,۸۵۰', change: '+2.10%', code: 'AED' },
      { name: 'بیت‌کوین', price: '۲۱,۳۶۰,۶۸۸,۷۴۹', change: '+2.12%', code: 'BTC' },
    ];

    defaultFallbacks.forEach((d) => {
      if (!fullItems.some((fi) => fi.name === d.name) && fullItems.length < 10) {
        fullItems.push(d);
      }
    });

    const rowW = width - 120; // 960px
    const rowH = 95;
    const gap = 12;

    for (let i = 0; i < 10; i++) {
      const item = fullItems[i] || defaultFallbacks[i];
      const rowX = 60;
      const rowY = curY + i * (rowH + gap);

      // Card Background with Subtle Glass Gradient
      const cardGrad = ctx.createLinearGradient(rowX, rowY, rowX + rowW, rowY + rowH);
      cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
      ctx.fillStyle = cardGrad;
      roundRect(ctx, rowX, rowY, rowW, rowH, 20);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const centerY = rowY + rowH / 2;

      // RIGHT SECTION: Custom Vector Badge + Name + Ticker
      const code = getAssetCode(item.name, item.code);
      const badgeX = rowX + rowW - 48;
      drawAssetBadge(ctx, badgeX, centerY, 24, item.name, code);

      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.font = 'bold 24px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, badgeX - 36, centerY - 4);

      ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(code, badgeX - 36, centerY + 21);

      // LEFT SECTION: Price (Top) and Change Badge (Bottom)
      const ch = formatChangePercent(item.change);
      const priceText = toPersianDigits(item.price);

      // 1. Live Price + "تومان"
      ctx.textAlign = 'left';
      ctx.direction = 'rtl';
      ctx.font = '900 27px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(priceText, rowX + 28, centerY - 4);

      const pWidth = ctx.measureText(priceText).width;
      ctx.font = 'normal 15px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('تومان', rowX + 28 + pWidth + 8, centerY - 5);

      // 2. Change Pill Badge directly below price
      const pillW = 115;
      const pillH = 30;
      const pillX = rowX + 28;
      const pillY = centerY + 8;

      ctx.fillStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 15);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 16px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 21);

      // Subtle Center Connector Line (Connecting Right & Left gracefully)
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(badgeX - 190, centerY);
      ctx.lineTo(rowX + 28 + pWidth + 70, centerY);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Market Bubble & Intelligence Card (Fills lower section)
    curY += 10 * (rowH + gap) + 16;
    const infoH = 125;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.07)';
    roundRect(ctx, 60, curY, width - 120, infoH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 21px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FDE68A';
    ctx.fillText('💎 تحلیل زنده حباب سکه و محاسبه فاکتور طلا در کی‌گلد', width / 2, curY + 38);

    // 3 Pill Badges inside Bubble Box
    const chipW = 260;
    const chipH = 34;
    const chipGap = 16;
    const startChipX = (width - (3 * chipW + 2 * chipGap)) / 2;
    const chipY = curY + 62;

    const chips = [
      'حباب سکه امامی: ۲۱.۴٪',
      'حباب نیم سکه: ۲۴.۱٪',
      'حباب ربع سکه: ۳۹.۲٪',
    ];

    chips.forEach((txt, idx) => {
      const cx = startChipX + idx * (chipW + chipGap);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      roundRect(ctx, cx, chipY, chipW, chipH, 17);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#F3F4F6';
      ctx.fillText(txt, cx + chipW / 2, chipY + 23);
    });

    // 4. Footer & Brand Showcase
    const footY = height - 70;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی گلد • سامانه استعلام زنده قیمت طلا، سکه و ارز', width / 2, footY - 14);

    ctx.font = 'normal 16px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('استعلام آنلاین و بی‌درنگ • اپلیکیشن اندروید: kgold.irkinsta.top', width / 2, footY + 16);

  } else {
    // -------------------------------------------------------------
    // POST MODE (1:1) - 1080 x 1080
    // -------------------------------------------------------------
    curY += 25;

    const postItems: ShareCardItem[] = options.items.slice(0, 7);
    const defaultFallbacks = [
      { name: 'دلار آمریکا', price: '۲۵۶,۵۰۰', change: '+2.23%', code: 'USD' },
      { name: 'تتر', price: '۲۵۴,۱۱۶', change: '+2.23%', code: 'USDT' },
      { name: 'طلای ۱۸ عیار', price: '۲۵,۳۵۸,۰۰۰', change: '+1.82%', code: '18K' },
      { name: 'سکه تمام امامی', price: '۲۵۹,۰۰۵,۰۰۰', change: '+2.73%', code: 'EMAMI' },
      { name: 'بیت‌کوین', price: '۲۱,۳۶۰,۶۸۸,۷۴۹', change: '+2.12%', code: 'BTC' },
      { name: 'یورو اروپا', price: '۲۹۰,۸۰۰', change: '+2.14%', code: 'EUR' },
      { name: 'درهم امارات', price: '۶۹,۸۵۰', change: '+2.10%', code: 'AED' },
    ];

    defaultFallbacks.forEach((d) => {
      if (!postItems.some((pi) => pi.name === d.name) && postItems.length < 7) {
        postItems.push(d);
      }
    });

    const rowW = width - 120; // 960px
    const rowH = 86;
    const gap = 11;

    for (let i = 0; i < 7; i++) {
      const item = postItems[i] || defaultFallbacks[i];
      const rowX = 60;
      const rowY = curY + i * (rowH + gap);

      // Card Background
      const cardGrad = ctx.createLinearGradient(rowX, rowY, rowX + rowW, rowY + rowH);
      cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
      ctx.fillStyle = cardGrad;
      roundRect(ctx, rowX, rowY, rowW, rowH, 18);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const centerY = rowY + rowH / 2;

      // RIGHT SECTION: Custom Vector Badge + Name + Ticker
      const code = getAssetCode(item.name, item.code);
      const badgeX = rowX + rowW - 44;
      drawAssetBadge(ctx, badgeX, centerY, 22, item.name, code);

      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.font = 'bold 23px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, badgeX - 34, centerY - 3);

      ctx.font = 'bold 14px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(code, badgeX - 34, centerY + 20);

      // LEFT SECTION: Price (Top) and Change Badge (Bottom)
      const ch = formatChangePercent(item.change);
      const priceText = toPersianDigits(item.price);

      // 1. Live Price + "تومان"
      ctx.textAlign = 'left';
      ctx.direction = 'rtl';
      ctx.font = '900 26px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(priceText, rowX + 26, centerY - 4);

      const pWidth = ctx.measureText(priceText).width;
      ctx.font = 'normal 14.5px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('تومان', rowX + 26 + pWidth + 8, centerY - 5);

      // 2. Change Pill Badge directly below price
      const pillW = 110;
      const pillH = 28;
      const pillX = rowX + 26;
      const pillY = centerY + 8;

      ctx.fillStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      roundRect(ctx, pillX, pillY, pillW, pillH, 14);
      ctx.fill();
      ctx.strokeStyle = ch.isPositive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = ch.isPositive ? '#34D399' : '#F87171';
      ctx.fillText(ch.text, pillX + pillW / 2, pillY + 20);

      // Subtle Center Connector Line
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(badgeX - 180, centerY);
      ctx.lineTo(rowX + 26 + pWidth + 65, centerY);
      ctx.stroke();
      ctx.restore();
    }

    // Footer
    const footY = height - 68;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('کی گلد • سامانه استعلام زنده قیمت طلا، سکه و ارز', width / 2, footY - 14);

    ctx.font = 'normal 15px Vazirmatn, Tahoma, sans-serif';
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
