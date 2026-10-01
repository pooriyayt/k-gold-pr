package com.kgold.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public class WidgetConfigureActivity extends Activity {

    public static final String PREFS_NAME = "com.kgold.app.widget_prefs";
    public static final String PREF_PREFIX_KEY = "widget_assets_";
    public static final String PREF_DIGITS_LANG_PREFIX = "widget_digits_lang_";
    public static final String PREF_THEME_PREFIX = "widget_theme_";

    private int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private final List<String> mSelectedKeys = new ArrayList<>();
    private String mDigitsLang = "fa"; // "fa" or "en"
    private String mTheme = "white"; // "white" or "transparent"

    public static class AssetItem {
        public String key;
        public String name;
        public String englishName;
        public String code;
        public int iconRes;
        public String defaultPrice;
        public String defaultChange;
        public boolean isPositive;

        public AssetItem(String key, String name, String englishName, String code, int iconRes, String defaultPrice, String defaultChange, boolean isPositive) {
            this.key = key;
            this.name = name;
            this.englishName = englishName;
            this.code = code;
            this.iconRes = iconRes;
            this.defaultPrice = defaultPrice;
            this.defaultChange = defaultChange;
            this.isPositive = isPositive;
        }
    }

    public static List<AssetItem> getAllAssets() {
        List<AssetItem> list = new ArrayList<>();
        list.add(new AssetItem("usd", "دلار آمریکا", "US Dollar", "USD", R.drawable.widget_icon_usd, "۶۱,۳۰۰", "+۲.۱۱٪ ↗", true));
        list.add(new AssetItem("eur", "یورو اروپا", "Euro", "EUR", R.drawable.widget_icon_eur, "۶۶,۴۰۰", "+۲.۰۳٪ ↗", true));
        list.add(new AssetItem("aed", "درهم امارات", "UAE Dirham", "AED", R.drawable.widget_icon_aed, "۱۶,۶۸۰", "+۲.۱۰٪ ↗", true));
        list.add(new AssetItem("gbp", "پوند انگلیس", "British Pound", "GBP", R.drawable.widget_icon_gbp, "۷۸,۲۰۰", "+۱.۹۵٪ ↗", true));
        list.add(new AssetItem("gold18k", "طلای ۱۸ عیار", "Gold 18K", "18K", R.drawable.widget_icon_gold, "۳,۷۵۰,۰۰۰", "+۱.۸۲٪ ↗", true));
        list.add(new AssetItem("emami", "سکه تمام امامی", "Emami Coin", "EMAMI", R.drawable.widget_icon_coin, "۴۳,۸۰۰,۰۰۰", "+۲.۷۳٪ ↗", true));
        list.add(new AssetItem("bahar", "سکه بهار آزادی", "Bahar Azadi", "BAHAR", R.drawable.widget_icon_coin, "۳۸,۹۰۰,۰۰۰", "+۱.۵۱٪ ↗", true));
        list.add(new AssetItem("half", "نیم سکه بهار", "Half Coin", "HALF", R.drawable.widget_icon_coin, "۲۳,۵۰۰,۰۰۰", "+۱.۱۰٪ ↗", true));
        list.add(new AssetItem("quarter", "ربع سکه بهار", "Quarter Coin", "QUARTER", R.drawable.widget_icon_coin, "۱۵,۵۰۰,۰۰۰", "+۰.۸۸٪ ↗", true));
        list.add(new AssetItem("gerami", "سکه گرمی", "Gerami Coin", "GERAMI", R.drawable.widget_icon_coin, "۷,۲۰۰,۰۰۰", "+۰.۵۰٪ ↗", true));
        list.add(new AssetItem("usdt", "تتر دیجیتال", "Tether USD", "USDT", R.drawable.widget_icon_tether, "۶۱,۲۵۰", "+۰.۲۵٪ ↗", true));
        list.add(new AssetItem("btc", "بیت‌کوین", "Bitcoin", "BTC", R.drawable.widget_icon_btc, "۴,۱۲۰,۰۰۰,۰۰۰", "+۲.۱۲٪ ↗", true));
        return list;
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

    public static String formatChangeText(String change, boolean isPositive) {
        return formatChangeText(change, isPositive, true);
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

    public static AssetItem getAssetByKey(Context context, String key) {
        return getAssetByKey(context, key, true);
    }

    public static AssetItem getAssetByKey(Context context, String key, boolean isPersian) {
        List<AssetItem> assets = getAllAssets();
        for (AssetItem item : assets) {
            if (item.key.equalsIgnoreCase(key)) {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String price = prefs.getString("price_" + key, item.defaultPrice);
                String change = prefs.getString("change_" + key, item.defaultChange);
                boolean isPos = prefs.getBoolean("is_pos_" + key, item.isPositive);
                return new AssetItem(item.key, item.name, item.englishName, item.code, item.iconRes, 
                        formatDigits(price, isPersian), 
                        formatChangeText(change, isPos, isPersian), 
                        isPos);
            }
        }
        return assets.get(0);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Default to OK so buggy launchers that fail to complete result won't drop widget
        setResult(RESULT_CANCELED);
        setContentView(R.layout.activity_widget_configure);

        Intent intent = getIntent();
        Bundle extras = intent != null ? intent.getExtras() : null;
        if (extras != null) {
            mAppWidgetId = extras.getInt(
                    AppWidgetManager.EXTRA_APPWIDGET_ID,
                    AppWidgetManager.INVALID_APPWIDGET_ID
            );
        }
        if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID && intent != null) {
            mAppWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }

        final List<AssetItem> allAssets = getAllAssets();

        // Read dynamically synced prices from preferences
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        for (AssetItem item : allAssets) {
            String savedPrice = prefs.getString("price_" + item.key, null);
            if (savedPrice != null) item.defaultPrice = toPersianDigits(savedPrice);
            String savedChange = prefs.getString("change_" + item.key, null);
            boolean isPos = prefs.getBoolean("is_pos_" + item.key, item.isPositive);
            if (savedChange != null) item.defaultChange = formatChangeText(savedChange, isPos);
            item.isPositive = isPos;
        }

        // Initialize Selected Assets (Default 4: USD, EUR, AED, GBP)
        String savedCsv = null;
        if (mAppWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
            savedCsv = prefs.getString(PREF_PREFIX_KEY + mAppWidgetId, null);
        }
        if (savedCsv == null || savedCsv.trim().isEmpty()) {
            savedCsv = prefs.getString("selected_assets", "usd,eur,aed,gbp");
        }

        mSelectedKeys.clear();
        if (savedCsv != null) {
            for (String k : savedCsv.split(",")) {
                String clean = k.trim().toLowerCase();
                if (!clean.isEmpty() && !mSelectedKeys.contains(clean)) {
                    mSelectedKeys.add(clean);
                }
            }
        }
        if (mSelectedKeys.isEmpty()) {
            mSelectedKeys.add("usd");
            mSelectedKeys.add("eur");
            mSelectedKeys.add("aed");
            mSelectedKeys.add("gbp");
        }

        // Read initial digits language & theme
        if (mAppWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
            mDigitsLang = prefs.getString(PREF_DIGITS_LANG_PREFIX + mAppWidgetId, prefs.getString("widget_digits_lang", "fa"));
            mTheme = prefs.getString(PREF_THEME_PREFIX + mAppWidgetId, prefs.getString("widget_theme", "white"));
        } else {
            mDigitsLang = prefs.getString("widget_digits_lang", "fa");
            mTheme = prefs.getString("widget_theme", "white");
        }

        // UI references
        final View previewSingleContainer = findViewById(R.id.preview_single_container);
        final View previewMultiContainer = findViewById(R.id.preview_multi_container);
        final View previewRow1 = findViewById(R.id.preview_row_1);
        final View previewRow2 = findViewById(R.id.preview_row_2);

        // Single preview views
        final ImageView previewIcon = findViewById(R.id.preview_icon);
        final TextView previewName = findViewById(R.id.preview_name);
        final TextView previewCode = findViewById(R.id.preview_code);
        final TextView previewChange = findViewById(R.id.preview_change);
        final TextView previewPrice = findViewById(R.id.preview_price);

        // Multi preview views (Slot 1)
        final ImageView prevIcon1 = findViewById(R.id.prev_icon_1);
        final TextView prevName1 = findViewById(R.id.prev_name_1);
        final TextView prevCode1 = findViewById(R.id.prev_code_1);
        final TextView prevChange1 = findViewById(R.id.prev_change_1);
        final TextView prevPrice1 = findViewById(R.id.prev_price_1);

        // Multi preview views (Slot 2)
        final ImageView prevIcon2 = findViewById(R.id.prev_icon_2);
        final TextView prevName2 = findViewById(R.id.prev_name_2);
        final TextView prevCode2 = findViewById(R.id.prev_code_2);
        final TextView prevChange2 = findViewById(R.id.prev_change_2);
        final TextView prevPrice2 = findViewById(R.id.prev_price_2);

        // Multi preview views (Slot 3)
        final ImageView prevIcon3 = findViewById(R.id.prev_icon_3);
        final TextView prevName3 = findViewById(R.id.prev_name_3);
        final TextView prevCode3 = findViewById(R.id.prev_code_3);
        final TextView prevChange3 = findViewById(R.id.prev_change_3);
        final TextView prevPrice3 = findViewById(R.id.prev_price_3);

        // Multi preview views (Slot 4)
        final View prevSlot4 = findViewById(R.id.prev_slot_4);
        final ImageView prevIcon4 = findViewById(R.id.prev_icon_4);
        final TextView prevName4 = findViewById(R.id.prev_name_4);
        final TextView prevCode4 = findViewById(R.id.prev_code_4);
        final TextView prevChange4 = findViewById(R.id.prev_change_4);
        final TextView prevPrice4 = findViewById(R.id.prev_price_4);

        final TextView txtSelectionCounter = findViewById(R.id.txt_selection_counter);
        final Button btnAddWidget = findViewById(R.id.btn_add_widget);
        final GridView gridView = findViewById(R.id.assets_grid);

        final TextView btnDigitsFa = findViewById(R.id.btn_digits_fa);
        final TextView btnDigitsEn = findViewById(R.id.btn_digits_en);

        // Setup initial button states (Segmented pill style)
        Runnable updateButtonsState = () -> {
            boolean isFa = "fa".equalsIgnoreCase(mDigitsLang);
            btnDigitsFa.setBackgroundResource(isFa ? R.drawable.widget_pill_active : android.R.color.transparent);
            btnDigitsFa.setTextColor(isFa ? 0xFFFFFFFF : 0xFF64748B);
            btnDigitsEn.setBackgroundResource(!isFa ? R.drawable.widget_pill_active : android.R.color.transparent);
            btnDigitsEn.setTextColor(!isFa ? 0xFFFFFFFF : 0xFF64748B);
        };

        // Update preview helper
        Runnable updatePreview = () -> {
            boolean isPersian = "fa".equalsIgnoreCase(mDigitsLang);
            txtSelectionCounter.setText("انتخاب ارزها (" + mSelectedKeys.size() + " از ۴ ارز انتخاب شده):");

            Typeface tfTitle = isPersian ? KGoldWidgetRenderer.getSfArabicBold(this) : KGoldWidgetRenderer.getGsansBold(this);
            Typeface tfCode = isPersian ? KGoldWidgetRenderer.getSfArabicBold(this) : KGoldWidgetRenderer.getGsansMedium(this);
            Typeface tfPrice = isPersian ? KGoldWidgetRenderer.getVazirBold(this) : KGoldWidgetRenderer.getGsansBold(this);
            Typeface tfChange = isPersian ? KGoldWidgetRenderer.getVazirBold(this) : KGoldWidgetRenderer.getGsansBold(this);

            if (mSelectedKeys.size() == 1) {
                previewSingleContainer.setVisibility(View.VISIBLE);
                previewMultiContainer.setVisibility(View.GONE);

                AssetItem single = getAssetByKey(this, mSelectedKeys.get(0), isPersian);
                previewIcon.setImageResource(single.iconRes);
                previewName.setTypeface(tfTitle);
                previewName.setText(isPersian ? single.name : single.englishName);
                previewCode.setTypeface(tfCode);
                previewCode.setText(single.code);
                previewChange.setTypeface(tfChange);
                previewChange.setText(formatChangeText(single.defaultChange, single.isPositive, isPersian));
                previewChange.setTextColor(single.isPositive ? 0xFF16A34A : 0xFFDC2626);
                previewPrice.setTypeface(tfPrice);
                previewPrice.setText(single.defaultPrice);
            } else {
                previewSingleContainer.setVisibility(View.GONE);
                previewMultiContainer.setVisibility(View.VISIBLE);

                // Slot 1
                AssetItem a1 = getAssetByKey(this, mSelectedKeys.get(0), isPersian);
                prevIcon1.setImageResource(a1.iconRes);
                prevName1.setTypeface(tfTitle);
                prevName1.setText(isPersian ? a1.name : a1.englishName);
                prevCode1.setTypeface(tfCode);
                prevCode1.setText(a1.code);
                prevChange1.setTypeface(tfChange);
                prevChange1.setText(formatChangeText(a1.defaultChange, a1.isPositive, isPersian));
                prevChange1.setTextColor(a1.isPositive ? 0xFF16A34A : 0xFFDC2626);
                prevPrice1.setTypeface(tfPrice);
                prevPrice1.setText(a1.defaultPrice);

                // Slot 2
                AssetItem a2 = getAssetByKey(this, mSelectedKeys.get(1), isPersian);
                prevIcon2.setImageResource(a2.iconRes);
                prevName2.setTypeface(tfTitle);
                prevName2.setText(isPersian ? a2.name : a2.englishName);
                prevCode2.setTypeface(tfCode);
                prevCode2.setText(a2.code);
                prevChange2.setTypeface(tfChange);
                prevChange2.setText(formatChangeText(a2.defaultChange, a2.isPositive, isPersian));
                prevChange2.setTextColor(a2.isPositive ? 0xFF16A34A : 0xFFDC2626);
                prevPrice2.setTypeface(tfPrice);
                prevPrice2.setText(a2.defaultPrice);

                if (mSelectedKeys.size() == 2) {
                    previewRow2.setVisibility(View.GONE);
                } else {
                    previewRow2.setVisibility(View.VISIBLE);

                    // Slot 3
                    AssetItem a3 = getAssetByKey(this, mSelectedKeys.get(2), isPersian);
                    prevIcon3.setImageResource(a3.iconRes);
                    prevName3.setTypeface(tfTitle);
                    prevName3.setText(isPersian ? a3.name : a3.englishName);
                    prevCode3.setTypeface(tfCode);
                    prevCode3.setText(a3.code);
                    prevChange3.setTypeface(tfChange);
                    prevChange3.setText(formatChangeText(a3.defaultChange, a3.isPositive, isPersian));
                    prevChange3.setTextColor(a3.isPositive ? 0xFF16A34A : 0xFFDC2626);
                    prevPrice3.setTypeface(tfPrice);
                    prevPrice3.setText(a3.defaultPrice);

                    // Slot 4
                    if (mSelectedKeys.size() >= 4) {
                        AssetItem a4 = getAssetByKey(this, mSelectedKeys.get(3), isPersian);
                        prevSlot4.setVisibility(View.VISIBLE);
                        prevIcon4.setImageResource(a4.iconRes);
                        prevName4.setTypeface(tfTitle);
                        prevName4.setText(isPersian ? a4.name : a4.englishName);
                        prevCode4.setTypeface(tfCode);
                        prevCode4.setText(a4.code);
                        prevChange4.setTypeface(tfChange);
                        prevChange4.setText(formatChangeText(a4.defaultChange, a4.isPositive, isPersian));
                        prevChange4.setTextColor(a4.isPositive ? 0xFF16A34A : 0xFFDC2626);
                        prevPrice4.setTypeface(tfPrice);
                        prevPrice4.setText(a4.defaultPrice);
                    } else {
                        prevSlot4.setVisibility(View.INVISIBLE);
                    }
                }
            }
        };

        // Listeners for setting toggles
        btnDigitsFa.setOnClickListener(v -> {
            mDigitsLang = "fa";
            updateButtonsState.run();
            updatePreview.run();
        });

        btnDigitsEn.setOnClickListener(v -> {
            mDigitsLang = "en";
            updateButtonsState.run();
            updatePreview.run();
        });

        // Initial preview & button states
        updateButtonsState.run();
        updatePreview.run();

        final ArrayAdapter<AssetItem> adapter = new ArrayAdapter<AssetItem>(this, R.layout.item_widget_chip, allAssets) {
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
                    TextView badge = convertView.findViewById(R.id.chip_badge);

                    icon.setImageResource(item.iconRes);
                    name.setText(item.name);

                    int selectedIndex = mSelectedKeys.indexOf(item.key.toLowerCase());
                    if (selectedIndex >= 0) {
                        chipRoot.setBackgroundResource(R.drawable.widget_item_selected_bg);
                        badge.setVisibility(View.VISIBLE);
                        badge.setText(String.valueOf(selectedIndex + 1));
                    } else {
                        chipRoot.setBackgroundResource(R.drawable.widget_item_light_bg);
                        badge.setVisibility(View.GONE);
                    }
                }
                return convertView;
            }
        };

        gridView.setAdapter(adapter);

        gridView.setOnItemClickListener((parent, view, position, id) -> {
            AssetItem clicked = allAssets.get(position);
            String key = clicked.key.toLowerCase();

            if (mSelectedKeys.contains(key)) {
                if (mSelectedKeys.size() <= 1) {
                    Toast.makeText(this, "حداقل ۱ ارز باید انتخاب شده باشد", Toast.LENGTH_SHORT).show();
                    return;
                }
                mSelectedKeys.remove(key);
            } else {
                if (mSelectedKeys.size() >= 4) {
                    Toast.makeText(this, "حداکثر ۴ ارز می‌توانید برای ویجت انتخاب کنید", Toast.LENGTH_SHORT).show();
                    return;
                }
                mSelectedKeys.add(key);
            }

            adapter.notifyDataSetChanged();
            updatePreview.run();
        });

        btnAddWidget.setOnClickListener(v -> {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mSelectedKeys.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(mSelectedKeys.get(i));
            }
            String resultCsv = sb.toString();

            // Save selected assets, digits language, and theme for this appWidgetId and globally
            SharedPreferences.Editor editor = getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit();
            if (mAppWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                editor.putString(PREF_PREFIX_KEY + mAppWidgetId, resultCsv);
                editor.putString(PREF_DIGITS_LANG_PREFIX + mAppWidgetId, mDigitsLang);
                editor.putString(PREF_THEME_PREFIX + mAppWidgetId, mTheme);
            }
            editor.putString("selected_assets", resultCsv);
            editor.putString("widget_digits_lang", mDigitsLang);
            editor.putString("widget_theme", mTheme);
            editor.apply();

            // Update widget immediately
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(WidgetConfigureActivity.this);
            if (mAppWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                KGoldWidgetProvider.updateAppWidget(WidgetConfigureActivity.this, appWidgetManager, mAppWidgetId);
            }
            KGoldWidgetProvider.updateAllWidgets(WidgetConfigureActivity.this);

            // Return success
            Intent resultValue = new Intent();
            if (mAppWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
            }
            setResult(RESULT_OK, resultValue);
            finish();
        });
    }
}
