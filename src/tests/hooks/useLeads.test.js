import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import useLeads from "../../hooks/useLeads";

describe("useLeads Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize with empty data", () => {
    const { result } = renderHook(() => useLeads());
    expect(result.current.leadsData).toEqual({});
    expect(result.current.selectedFolder).toBe("");
  });

  it("should add a new folder", () => {
    const { result } = renderHook(() => useLeads());

    act(() => {
      result.current.addFolder("Work");
    });

    expect(result.current.leadsData).toHaveProperty("Work");
    expect(result.current.selectedFolder).toBe("Work");
  });

  it("should not add duplicate folder", () => {
    const { result } = renderHook(() => useLeads());

    // Mock alert
    window.alert = vi.fn();

    act(() => {
      result.current.addFolder("Work");
    });

    act(() => {
      result.current.addFolder("Work");
    });

    expect(window.alert).toHaveBeenCalledWith('Folder "Work" already exists.');
  });

  it("should save a link to selected folder", () => {
    const { result } = renderHook(() => useLeads());

    // Mock prompt
    vi.spyOn(window, "prompt").mockReturnValue("My Link");

    act(() => {
      result.current.addFolder("Work");
    });

    act(() => {
      result.current.saveLink("https://example.com");
    });

    expect(result.current.leadsData["Work"]).toHaveLength(1);
    expect(result.current.leadsData["Work"][0].url).toBe("https://example.com");
    expect(result.current.leadsData["Work"][0].name).toBe("My Link");
  });
});
