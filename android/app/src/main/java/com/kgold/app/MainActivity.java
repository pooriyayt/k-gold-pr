package com.kgold.app;

import android.Manifest;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

public class MainActivity extends BridgeActivity {

    private static final int STORAGE_PERMISSION_CODE = 101;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Add Javascript Interface to WebView for Native Gallery Saving, Sharing, Widgets & In-App APK Updating
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new KGoldNativeBridge(), "AndroidBridge");
        }

        // Initialize widget auto-refresh background alarm and fetch latest prices
        KGoldWidgetProvider.scheduleAutoUpdate(this);
        KGoldWidgetProvider.fetchAndSyncLatestPrices(this);
    }

    public class KGoldNativeBridge {

        @JavascriptInterface
        public String saveImageToGallery(String base64Data, String filename) {
            try {
                if (base64Data == null || base64Data.isEmpty()) {
                    return "{\"success\":false,\"error\":\"داده تصویر خالی است\"}";
                }

                // Check permissions on Android <= 32
                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.S_V2) {
                    boolean writeGranted = ContextCompat.checkSelfPermission(MainActivity.this,
                            Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
                    boolean readGranted = ContextCompat.checkSelfPermission(MainActivity.this,
                            Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
                    if (!writeGranted && !readGranted) {
                        ActivityCompat.requestPermissions(MainActivity.this,
                                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE},
                                STORAGE_PERMISSION_CODE);
                    }
                }

                // Strip data URL prefix
                String pureBase64 = base64Data;
                if (pureBase64.contains(",")) {
                    pureBase64 = pureBase64.substring(pureBase64.indexOf(",") + 1);
                }

                byte[] decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT);
                String actualFilename = (filename != null && !filename.isEmpty())
                        ? filename
                        : "KGold_" + System.currentTimeMillis() + ".png";

                boolean savedSuccessfully = false;
                String savedPath = "";

                // Strategy 1: Android 10+ MediaStore
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    try {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.Images.Media.DISPLAY_NAME, actualFilename);
                        values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                        values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/KGold");
                        values.put(MediaStore.Images.Media.IS_PENDING, 1);

                        Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                        if (uri != null) {
                            try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                                if (os != null) {
                                    os.write(decodedBytes);
                                    os.flush();
                                    savedSuccessfully = true;
                                }
                            }
                            values.clear();
                            values.put(MediaStore.Images.Media.IS_PENDING, 0);
                            getContentResolver().update(uri, values, null, null);
                            savedPath = uri.toString();
                        }
                    } catch (Exception e) {
                        savedSuccessfully = false;
                    }
                }

                // Strategy 2: Direct public directory / Pictures / KGold (fallback or pre-Android 10)
                if (!savedSuccessfully) {
                    try {
                        File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "KGold");
                        if (!dir.exists()) {
                            dir.mkdirs();
                        }
                        File file = new File(dir, actualFilename);
                        try (FileOutputStream fos = new FileOutputStream(file)) {
                            fos.write(decodedBytes);
                            fos.flush();
                            savedSuccessfully = true;
                            savedPath = file.getAbsolutePath();
                        }
                        MediaScannerConnection.scanFile(MainActivity.this,
                                new String[]{file.getAbsolutePath()}, new String[]{"image/png"}, null);
                    } catch (Exception e) {
                        savedSuccessfully = false;
                    }
                }

                // Strategy 3: App external files dir as ultimate safe fallback
                if (!savedSuccessfully) {
                    File extDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
                    if (extDir != null) {
                        File file = new File(extDir, actualFilename);
                        try (FileOutputStream fos = new FileOutputStream(file)) {
                            fos.write(decodedBytes);
                            fos.flush();
                            savedSuccessfully = true;
                            savedPath = file.getAbsolutePath();
                        }
                        MediaScannerConnection.scanFile(MainActivity.this,
                                new String[]{file.getAbsolutePath()}, new String[]{"image/png"}, null);
                    }
                }

                if (savedSuccessfully) {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "کارت با موفقیت در گالری ذخیره شد ✓", Toast.LENGTH_SHORT).show());
                    return "{\"success\":true,\"path\":\"" + savedPath + "\"}";
                } else {
                    return "{\"success\":false,\"error\":\"امکان ذخیره فایل در حافظه وجود ندارد\"}";
                }

            } catch (Exception e) {
                return "{\"success\":false,\"error\":\"" + e.getMessage() + "\"}";
            }
        }

        @JavascriptInterface
        public void shareImage(String base64Data, String title) {
            try {
                if (base64Data == null || base64Data.isEmpty()) return;

                String pureBase64 = base64Data;
                if (pureBase64.contains(",")) {
                    pureBase64 = pureBase64.substring(pureBase64.indexOf(",") + 1);
                }
                byte[] decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT);

                // Save to app cache
                File cacheDir = new File(getCacheDir(), "shared_images");
                if (!cacheDir.exists()) cacheDir.mkdirs();
                File tempFile = new File(cacheDir, "kgold_share_" + System.currentTimeMillis() + ".png");
                try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                    fos.write(decodedBytes);
                    fos.flush();
                }

                Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", tempFile);

                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType("image/png");
                shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
                shareIntent.putExtra(Intent.EXTRA_TEXT, "استعلام قیمت لحظه‌ای طلا و ارز در کی‌گلد (KGold)");
                shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                Intent chooser = Intent.createChooser(shareIntent, title != null ? title : "اشتراک‌گذاری کارت قیمت کی‌گلد");
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(chooser);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void syncWidgetPrices(String pricesJson) {
            try {
                if (pricesJson == null || pricesJson.isEmpty()) return;
                JSONObject obj = new JSONObject(pricesJson);
                SharedPreferences.Editor editor = getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE).edit();

                Iterator<String> keys = obj.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    JSONObject itemObj = obj.getJSONObject(key);
                    if (itemObj.has("price")) {
                        editor.putString("price_" + key, itemObj.getString("price"));
                    }
                    if (itemObj.has("change")) {
                        editor.putString("change_" + key, itemObj.getString("change"));
                    }
                    if (itemObj.has("isPositive")) {
                        editor.putBoolean("is_pos_" + key, itemObj.getBoolean("isPositive"));
                    }
                }
                editor.apply();

                // Refresh all home screen widgets
                runOnUiThread(() -> KGoldWidgetProvider.updateAllWidgets(MainActivity.this));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void updateDefaultWidgetAssets(String assetsCsv) {
            try {
                if (assetsCsv == null || assetsCsv.isEmpty()) return;
                String[] parts = assetsCsv.split(",");
                java.util.List<String> list = new java.util.ArrayList<>();
                for (String p : parts) {
                    String trimmed = p.trim().toLowerCase();
                    if (!trimmed.isEmpty() && !list.contains(trimmed)) {
                        list.add(trimmed);
                    }
                }
                if (list.size() < 2) {
                    if (!list.contains("usd")) list.add("usd");
                    if (!list.contains("emami")) list.add("emami");
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < list.size(); i++) {
                    if (i > 0) sb.append(",");
                    sb.append(list.get(i));
                }
                String safeAssetsCsv = sb.toString();

                SharedPreferences prefs = getSharedPreferences(WidgetConfigureActivity.PREFS_NAME, Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = prefs.edit();
                editor.putString("selected_assets", safeAssetsCsv);

                // CRITICAL FIX: Overwrite all existing widget instances with this selection
                // so the user's home screen widget immediately updates to the new selection!
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(MainActivity.this);
                ComponentName thisWidget = new ComponentName(MainActivity.this, KGoldWidgetProvider.class);
                int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
                if (appWidgetIds != null && appWidgetIds.length > 0) {
                    for (int id : appWidgetIds) {
                        editor.putString(WidgetConfigureActivity.PREF_PREFIX_KEY + id, safeAssetsCsv);
                    }
                }
                editor.apply();

                runOnUiThread(() -> {
                    KGoldWidgetProvider.updateAllWidgets(MainActivity.this);
                    Toast.makeText(MainActivity.this, "ویجت با موفقیت به‌روزرسانی شد ✓", Toast.LENGTH_SHORT).show();
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void updateDefaultWidgetAsset(String assetKey) {
            updateDefaultWidgetAssets(assetKey);
        }

        @JavascriptInterface
        public void downloadAndInstallApk(final String downloadUrl) {
            new Thread(() -> {
                try {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "دریافت بروزرسانی آغاز شد...", Toast.LENGTH_SHORT).show());

                    String targetUrl = downloadUrl;
                    HttpURLConnection connection = null;

                    // Follow redirects (GitHub 302/307 to S3)
                    int redirects = 0;
                    while (redirects < 6) {
                        URL url = new URL(targetUrl);
                        connection = (HttpURLConnection) url.openConnection();
                        connection.setRequestProperty("User-Agent", "KGold-Android-Updater");
                        connection.setInstanceFollowRedirects(true);
                        connection.connect();
                        int responseCode = connection.getResponseCode();
                        if (responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                            responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                            responseCode == 307 || responseCode == 308) {
                            String newUrl = connection.getHeaderField("Location");
                            if (newUrl != null) {
                                targetUrl = newUrl;
                                redirects++;
                                continue;
                            }
                        }
                        break;
                    }

                    if (connection == null || connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                        final String errMsg = "خطا در اتصال به سرور بروزرسانی (" + (connection != null ? connection.getResponseCode() : -1) + ")";
                        runOnUiThread(() -> {
                            Toast.makeText(MainActivity.this, errMsg, Toast.LENGTH_LONG).show();
                            if (bridge != null && bridge.getWebView() != null) {
                                bridge.getWebView().evaluateJavascript("if(window.onUpdateDownloadError) window.onUpdateDownloadError('" + errMsg + "');", null);
                            }
                        });
                        return;
                    }

                    int fileLength = connection.getContentLength();
                    File cacheDir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "updates");
                    if (!cacheDir.exists()) cacheDir.mkdirs();
                    File outputFile = new File(cacheDir, "KGold_update.apk");
                    if (outputFile.exists()) outputFile.delete();

                    try (InputStream input = connection.getInputStream();
                         FileOutputStream output = new FileOutputStream(outputFile)) {

                        byte[] data = new byte[8192];
                        long total = 0;
                        int count;
                        long lastNotifyTime = 0;

                        while ((count = input.read(data)) != -1) {
                            total += count;
                            output.write(data, 0, count);

                            long now = System.currentTimeMillis();
                            if (now - lastNotifyTime > 120) {
                                lastNotifyTime = now;
                                final int percent = fileLength > 0 ? (int) ((total * 100) / fileLength) : -1;
                                final double downloadedMb = (double) total / (1024 * 1024);
                                final double totalMb = fileLength > 0 ? (double) fileLength / (1024 * 1024) : 0;

                                runOnUiThread(() -> {
                                    if (bridge != null && bridge.getWebView() != null) {
                                        bridge.getWebView().evaluateJavascript(
                                            String.format(java.util.Locale.US,
                                                "if(window.onUpdateDownloadProgress) window.onUpdateDownloadProgress(%d, %.2f, %.2f);",
                                                percent, downloadedMb, totalMb),
                                            null
                                        );
                                    }
                                });
                            }
                        }
                        output.flush();
                    }

                    // Notify complete
                    runOnUiThread(() -> {
                        if (bridge != null && bridge.getWebView() != null) {
                            bridge.getWebView().evaluateJavascript("if(window.onUpdateDownloadComplete) window.onUpdateDownloadComplete();", null);
                        }
                    });

                    // Check unknown sources on Android 8+
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        if (!getPackageManager().canRequestPackageInstalls()) {
                            Intent allowIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()));
                            allowIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(allowIntent);
                        }
                    }

                    // Launch PackageInstaller
                    Uri apkUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", outputFile);
                    Intent installIntent = new Intent(Intent.ACTION_VIEW);
                    installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                    installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(installIntent);

                } catch (final Exception e) {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "خطا در دانلود یا نصب: " + e.getMessage(), Toast.LENGTH_LONG).show();
                        if (bridge != null && bridge.getWebView() != null) {
                            bridge.getWebView().evaluateJavascript("if(window.onUpdateDownloadError) window.onUpdateDownloadError('" + e.getMessage() + "');", null);
                        }
                    });
                }
            }).start();
        }
    }
}
