package com.kgold.app;

import android.Manifest;
import android.content.ContentValues;
import android.content.Intent;
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

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Add Javascript Interface to WebView for Native Gallery Saving, Sharing & In-App APK Updating
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new KGoldNativeBridge(), "AndroidBridge");
        }
    }

    public class KGoldNativeBridge {

        @JavascriptInterface
        public String saveImageToGallery(String base64Data, String filename) {
            try {
                if (base64Data == null || base64Data.isEmpty()) {
                    return "{\"success\":false,\"error\":\"Empty base64 data\"}";
                }

                // Check permissions on older Android (<= API 28)
                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
                    if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                            != PackageManager.PERMISSION_GRANTED) {
                        ActivityCompat.requestPermissions(MainActivity.this,
                                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 101);
                        return "{\"success\":false,\"error\":\"Permission requested\"}";
                    }
                }

                // Strip data URL prefix if present
                String pureBase64 = base64Data;
                if (pureBase64.contains(",")) {
                    pureBase64 = pureBase64.substring(pureBase64.indexOf(",") + 1);
                }

                byte[] decodedBytes = Base64.decode(pureBase64, Base64.DEFAULT);
                String actualFilename = (filename != null && !filename.isEmpty()) ? filename : "KGold_" + System.currentTimeMillis() + ".png";

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // Android 10+ MediaStore approach (No dangerous storage permission required)
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
                            }
                        }
                        values.clear();
                        values.put(MediaStore.Images.Media.IS_PENDING, 0);
                        getContentResolver().update(uri, values, null, null);

                        runOnUiThread(() -> Toast.makeText(MainActivity.this, "کارت قیمت با موفقیت در گالری ذخیره شد", Toast.LENGTH_LONG).show());
                        return "{\"success\":true,\"uri\":\"" + uri.toString() + "\"}";
                    }
                } else {
                    // Legacy Android (< Android 10)
                    File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "KGold");
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    File file = new File(dir, actualFilename);
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(decodedBytes);
                        fos.flush();
                    }
                    MediaScannerConnection.scanFile(MainActivity.this, new String[]{file.getAbsolutePath()}, new String[]{"image/png"}, null);

                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "کارت قیمت با موفقیت در گالری ذخیره شد", Toast.LENGTH_LONG).show());
                    return "{\"success\":true,\"path\":\"" + file.getAbsolutePath() + "\"}";
                }
            } catch (Exception e) {
                return "{\"success\":false,\"error\":\"" + e.getMessage() + "\"}";
            }
            return "{\"success\":false,\"error\":\"Unknown error\"}";
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
