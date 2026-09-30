package com.kgold.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

public class WidgetConfigureActivity extends Activity {

    public static final String PREFS_NAME = "com.kgold.app.widget_prefs";
    public static final String PREF_PREFIX_KEY = "widget_asset_";

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    public static class AssetItem {
        public String key;
        public String name;
        public String code;
        public int iconRes;
        public String defaultPrice;
        public String defaultPrevPrice;

        public AssetItem(String key, String name, String code, int iconRes, String defaultPrice, String defaultPrevPrice) {
            this.key = key;
            this.name = name;
            this.code = code;
            this.iconRes = iconRes;
            this.defaultPrice = defaultPrice;
            this.defaultPrevPrice = defaultPrevPrice;
        }
    }

    public static List<AssetItem> getAllAssets() {
        List<AssetItem> list = new ArrayList<>();
        list.add(new AssetItem("usd", "دلار آمریکا", "USD", R.drawable.widget_flag_usa, "۶۱,۳۰۰", "۶۱,۲۰۰"));
        list.add(new AssetItem("usdt", "تتر دیجیتال", "USDT", R.drawable.widget_icon_tether, "۶۱,۲۵۰", "۶۱,۱۸۰"));
        list.add(new AssetItem("gold18k", "طلای ۱۸ عیار", "18K", R.drawable.widget_icon_gold_bar, "۳,۷۵۰,۰۰۰", "۳,۷۲۰,۰۰۰"));
        list.add(new AssetItem("emami", "سکه امامی", "EMAMI", R.drawable.widget_icon_coin_gold, "۴۳,۸۰۰,۰۰۰", "۴۳,۵۰۰,۰۰۰"));
        list.add(new AssetItem("bahar", "سکه بهار آزادی", "BAHAR", R.drawable.widget_icon_coin_gold, "۳۸,۹۰۰,۰۰۰", "۳۸,۷۰۰,۰۰۰"));
        list.add(new AssetItem("half", "نیم سکه بهار آزادی", "HALF", R.drawable.widget_icon_coin_gold, "۲۳,۵۰۰,۰۰۰", "۲۳,۴۰۰,۰۰۰"));
        list.add(new AssetItem("quarter", "ربع سکه بهار آزادی", "QUARTER", R.drawable.widget_icon_coin_gold, "۱۵,۵۰۰,۰۰۰", "۱۵,۴۰۰,۰۰۰"));
        list.add(new AssetItem("gerami", "سکه یک گرمی", "GERAMI", R.drawable.widget_icon_coin_gold, "۷,۲۰۰,۰۰۰", "۷,۱۵۰,۰۰۰"));
        list.add(new AssetItem("eur", "یورو اروپا", "EUR", R.drawable.widget_flag_eur, "۶۶,۴۰۰", "۶۶,۱۰۰"));
        list.add(new AssetItem("aed", "درهم امارات", "AED", R.drawable.widget_flag_aed, "۱۶,۶۸۰", "۱۶,۶۲۰"));
        list.add(new AssetItem("gbp", "پوند انگلیس", "GBP", R.drawable.widget_flag_gbp, "۷۸,۲۰۰", "۷۷,۹۰۰"));
        list.add(new AssetItem("btc", "بیت‌کوین", "BTC", R.drawable.widget_icon_btc, "۴,۱۲۰,۰۰۰,۰۰۰", "۴,۰۹۰,۰۰۰,۰۰۰"));
        return list;
    }

    public static AssetItem getAssetByKey(Context context, String key) {
        List<AssetItem> assets = getAllAssets();
        for (AssetItem item : assets) {
            if (item.key.equalsIgnoreCase(key)) {
                // Check if SharedPreferences has newer synced prices
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String price = prefs.getString("price_" + key, item.defaultPrice);
                String prevPrice = prefs.getString("prev_price_" + key, item.defaultPrevPrice);
                return new AssetItem(item.key, item.name, item.code, item.iconRes, price, prevPrice);
            }
        }
        return assets.get(0);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setResult(RESULT_CANCELED);
        setContentView(R.layout.activity_widget_configure);

        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            mAppWidgetId = extras.getInt(
                    AppWidgetManager.EXTRA_APPWIDGET_ID,
                    AppWidgetManager.INVALID_APPWIDGET_ID
            );
        }

        if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }

        ListView listView = findViewById(R.id.assets_list);
        List<AssetItem> assets = getAllAssets();

        // Read updated prices from preferences if available
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        for (AssetItem item : assets) {
            String savedPrice = prefs.getString("price_" + item.key, null);
            if (savedPrice != null) {
                item.defaultPrice = savedPrice;
            }
        }

        ArrayAdapter<AssetItem> adapter = new ArrayAdapter<AssetItem>(this, R.layout.item_widget_asset, assets) {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                if (convertView == null) {
                    convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_widget_asset, parent, false);
                }
                AssetItem item = getItem(position);
                if (item != null) {
                    ImageView icon = convertView.findViewById(R.id.item_icon);
                    TextView name = convertView.findViewById(R.id.item_name);
                    TextView code = convertView.findViewById(R.id.item_code);
                    TextView price = convertView.findViewById(R.id.item_price);

                    icon.setImageResource(item.iconRes);
                    name.setText(item.name);
                    code.setText(item.code);
                    price.setText(item.defaultPrice);
                }
                return convertView;
            }
        };

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view, position, id) -> {
            AssetItem selected = assets.get(position);

            // Save selected asset for this appWidgetId
            SharedPreferences.Editor editor = getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit();
            editor.putString(PREF_PREFIX_KEY + mAppWidgetId, selected.key);
            editor.apply();

            // Update widget immediately
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(WidgetConfigureActivity.this);
            KGoldWidgetProvider.updateAppWidget(WidgetConfigureActivity.this, appWidgetManager, mAppWidgetId);

            // Return success to Android launcher
            Intent resultValue = new Intent();
            resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
            setResult(RESULT_OK, resultValue);
            finish();
        });
    }
}
