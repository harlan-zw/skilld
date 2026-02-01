/**
 * GitHub/ungh README resolution
 */

import { fetchText, verifyUrl } from './utils'

/**
 * Fetch GitHub repo metadata to get website URL
 */
export async function fetchGitHubRepoMeta(owner: string, repo: string): Promise<{ homepage?: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok) return null
  const data = await res.json().catch(() => null)
  return data?.homepage ? { homepage: data.homepage } : null
}

/**
 * Resolve README URL for a GitHub repo, returns ungh:// pseudo-URL or raw URL
 */
export async function fetchReadme(owner: string, repo: string, subdir?: string): Promise<string | null> {
  // Try ungh first
  const unghUrl = subdir
    ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md`
    : `https://ungh.cc/repos/${owner}/${repo}/readme`

  const unghRes = await fetch(unghUrl, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (unghRes?.ok) {
    return `ungh://${owner}/${repo}${subdir ? `/${subdir}` : ''}`
  }

  // Fallback to raw.githubusercontent.com
  const basePath = subdir ? `${subdir}/` : ''
  for (const branch of ['main', 'master']) {
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${basePath}README.md`
    if (await verifyUrl(readmeUrl)) {
      return readmeUrl
    }
  }

  return null
}

/**
 * Fetch README content from ungh:// pseudo-URL or regular URL
 */
export async function fetchReadmeContent(url: string): Promise<string | null> {
  if (url.startsWith('ungh://')) {
    const parts = url.replace('ungh://', '').split('/')
    const owner = parts[0]
    const repo = parts[1]
    const subdir = parts.slice(2).join('/')

    const unghUrl = subdir
      ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md`
      : `https://ungh.cc/repos/${owner}/${repo}/readme`

    const res = await fetch(unghUrl, {
      headers: { 'User-Agent': 'skilld/1.0' },
    }).catch(() => null)

    if (!res?.ok) return null

    const text = await res.text()
    try {
      const json = JSON.parse(text) as { markdown?: string, file?: { contents?: string } }
      return json.markdown || json.file?.contents || null
    }
    catch {
      return text
    }
  }

  return fetchText(url)
}
