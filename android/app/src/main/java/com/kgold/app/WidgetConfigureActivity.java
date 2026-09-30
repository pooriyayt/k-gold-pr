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
import android.widget.Button;
import android.widget.ImageView;
import android.widget.GridView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

public class WidgetConfigureActivity extends Activity {

    public static final String PREFS_NAME = "com.kgold.app.widget_prefs";
    public static final String PREF_PREFIX_KEY = "widget_asset_";

    private int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private int mSelectedIndex = 0;

    public static class AssetItem {
        public String key;
        public String name;
        public String code;
        public int iconRes;
        public String defaultPrice;
        public String defaultChange;
        public boolean isPositive;

        public AssetItem(String key, String name, String code, int iconRes, String defaultPrice, String defaultChange, boolean isPositive) {
            this.key = key;
            this.name = name;
            this.code = code;
            this.iconRes = iconRes;
            this.defaultPrice = defaultPrice;
            this.defaultChange = defaultChange;
            this.isPositive = isPositive;
        }
    }

    public static List<AssetItem> getAllAssets() {
        List<AssetItem> list = new ArrayList<>();
        list.add(new AssetItem("usd", "دلار آمریکا", "USD", R.drawable.widget_icon_usd, "۶۱,۳۰۰", "+۲.۱۱٪ ↗", true));
        list.add(new AssetItem("eur", "یورو اروپا", "EUR", R.drawable.widget_icon_eur, "۶۶,۴۰۰", "+۲.۰۳٪ ↗", true));
        list.add(new AssetItem("aed", "درهم امارات", "AED", R.drawable.widget_icon_aed, "۱۶,۶۸۰", "+۲.۱۰٪ ↗", true));
        list.add(new AssetItem("gbp", "پوند انگلیس", "GBP", R.drawable.widget_icon_gbp, "۷۸,۲۰۰", "+۱.۹۵٪ ↗", true));
        list.add(new AssetItem("gold18k", "طلای ۱۸ عیار", "18K", R.drawable.widget_icon_gold, "۳,۷۵۰,۰۰۰", "+۱.۸۲٪ ↗", true));
        list.add(new AssetItem("emami", "سکه تمام امامی", "EMAMI", R.drawable.widget_icon_coin, "۴۳,۸۰۰,۰۰۰", "+۲.۷۳٪ ↗", true));
        list.add(new AssetItem("bahar", "سکه بهار آزادی", "BAHAR", R.drawable.widget_icon_coin, "۳۸,۹۰۰,۰۰۰", "+۱.۵۱٪ ↗", true));
        list.add(new AssetItem("half", "نیم سکه بهار آزادی", "HALF", R.drawable.widget_icon_coin, "۲۳,۵۰۰,۰۰۰", "+۱.۱۰٪ ↗", true));
        list.add(new AssetItem("quarter", "ربع سکه بهار آزادی", "QUARTER", R.drawable.widget_icon_coin, "۱۵,۵۰۰,۰۰۰", "+۰.۸۸٪ ↗", true));
        list.add(new AssetItem("gerami", "سکه گرمی", "GERAMI", R.drawable.widget_icon_coin, "۷,۲۰۰,۰۰۰", "+۰.۵۰٪ ↗", true));
        list.add(new AssetItem("usdt", "تتر دیجیتال", "USDT", R.drawable.widget_icon_tether, "۶۱,۲۵۰", "+۰.۲۵٪ ↗", true));
        list.add(new AssetItem("btc", "بیت‌کوین", "BTC", R.drawable.widget_icon_btc, "۴,۱۲۰,۰۰۰,۰۰۰", "+۲.۱۲٪ ↗", true));
        return list;
    }

    public static AssetItem getAssetByKey(Context context, String key) {
        List<AssetItem> assets = getAllAssets();
        for (AssetItem item : assets) {
            if (item.key.equalsIgnoreCase(key)) {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String price = prefs.getString("price_" + key, item.defaultPrice);
                String change = prefs.getString("change_" + key, item.defaultChange);
                boolean isPos = prefs.getBoolean("is_pos_" + key, item.isPositive);
                return new AssetItem(item.key, item.name, item.code, item.iconRes, price, change, isPos);
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

        final List<AssetItem> assets = getAllAssets();

        // Read dynamically synced prices from preferences
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        for (AssetItem item : assets) {
            String savedPrice = prefs.getString("price_" + item.key, null);
            if (savedPrice != null) {
                item.defaultPrice = savedPrice;
            }
            String savedChange = prefs.getString("change_" + item.key, null);
            if (savedChange != null) {
                item.defaultChange = savedChange;
            }
        }

        // Preview views
        final ImageView previewIcon = findViewById(R.id.preview_icon);
        final TextView previewName = findViewById(R.id.preview_name);
        final TextView previewCode = findViewById(R.id.preview_code);
        final TextView previewChange = findViewById(R.id.preview_change);
        final TextView previewPrice = findViewById(R.id.preview_price);
        final Button btnAddWidget = findViewById(R.id.btn_add_widget);
        final android.widget.GridView gridView = findViewById(R.id.assets_grid);

        // Update preview helper
        Runnable updatePreview = () -> {
            if (mSelectedIndex >= 0 && mSelectedIndex < assets.size()) {
                AssetItem selected = assets.get(mSelectedIndex);
                previewIcon.setImageResource(selected.iconRes);
                previewName.setText(selected.name);
                previewCode.setText(selected.code);
                previewChange.setText(selected.defaultChange);
                previewChange.setTextColor(selected.isPositive ? 0xFF16A34A : 0xFFDC2626);
                previewPrice.setText(selected.defaultPrice);
            }
        };

        // Initial preview
        updatePreview.run();

        final ArrayAdapter<AssetItem> adapter = new ArrayAdapter<AssetItem>(this, R.layout.item_widget_chip, assets) {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                if (convertView == null) {
                    convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_widget_chip, parent, false);
                }
                AssetItem item = getItem(position);
                if (item != null) {
                    View chipRoot = convertView.findViewById(R.id.chip_root);
                    ImageView icon = convertView.findViewById(R.id.chip_icon);
                    TextView name = convertView.findViewById(R.id.chip_name);

                    icon.setImageResource(item.iconRes);
                    name.setText(item.name);

                    if (position == mSelectedIndex) {
                        chipRoot.setBackgroundResource(R.drawable.widget_item_selected_bg);
                    } else {
                        chipRoot.setBackgroundResource(R.drawable.widget_item_light_bg);
                    }
                }
                return convertView;
            }
        };

        gridView.setAdapter(adapter);

        gridView.setOnItemClickListener((parent, view, position, id) -> {
            mSelectedIndex = position;
            adapter.notifyDataSetChanged();
            updatePreview.run();
        });

        btnAddWidget.setOnClickListener(v -> {
            AssetItem selected = assets.get(mSelectedIndex);

            // Save selected asset for this appWidgetId
            SharedPreferences.Editor editor = getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit();
            editor.putString(PREF_PREFIX_KEY + mAppWidgetId, selected.key);
            editor.apply();

            // Update widget immediately
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(WidgetConfigureActivity.this);
            KGoldWidgetProvider.updateAppWidget(WidgetConfigureActivity.this, appWidgetManager, mAppWidgetId);

            // Return success
            Intent resultValue = new Intent();
            resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
            setResult(RESULT_OK, resultValue);
            finish();
        });
    }
}
