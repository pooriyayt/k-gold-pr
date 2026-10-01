package com.kgold.app;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Bundle;

import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

public class KGoldWidgetRenderer {

    private static Typeface sBoldTypeface = null;
    private static Typeface sRegularTypeface = null;

    public static Typeface getBoldTypeface(Context context) {
        if (sBoldTypeface == null) {
            try {
                sBoldTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/SFProArabic-Bold.ttf");
            } catch (Exception e1) {
                try {
                    sBoldTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/SF-Arabic-700.ttf");
                } catch (Exception e2) {
                    sBoldTypeface = Typeface.DEFAULT_BOLD;
                }
            }
        }
        return sBoldTypeface;
    }

    public static Typeface getRegularTypeface(Context context) {
        if (sRegularTypeface == null) {
            try {
                sRegularTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/SFArabic-Regular.ttf");
            } catch (Exception e1) {
                try {
                    sRegularTypeface = Typeface.createFromAsset(context.getAssets(), "public/fonts/SF-Arabic-500.ttf");
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

        // Standard crisp canvas (720 x 720) for 1:1 square
        int canvasW = 720;
        int canvasH = 720;

        if (appWidgetManager != null && appWidgetId > 0) {
            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            if (options != null) {
                int minW = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
                int minH = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0);
                // If user resized explicitly to wide rectangle (e.g. 4x2 cells or 2x1 cells)
                if (minW > 0 && minH > 0) {
                    if (assets.size() == 2 && minW >= minH * 1.35) {
                        canvasW = 720;
                        canvasH = 360;
                    } else if (minW >= minH * 1.55) {
                        canvasW = 1080;
                        canvasH = 540;
                    }
                }
            }
        }

        Bitmap bitmap = Bitmap.createBitmap(canvasW, canvasH, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        if (canvasW > canvasH) {
            if (assets.size() == 2) {
                renderTwoCards(context, canvas, assets, canvasW, canvasH);
            } else {
                renderWideLayout(context, canvas, assets, canvasW, canvasH);
            }
        } else {
            // Square 1:1 format (Default & Recommended)
            if (assets.size() == 1) {
                renderSingleSquareCard(context, canvas, assets.get(0), canvasW, canvasH);
            } else if (assets.size() == 2) {
                renderTwoCards(context, canvas, assets, canvasW, canvasH);
            } else {
                renderFourCardsGrid(context, canvas, assets, canvasW, canvasH);
            }
        }

        return bitmap;
    }

    /**
     * 1 ASSET MODE: Single Large Luxury Square Card
     */
    private static void renderSingleSquareCard(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset, int w, int h) {
        Typeface tfBold = getBoldTypeface(context);
        Typeface tfRegular = getRegularTypeface(context);

        // Card bounds
        RectF cardRect = new RectF(16f, 16f, w - 16f, h - 16f);

        // 1. Card Background
        Paint bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bgPaint.setColor(0xFFFFFFFF);
        canvas.drawRoundRect(cardRect, 56f, 56f, bgPaint);

        // 2. Card Subtle Border
        Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setColor(0xFFE2E8F0);
        strokePaint.setStrokeWidth(3f);
        canvas.drawRoundRect(cardRect, 56f, 56f, strokePaint);

        // 3. Top Row: Icon on Left, Name & Code on Right
        int iconSize = 120;
        int iconX = 54;
        int iconY = 54;
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        namePaint.setTypeface(tfBold);
        namePaint.setColor(0xFF0F172A);
        namePaint.setTextSize(44f);
        namePaint.setTextAlign(Paint.Align.RIGHT);
        canvas.drawText(cleanName(asset.englishName), w - 54f, 108f, namePaint);

        Paint codePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        codePaint.setTypeface(tfBold);
        codePaint.setColor(0xFF64748B);
        codePaint.setTextSize(28f);
        codePaint.setTextAlign(Paint.Align.RIGHT);
        canvas.drawText(asset.code, w - 54f, 156f, codePaint);

        // 4. Bottom Row: Change Percentage
        Paint changePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        changePaint.setTypeface(tfBold);
        changePaint.setTextSize(38f);
        changePaint.setColor(asset.isPositive ? 0xFF16A34A : 0xFFDC2626);
        changePaint.setTextAlign(Paint.Align.LEFT);
        canvas.drawText(toPersianDigits(asset.defaultChange), 54f, h - 170f, changePaint);

        // 5. Live Price & "تومان"
        Paint pricePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pricePaint.setTypeface(tfBold);
        pricePaint.setColor(0xFF0F172A);
        pricePaint.setTextSize(72f);
        pricePaint.setTextAlign(Paint.Align.LEFT);
        String pStr = toPersianDigits(asset.defaultPrice);
        canvas.drawText(pStr, 54f, h - 74f, pricePaint);

        float pWidth = pricePaint.measureText(pStr);
        Paint unitPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        unitPaint.setTypeface(tfRegular);
        unitPaint.setColor(0xFF94A3B8);
        unitPaint.setTextSize(28f);
        unitPaint.setTextAlign(Paint.Align.LEFT);
        canvas.drawText("تومان", 54f + pWidth + 18f, h - 74f, unitPaint);
    }

    /**
     * 2 ASSETS MODE: Two Square Cards Centered
     */
    private static void renderTwoCards(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h) {
        int cardW = 342;
        int cardH = Math.min(342, h - 18);
        int gap = 12;
        int startX = (w - (cardW * 2 + gap)) / 2;
        int startY = (h - cardH) / 2;

        drawMiniCard(context, canvas, assets.get(0), startX, startY, cardW, cardH);
        drawMiniCard(context, canvas, assets.get(1), startX + cardW + gap, startY, cardW, cardH);
    }

    /**
     * 4 ASSETS MODE: 2x2 Square Grid
     */
    private static void renderFourCardsGrid(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h) {
        int cardW = 342;
        int cardH = 342;
        int pad = 12;
        int gap = 12;

        int col0 = pad;
        int col1 = pad + cardW + gap;
        int row0 = pad;
        int row1 = pad + cardH + gap;

        // Card 1 (Top-Left)
        if (assets.size() > 0) drawMiniCard(context, canvas, assets.get(0), col0, row0, cardW, cardH);
        // Card 2 (Top-Right)
        if (assets.size() > 1) drawMiniCard(context, canvas, assets.get(1), col1, row0, cardW, cardH);
        // Card 3 (Bottom-Left)
        if (assets.size() > 2) drawMiniCard(context, canvas, assets.get(2), col0, row1, cardW, cardH);
        // Card 4 (Bottom-Right)
        if (assets.size() > 3) drawMiniCard(context, canvas, assets.get(3), col1, row1, cardW, cardH);
    }

    /**
     * Wide Layout (when widget is resized to 4x2 wide rectangle)
     */
    private static void renderWideLayout(Context context, Canvas canvas, List<WidgetConfigureActivity.AssetItem> assets, int w, int h) {
        int count = Math.min(assets.size(), 4);
        int gap = 14;
        int pad = 14;
        int totalGaps = (count - 1) * gap;
        int cardW = (w - (pad * 2) - totalGaps) / count;
        int cardH = h - (pad * 2);

        for (int i = 0; i < count; i++) {
            int cx = pad + i * (cardW + gap);
            drawMiniCard(context, canvas, assets.get(i), cx, pad, cardW, cardH);
        }
    }

    /**
     * Renders a Single Mini Card (used in 2x2 Grid or Wide mode)
     */
    private static void drawMiniCard(Context context, Canvas canvas, WidgetConfigureActivity.AssetItem asset, int x, int y, int w, int h) {
        Typeface tfBold = getBoldTypeface(context);

        RectF cardRect = new RectF(x, y, x + w, y + h);

        // Background
        Paint bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        bgPaint.setColor(0xFFFFFFFF);
        canvas.drawRoundRect(cardRect, 44f, 44f, bgPaint);

        // Border
        Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setColor(0xFFE2E8F0);
        strokePaint.setStrokeWidth(2.5f);
        canvas.drawRoundRect(cardRect, 44f, 44f, strokePaint);

        // Top Row: Icon
        int iconSize = 72;
        int iconX = x + 24;
        int iconY = y + 24;
        Drawable icon = ContextCompat.getDrawable(context, asset.iconRes);
        if (icon != null) {
            icon.setBounds(iconX, iconY, iconX + iconSize, iconY + iconSize);
            icon.draw(canvas);
        }

        // Top Row: Name & Code (Right-Aligned)
        Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        namePaint.setTypeface(tfBold);
        namePaint.setColor(0xFF0F172A);
        namePaint.setTextSize(26f);
        namePaint.setTextAlign(Paint.Align.RIGHT);

        String name = cleanName(asset.englishName);
        if (namePaint.measureText(name) > (w - 120f)) {
            namePaint.setTextSize(22f);
        }
        canvas.drawText(name, x + w - 24f, y + 54f, namePaint);

        Paint codePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        codePaint.setTypeface(tfBold);
        codePaint.setColor(0xFF64748B);
        codePaint.setTextSize(20f);
        codePaint.setTextAlign(Paint.Align.RIGHT);
        canvas.drawText(asset.code, x + w - 24f, y + 84f, codePaint);

        // Bottom: Change Percentage (Left-Aligned)
        Paint changePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        changePaint.setTypeface(tfBold);
        changePaint.setTextSize(26f);
        changePaint.setColor(asset.isPositive ? 0xFF16A34A : 0xFFDC2626);
        changePaint.setTextAlign(Paint.Align.LEFT);
        canvas.drawText(toPersianDigits(asset.defaultChange), x + 24f, y + h - 82f, changePaint);

        // Bottom: Live Price (Left-Aligned, SF Pro Arabic Bold)
        Paint pricePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pricePaint.setTypeface(tfBold);
        pricePaint.setColor(0xFF0F172A);
        pricePaint.setTextSize(44f);
        pricePaint.setTextAlign(Paint.Align.LEFT);

        String pStr = toPersianDigits(asset.defaultPrice);
        float pWidth = pricePaint.measureText(pStr);
        if (pWidth > (w - 48f)) {
            pricePaint.setTextSize(34f);
        }
        canvas.drawText(pStr, x + 24f, y + h - 28f, pricePaint);
    }
}
