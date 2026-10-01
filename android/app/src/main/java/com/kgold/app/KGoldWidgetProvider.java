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
    public void onEnabled(Context context) {
        super.onEnabled(context);
        updateAllWidgets(context);
        scheduleAutoUpdate(context);
        fetchAndSyncLatestPrices(context);
    }

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
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, android.os.Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId);
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

        // Render pixel-perfect high-definition Canvas bitmap with SF Pro Arabic typography & 1:1 square
        android.graphics.Bitmap widgetBmp = KGoldWidgetRenderer.renderWidget(context, appWidgetManager, appWidgetId, assetKeys);
        views.setImageViewBitmap(R.id.widget_canvas_image, widgetBmp);

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
