# Add project specific ProGuard rules here.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep Capacitor Core & Plugins
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep KGold App & Native Bridge
-keep class com.kgold.app.** { *; }
-keepclassmembers class com.kgold.app.MainActivity$KGoldNativeBridge {
    public *;
}

# Keep WebKit & AndroidX
-keep class androidx.webkit.** { *; }
-dontwarn com.getcapacitor.**
