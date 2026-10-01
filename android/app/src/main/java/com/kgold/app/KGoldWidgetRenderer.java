package com.kgold.app;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PaintFlagsDrawFilter;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Bundle;

import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

public class KGoldWidgetRenderer {

    // Fonts cache
    private static Typeface sGsansBold = null;
    private static Typeface sGsansMedium = null;
    private static Typeface sVazirBold = null;
    private static Typeface sVazirRegular = null;
    private static Typeface sSfArabicBold = null;
    private static Typeface sSfArabicRegular = null;

    public static Typeface getGsansBold(Context context) {
        if (sGsansBold == null) {
            try {
                sGsansBold = Typeface.createFromAsset(context.getAssets(), "public/fonts/GoogleSans-Bold.ttf");
            } catch (Exception e) {
                sGsansBold = Typeface.DEFAULT_BOLD;
            }
        }
        return sGsansBold;
    }

    public static Typeface getGsansMedium(Context context) {
        if (sGsansMedium == null) {
            try {
                sGsansMedium = Typeface.createFromAsset(context.getAssets(), "public/fonts/GoogleSans-Medium.ttf");
            } catch (Exception e) {
                sGsansMedium = Typeface.DEFAULT;
            }
        }
        return sGsansMedium;
    }

    public static Typeface getVazirBold(Context context) {
        if (sVazirBold == null) {
            try {
                sVazirBold = Typeface.createFromAsset(context.getAssets(), "public/fonts/Vazirmatn-Bold.ttf");
            } catch (Exception e) {
                sVazirBold = Typeface.DEFAULT_BOLD;
            }
        }
        return sVazirBold;
    }

    public static Typeface getVazirRegular(Context context) {
        if (sVazirRegular == null) {
            try {
                sVazirRegular = Typeface.createFromAsset(context.getAssets(), "public/fonts/Vazirmatn-Regular.ttf");
            } catch (Exception e) {
                sVazirRegular = Typeface.DEFAULT;
            }
        }
        return sVazirRegular;
    }

    public static Typeface getSfArabicBold(Context context) {
        if (sSfArabicBold == null) {
            try {
                sSfArabicBold = Typeface.createFromAsset(context.getAssets(), "public/fonts/SFProArabic-Bold.ttf");
            } catch (Exception e1) {
                try {
                    sSfArabicBold = Typeface.createFromAsset(context.getAssets(), "public/fonts/SF-Arabic-700.ttf");
                } catch (Exception e2) {
                    sSfArabicBold = Typeface.DEFAULT_BOLD;
                }
            }
        }
        return sSfArabicBold;
    }

    public static Typeface getSfArabicRegular(Context context) {
        if (sSfArabicRegular == null) {
            try {
                sSfArabicRegular = Typeface.createFromAsset(context.getAssets(), "public/fonts/SFArabic-Regular.ttf");
            } catch (Exception e1) {
                try {
                    sSfArabicRegular = Typeface.createFromAsset(context.getAssets(), "public/fonts/SF-Arabic-500.ttf");
                } catch (Exception e2) {
                    sSfArabicRegular = Typeface.DEFAULT;
                }
            }
        }
        return sSfArabicRegular;
    }

    public static String toPersianDigits(String str) {
        if (str == null || str.isEmpty()) return "";
        return str.replace('0', '۰')
                  .replace('1', '۱')
                  .replace('2', '۲')
                  .replace('3', '۳')
                  .replace('4', '۴')
                  .replace('5', '۵')
                  .replace('6', '۶')
                  .replace('7', '۷')
                  .replace('8', '۸')
                  .replace('9', '۹')
                  .replace('%', '٪');
    }

    public static String toEnglishDigits(String str) {
        if (str == null || str.isEmpty()) return "";
        return str.replace('۰', '0')
                  .replace('۱', '1')
                  .replace('۲', '2')
                  .replace('۳', '3')
                  .replace('۴', '4')
                  .replace('۵', '5')
                  .replace('۶', '6')
                  .replace('۷', '7')
                  .replace('۸', '8')
                  .replace('۹', '9')
                  .replace('٪', '%');
    }

    public static String formatDigits(String str, boolean isPersian) {
        return isPersian ? toPersianDigits(str) : toEnglishDigits(str);
    }

    public static String formatChangeText(String change, boolean isPositive, boolean isPersian) {
        if (change == null || change.trim().isEmpty()) {
            return isPersian ? (isPositive ? "+۰.۰۰٪ ↗" : "-۰.۰۰٪ ↘") : (isPositive ? "+0.00% ↗" : "-0.00% ↘");
        }
        boolean isNeg = change.contains("-") || !isPositive;
        String clean = change.replaceAll("[+\\-\\s%٪↗↘]", "").trim();
        if (clean.isEmpty()) clean = "0.00";
        String arrow = isNeg ? " ↘" : " ↗";
        String sign = isNeg ? "-" : "+";
        String pct = isPersian ? "٪" : "%";
        return formatDigits(sign + clean + pct + arrow, isPersian);
    }

    public static String cleanEnglishName(String name) {
        if (name == null) return "";
        if (name.equalsIgnoreCase("British Pound")) return "British Pound";
        if (name.equalsIgnoreCase("US Dollar")) return "US Dollar";
        if (name.equalsIgnoreCase("UAE Dirham")) return "UAE Dirham";
        if (name.equalsIgnoreCase("Tether USD") || name.equalsIgnoreCase("Tether USDT")) return "Tether USD";
        if (name.equalsIgnoreCase("Emami Coin")) return "Emami Coin";
        if (name.equalsIgnoreCase("Bahar Azadi")) return "Bahar Azadi";
        return name;
    }

    public static class WidgetThemeConfig {
        public int bgColor;
        public int strokeColor;
        public float strokeWidth;
        public int titleColor;
        public int codeColor;
        public int priceColor;
        public int unitColor;
        public int posColor;
        public int negColor;

        public static WidgetThemeConfig get() {
            WidgetThemeConfig c = new WidgetThemeConfig();
            // Solid crisp white luxury card
            c.bgColor = 0xFFFFFFFF;
            c.strokeColor = 0xFFE2E8F0;
            c.strokeWidth = 2.5f;
            c.titleColor = 0xFF0F172A;
            c.codeColor = 0xFF64748B;
            c.priceColor = 0xFF0F172A;
            c.unitColor = 0xFF94A3B8;
            c.posColor = 0xFF16A34A;
            c.negColor = 0xFFDC2626;
            return c;
        }

        public static WidgetThemeConfig get(boolean isTransparent) {
            return get();
        }
    }

    private static Paint createPaint(int color, Paint.Style style, float strokeWidth) {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.DITHER_FLAG);
        p.setAntiAlias(true);
        p.setDither(true);
        p.setColor(color);
        p.setStyle(style);
        if (strokeWidth > 0) p.setStrokeWidth(strokeWidth);
        return p;
    }

    private static Paint createTextPaint(Typeface tf, int color, float size, Paint.Align align) {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG | Paint.LINEAR_TEXT_FLAG);
        p.setAntiAlias(true);
        p.setSubpixelText(true);
        p.setLinearText(true);
        p.setFilterBitmap(true);
        p.setTypeface(tf);
        p.setColor(color);
        p.setTextSize(size);
        p.setTextAlign(align);
        return p;
    }

    /**
     * Main Entry: Render pixel-perfect luxury widget Bitmap in Ultra HD Retina resolution (1080p)
     */
    public static Bitmap renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId, List<String> assetKeys) {
        // Read user preferences
        SharedPreferences prefs = context.getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE);
        String digitsLang = prefs.getString(WidgetConfigureActivity.PREF_DIGITS_LANG_PREFIX + appWidgetId, null);
        if (digitsLang == null) {
            digitsLang = prefs.getString("widget_digits_lang", "fa");
        }
        boolean isPersian = !"en".equalsIgnoreCase(digitsLang);

        List<WidgetConfigureActivity.AssetItem> assets = new ArrayList<>();
        for (String k : assetKeys) {
            assets.add(WidgetConfigureActivity.getAssetByKey(context, k, isPersian));
        }
        if (assets.isEmpty()) {
            assets.add(WidgetConfigureActivity.getAssetByKey(context, "usd", isPersian));
        }

        WidgetThemeConfig themeConfig = WidgetThemeConfig.get();

        // Calculate dynamic, responsive canvas dimensions (Retina 1080p definition)
        int minW = 0;
        int minH = 0;
        if (appWidgetManager != null && appWidgetId > 0) {
            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            if (options != null) {
                minW = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
                minH = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0);
            }
        }

        int canvasW = 1080;
        int canvasH = 1080;

        if (minW > 0 && minH > 0) {
            float ratio = (float) minW / (float) minH;
            if (assets.size() == 2) {
                if (ratio > 1.35f) {
                    // Wide horizontal layout (4x2)
                    canvasW = 1080;
                    canvasH = 540;
                } else if (ratio < 0.85f) {
                    // Tall vertical layout (2x4)
                    canvasW = 540;
                    canvasH = 1080;
                } else {
                    canvasW = 1080;
                    canvasH = 1080;
                }
            } else {
                // 1 asset or 3-4 assets: always a clean 1080x1080 square canvas
                canvasW = 1080;
                canvasH = 1080;
            }
        }

        Bitmap bitmap = Bitmap.createBitmap(canvasW, canvasH, Bitmap.Config.ARGB_8888);
        bitmap.setDensity(context.getResources().getDisplayMetrics().densityDpi);
        Canvas canvas = new Canvas(bitmap);
        canvas.setDrawFilter(new PaintFlagsDrawFilter(0,
                Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG | Paint.DITHER_FLAG | Paint.SUBPIXEL_TEXT_FLAG));

        if (assets.size() == 1) {
            renderSingleCard(context, canvas, assets.get(0), canvasW, canvasH, themeConfig, isPersian);
        } else if (assets.size() == 2) {
            renderTwoCards(context, canvas, assets, canvasW, canvasH, themeConfig, isPersian);
        } else {
            renderFourCardsGrid(context, canvas, assets, canvasW, canvasH, themeConfig, isPersian);
        }

        return bitmap;
    }

    /**
     * 1 ASSET MODE: Single Responsive Card in 1080p
     */
    private static void renderSingleCard(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        Typeface tfTitle = isPersian ? getSfArabicBold(context) : getGsansBold(context);
        Typeface tfCode = isPersian ? getSfArabicBold(context) : getGsansMedium(context);
        Typeface tfPrice = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfChange = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfUnit = isPersian ? getSfArabicRegular(context) : getGsansMedium(context);

        float pad = 24f;
        RectF cardRect = new RectF(pad, pad, w - pad, h - pad);

        // 1. Background & Border
        Paint bgPaint = createPaint(theme.bgColor, Paint.Style.FILL, 0);
        canvas.drawRoundRect(cardRect, 76f, 76f, bgPaint);

        Paint strokePaint = createPaint(theme.strokeColor, Paint.Style.STROKE, 3.5f);
        canvas.drawRoundRect(cardRect, 76f, 76f, strokePaint);

        // 2. Top Row: Icon on Left, Name & Code on Right
        int iconSize = 136;
        int iconX = Math.round(pad + 48f);
        int iconY = Math.round(pad + 48f);
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        // Title text (Persian name in Persian mode, English name in English mode)
        float textRight = w - pad - 54f;
        String displayName = isPersian ? asset.name : cleanEnglishName(asset.englishName);

        float nameSize = 58f;
        Paint namePaint = createTextPaint(tfTitle, theme.titleColor, nameSize, Paint.Align.RIGHT);

        float maxNameWidth = textRight - (iconX + iconSize + 32f);
        if (namePaint.measureText(displayName) > maxNameWidth) {
            namePaint.setTextSize(nameSize * 0.84f);
        }
        canvas.drawText(displayName, textRight, iconY + 62f, namePaint);

        float codeSize = 36f;
        Paint codePaint = createTextPaint(tfCode, theme.codeColor, codeSize, Paint.Align.RIGHT);
        canvas.drawText(asset.code, textRight, iconY + 116f, codePaint);

        // 3. Bottom Row: Change Percentage & Hero Price
        float changeSize = 44f;
        int changeColor = asset.isPositive ? theme.posColor : theme.negColor;
        Paint changePaint = createTextPaint(tfChange, changeColor, changeSize, Paint.Align.LEFT);
        String changeStr = formatChangeText(asset.defaultChange, asset.isPositive, isPersian);
        canvas.drawText(changeStr, iconX, h - pad - 190f, changePaint);

        float priceSize = 100f;
        Paint pricePaint = createTextPaint(tfPrice, theme.priceColor, priceSize, Paint.Align.LEFT);
        String pStr = formatDigits(asset.defaultPrice, isPersian);
        float pWidth = pricePaint.measureText(pStr);
        float maxPriceWidth = w - iconX * 2 - 160f;
        if (pWidth > maxPriceWidth) {
            pricePaint.setTextSize(priceSize * 0.82f);
            pWidth = pricePaint.measureText(pStr);
        }
        canvas.drawText(pStr, iconX, h - pad - 60f, pricePaint);

        float unitSize = 38f;
        Paint unitPaint = createTextPaint(tfUnit, theme.unitColor, unitSize, Paint.Align.LEFT);
        String unitStr = isPersian ? "تومان" : "TOMAN";
        canvas.drawText(unitStr, iconX + pWidth + 20f, h - pad - 60f, unitPaint);
    }

    /**
     * 2 ASSETS MODE: Two Cards Side-by-Side or Stacked
     */
    private static void renderTwoCards(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        int pad = 20;
        int gap = 20;

        if (w >= h) {
            // Horizontal side-by-side
            int cardW = (w - (pad * 2) - gap) / 2;
            int cardH = h - (pad * 2);
            drawMiniCard(context, canvas, assets.get(0), pad, pad, cardW, cardH, theme, isPersian);
            drawMiniCard(context, canvas, assets.get(1), pad + cardW + gap, pad, cardW, cardH, theme, isPersian);
        } else {
            // Vertical stacked
            int cardW = w - (pad * 2);
            int cardH = (h - (pad * 2) - gap) / 2;
            drawMiniCard(context, canvas, assets.get(0), pad, pad, cardW, cardH, theme, isPersian);
            drawMiniCard(context, canvas, assets.get(1), pad, pad + cardH + gap, cardW, cardH, theme, isPersian);
        }
    }

    /**
     * 4 ASSETS MODE: 2x2 Grid (Responsive & Balanced in 1080p)
     */
    private static void renderFourCardsGrid(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        int pad = 20;
        int gap = 20;
        int cardW = (w - (pad * 2) - gap) / 2;
        int cardH = (h - (pad * 2) - gap) / 2;

        int col0 = pad;
        int col1 = pad + cardW + gap;
        int row0 = pad;
        int row1 = pad + cardH + gap;

        // Card 1 (Top-Left)
        if (assets.size() > 0) drawMiniCard(context, canvas, assets.get(0), col0, row0, cardW, cardH, theme, isPersian);
        // Card 2 (Top-Right)
        if (assets.size() > 1) drawMiniCard(context, canvas, assets.get(1), col1, row0, cardW, cardH, theme, isPersian);
        // Card 3 (Bottom-Left)
        if (assets.size() > 2) drawMiniCard(context, canvas, assets.get(2), col0, row1, cardW, cardH, theme, isPersian);
        // Card 4 (Bottom-Right)
        if (assets.size() > 3) drawMiniCard(context, canvas, assets.get(3), col1, row1, cardW, cardH, theme, isPersian);
    }

    /**
     * Renders a Single Mini Card in 1080p Ultra HD
     */
    private static void drawMiniCard(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset, int x, int y, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        Typeface tfTitle = isPersian ? getSfArabicBold(context) : getGsansBold(context);
        Typeface tfCode = isPersian ? getSfArabicBold(context) : getGsansMedium(context);
        Typeface tfPrice = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfChange = isPersian ? getVazirBold(context) : getGsansBold(context);

        RectF cardRect = new RectF(x, y, x + w, y + h);

        // Background & Border
        Paint bgPaint = createPaint(theme.bgColor, Paint.Style.FILL, 0);
        canvas.drawRoundRect(cardRect, 68f, 68f, bgPaint);

        Paint strokePaint = createPaint(theme.strokeColor, Paint.Style.STROKE, 3.5f);
        canvas.drawRoundRect(cardRect, 68f, 68f, strokePaint);

        // Top Row: Icon
        int iconSize = Math.max(86, Math.min(106, Math.round(Math.min(w, h) * 0.20f)));
        int iconX = x + 44;
        int iconY = y + 44;
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        // Top Row: Name & Code (Right-Aligned with generous margin matching reference sample)
        float textRight = x + w - 52f;
        String displayName = isPersian ? asset.name : cleanEnglishName(asset.englishName);

        float nameSize = Math.max(38f, Math.min(50f, w * 0.098f));
        Paint namePaint = createTextPaint(tfTitle, theme.titleColor, nameSize, Paint.Align.RIGHT);

        float maxNameWidth = textRight - (iconX + iconSize + 22f);
        if (namePaint.measureText(displayName) > maxNameWidth) {
            namePaint.setTextSize(nameSize * 0.84f);
        }
        canvas.drawText(displayName, textRight, iconY + 52f, namePaint);

        float codeSize = Math.max(26f, nameSize * 0.68f);
        Paint codePaint = createTextPaint(tfCode, theme.codeColor, codeSize, Paint.Align.RIGHT);
        canvas.drawText(asset.code, textRight, iconY + 98f, codePaint);

        // Bottom: Change Percentage (Left-Aligned with icon)
        float changeSize = Math.max(32f, Math.min(40f, w * 0.078f));
        int changeColor = asset.isPositive ? theme.posColor : theme.negColor;
        Paint changePaint = createTextPaint(tfChange, changeColor, changeSize, Paint.Align.LEFT);
        String changeStr = formatChangeText(asset.defaultChange, asset.isPositive, isPersian);
        canvas.drawText(changeStr, iconX, y + h - 124f, changePaint);

        // Bottom: Live Price (Bold, prominent, left-aligned)
        float priceSize = Math.max(62f, Math.min(78f, w * 0.155f));
        Paint pricePaint = createTextPaint(tfPrice, theme.priceColor, priceSize, Paint.Align.LEFT);

        String pStr = formatDigits(asset.defaultPrice, isPersian);
        float pWidth = pricePaint.measureText(pStr);
        float maxPriceWidth = w - 88f;
        if (pWidth > maxPriceWidth) {
            pricePaint.setTextSize(priceSize * 0.80f);
        }
        canvas.drawText(pStr, iconX, y + h - 42f, pricePaint);
    }
}
