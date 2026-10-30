import { describe, it, expect, vi, afterEach } from "vitest";
import * as loader from "./data-loader";

/**
 * P-09: `loadProgram()` with no slug fell back to `anterior-hip-rebuild`, the
 * founder's personal programme, so any slug-less caller rendered someone
 * else's hip rehab to a stranger. No slug now means no program.
 */
afterEach(() => vi.unstubAllGlobals());

describe("loadProgram without a slug", () => {
  it("rejects instead of fetching the hip programme", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(loader.loadProgram(undefined as unknown as string)).rejects.toThrow(/no program slug/);
    await expect(loader.loadProgram("")).rejects.toThrow(/no program slug/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("no longer exports a default programme slug", () => {
    expect("DEFAULT_PROGRAM_SLUG" in loader).toBe(false);
  });
});
