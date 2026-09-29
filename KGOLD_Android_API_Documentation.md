# مستندات جامع API نرم‌افزار اندروید کی‌گلد (K-GOLD Android API Documentation)

این مستند شامل مشخصات فنی اندپوینت‌ها، هدرهای امنیتی الزامی، مدل‌های داده‌ای (Data Models)، نمونه کامل خروجی‌های JSON واقعی و کدهای آماده کاتلین (Kotlin / Retrofit) جهت پیاده‌سازی و ساخت اپلیکیشن بومی اندروید است.

---

## ۱. مشخصات عمومی سرور و امنیت (Base Specs & Security)

- **Base URL:** `https://kgold.irkinsta.top`
- **Protocol:** `HTTPS`
- **Data Format:** `JSON` (UTF-8)
- **Architecture:** `RESTful` (متدهای `GET`)
- **Refresh Interval (توصیه‌شده):** هر ۶۰ الی ۱۸۰ ثانیه یا از طریق قابلیت Pull-to-Refresh کاربر

### ⚠️ هدرهای امنیتی الزامی (Security Headers - شیلد محافظتی)
کلیه اندپوینت‌های سرور مجهز به شیلد امنیتی ضد اسکرپ هستند. هر درخواستی از سمت کلاینت اندروید **باید** هدرهای زیر را ارسال کند؛ در غیر این صورت سرور خطای `403 Forbidden` بازمی‌گرداند:

| Header Name | Value | توضیحات |
| :--- | :--- | :--- |
| `X-KGOLD-Shield` | `kG0ld_S3cur3_Sh1eld_9982` | **الزامی:** کلید اختصاصی احراز هویت اپلیکیشن |
| `X-Requested-With` | `XMLHttpRequest` | الزامی جهت شناسایی درخواست‌های کلاینتی |
| `User-Agent` | `KGOLD-Android-App/1.0` | نام اختصاصی نرم‌افزار اندروید |

---

## ۲. مشخصات اندپوینت‌ها (API Endpoints)

### اندپوینت اول: طلا، سکه، ارزهای فیات و خودرو
- **URL:** `https://kgold.irkinsta.top/api/prices`
- **Method:** `GET`
- **Description:** بازگرداننده کلیه نرخ‌های ارزهای خارجی، طلا و مسکوکات، قیمت انواع خودروها و برچسب زمان آخرین بروزرسانی.

#### نمونه خروجی JSON واقعی (Response Sample):
```json
{
  "currencies": [
    {
      "name": "دلار آمریکا",
      "code": "USD",
      "price": "233,900",
      "change_24h": "+1.09%",
      "change_7d": "+1.14%",
      "change_30d": "+3.62%"
    },
    {
      "name": "یورو",
      "code": "EUR",
      "price": "268,100",
      "change_24h": "+0.98%",
      "change_7d": "+0.46%",
      "change_30d": "+2.63%"
    },
    {
      "name": "درهم امارات",
      "code": "AED",
      "price": "63,680",
      "change_24h": "+1.08%",
      "change_7d": "+1.13%",
      "change_30d": "+3.61%"
    },
    {
      "name": "لیر ترکیه",
      "code": "TRY",
      "price": "4,860",
      "change_24h": "+1.00%",
      "change_7d": "+0.69%",
      "change_30d": "+2.90%"
    },
    {
      "name": "پوند انگلیس",
      "code": "GBP",
      "price": "308,800",
      "change_24h": "+0.88%",
      "change_7d": "+0.82%",
      "change_30d": "+2.83%"
    }
  ],
  "gold": [
    {
      "name": "حباب سکه امامی",
      "price": "226,000",
      "change_24h": "-2.10%",
      "change_7d": "N/A",
      "change_30d": "N/A"
    },
    {
      "name": "طلای 18 عیار / 750",
      "price": "23,933,000",
      "change_24h": "+0.20%",
      "change_7d": "+2.93%",
      "change_30d": "+2.60%"
    },
    {
      "name": "طلای ۲۴ عیار",
      "price": "31,910,300",
      "change_24h": "+0.20%",
      "change_7d": "+2.93%",
      "change_30d": "+2.60%"
    },
    {
      "name": "سکه امامی",
      "price": "273,500,000",
      "change_24h": "-0.18%",
      "change_7d": "+2.82%",
      "change_30d": "+3.80%"
    },
    {
      "name": "سکه بهار آزادی",
      "price": "249,000,000",
      "change_24h": "-0.20%",
      "change_7d": "+2.68%",
      "change_30d": "+3.75%"
    },
    {
      "name": "نیم سکه",
      "price": "148,000,000",
      "change_24h": "-0.34%",
      "change_7d": "+2.07%",
      "change_30d": "+3.50%"
    },
    {
      "name": "ربع سکه",
      "price": "87,000,000",
      "change_24h": "-0.57%",
      "change_7d": "+1.75%",
      "change_30d": "+3.57%"
    },
    {
      "name": "سکه گرمی",
      "price": "33,000,000",
      "change_24h": "-2.46%",
      "change_7d": "0.00%",
      "change_30d": "-1.06%"
    },
    {
      "name": "مثقال طلا",
      "price": "103,673,000",
      "change_24h": "+0.20%",
      "change_7d": "+2.93%",
      "change_30d": "+2.60%"
    },
    {
      "name": "انس طلا",
      "price": "3,025.50",
      "change_24h": "+0.45%",
      "change_7d": "+1.20%",
      "change_30d": "+2.80%"
    }
  ],
  "cars": {
    "ایران خودرو": [
      {
        "name": "1404 پژو 207، اتوماتیک، سقف پانوراما (قیمت بازار)",
        "price": "1,390,000,000"
      },
      {
        "name": "1404 تارا، اتوماتیک، V4 LX (قیمت بازار)",
        "price": "1,450,000,000"
      },
      {
        "name": "1404 دنا پلاس، اتوماتیک، توربو آپشنال (قیمت بازار)",
        "price": "1,490,000,000"
      }
    ],
    "سایپا": [
      {
        "name": "1404 شاهین، اتوماتیک، G (قیمت بازار)",
        "price": "1,050,000,000"
      },
      {
        "name": "1404 کوییک، دنده‌ای، S (قیمت بازار)",
        "price": "560,000,000"
      },
      {
        "name": "1404 ساینا، دنده‌ای، S (قیمت بازار)",
        "price": "540,000,000"
      }
    ]
  },
  "last_update": "2026-09-22 15:10"
}
```

---

### اندپوینت دوم: نرخ زنده ارزهای دیجیتال (Cryptocurrency Markets)
- **URL:** `https://kgold.irkinsta.top/api/crypto`
- **Method:** `GET`
- **Description:** بازگرداننده لیست کامل مارکت‌های ارز دیجیتال با دو پایه معاملاتی تومان (`_IRT`) و تتر (`_USDT`).
- **نکات مهم فیلدها:**
  - `symbol`: نماد جفت‌ارز معاملاتی (مثلاً `BTC_IRT` یعنی بیت‌کوین به تومان، `BTC_USDT` یعنی بیت‌کوین به دلار/تتر).
  - `price`: عدد قیمت لحظه‌ای (در صورت پسوند `_IRT` به تومان، و در صورت `_USDT` به دلار).
  - `daily_change_price`: درصد نوسان ۲۴ ساعته (عدد اعشاری مثبت یا منفی).
  - `low` و `high`: کمترین و بیشترین قیمت معامله‌شده در ۲۴ ساعت گذشته.
  - `timestamp`: برچسب زمانی یونیکس (Unix Timestamp).

#### نمونه خروجی JSON واقعی (Response Sample):
```json
[
  {
    "symbol": "BTC_IRT",
    "price": "19848860115",
    "daily_change_price": 2.39,
    "low": "19360369956",
    "high": "20000000000",
    "timestamp": 1790077156.696331
  },
  {
    "symbol": "BTC_USDT",
    "price": "86194.05",
    "daily_change_price": 1.76,
    "low": "84679.43",
    "high": "87420.09",
    "timestamp": 1790077191.183304
  },
  {
    "symbol": "ETH_IRT",
    "price": "632151849",
    "daily_change_price": 1.33,
    "low": "619991506",
    "high": "640983759",
    "timestamp": 1790076977.676596
  },
  {
    "symbol": "ETH_USDT",
    "price": "2745.20",
    "daily_change_price": 0.85,
    "low": "2710.00",
    "high": "2785.40",
    "timestamp": 1790076978.102145
  },
  {
    "symbol": "USDT_IRT",
    "price": "230664",
    "daily_change_price": 0.78,
    "low": "227795",
    "high": "231996",
    "timestamp": 1790077191.555363
  },
  {
    "symbol": "TON_IRT",
    "price": "872500",
    "daily_change_price": 1.15,
    "low": "858000",
    "high": "885000",
    "timestamp": 1790077100.123456
  },
  {
    "symbol": "SOL_IRT",
    "price": "27015000",
    "daily_change_price": 0.47,
    "low": "26500000",
    "high": "27450000",
    "timestamp": 1790076977.968239
  },
  {
    "symbol": "UNI_IRT",
    "price": "2004652",
    "daily_change_price": -2.46,
    "low": "1989102",
    "high": "2110106",
    "timestamp": 1790076794.080565
  }
]
```

---

### اندپوینت سوم: تفکیک اختصاصی قیمت خودروها
- **URL:** `https://kgold.irkinsta.top/api/cars`
- **Method:** `GET`
- **Description:** بازگرداننده قیمت خودروهای صفر کیلومتر داخلی و مونتاژی به تفکیک کارخانه و برند.

#### نمونه خروجی JSON واقعی (Response Sample):
```json
{
  "ایران خودرو": [
    {
      "name": "1404 پژو 207، اتوماتیک، سقف پانوراما (قیمت بازار)",
      "price": "1,390,000,000"
    },
    {
      "name": "1404 پژو 207، دنده‌ای، ارتقا یافته (قیمت بازار)",
      "price": "980,000,000"
    },
    {
      "name": "1404 تارا، اتوماتیک، V4 LX (قیمت بازار)",
      "price": "1,450,000,000"
    },
    {
      "name": "1404 دنا پلاس، اتوماتیک، توربو آپشنال (قیمت بازار)",
      "price": "1,490,000,000"
    }
  ],
  "سایپا": [
    {
      "name": "1404 شاهین، اتوماتیک، G (قیمت بازار)",
      "price": "1,050,000,000"
    },
    {
      "name": "1404 کوییک، دنده‌ای، S (قیمت بازار)",
      "price": "560,000,000"
    },
    {
      "name": "1404 ساینا، دنده‌ای، S (قیمت بازار)",
      "price": "540,000,000"
    }
  ],
  "بهمن موتور": [
    {
      "name": "1404 دیگنیتی، پرستیژ (قیمت بازار)",
      "price": "2,650,000,000"
    },
    {
      "name": "1404 فیدلیتی، پرایم، 7 نفره (قیمت بازار)",
      "price": "2,280,000,000"
    }
  ],
  "مدیران خودرو (ام وی ام - فونیکس)": [
    {
      "name": "1404 فونیکس، FX، پرمیوم (قیمت بازار)",
      "price": "2,820,000,000"
    },
    {
      "name": "1404 ام وی ام، X22 پرو، دنده‌ای (قیمت بازار)",
      "price": "1,180,000,000"
    }
  ]
}
```

---

## ۳. راهنمای CDN تصاویر و لوگوها برای برنامه اندروید

برنامه اندروید می‌تواند لوگوی ارزها را از طریق کتابخانه‌هایی مانند **Glide** یا **Coil** لود کند:

### ۱. پرچم ارزهای فیات (USD, EUR, AED, TRY, ...):
- **الگوی آدرس FlagCDN:**
  ```text
  https://flagcdn.com/w160/{country_code}.png
  ```
- **جدول کد پرچم کشورهای پرکاربرد:**
  - دلار آمریکا (`USD`): `us`
  - یورو (`EUR`): `eu`
  - درهم امارات (`AED`): `ae`
  - لیر ترکیه (`TRY`): `tr`
  - پوند بریتانیا (`GBP`): `gb`
  - دلار کانادا (`CAD`): `ca`
  - دلار استرالیا (`AUD`): `au`
  - فرانک سوئیس (`CHF`): `ch`
  - یوان چین (`CNY`): `cn`
  - روبل روسیه (`RUB`): `ru`
  - دینار عراق (`IQD`): `iq`
  - ریال عمان (`OMR`): `om`
  - ریال عربستان (`SAR`): `sa`
  - دینار کویت (`KWD`): `kw`
  - گریونا اوکراین (`UAH`): `ua`
  - پزو آرژانتین (`ARS`): `ar`

### ۲. لوگوی ارزهای دیجیتال (BTC, ETH, USDT, TON, UNI, ...):
- **الگوی آدرس Spothq Icons (PNG کیفیت بالا):**
  ```text
  https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/{ticker_lowercase}.png
  ```
- **الگوی آدرس وکتور SVG:**
  ```text
  https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/{ticker_lowercase}.svg
  ```
- **لوگوی جایگزین هوشمند (Fallback Placeholder):**
  در صورت عدم وجود آیکون برای یک توکن جدید، از آواتار متنی استفاده شود:
  ```text
  https://ui-avatars.com/api/?name={TICKER}&size=128&background=1e2535&color=7dd3fc&bold=true
  ```

---

## ۴. مدل‌های داده‌ای آماده در کاتلین (Kotlin Data Classes)

کدهای آماده زیر را مستقیماً در پکیج `model` یا `data` در پروژه اندروید کپی کنید (سازگار با `Gson` و `Moshi`):

```kotlin
package com.kgold.app.data.model

import com.google.gson.annotations.SerializedName

// -------------------------------------------------------------
// 1. مدل پاسخ /api/prices
// -------------------------------------------------------------
data class PricesResponse(
    @SerializedName("currencies") val currencies: List<CurrencyItem>,
    @SerializedName("gold") val gold: List<GoldItem>,
    @SerializedName("cars") val cars: Map<String, List<CarItem>>,
    @SerializedName("last_update") val lastUpdate: String
)

data class CurrencyItem(
    @SerializedName("name") val name: String,
    @SerializedName("code") val code: String,
    @SerializedName("price") val price: String,
    @SerializedName("change_24h") val change24h: String,
    @SerializedName("change_7d") val change7d: String?,
    @SerializedName("change_30d") val change30d: String?
)

data class GoldItem(
    @SerializedName("name") val name: String,
    @SerializedName("price") val price: String,
    @SerializedName("change_24h") val change24h: String,
    @SerializedName("change_7d") val change7d: String?,
    @SerializedName("change_30d") val change30d: String?
)

data class CarItem(
    @SerializedName("name") val name: String,
    @SerializedName("price") val price: String
)

// -------------------------------------------------------------
// 2. مدل پاسخ /api/crypto
// -------------------------------------------------------------
data class CryptoItem(
    @SerializedName("symbol") val symbol: String,
    @SerializedName("price") val price: String,
    @SerializedName("daily_change_price") val dailyChangePercent: Double,
    @SerializedName("low") val low: String,
    @SerializedName("high") val high: String,
    @SerializedName("timestamp") val timestamp: Double
) {
    // توابع کمکی کاربردی برای UI اندروید
    val baseAsset: String
        get() = symbol.substringBefore("_").uppercase()

    val quoteAsset: String
        get() = symbol.substringAfter("_").uppercase()

    val isTomanMarket: Boolean
        get() = quoteAsset == "IRT"
}
```

---

## ۵. نمونه کد راه‌اندازی شبکه در اندروید (Retrofit & OkHttp)

### ۱. اینترفیس API (`KgoldApiService.kt`):
```kotlin
package com.kgold.app.data.api

import com.kgold.app.data.model.CarItem
import com.kgold.app.data.model.CryptoItem
import com.kgold.app.data.model.PricesResponse
import retrofit2.Response
import retrofit2.http.GET

interface KgoldApiService {

    @GET("api/prices")
    async fun getPrices(): Response<PricesResponse>

    @GET("api/crypto")
    async fun getCrypto(): Response<List<CryptoItem>>

    @GET("api/cars")
    async fun getCars(): Response<Map<String, List<CarItem>>>
}
```

### ۲. تنظیم OkHttpClient با هدر شیلد (`NetworkModule.kt`):
```kotlin
package com.kgold.app.di

import com.kgold.app.data.api.KgoldApiService
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {

    private const val BASE_URL = "https://kgold.irkinsta.top/"
    private const val SHIELD_TOKEN = "kG0ld_S3cur3_Sh1eld_9982"

    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val requestWithHeaders = originalRequest.newBuilder()
            .header("X-KGOLD-Shield", SHIELD_TOKEN)
            .header("X-Requested-With", "XMLHttpRequest")
            .header("User-Agent", "KGOLD-Android-App/1.0")
            .header("Cache-Control", "no-cache")
            .build()
        chain.proceed(requestWithHeaders)
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    val apiService: KgoldApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(KgoldApiService::class.java)
    }
}
```

---

## ۶. توصیه‌های کلیدی برای برنامه‌نویس اندروید

1. **نمایش تغییرات قیمت (Price Change Colors):**
   - اگر درصد تغییر مثبت بود (`> 0`): رنگ سبز `#10B981` (مثلاً `+1.09%`)
   - اگر درصد تغییر منفی بود (`< 0`): رنگ قرمز `#EF4444` (مثلاً `-0.18%`)
   - اگر صفر بود (`== 0`): رنگ خاکستری `#6B7280`
2. **قالب‌بندی اعداد (Formatting):**
   - کلیه قیمت‌های فیات، طلا و خودرو به صورت رشته رشته با جداکننده کاما (`1,390,000,000`) تحویل داده می‌شوند. برای محاسبات، کاماها را حذف (`replace(",", "")`) و به `Long` یا `Double` تبدیل کنید.
   - در بخش کریپتو، قیمت‌های `_IRT` بدون ممیز (یا تا صفر رقم اعشار) و قیمت‌های `_USDT` بسته به ارزش کوین (از ۲ تا ۶ رقم اعشار) فرمت شوند.
3. **کش آفلاین (Offline Caching):**
   - پیشنهاد می‌شود پاسخ جیسون دریافتی در `Room Database` یا `DataStore` ذخیره شود تا هنگام باز شدن اپ در صورت قطعی اینترنت، آخرین قیمت‌های ثبت‌شده سریعاً برای کاربر رندر شوند.
