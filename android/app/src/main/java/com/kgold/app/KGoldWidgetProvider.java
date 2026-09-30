package com.kgold.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class KGoldWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE);
        String assetKey = prefs.getString(WidgetConfigureActivity.PREF_PREFIX_KEY + appWidgetId, "usd");

        WidgetConfigureActivity.AssetItem asset = WidgetConfigureActivity.getAssetByKey(context, assetKey);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_kgold);

        // Icon, Title & Code
        views.setImageViewResource(R.id.widget_icon, asset.iconRes);
        views.setTextViewText(R.id.widget_name, asset.name);
        views.setTextViewText(R.id.widget_code, asset.code);

        // Prices
        views.setTextViewText(R.id.widget_prev_price, asset.defaultPrevPrice);
        views.setTextViewText(R.id.widget_price, asset.defaultPrice);

        // Check if positive or negative to set color
        boolean isPositive = prefs.getBoolean("is_pos_" + assetKey, true);
        views.setTextColor(R.id.widget_price, isPositive ? 0xFF16A34A : 0xFFDC2626);

        // Intent to launch MainActivity on tap
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
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
