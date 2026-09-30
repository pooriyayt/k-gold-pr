package com.kgold.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class KGoldWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_AUTO_UPDATE = "com.kgold.app.ACTION_AUTO_UPDATE";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        // Fetch fresh prices from server in background
        fetchAndSyncLatestPrices(context);
        // Ensure repeating background update alarm is active
        scheduleAutoUpdate(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent != null ? intent.getAction() : null;
        if (ACTION_AUTO_UPDATE.equals(action) ||
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_USER_PRESENT.equals(action)) {
            fetchAndSyncLatestPrices(context);
            scheduleAutoUpdate(context);
        }
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

    public static String formatChangeText(String change, boolean isPositive) {
        if (change == null || change.trim().isEmpty()) {
            return isPositive ? "+۰.۰۰٪ ↗" : "-۰.۰۰٪ ↘";
        }
        boolean isNeg = change.contains("-") || !isPositive;
        String clean = change.replaceAll("[+\\-\\s%٪↗↘]", "").trim();
        if (clean.isEmpty()) clean = "0.00";
        String arrow = isNeg ? " ↘" : " ↗";
        String sign = isNeg ? "-" : "+";
        return toPersianDigits(sign + clean + "٪" + arrow);
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE);
        
        // Check widget specific assets first, fallback to global selected_assets, then default 4
        String rawAssets = prefs.getString(WidgetConfigureActivity.PREF_PREFIX_KEY + appWidgetId, null);
        if (rawAssets == null || rawAssets.trim().isEmpty()) {
            rawAssets = prefs.getString("selected_assets", "usd,eur,aed,gbp");
        }

        List<String> assetKeys = new ArrayList<>();
        if (rawAssets != null) {
            for (String k : rawAssets.split(",")) {
                String trimmed = k.trim().toLowerCase();
                if (!trimmed.isEmpty()) {
                    assetKeys.add(trimmed);
                }
            }
        }
        if (assetKeys.isEmpty()) {
            assetKeys.add("usd");
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_kgold);

        if (assetKeys.size() == 1) {
            // === 1 ASSET MODE (Large Single Square Card) ===
            views.setViewVisibility(R.id.widget_single_layout, View.VISIBLE);
            views.setViewVisibility(R.id.widget_multi_layout, View.GONE);

            WidgetConfigureActivity.AssetItem asset = WidgetConfigureActivity.getAssetByKey(context, assetKeys.get(0));
            views.setImageViewResource(R.id.widget_icon, asset.iconRes);
            views.setTextViewText(R.id.widget_name, asset.englishName);
            views.setTextViewText(R.id.widget_code, asset.code);
            views.setTextViewText(R.id.widget_change, formatChangeText(asset.defaultChange, asset.isPositive));
            views.setTextColor(R.id.widget_change, asset.isPositive ? 0xFF16A34A : 0xFFDC2626);
            views.setTextViewText(R.id.widget_price, toPersianDigits(asset.defaultPrice));
            views.setTextViewText(R.id.widget_unit, "تومان");

        } else {
            // === 2 TO 4 ASSETS MODE (2x2 Square Grid) ===
            views.setViewVisibility(R.id.widget_single_layout, View.GONE);
            views.setViewVisibility(R.id.widget_multi_layout, View.VISIBLE);

            // Slot 1
            WidgetConfigureActivity.AssetItem a1 = WidgetConfigureActivity.getAssetByKey(context, assetKeys.get(0));
            views.setImageViewResource(R.id.slot_icon_1, a1.iconRes);
            views.setTextViewText(R.id.slot_name_1, a1.englishName);
            views.setTextViewText(R.id.slot_code_1, a1.code);
            views.setTextViewText(R.id.slot_change_1, formatChangeText(a1.defaultChange, a1.isPositive));
            views.setTextColor(R.id.slot_change_1, a1.isPositive ? 0xFF16A34A : 0xFFDC2626);
            views.setTextViewText(R.id.slot_price_1, toPersianDigits(a1.defaultPrice));
            views.setViewVisibility(R.id.slot_card_1, View.VISIBLE);

            // Slot 2
            WidgetConfigureActivity.AssetItem a2 = WidgetConfigureActivity.getAssetByKey(context, assetKeys.get(1));
            views.setImageViewResource(R.id.slot_icon_2, a2.iconRes);
            views.setTextViewText(R.id.slot_name_2, a2.englishName);
            views.setTextViewText(R.id.slot_code_2, a2.code);
            views.setTextViewText(R.id.slot_change_2, formatChangeText(a2.defaultChange, a2.isPositive));
            views.setTextColor(R.id.slot_change_2, a2.isPositive ? 0xFF16A34A : 0xFFDC2626);
            views.setTextViewText(R.id.slot_price_2, toPersianDigits(a2.defaultPrice));
            views.setViewVisibility(R.id.slot_card_2, View.VISIBLE);

            if (assetKeys.size() == 2) {
                // If only 2 assets, hide Row 2 so Row 1 sits centered
                views.setViewVisibility(R.id.multi_row_2, View.GONE);
            } else {
                views.setViewVisibility(R.id.multi_row_2, View.VISIBLE);

                // Slot 3
                WidgetConfigureActivity.AssetItem a3 = WidgetConfigureActivity.getAssetByKey(context, assetKeys.get(2));
                views.setImageViewResource(R.id.slot_icon_3, a3.iconRes);
                views.setTextViewText(R.id.slot_name_3, a3.englishName);
                views.setTextViewText(R.id.slot_code_3, a3.code);
                views.setTextViewText(R.id.slot_change_3, formatChangeText(a3.defaultChange, a3.isPositive));
                views.setTextColor(R.id.slot_change_3, a3.isPositive ? 0xFF16A34A : 0xFFDC2626);
                views.setTextViewText(R.id.slot_price_3, toPersianDigits(a3.defaultPrice));
                views.setViewVisibility(R.id.slot_card_3, View.VISIBLE);

                // Slot 4
                if (assetKeys.size() >= 4) {
                    WidgetConfigureActivity.AssetItem a4 = WidgetConfigureActivity.getAssetByKey(context, assetKeys.get(3));
                    views.setImageViewResource(R.id.slot_icon_4, a4.iconRes);
                    views.setTextViewText(R.id.slot_name_4, a4.englishName);
                    views.setTextViewText(R.id.slot_code_4, a4.code);
                    views.setTextViewText(R.id.slot_change_4, formatChangeText(a4.defaultChange, a4.isPositive));
                    views.setTextColor(R.id.slot_change_4, a4.isPositive ? 0xFF16A34A : 0xFFDC2626);
                    views.setTextViewText(R.id.slot_price_4, toPersianDigits(a4.defaultPrice));
                    views.setViewVisibility(R.id.slot_card_4, View.VISIBLE);
                } else {
                    // Invisible preserves the square 2x2 grid balance
                    views.setViewVisibility(R.id.slot_card_4, View.INVISIBLE);
                }
            }
        }

        // Tap on widget opens MainActivity
        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, KGoldWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        if (appWidgetIds != null && appWidgetIds.length > 0) {
            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }
        }
    }

    public static void scheduleAutoUpdate(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            Intent intent = new Intent(context, KGoldWidgetProvider.class);
            intent.setAction(ACTION_AUTO_UPDATE);
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    998,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            long intervalMillis = 15 * 60 * 1000L; // 15 minutes
            long triggerAt = System.currentTimeMillis() + intervalMillis;
            if (alarmManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
                } else {
                    alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, triggerAt, intervalMillis, pendingIntent);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void fetchAndSyncLatestPrices(final Context context) {
        new Thread(() -> {
            try {
                // 1. Fetch Currency & Gold prices from KGold API
                URL urlPrices = new URL("https://kgold.irkinsta.top/api/prices");
                HttpURLConnection connPrices = (HttpURLConnection) urlPrices.openConnection();
                connPrices.setRequestProperty("X-KGOLD-Shield", "kG0ld_S3cur3_Sh1eld_9982");
                connPrices.setRequestProperty("User-Agent", "KGOLD-Android-Widget/1.0");
                connPrices.setConnectTimeout(8000);
                connPrices.setReadTimeout(8000);
                connPrices.connect();

                if (connPrices.getResponseCode() == HttpURLConnection.HTTP_OK) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connPrices.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    reader.close();

                    JSONObject json = new JSONObject(sb.toString());
                    SharedPreferences.Editor editor = context.getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE).edit();

                    if (json.has("currencies")) {
                        JSONArray currs = json.getJSONArray("currencies");
                        for (int i = 0; i < currs.length(); i++) {
                            JSONObject c = currs.getJSONObject(i);
                            String code = c.optString("code", "").toLowerCase();
                            String price = c.optString("price", "");
                            String change = c.optString("change_24h", "");
                            if (!code.isEmpty() && !price.isEmpty()) {
                                editor.putString("price_" + code, toPersianDigits(price));
                                if (!change.isEmpty()) {
                                    boolean isPos = !change.contains("-");
                                    editor.putString("change_" + code, formatChangeText(change, isPos));
                                    editor.putBoolean("is_pos_" + code, isPos);
                                }
                            }
                        }
                    }

                    if (json.has("gold")) {
                        JSONArray goldArr = json.getJSONArray("gold");
                        for (int i = 0; i < goldArr.length(); i++) {
                            JSONObject g = goldArr.getJSONObject(i);
                            String name = g.optString("name", "");
                            String price = g.optString("price", "");
                            String change = g.optString("change_24h", "");
                            String key = null;
                            if (name.contains("۱۸") && !name.contains("حباب")) key = "gold18k";
                            else if (name.contains("امامی") && !name.contains("حباب")) key = "emami";
                            else if (name.contains("بهار") && !name.contains("حباب")) key = "bahar";
                            else if (name.contains("نیم") && !name.contains("حباب")) key = "half";
                            else if (name.contains("ربع") && !name.contains("حباب")) key = "quarter";
                            else if (name.contains("گرمی") && !name.contains("حباب")) key = "gerami";

                            if (key != null && !price.isEmpty()) {
                                editor.putString("price_" + key, toPersianDigits(price));
                                if (!change.isEmpty()) {
                                    boolean isPos = !change.contains("-");
                                    editor.putString("change_" + key, formatChangeText(change, isPos));
                                    editor.putBoolean("is_pos_" + key, isPos);
                                }
                            }
                        }
                    }
                    editor.apply();
                }

                // 2. Fetch Crypto prices for USDT & BTC
                try {
                    URL urlCrypto = new URL("https://kgold.irkinsta.top/api/crypto");
                    HttpURLConnection connCrypto = (HttpURLConnection) urlCrypto.openConnection();
                    connCrypto.setRequestProperty("X-KGOLD-Shield", "kG0ld_S3cur3_Sh1eld_9982");
                    connCrypto.setRequestProperty("User-Agent", "KGOLD-Android-Widget/1.0");
                    connCrypto.setConnectTimeout(8000);
                    connCrypto.setReadTimeout(8000);
                    connCrypto.connect();

                    if (connCrypto.getResponseCode() == HttpURLConnection.HTTP_OK) {
                        BufferedReader r = new BufferedReader(new InputStreamReader(connCrypto.getInputStream()));
                        StringBuilder sbCrypto = new StringBuilder();
                        String l;
                        while ((l = r.readLine()) != null) sbCrypto.append(l);
                        r.close();

                        JSONArray cryptoArr = new JSONArray(sbCrypto.toString());
                        SharedPreferences.Editor editor = context.getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE).edit();
                        for (int i = 0; i < cryptoArr.length(); i++) {
                            JSONObject item = cryptoArr.getJSONObject(i);
                            String symbol = item.optString("symbol", "");
                            if ("USDT_IRT".equalsIgnoreCase(symbol)) {
                                long p = Math.round(item.optDouble("price", 0));
                                double ch = item.optDouble("daily_change_price", 0);
                                if (p > 0) {
                                    boolean isPos = ch >= 0;
                                    editor.putString("price_usdt", toPersianDigits(String.format(Locale.US, "%,d", p)));
                                    editor.putString("change_usdt", formatChangeText(String.format(Locale.US, "%.2f", Math.abs(ch)), isPos));
                                    editor.putBoolean("is_pos_usdt", isPos);
                                }
                            } else if ("BTC_IRT".equalsIgnoreCase(symbol)) {
                                long p = Math.round(item.optDouble("price", 0));
                                double ch = item.optDouble("daily_change_price", 0);
                                if (p > 0) {
                                    boolean isPos = ch >= 0;
                                    editor.putString("price_btc", toPersianDigits(String.format(Locale.US, "%,d", p)));
                                    editor.putString("change_btc", formatChangeText(String.format(Locale.US, "%.2f", Math.abs(ch)), isPos));
                                    editor.putBoolean("is_pos_btc", isPos);
                                }
                            }
                        }
                        editor.apply();
                    }
                } catch (Exception ignored) {}

                // Trigger UI update on main thread
                new Handler(Looper.getMainLooper()).post(() -> updateAllWidgets(context));

            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
}
