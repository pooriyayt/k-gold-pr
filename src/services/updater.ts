// In-App Auto Update Service via GitHub Releases API

export interface ReleaseInfo {
  version: string;
  name: string;
  body: string;
  publishedAt: string;
  apkDownloadUrl: string;
  apkSizeMb: number;
  releaseUrl: string;
}

export const CURRENT_APP_VERSION = 'v1.3.3';
const GITHUB_REPO = 'pooriyayt/k-gold-pr';
const GITHUB_TOKEN = '';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

/**
 * Compare two semver-like version strings (e.g., 'v1.2.0' vs 'v1.1.0')
 * Returns true if remoteVersion > currentVersion
 */
export function isNewerVersion(remoteVersion: string, currentVersion: string = CURRENT_APP_VERSION): boolean {
  const cleanRemote = remoteVersion.replace(/^v/i, '').trim();
  const cleanCurrent = currentVersion.replace(/^v/i, '').trim();

  const rParts = cleanRemote.split('.').map((n) => parseInt(n, 10) || 0);
  const cParts = cleanCurrent.split('.').map((n) => parseInt(n, 10) || 0);

  const len = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < len; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

/**
 * Fetch the latest release information from GitHub Releases API
 */
export async function checkLatestRelease(): Promise<{
  hasUpdate: boolean;
  release: ReleaseInfo | null;
  error?: string;
}> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'KGold-Android-App',
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const res = await fetch(GITHUB_API_URL, { headers });

    if (!res.ok) {
      if (res.status === 404) {
        return { hasUpdate: false, release: null, error: 'برنامه شما آخرین نسخه است.' };
      }
      return { hasUpdate: false, release: null, error: `خطا در دریافت وضعیت بروزرسانی (${res.status})` };
    }

    const data = await res.json();
    const tagName = data.tag_name || '';

    // Find attached KGold.apk asset
    const apkAsset = Array.isArray(data.assets)
      ? data.assets.find((a: any) => a.name && a.name.toLowerCase().endsWith('.apk'))
      : null;

    let apkDownloadUrl = apkAsset ? apkAsset.browser_download_url : data.html_url;

    // If private repo, resolve pre-signed direct download link via HEAD request
    if (apkAsset?.url && GITHUB_TOKEN) {
      try {
        const headRes = await fetch(apkAsset.url, {
          method: 'HEAD',
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/octet-stream',
            'User-Agent': 'KGold-Android-App',
          },
        });
        if (headRes.ok && headRes.url && headRes.url.includes('release-assets.githubusercontent.com')) {
          apkDownloadUrl = headRes.url;
        }
      } catch {}
    }

    const apkSizeMb = apkAsset ? Number((apkAsset.size / (1024 * 1024)).toFixed(2)) : 0;

    const release: ReleaseInfo = {
      version: tagName,
      name: data.name || tagName,
      body: data.body || 'تغییرات جزئی و بهبود عملکرد برنامه.',
      publishedAt: data.published_at || '',
      apkDownloadUrl,
      apkSizeMb,
      releaseUrl: data.html_url || '',
    };

    const hasUpdate = isNewerVersion(tagName, CURRENT_APP_VERSION);

    return {
      hasUpdate,
      release,
    };
  } catch (err: any) {
    return {
      hasUpdate: false,
      release: null,
      error: 'خطا در برقراری ارتباط با گیت‌هاب.',
    };
  }
}
