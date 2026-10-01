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
        if (name.equalsIgnoreCase("Tether USD") || name.equalsIgnoreCase("Tether USDT") || name.equalsIgnoreCase("Tether")) return "Tether";
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
            c.strokeWidth = 2.8f;
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
     * Main Entry: Render pixel-perfect luxury widget Bitmap in Ultra HD Retina resolution (1080p).
     * The entire widget is rendered as ONE unified rectangular card box matching the launcher slot.
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
        // Mandatory minimum 2 currencies
        if (assets.size() < 2) {
            if (!assetKeys.contains("usd")) assets.add(WidgetConfigureActivity.getAssetByKey(context, "usd", isPersian));
            if (!assetKeys.contains("emami")) assets.add(WidgetConfigureActivity.getAssetByKey(context, "emami", isPersian));
        }

        WidgetThemeConfig themeConfig = WidgetThemeConfig.get();

        // Calculate dynamic, responsive canvas dimensions based on launcher's actual size
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
        int canvasH;

        if (minW > 0 && minH > 0) {
            float ratio = (float) minW / (float) minH;
            float clampedRatio = Math.max(0.95f, Math.min(3.2f, ratio));
            canvasH = Math.round(canvasW / clampedRatio);
        } else {
            // Default wide card
            if (assets.size() == 2) {
                canvasH = 480; // 2.25:1 aspect ratio
            } else {
                canvasH = 680; // 1.58:1 aspect ratio
            }
        }
        canvasH = Math.max(360, Math.min(1200, canvasH));

        Bitmap bitmap = Bitmap.createBitmap(canvasW, canvasH, Bitmap.Config.ARGB_8888);
        bitmap.setDensity(context.getResources().getDisplayMetrics().densityDpi);
        Canvas canvas = new Canvas(bitmap);
        canvas.setDrawFilter(new PaintFlagsDrawFilter(0,
                Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG | Paint.DITHER_FLAG | Paint.SUBPIXEL_TEXT_FLAG));

        // 1. Draw ONE UNIFIED RECTANGULAR BOX
        float pad = 10f;
        RectF cardRect = new RectF(pad, pad, canvasW - pad, canvasH - pad);
        float cornerRadius = 54f;

        // Solid pure white background
        Paint bgPaint = createPaint(themeConfig.bgColor, Paint.Style.FILL, 0);
        canvas.drawRoundRect(cardRect, cornerRadius, cornerRadius, bgPaint);

        // Elegant border stroke
        Paint strokePaint = createPaint(themeConfig.strokeColor, Paint.Style.STROKE, themeConfig.strokeWidth);
        canvas.drawRoundRect(cardRect, cornerRadius, cornerRadius, strokePaint);

        // 2. Render items with subtle divider lines
        Paint dividerPaint = createPaint(0xFFF1F5F9, Paint.Style.STROKE, 2.5f);

        if (assets.size() == 2) {
            // 2 ASSETS: Left and Right Columns
            float midX = canvasW / 2f;
            canvas.drawLine(midX, pad + 32f, midX, canvasH - pad - 32f, dividerPaint);

            float colW = midX - pad;
            float colH = canvasH - pad * 2f;
            drawItemInSlot(context, canvas, assets.get(0), pad, pad, colW, colH, themeConfig, isPersian);
            drawItemInSlot(context, canvas, assets.get(1), midX, pad, colW, colH, themeConfig, isPersian);
        } else {
            // 3 or 4 ASSETS: 2x2 Quadrant Grid inside the single rectangular box
            float midX = canvasW / 2f;
            float midY = canvasH / 2f;
            canvas.drawLine(midX, pad + 24f, midX, canvasH - pad - 24f, dividerPaint);
            canvas.drawLine(pad + 24f, midY, canvasW - pad - 24f, midY, dividerPaint);

            float quadW = midX - pad;
            float quadH = midY - pad;

            if (assets.size() > 0) drawItemInSlot(context, canvas, assets.get(0), pad, pad, quadW, quadH, themeConfig, isPersian);
            if (assets.size() > 1) drawItemInSlot(context, canvas, assets.get(1), midX, pad, quadW, quadH, themeConfig, isPersian);
            if (assets.size() > 2) drawItemInSlot(context, canvas, assets.get(2), pad, midY, quadW, quadH, themeConfig, isPersian);
            if (assets.size() > 3) drawItemInSlot(context, canvas, assets.get(3), midX, midY, quadW, quadH, themeConfig, isPersian);
        }

        return bitmap;
    }

    /**
     * Renders a Single Currency Item inside a designated slot of the unified card.
     */
    private static void drawItemInSlot(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset,
                                       float slotX, float slotY, float slotW, float slotH,
                                       WidgetThemeConfig theme, boolean isPersian) {
        Typeface tfTitle = isPersian ? getSfArabicBold(context) : getGsansBold(context);
        Typeface tfCode = isPersian ? getSfArabicBold(context) : getGsansMedium(context);
        Typeface tfPrice = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfChange = isPersian ? getVazirBold(context) : getGsansBold(context);
        Typeface tfUnit = isPersian ? getSfArabicRegular(context) : getGsansMedium(context);

        boolean isCompact = slotH <= 340f;

        // 1. Icon (Left-Aligned in slot)
        int iconSize = isCompact ?
                Math.max(74, Math.min(94, Math.round(slotH * 0.24f))) :
                Math.max(92, Math.min(116, Math.round(slotH * 0.23f)));
        float iconX = slotX + (isCompact ? 28f : 36f);
        float iconY = slotY + (isCompact ? 24f : 32f);

        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(Math.round(iconX), Math.round(iconY), Math.round(iconX + iconSize), Math.round(iconY + iconSize));
            icon.draw(canvas);
        }

        // 2. Name & Code (Right-Aligned with generous margin)
        float textRight = slotX + slotW - (isCompact ? 28f : 36f);
        String displayName = isPersian ? asset.name : cleanEnglishName(asset.englishName);

        float nameSize = isCompact ?
                Math.max(38f, Math.min(44f, slotW * 0.082f)) :
                Math.max(44f, Math.min(50f, slotW * 0.092f));
        Paint namePaint = createTextPaint(tfTitle, theme.titleColor, nameSize, Paint.Align.RIGHT);

        float maxNameWidth = textRight - (iconX + iconSize + 18f);
        if (namePaint.measureText(displayName) > maxNameWidth) {
            namePaint.setTextSize(nameSize * 0.82f);
        }
        float nameY = iconY + (iconSize * 0.44f);
        canvas.drawText(displayName, textRight, nameY, namePaint);

        float codeSize = isCompact ?
                Math.max(24f, Math.min(28f, nameSize * 0.65f)) :
                Math.max(26f, Math.min(32f, nameSize * 0.68f));
        Paint codePaint = createTextPaint(tfCode, theme.codeColor, codeSize, Paint.Align.RIGHT);
        float codeY = iconY + (iconSize * 0.88f);
        canvas.drawText(asset.code, textRight, codeY, codePaint);

        // 3. Change Percentage (Left-Aligned with icon)
        float changeSize = isCompact ?
                Math.max(28f, Math.min(34f, slotW * 0.068f)) :
                Math.max(34f, Math.min(40f, slotW * 0.076f));
        int changeColor = asset.isPositive ? theme.posColor : theme.negColor;
        Paint changePaint = createTextPaint(tfChange, changeColor, changeSize, Paint.Align.LEFT);
        String changeStr = formatChangeText(asset.defaultChange, asset.isPositive, isPersian);

        float changeY = isCompact ? (slotY + slotH - 78f) : (slotY + slotH - 108f);
        canvas.drawText(changeStr, iconX, changeY, changePaint);

        // 4. Live Price & Unit (Left-Aligned with icon)
        float priceSize = isCompact ?
                Math.max(50f, Math.min(62f, slotW * 0.118f)) :
                Math.max(64f, Math.min(76f, slotW * 0.144f));
        Paint pricePaint = createTextPaint(tfPrice, theme.priceColor, priceSize, Paint.Align.LEFT);

        String pStr = formatDigits(asset.defaultPrice, isPersian);
        float pWidth = pricePaint.measureText(pStr);
        float maxPriceWidth = slotW - 74f;
        if (pWidth > maxPriceWidth) {
            pricePaint.setTextSize(priceSize * 0.80f);
            pWidth = pricePaint.measureText(pStr);
        }

        float priceY = isCompact ? (slotY + slotH - 24f) : (slotY + slotH - 38f);
        canvas.drawText(pStr, iconX, priceY, pricePaint);

        // Currency Unit ("تومان" / "TOMAN")
        float unitSize = isCompact ? 22f : 28f;
        Paint unitPaint = createTextPaint(tfUnit, theme.unitColor, unitSize, Paint.Align.LEFT);
        String unitStr = isPersian ? "تومان" : "TOMAN";
        float unitX = iconX + pWidth + 14f;
        if (unitX + unitPaint.measureText(unitStr) < slotX + slotW - 14f) {
            canvas.drawText(unitStr, unitX, priceY, unitPaint);
        }
    }
}
