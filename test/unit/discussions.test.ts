import type { GitHubDiscussion } from "../../src/sources/discussions";
import { describe, expect, it } from "vitest";
import { scoreDiscussion } from "../../src/sources/discussions";

function makeDiscussion(overrides: Partial<GitHubDiscussion> = {}): GitHubDiscussion {
  return {
    number: 1,
    title: "How to use defineModel with TypeScript",
    body: "I have a component using `defineModel<string>()`...",
    category: "Help/Questions",
    createdAt: "2025-12-01T00:00:00Z",
    url: "https://github.com/orgs/vuejs/discussions/1",
    upvoteCount: 2,
    comments: 3,
    topComments: [],
    ...overrides,
  };
}

describe("scoreDiscussion", () => {
  it("rejects job postings", () => {
    expect(
      scoreDiscussion(
        makeDiscussion({ title: "looking senior full stack developer for ongoing projects" }),
      ),
    ).toBe(-1);
  });

  it('rejects "guide me to complete" requests', () => {
    expect(
      scoreDiscussion(makeDiscussion({ title: "guide me to complete the attendance project" })),
    ).toBe(-1);
  });

  it("rejects tutorial-seeking titles", () => {
    expect(
      scoreDiscussion(
        makeDiscussion({ title: "Seeking Recommended Tutorial: HREF and Form Values" }),
      ),
    ).toBe(-1);
  });

  it("rejects hiring posts", () => {
    expect(scoreDiscussion(makeDiscussion({ title: "hiring Vue.js developer" }))).toBe(-1);
  });

  it("scores code presence highly", () => {
    const withCode = makeDiscussion({
      body: "Example:\n```vue\n<script setup>\nconst x = ref(0)\n</script>\n```",
      upvoteCount: 0,
    });
    const withoutCode = makeDiscussion({
      body: "I have a problem with my component",
      upvoteCount: 0,
    });
    expect(scoreDiscussion(withCode)).toBeGreaterThan(scoreDiscussion(withoutCode));
  });

  it("scores code in comments even if body has none", () => {
    const d = makeDiscussion({
      body: "Why does this not work?",
      upvoteCount: 0,
      topComments: [{ body: "```js\nwatch(() => foo, cb)\n```", author: "helper", reactions: 0 }],
    });
    expect(scoreDiscussion(d)).toBeGreaterThanOrEqual(3);
  });

  it("scores accepted answers", () => {
    const answered = makeDiscussion({
      answer: "Use `toRef` to preserve reactivity. Here is an example that shows...",
      upvoteCount: 0,
    });
    const unanswered = makeDiscussion({ upvoteCount: 0 });
    expect(scoreDiscussion(answered)).toBeGreaterThan(scoreDiscussion(unanswered));
  });

  it("scores longer answers higher", () => {
    const short = makeDiscussion({ answer: "Yes.", upvoteCount: 0 });
    const long = makeDiscussion({
      answer:
        "Use `toRef` to preserve reactivity. The reason this happens is that destructuring breaks the reactive proxy connection, so you need to either use a getter function with watch or wrap it in toRef.",
      upvoteCount: 0,
    });
    expect(scoreDiscussion(long)).toBeGreaterThan(scoreDiscussion(short));
  });

  it("scores maintainer-authored discussions highly", () => {
    const maintainerAuthored = makeDiscussion({
      isMaintainer: true,
      upvoteCount: 0,
      body: "No code here",
    });
    const communityAuthored = makeDiscussion({ upvoteCount: 0, body: "No code here" });
    expect(scoreDiscussion(maintainerAuthored)).toBeGreaterThan(scoreDiscussion(communityAuthored));
    // Maintainer-authored should pass threshold even with minimal engagement
    expect(scoreDiscussion(maintainerAuthored)).toBeGreaterThanOrEqual(3);
  });

  it("scores maintainer comment involvement", () => {
    const withMaintainer = makeDiscussion({
      upvoteCount: 0,
      topComments: [
        {
          body: "This is expected behavior",
          author: "yyx990803",
          reactions: 0,
          isMaintainer: true,
        },
      ],
    });
    const withoutMaintainer = makeDiscussion({
      upvoteCount: 0,
      topComments: [{ body: "This is expected behavior", author: "random", reactions: 0 }],
    });
    expect(scoreDiscussion(withMaintainer)).toBeGreaterThan(scoreDiscussion(withoutMaintainer));
  });

  it("scores upvotes (capped at 5)", () => {
    const low = makeDiscussion({ upvoteCount: 1 });
    const high = makeDiscussion({ upvoteCount: 10 });
    expect(scoreDiscussion(high)).toBeGreaterThan(scoreDiscussion(low));
    // Cap difference: 10 upvotes should score same as 5
    const five = makeDiscussion({ upvoteCount: 5 });
    expect(scoreDiscussion(high)).toBe(scoreDiscussion(five));
  });

  it("scores comment reactions", () => {
    const withReactions = makeDiscussion({
      upvoteCount: 0,
      topComments: [{ body: "Good explanation", author: "user", reactions: 3 }],
    });
    const noReactions = makeDiscussion({
      upvoteCount: 0,
      topComments: [{ body: "Good explanation", author: "user", reactions: 0 }],
    });
    expect(scoreDiscussion(withReactions)).toBeGreaterThan(scoreDiscussion(noReactions));
  });

  it("filters out low-quality discussions (no code, no answer, low engagement)", () => {
    // Simulates the Django attendance project discussion
    const junk = makeDiscussion({
      title: "Create an attendance program for employees",
      body: "Please help me with my project in Python Web Django",
      upvoteCount: 1,
      comments: 1,
      topComments: [{ body: "Try freelancer or fiverr", author: "user", reactions: 0 }],
    });
    expect(scoreDiscussion(junk)).toBeLessThan(3);
  });

  it("keeps high-quality technical discussions", () => {
    const good = makeDiscussion({
      title: "defineModel default value is NOT reactive",
      body: "```typescript\nconst state = defineModel<State>('lookup', { default: () => ({}) })\n```",
      upvoteCount: 2,
      answer:
        "This is by design. `defineModel` compiles to `useModel()` which uses `customRef` internally. The default value is stored in a plain `localValue` variable, not a reactive proxy.",
      topComments: [
        {
          body: "`useModel` uses customRef — the set() is never called when mutating nested props",
          author: "expert",
          reactions: 1,
        },
      ],
    });
    expect(scoreDiscussion(good)).toBeGreaterThanOrEqual(3);
  });
});
