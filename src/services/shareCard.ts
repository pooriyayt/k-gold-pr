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
  bgGrad.addColorStop(0, '#090B10');
  bgGrad.addColorStop(0.4, '#10141E');
  bgGrad.addColorStop(0.8, '#141A26');
  bgGrad.addColorStop(1, '#080A0E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Gold Glow at top right & bottom left
  const glowTop = ctx.createRadialGradient(width * 0.85, height * 0.1, 10, width * 0.85, height * 0.1, 450);
  glowTop.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
  glowTop.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glowTop;
  ctx.fillRect(0, 0, width, height);

  const glowBottom = ctx.createRadialGradient(width * 0.15, height * 0.9, 10, width * 0.15, height * 0.9, 450);
  glowBottom.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
  glowBottom.addColorStop(1, 'rgba(59, 130, 246, 0)');
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Accent
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 4;
  roundRect(ctx, 40, 40, width - 80, height - 80, 48);
  ctx.stroke();

  // 2. Header: Logo & Branding
  const padX = 90;
  let curY = isStory ? 160 : 120;

  // KGold Brand Badge
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';

  // Gold Pill Badge
  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  roundRect(ctx, width - padX - 220, curY - 35, 220, 52, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = 'bold 24px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('⚡ نرخ لحظه‌ای بازار', width - padX - 25, curY);

  // App Name
  curY += 65;
  ctx.font = '900 48px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('کی گلد | KGold', width - padX, curY);

  // Subtitle & Date
  curY += 45;
  ctx.font = '500 24px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`تاریخ: ${options.dateStr} | ساعت استعلام: ${options.timeStr}`, width - padX, curY);

  // Separator Line
  curY += 45;
  const lineGrad = ctx.createLinearGradient(padX, curY, width - padX, curY);
  lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
  lineGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
  lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(width - padX, curY);
  ctx.stroke();

  // 3. Spotlight Item (if any)
  if (options.spotlightItem) {
    curY += 50;
    const boxH = isStory ? 280 : 210;

    // Glowing container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, padX, curY, width - padX * 2, boxH, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Spotlight Title
    ctx.font = 'bold 34px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(options.spotlightItem.name, width - padX - 45, curY + 65);

    // Spotlight Price
    ctx.font = '900 56px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#F59E0B';
    ctx.fillText(`${options.spotlightItem.price} تومان`, width - padX - 45, curY + 145);

    // Spotlight Change Tag
    const isPos = !options.spotlightItem.change.startsWith('-');
    ctx.fillStyle = isPos ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    roundRect(ctx, padX + 45, curY + 95, 200, 60, 30);
    ctx.fill();
    ctx.strokeStyle = isPos ? '#22C55E' : '#EF4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 30px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = isPos ? '#4ADE80' : '#F87171';
    ctx.fillText(options.spotlightItem.change, padX + 145, curY + 137);

    curY += boxH + 40;
  } else {
    curY += 50;
  }

  // 4. Grid of Market Assets
  ctx.textAlign = 'right';
  const displayItems = options.items.slice(0, isStory ? 6 : 4);
  const cardH = isStory ? 120 : 105;
  const gapY = isStory ? 24 : 16;

  for (let i = 0; i < displayItems.length; i++) {
    const item = displayItems[i];
    const itemY = curY + i * (cardH + gapY);

    // Card background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    roundRect(ctx, padX, itemY, width - padX * 2, cardH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Asset Name
    ctx.font = 'bold 30px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(item.name, width - padX - 40, itemY + (cardH / 2) + 10);

    // Asset Price
    ctx.font = '800 32px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(`${item.price} ت`, padX + 270, itemY + (cardH / 2) + 10);

    // Change Tag
    const isPos = !item.change.startsWith('-');
    ctx.fillStyle = isPos ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    roundRect(ctx, padX + 30, itemY + (cardH / 2) - 26, 130, 52, 26);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = isPos ? '#4ADE80' : '#F87171';
    ctx.fillText(item.change, padX + 95, itemY + (cardH / 2) + 8);
    ctx.textAlign = 'right';
  }

  // 5. Footer: Watermark & Branding
  const footY = height - 90;
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText('طراحی شده با کی گلد (KGold) | مرجع رسمی استعلام زنده طلا و ارز', width / 2, footY - 20);

  ctx.font = 'normal 18px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('https://github.com/pooriyayt/k-gold-pr', width / 2, footY + 15);
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
 * Download generated canvas as a PNG file
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'kgold-market-card.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Share generated canvas via Web Share API
 */
export async function shareCanvas(canvas: HTMLCanvasElement, title: string = 'نرخ لحظه‌ای طلا و ارز - کی گلد'): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        downloadCanvas(canvas);
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
          downloadCanvas(canvas);
          resolve(false);
        }
      } else {
        downloadCanvas(canvas);
        resolve(true);
      }
    }, 'image/png');
  });
}
