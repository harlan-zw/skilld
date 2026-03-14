import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectTargetAgent } from "../../src/agent/detect";

describe("agent/detect", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clean Claude Code env vars that may leak when tests run inside Claude Code
    delete process.env.CLAUDE_CODE;
    delete process.env.CLAUDECODE;
    delete process.env.CLAUDE_CODE_ENTRYPOINT;
    delete process.env.CLAUDE_CODE_SSE_PORT;
    delete process.env.CLAUDE_CONFIG_DIR;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("detectTargetAgent", () => {
    it("detects claude-code from CLAUDE_CODE env", () => {
      process.env.CLAUDE_CODE = "1";
      expect(detectTargetAgent()).toBe("claude-code");
    });

    it("detects claude-code from CLAUDECODE env (no underscore)", () => {
      process.env.CLAUDECODE = "1";
      expect(detectTargetAgent()).toBe("claude-code");
    });

    it("detects claude-code from CLAUDE_CODE_ENTRYPOINT env", () => {
      process.env.CLAUDE_CODE_ENTRYPOINT = "cli";
      expect(detectTargetAgent()).toBe("claude-code");
    });

    it("detects claude-code from CLAUDE_CONFIG_DIR env", () => {
      process.env.CLAUDE_CONFIG_DIR = "/home/user/.claude";
      expect(detectTargetAgent()).toBe("claude-code");
    });

    it("detects cursor from CURSOR_SESSION env", () => {
      process.env.CURSOR_SESSION = "abc123";
      expect(detectTargetAgent()).toBe("cursor");
    });

    it("detects cursor from CURSOR_TRACE_ID env", () => {
      process.env.CURSOR_TRACE_ID = "trace-123";
      expect(detectTargetAgent()).toBe("cursor");
    });

    it("detects windsurf from WINDSURF_SESSION env", () => {
      process.env.WINDSURF_SESSION = "ws-123";
      expect(detectTargetAgent()).toBe("windsurf");
    });

    it("detects cline from CLINE_TASK_ID env", () => {
      process.env.CLINE_TASK_ID = "task-123";
      expect(detectTargetAgent()).toBe("cline");
    });

    it("detects cline from CLINE_ACTIVE env", () => {
      process.env.CLINE_ACTIVE = "true";
      expect(detectTargetAgent()).toBe("cline");
    });

    it("detects codex from CODEX_HOME env", () => {
      process.env.CODEX_HOME = "/home/user/.codex";
      expect(detectTargetAgent()).toBe("codex");
    });

    it("detects github-copilot from COPILOT_RUN_APP", () => {
      process.env.COPILOT_RUN_APP = "1";
      expect(detectTargetAgent()).toBe("github-copilot");
    });

    it("detects gemini-cli from GEMINI_CLI env", () => {
      process.env.GEMINI_CLI = "1";
      expect(detectTargetAgent()).toBe("gemini-cli");
    });

    it("detects goose from GOOSE_SESSION", () => {
      process.env.GOOSE_SESSION = "goose-123";
      expect(detectTargetAgent()).toBe("goose");
    });

    it("detects goose from AGENT_SESSION_ID", () => {
      process.env.AGENT_SESSION_ID = "agent-123";
      expect(detectTargetAgent()).toBe("goose");
    });

    it("detects amp from AMP_SESSION", () => {
      process.env.AMP_SESSION = "amp-123";
      expect(detectTargetAgent()).toBe("amp");
    });

    it("detects opencode from OPENCODE_SESSION", () => {
      process.env.OPENCODE_SESSION = "oc-123";
      expect(detectTargetAgent()).toBe("opencode");
    });

    it("detects opencode from OPENCODE_SESSION_ID", () => {
      process.env.OPENCODE_SESSION_ID = "oc-456";
      expect(detectTargetAgent()).toBe("opencode");
    });

    it("detects roo from ROO_SESSION", () => {
      process.env.ROO_SESSION = "roo-123";
      expect(detectTargetAgent()).toBe("roo");
    });

    it("prioritizes env vars over directory detection", () => {
      process.env.CURSOR_SESSION = "cursor";
      // Even if .claude exists, env var takes precedence
      expect(detectTargetAgent()).toBe("cursor");
    });
  });
});
