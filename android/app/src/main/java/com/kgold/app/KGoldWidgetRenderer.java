package com.kgold.app;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
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

    /**
     * Main Entry: Render pixel-perfect luxury widget Bitmap
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

        // Calculate dynamic, responsive canvas dimensions to fit the user's widget cell exactly
        int minW = 0;
        int minH = 0;
        if (appWidgetManager != null && appWidgetId > 0) {
            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            if (options != null) {
                minW = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
                minH = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0);
            }
        }

        int canvasW = 720;
        int canvasH = 720;

        if (minW > 0 && minH > 0) {
            float ratio = (float) minW / (float) minH;
            if (assets.size() == 1) {
                // Single card: Allow graceful aspect ratio between 0.85 and 1.8
                canvasW = 720;
                float clampedRatio = Math.max(0.85f, Math.min(1.8f, ratio));
                canvasH = Math.round(canvasW / clampedRatio);
            } else if (assets.size() == 2) {
                // Two cards: naturally 1.35 to 2.4 ratio
                canvasW = 720;
                float clampedRatio = Math.max(1.35f, Math.min(2.4f, ratio));
                canvasH = Math.round(canvasW / clampedRatio);
            } else {
                // 3 to 4 cards: 2x2 grid ratio
                canvasW = 720;
                float clampedRatio = Math.max(0.85f, Math.min(1.6f, ratio));
                canvasH = Math.round(canvasW / clampedRatio);
            }
        } else {
            if (assets.size() == 2) {
                canvasW = 720;
                canvasH = 380;
            } else {
                canvasW = 720;
                canvasH = 720;
            }
        }

        Bitmap bitmap = Bitmap.createBitmap(canvasW, canvasH, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

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
     * 1 ASSET MODE: Single Responsive Card
     */
    private static void renderSingleCard(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        // Typography based on language:
        // Persian: SF Pro Arabic for words, Vazirmatn for numbers
        // English: Google Sans (Gsans) for BOTH words and numbers
        Typeface tfTitle = isPersian ? getSfArabicBold(context) : getGsansBold(context);
        Typeface tfCode = isPersian ? getSfArabicBold(context) : getGsansMedium(context);
        Typeface tfPrice = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfChange = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfUnit = isPersian ? getSfArabicRegular(context) : getGsansMedium(context);

        float pad = 14f;
        RectF cardRect = new RectF(pad, pad, w - pad, h - pad);

        // 1. Background
        Paint bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bgPaint.setColor(theme.bgColor);
        canvas.drawRoundRect(cardRect, 56f, 56f, bgPaint);

        // 2. Border
        Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setColor(theme.strokeColor);
        strokePaint.setStrokeWidth(theme.strokeWidth);
        canvas.drawRoundRect(cardRect, 56f, 56f, strokePaint);

        // 3. Top Row: Icon on Left, Name & Code on Right
        int iconSize = Math.max(90, Math.min(124, Math.round(Math.min(w, h) * 0.18f)));
        int iconX = Math.round(pad + 44f);
        int iconY = Math.round(pad + 44f);
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        // Title text (Persian name in Persian mode, English name in English mode)
        float textRight = w - pad - 48f;
        String displayName = isPersian ? asset.name : cleanEnglishName(asset.englishName);

        Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        namePaint.setTypeface(tfTitle);
        namePaint.setColor(theme.titleColor);
        float nameSize = Math.max(38f, Math.min(52f, w * 0.072f));
        namePaint.setTextSize(nameSize);
        namePaint.setTextAlign(Paint.Align.RIGHT);

        float maxNameWidth = textRight - (iconX + iconSize + 24f);
        if (namePaint.measureText(displayName) > maxNameWidth) {
            namePaint.setTextSize(nameSize * 0.85f);
        }
        canvas.drawText(displayName, textRight, iconY + iconSize * 0.44f, namePaint);

        Paint codePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        codePaint.setTypeface(tfCode);
        codePaint.setColor(theme.codeColor);
        codePaint.setTextSize(nameSize * 0.65f);
        codePaint.setTextAlign(Paint.Align.RIGHT);
        canvas.drawText(asset.code, textRight, iconY + iconSize * 0.86f, codePaint);

        // 4. Bottom Row: Change Percentage (Left-Aligned)
        Paint changePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        changePaint.setTypeface(tfChange);
        float changeSize = Math.max(30f, Math.min(42f, w * 0.058f));
        changePaint.setTextSize(changeSize);
        changePaint.setColor(asset.isPositive ? theme.posColor : theme.negColor);
        changePaint.setTextAlign(Paint.Align.LEFT);
        String changeStr = formatChangeText(asset.defaultChange, asset.isPositive, isPersian);
        canvas.drawText(changeStr, iconX, h - pad - 124f, changePaint);

        // 5. Live Price & Unit
        Paint pricePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pricePaint.setTypeface(tfPrice);
        pricePaint.setColor(theme.priceColor);
        float priceSize = Math.max(56f, Math.min(84f, w * 0.115f));
        pricePaint.setTextSize(priceSize);
        pricePaint.setTextAlign(Paint.Align.LEFT);

        String pStr = formatDigits(asset.defaultPrice, isPersian);
        float pWidth = pricePaint.measureText(pStr);
        if (pWidth > (w - iconX * 2 - 140f)) {
            pricePaint.setTextSize(priceSize * 0.82f);
            pWidth = pricePaint.measureText(pStr);
        }
        canvas.drawText(pStr, iconX, h - pad - 42f, pricePaint);

        Paint unitPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        unitPaint.setTypeface(tfUnit);
        unitPaint.setColor(theme.unitColor);
        unitPaint.setTextSize(priceSize * 0.38f);
        unitPaint.setTextAlign(Paint.Align.LEFT);
        String unitStr = isPersian ? "تومان" : "TOMAN";
        canvas.drawText(unitStr, iconX + pWidth + 18f, h - pad - 42f, unitPaint);
    }

    /**
     * 2 ASSETS MODE: Two Cards Side-by-Side
     */
    private static void renderTwoCards(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        int pad = 12;
        int gap = 14;
        int cardW = (w - (pad * 2) - gap) / 2;
        int cardH = h - (pad * 2);

        drawMiniCard(context, canvas, assets.get(0), pad, pad, cardW, cardH, theme, isPersian);
        drawMiniCard(context, canvas, assets.get(1), pad + cardW + gap, pad, cardW, cardH, theme, isPersian);
    }

    /**
     * 4 ASSETS MODE: 2x2 Grid (Responsive & Balanced)
     */
    private static void renderFourCardsGrid(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        int pad = 12;
        int gap = 14;
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
     * Renders a Single Mini Card (in 2-asset or 4-asset mode)
     */
    private static void drawMiniCard(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset, int x, int y, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        Typeface tfTitle = isPersian ? getSfArabicBold(context) : getGsansBold(context);
        Typeface tfCode = isPersian ? getSfArabicBold(context) : getGsansMedium(context);
        Typeface tfPrice = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfChange = isPersian ? getVazirBold(context) : getGsansBold(context);

        RectF cardRect = new RectF(x, y, x + w, y + h);

        // Background
        Paint bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bgPaint.setColor(theme.bgColor);
        canvas.drawRoundRect(cardRect, 48f, 48f, bgPaint);

        // Border
        Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setColor(theme.strokeColor);
        strokePaint.setStrokeWidth(theme.strokeWidth);
        canvas.drawRoundRect(cardRect, 48f, 48f, strokePaint);

        // Top Row: Icon
        int iconSize = Math.max(62, Math.min(74, Math.round(Math.min(w, h) * 0.21f)));
        int iconX = x + 32;
        int iconY = y + 32;
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        // Top Row: Name & Code (Right-Aligned with generous margin matching reference sample)
        float textRight = x + w - 38f;
        String displayName = isPersian ? asset.name : cleanEnglishName(asset.englishName);

        Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        namePaint.setTypeface(tfTitle);
        namePaint.setColor(theme.titleColor);
        float nameSize = Math.max(28f, Math.min(35f, w * 0.102f));
        namePaint.setTextSize(nameSize);
        namePaint.setTextAlign(Paint.Align.RIGHT);

        float maxNameWidth = textRight - (iconX + iconSize + 16f);
        if (namePaint.measureText(displayName) > maxNameWidth) {
            namePaint.setTextSize(nameSize * 0.84f);
        }
        canvas.drawText(displayName, textRight, iconY + 36f, namePaint);

        Paint codePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        codePaint.setTypeface(tfCode);
        codePaint.setColor(theme.codeColor);
        codePaint.setTextSize(Math.max(20f, nameSize * 0.68f));
        codePaint.setTextAlign(Paint.Align.RIGHT);
        canvas.drawText(asset.code, textRight, iconY + 68f, codePaint);

        // Bottom: Change Percentage (Left-Aligned with icon)
        Paint changePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        changePaint.setTypeface(tfChange);
        float changeSize = Math.max(23f, Math.min(28f, w * 0.080f));
        changePaint.setTextSize(changeSize);
        changePaint.setColor(asset.isPositive ? theme.posColor : theme.negColor);
        changePaint.setTextAlign(Paint.Align.LEFT);
        String changeStr = formatChangeText(asset.defaultChange, asset.isPositive, isPersian);
        canvas.drawText(changeStr, iconX, y + h - 86f, changePaint);

        // Bottom: Live Price (Bold, prominent, left-aligned)
        Paint pricePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pricePaint.setTypeface(tfPrice);
        pricePaint.setColor(theme.priceColor);
        float priceSize = Math.max(44f, Math.min(54f, w * 0.155f));
        pricePaint.setTextSize(priceSize);
        pricePaint.setTextAlign(Paint.Align.LEFT);

        String pStr = formatDigits(asset.defaultPrice, isPersian);
        float pWidth = pricePaint.measureText(pStr);
        float maxPriceWidth = w - 64f;
        if (pWidth > maxPriceWidth) {
            pricePaint.setTextSize(priceSize * 0.80f);
        }
        canvas.drawText(pStr, iconX, y + h - 30f, pricePaint);
    }
}
