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

export function drawPriceCard(canvas: HTMLCanvasElement, options: ShareCardOptions): void {
  const isStory = options.format === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background Gradient (Luxury Dark Onyx & Deep Slate)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0A0D14');
  bgGrad.addColorStop(0.35, '#101522');
  bgGrad.addColorStop(0.75, '#141A28');
  bgGrad.addColorStop(1, '#07090E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Golden & Sapphire Ambient Glows
  const glowTop = ctx.createRadialGradient(width * 0.85, height * 0.12, 10, width * 0.85, height * 0.12, 500);
  glowTop.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  glowTop.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glowTop;
  ctx.fillRect(0, 0, width, height);

  const glowBottom = ctx.createRadialGradient(width * 0.2, height * 0.88, 10, width * 0.2, height * 0.88, 550);
  glowBottom.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
  glowBottom.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, width, height);

  // Elegant Outer Double Border
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 3.5;
  roundRect(ctx, 36, 36, width - 72, height - 72, 44);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  roundRect(ctx, 48, 48, width - 96, height - 96, 36);
  ctx.stroke();

  // 2. Header: Logo & Branding
  const padX = 80;
  let curY = isStory ? 170 : 120;

  // Gold Pill Badge
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';

  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
  roundRect(ctx, width - padX - 230, curY - 36, 230, 52, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = 'bold 23px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('⚡ نرخ لحظه‌ای بازار', width - padX - 25, curY);

  // App Name
  curY += 68;
  ctx.font = '900 50px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('کی گلد | KGold', width - padX, curY);

  // Subtitle & Date
  curY += 46;
  ctx.font = 'bold 23px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`تاریخ استعلام: ${options.dateStr}   •   ساعت: ${options.timeStr}`, width - padX, curY);

  // Separator Line
  curY += 40;
  const lineGrad = ctx.createLinearGradient(padX, curY, width - padX, curY);
  lineGrad.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
  lineGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
  lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  // 3. Spotlight Hero Item (if present)
  if (options.spotlightItem) {
    curY += 45;
    const heroH = isStory ? 240 : 190;

    // Glowing Hero Card
    ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
    roundRect(ctx, padX, curY, width - padX * 2, heroH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Spotlight Title
    ctx.textAlign = 'right';
    ctx.font = 'bold 32px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(options.spotlightItem.name, width - padX - 40, curY + 60);

    // Spotlight Price
    ctx.font = '900 52px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#F59E0B';
    ctx.fillText(`${options.spotlightItem.price} تومان`, width - padX - 40, curY + 140);

    // Spotlight Change Tag (Left Aligned)
    const isPos = !options.spotlightItem.change.startsWith('-');
    ctx.fillStyle = isPos ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    roundRect(ctx, padX + 35, curY + (heroH / 2) - 30, 180, 60, 30);
    ctx.fill();
    ctx.strokeStyle = isPos ? '#22C55E' : '#EF4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = isPos ? '#4ADE80' : '#F87171';
    ctx.fillText(options.spotlightItem.change, padX + 125, curY + (heroH / 2) + 12);

    curY += heroH + 35;
  } else {
    curY += 40;
  }

  // 4. Grid of Market Assets (Balanced 3-column rows)
  const maxItems = isStory ? (options.spotlightItem ? 6 : 7) : 4;
  const displayItems = options.items.slice(0, maxItems);
  const cardH = isStory ? 122 : 110;
  const gapY = isStory ? 22 : 16;

  for (let i = 0; i < displayItems.length; i++) {
    const item = displayItems[i];
    const itemY = curY + i * (cardH + gapY);

    // Card background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, padX, itemY, width - padX * 2, cardH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Right Column: Gold Dot + Asset Name
    const centerY = itemY + (cardH / 2);

    // Gold Accent Dot
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(width - padX - 35, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Asset Name (Right aligned)
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    ctx.font = 'bold 30px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(item.name, width - padX - 58, centerY + 10);

    // Left Column: Change Tag
    const isPos = !item.change.startsWith('-');
    const pillW = 125;
    const pillH = 48;
    const pillX = padX + 28;
    const pillY = centerY - (pillH / 2);

    ctx.fillStyle = isPos ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
    roundRect(ctx, pillX, pillY, pillW, pillH, 24);
    ctx.fill();
    ctx.strokeStyle = isPos ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = isPos ? '#4ADE80' : '#F87171';
    ctx.fillText(item.change, pillX + (pillW / 2), centerY + 8);

    // Middle Column: Price (Left aligned directly after pill)
    ctx.textAlign = 'left';
    ctx.direction = 'ltr';
    ctx.font = '900 32px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(`${item.price} ت`, pillX + pillW + 20, centerY + 10);
  }

  // 5. Footer: Clean Official Branding (No GitHub URLs!)
  const footY = height - 90;
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.font = 'bold 24px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('کی گلد • مرجع تخصصی استعلام زنده قیمت طلا، سکه و ارز', width / 2, footY - 10);

  ctx.font = '500 19px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('سامانه رسمی تحلیل بازار و هشدارهای هوشمند قیمت', width / 2, footY + 24);
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
