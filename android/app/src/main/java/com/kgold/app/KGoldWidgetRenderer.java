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

    private static Typeface sBoldTypeface = null;
    private static Typeface sMediumTypeface = null;
    private static Typeface sRegularTypeface = null;

    public static Typeface getBoldTypeface(Context context) {
        if (sBoldTypeface == null) {
            try {
                sBoldTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/Vazirmatn-Bold.ttf");
            } catch (Exception e1) {
                try {
                    sBoldTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/SFProArabic-Bold.ttf");
                } catch (Exception e2) {
                    sBoldTypeface = Typeface.DEFAULT_BOLD;
                }
            }
        }
        return sBoldTypeface;
    }

    public static Typeface getMediumTypeface(Context context) {
        if (sMediumTypeface == null) {
            try {
                sMediumTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/Vazirmatn-Medium.ttf");
            } catch (Exception e1) {
                try {
                    sMediumTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/SF-Arabic-600.ttf");
                } catch (Exception e2) {
                    sMediumTypeface = Typeface.DEFAULT_BOLD;
                }
            }
        }
        return sMediumTypeface;
    }

    public static Typeface getRegularTypeface(Context context) {
        if (sRegularTypeface == null) {
            try {
                sRegularTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/Vazirmatn-Regular.ttf");
            } catch (Exception e1) {
                try {
                    sRegularTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/SFArabic-Regular.ttf");
                } catch (Exception e2) {
                    sRegularTypeface = Typeface.DEFAULT;
                }
            }
        }
        return sRegularTypeface;
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

    public static String cleanName(String name) {
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

        public static WidgetThemeConfig get(boolean isTransparent) {
            WidgetThemeConfig c = new WidgetThemeConfig();
            if (isTransparent) {
                // Glassmorphic translucent dark acrylic glass (~70% dark navy)
                c.bgColor = 0xB30F172A;
                c.strokeColor = 0x33FFFFFF;
                c.strokeWidth = 2.5f;
                c.titleColor = 0xFFFFFFFF;
                c.codeColor = 0xFF94A3B8;
                c.priceColor = 0xFFFFFFFF;
                c.unitColor = 0xFF94A3B8;
                c.posColor = 0xFF4ADE80; // Bright neon emerald
                c.negColor = 0xFFF87171; // Bright coral red
            } else {
                // Solid crisp white
                c.bgColor = 0xFFFFFFFF;
                c.strokeColor = 0xFFE2E8F0;
                c.strokeWidth = 2.5f;
                c.titleColor = 0xFF0F172A;
                c.codeColor = 0xFF64748B;
                c.priceColor = 0xFF0F172A;
                c.unitColor = 0xFF94A3B8;
                c.posColor = 0xFF16A34A;
                c.negColor = 0xFFDC2626;
            }
            return c;
        }
    }

    /**
     * Main Entry: Render pixel-perfect luxury widget Bitmap
     */
    public static Bitmap renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId, List<String> assetKeys) {
        List<WidgetConfigureActivity.AssetItem> assets = new ArrayList<>();
        for (String k : assetKeys) {
            assets.add(WidgetConfigureActivity.getAssetByKey(context, k));
        }
        if (assets.isEmpty()) {
            assets.add(WidgetConfigureActivity.getAssetByKey(context, "usd"));
        }

        // Read user preferences
        SharedPreferences prefs = context.getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE);
        String digitsLang = prefs.getString(WidgetConfigureActivity.PREF_DIGITS_LANG_PREFIX + appWidgetId, null);
        if (digitsLang == null) {
            digitsLang = prefs.getString("widget_digits_lang", "fa");
        }
        boolean isPersianDigits = !"en".equalsIgnoreCase(digitsLang);

        String theme = prefs.getString(WidgetConfigureActivity.PREF_THEME_PREFIX + appWidgetId, null);
        if (theme == null) {
            theme = prefs.getString("widget_theme", "white");
        }
        boolean isTransparent = "transparent".equalsIgnoreCase(theme);
        WidgetThemeConfig themeConfig = WidgetThemeConfig.get(isTransparent);

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
                // Two cards: naturally 1.5 to 2.4 ratio
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
            renderSingleCard(context, canvas, assets.get(0), canvasW, canvasH, themeConfig, isPersianDigits);
        } else if (assets.size() == 2) {
            renderTwoCards(context, canvas, assets, canvasW, canvasH, themeConfig, isPersianDigits);
        } else {
            renderFourCardsGrid(context, canvas, assets, canvasW, canvasH, themeConfig, isPersianDigits);
        }

        return bitmap;
    }

    /**
     * 1 ASSET MODE: Single Responsive Luxury Card (fits the widget bounds cleanly)
     */
    private static void renderSingleCard(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        Typeface tfBold = getBoldTypeface(context);
        Typeface tfRegular = getRegularTypeface(context);

        float pad = 12f;
        RectF cardRect = new RectF(pad, pad, w - pad, h - pad);

        // 1. Background
        Paint bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bgPaint.setColor(theme.bgColor);
        canvas.drawRoundRect(cardRect, 50f, 50f, bgPaint);

        // 2. Border
        Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setColor(theme.strokeColor);
        strokePaint.setStrokeWidth(theme.strokeWidth);
        canvas.drawRoundRect(cardRect, 50f, 50f, strokePaint);

        // 3. Top Row: Icon on Left, Name & Code on Right
        int iconSize = Math.max(76, Math.min(116, Math.round(Math.min(w, h) * 0.17f)));
        int iconX = Math.round(pad + 36f);
        int iconY = Math.round(pad + 36f);
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        namePaint.setTypeface(tfBold);
        namePaint.setColor(theme.titleColor);
        float nameSize = Math.max(30f, Math.min(44f, w * 0.058f));
        namePaint.setTextSize(nameSize);
        namePaint.setTextAlign(Paint.Align.RIGHT);

        String name = cleanName(asset.englishName);
        if (namePaint.measureText(name) > (w - iconSize - 120f)) {
            namePaint.setTextSize(nameSize * 0.85f);
        }
        canvas.drawText(name, w - pad - 36f, iconY + iconSize * 0.44f, namePaint);

        Paint codePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        codePaint.setTypeface(tfBold);
        codePaint.setColor(theme.codeColor);
        codePaint.setTextSize(nameSize * 0.62f);
        codePaint.setTextAlign(Paint.Align.RIGHT);
        canvas.drawText(asset.code, w - pad - 36f, iconY + iconSize * 0.84f, codePaint);

        // 4. Bottom Row: Change Percentage
        Paint changePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        changePaint.setTypeface(tfBold);
        float changeSize = Math.max(26f, Math.min(38f, w * 0.052f));
        changePaint.setTextSize(changeSize);
        changePaint.setColor(asset.isPositive ? theme.posColor : theme.negColor);
        changePaint.setTextAlign(Paint.Align.LEFT);
        String changeStr = formatChangeText(asset.defaultChange, asset.isPositive, isPersian);
        canvas.drawText(changeStr, iconX, h - pad - 110f, changePaint);

        // 5. Live Price & Unit
        Paint pricePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pricePaint.setTypeface(tfBold);
        pricePaint.setColor(theme.priceColor);
        float priceSize = Math.max(48f, Math.min(74f, w * 0.098f));
        pricePaint.setTextSize(priceSize);
        pricePaint.setTextAlign(Paint.Align.LEFT);

        String pStr = formatDigits(asset.defaultPrice, isPersian);
        float pWidth = pricePaint.measureText(pStr);
        if (pWidth > (w - iconX * 2 - 120f)) {
            pricePaint.setTextSize(priceSize * 0.82f);
            pWidth = pricePaint.measureText(pStr);
        }
        canvas.drawText(pStr, iconX, h - pad - 38f, pricePaint);

        Paint unitPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        unitPaint.setTypeface(tfRegular);
        unitPaint.setColor(theme.unitColor);
        unitPaint.setTextSize(priceSize * 0.38f);
        unitPaint.setTextAlign(Paint.Align.LEFT);
        canvas.drawText("تومان", iconX + pWidth + 16f, h - pad - 38f, unitPaint);
    }

    /**
     * 2 ASSETS MODE: Two Cards Side-by-Side
     */
    private static void renderTwoCards(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        int pad = 10;
        int gap = 12;
        int cardW = (w - (pad * 2) - gap) / 2;
        int cardH = h - (pad * 2);

        drawMiniCard(context, canvas, assets.get(0), pad, pad, cardW, cardH, theme, isPersian);
        drawMiniCard(context, canvas, assets.get(1), pad + cardW + gap, pad, cardW, cardH, theme, isPersian);
    }

    /**
     * 4 ASSETS MODE: 2x2 Grid (Responsive & Balanced)
     */
    private static void renderFourCardsGrid(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h, WidgetThemeConfig theme, boolean isPersian) {
        int pad = 10;
        int gap = 12;
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
        Typeface tfBold = getBoldTypeface(context);

        RectF cardRect = new RectF(x, y, x + w, y + h);

        // Background
        Paint bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bgPaint.setColor(theme.bgColor);
        canvas.drawRoundRect(cardRect, 40f, 40f, bgPaint);

        // Border
        Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setColor(theme.strokeColor);
        strokePaint.setStrokeWidth(theme.strokeWidth);
        canvas.drawRoundRect(cardRect, 40f, 40f, strokePaint);

        // Top Row: Icon
        int iconSize = Math.max(52, Math.min(76, Math.round(Math.min(w, h) * 0.22f)));
        int iconX = x + 20;
        int iconY = y + 20;
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        // Top Row: Name & Code (Right-Aligned)
        Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        namePaint.setTypeface(tfBold);
        namePaint.setColor(theme.titleColor);
        float nameSize = Math.max(20f, Math.min(26f, w * 0.076f));
        namePaint.setTextSize(nameSize);
        namePaint.setTextAlign(Paint.Align.RIGHT);

        String name = cleanName(asset.englishName);
        if (namePaint.measureText(name) > (w - iconSize - 55f)) {
            namePaint.setTextSize(nameSize * 0.82f);
        }
        canvas.drawText(name, x + w - 20f, iconY + iconSize * 0.44f, namePaint);

        Paint codePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        codePaint.setTypeface(tfBold);
        codePaint.setColor(theme.codeColor);
        codePaint.setTextSize(nameSize * 0.72f);
        codePaint.setTextAlign(Paint.Align.RIGHT);
        canvas.drawText(asset.code, x + w - 20f, iconY + iconSize * 0.84f, codePaint);

        // Bottom: Change Percentage (Left-Aligned)
        Paint changePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        changePaint.setTypeface(tfBold);
        float changeSize = Math.max(19f, Math.min(26f, w * 0.072f));
        changePaint.setTextSize(changeSize);
        changePaint.setColor(asset.isPositive ? theme.posColor : theme.negColor);
        changePaint.setTextAlign(Paint.Align.LEFT);
        String changeStr = formatChangeText(asset.defaultChange, asset.isPositive, isPersian);
        canvas.drawText(changeStr, x + 20f, y + h - 72f, changePaint);

        // Bottom: Live Price
        Paint pricePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pricePaint.setTypeface(tfBold);
        pricePaint.setColor(theme.priceColor);
        float priceSize = Math.max(30f, Math.min(44f, w * 0.125f));
        pricePaint.setTextSize(priceSize);
        pricePaint.setTextAlign(Paint.Align.LEFT);

        String pStr = formatDigits(asset.defaultPrice, isPersian);
        float pWidth = pricePaint.measureText(pStr);
        if (pWidth > (w - 40f)) {
            pricePaint.setTextSize(priceSize * 0.8f);
        }
        canvas.drawText(pStr, x + 20f, y + h - 24f, pricePaint);
    }
}
