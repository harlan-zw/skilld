import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
const mockGetGitHubToken = vi.fn<() => string | null>(() => null);
const mockIsKnownPrivateRepo = vi.fn<(owner: string, repo: string) => boolean>(() => false);
const mockMarkRepoPrivate = vi.fn();

vi.mock("ofetch", () => ({
  ofetch: {
    create: () => Object.assign(mockFetch, { raw: vi.fn() }),
  },
}));

vi.mock("../../src/sources/github-common", () => ({
  getGitHubToken: mockGetGitHubToken,
  isKnownPrivateRepo: mockIsKnownPrivateRepo,
  markRepoPrivate: mockMarkRepoPrivate,
}));

const { fetchGitHubRaw } = await import("../../src/sources/utils");

describe("sources/utils auth", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockGetGitHubToken.mockReset();
    mockIsKnownPrivateRepo.mockReset();
    mockMarkRepoPrivate.mockReset();
    mockGetGitHubToken.mockReturnValue(null);
    mockIsKnownPrivateRepo.mockReturnValue(false);
  });

  it("returns unauthenticated content for public repos", async () => {
    mockFetch.mockResolvedValueOnce("public content");

    const result = await fetchGitHubRaw(
      "https://raw.githubusercontent.com/owner/repo/main/README.md",
    );

    expect(result).toBe("public content");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/owner/repo/main/README.md",
      { responseType: "text" },
    );
  });

  it("falls back to authenticated request when unauthenticated request fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("403")).mockResolvedValueOnce("private content");
    mockGetGitHubToken.mockReturnValue("ghs_test");

    const result = await fetchGitHubRaw(
      "https://raw.githubusercontent.com/owner/repo/main/docs.md",
    );

    expect(result).toBe("private content");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://raw.githubusercontent.com/owner/repo/main/docs.md",
      { responseType: "text", headers: { Authorization: "token ghs_test" } },
    );
  });

  it("returns null when unauthenticated fails and no token available", async () => {
    mockFetch.mockRejectedValueOnce(new Error("404"));
    mockGetGitHubToken.mockReturnValue(null);

    const result = await fetchGitHubRaw(
      "https://raw.githubusercontent.com/owner/repo/main/missing.md",
    );

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("skips unauthenticated request for known private repos", async () => {
    mockIsKnownPrivateRepo.mockReturnValue(true);
    mockGetGitHubToken.mockReturnValue("ghs_private");
    mockFetch.mockResolvedValueOnce("secret docs");

    const result = await fetchGitHubRaw(
      "https://raw.githubusercontent.com/private/repo/main/docs.md",
    );

    expect(result).toBe("secret docs");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/private/repo/main/docs.md",
      { responseType: "text", headers: { Authorization: "token ghs_private" } },
    );
  });

  it("marks repo as private when auth fallback succeeds", async () => {
    mockFetch.mockRejectedValueOnce(new Error("403")).mockResolvedValueOnce("private content");
    mockGetGitHubToken.mockReturnValue("ghs_test");

    await fetchGitHubRaw("https://raw.githubusercontent.com/owner/repo/main/docs.md");

    expect(mockMarkRepoPrivate).toHaveBeenCalledWith("owner", "repo");
  });

  it("returns null for known private repos when token is unavailable", async () => {
    mockIsKnownPrivateRepo.mockReturnValue(true);
    mockGetGitHubToken.mockReturnValue(null);

    const result = await fetchGitHubRaw(
      "https://raw.githubusercontent.com/private/repo/main/docs.md",
    );

    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
