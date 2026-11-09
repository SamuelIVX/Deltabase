/**
 * Unit tests for Rightbar (Market Intelligence feed) and formatRelativeTime helper.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Rightbar, { formatRelativeTime } from "./rightbar";
import useFinnhubNews from "@/hooks/useFinnhubNews";

vi.mock("@/hooks/useFinnhubNews", () => ({
  default: vi.fn(),
}));

describe("formatRelativeTime", () => {
  it("handles non-finite or zero timestamps safely", () => {
    expect(formatRelativeTime(0)).toBe("");
    expect(formatRelativeTime(NaN)).toBe("");
  });

  it("formats recent timestamps correctly", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    expect(formatRelativeTime(nowSec - 20)).toBe("just now");
    expect(formatRelativeTime(nowSec - 120)).toBe("2m ago");
    expect(formatRelativeTime(nowSec - 7200)).toBe("2h ago");
    expect(formatRelativeTime(nowSec - 172800)).toBe("2d ago");
  });
});

describe("Rightbar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when pending", () => {
    vi.mocked(useFinnhubNews).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    } as never);

    render(<Rightbar />);
    expect(screen.getByText("Market News")).toBeInTheDocument();
    expect(screen.getByText("Loading headlines...")).toBeInTheDocument();
  });

  it("renders error state when hook errors", () => {
    vi.mocked(useFinnhubNews).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    } as never);

    render(<Rightbar />);
    expect(
      screen.getByText("Market news feed temporarily unavailable.")
    ).toBeInTheDocument();
  });

  it("renders empty state when articles list is empty", () => {
    vi.mocked(useFinnhubNews).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as never);

    render(<Rightbar />);
    expect(screen.getByText("No recent market headlines.")).toBeInTheDocument();
  });

  it("renders articles list up to 5 items with source and link attributes", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const mockArticles = [
      {
        id: "1",
        headline: "Fed holds benchmark interest rates steady",
        source: "Bloomberg",
        url: "https://bloomberg.com/news/1",
        datetime: nowSec - 3600,
        image: "https://images.test/1.jpg",
      },
      {
        id: "2",
        headline: "Tech giants report quarterly earnings beat",
        source: "Reuters",
        url: "https://reuters.com/news/2",
        datetime: nowSec - 600,
      },
      { id: "3", headline: "Headline 3", source: "CNBC", url: "https://cnbc.com/3", datetime: nowSec },
      { id: "4", headline: "Headline 4", source: "WSJ", url: "https://wsj.com/4", datetime: nowSec },
      { id: "5", headline: "Headline 5", source: "FT", url: "https://ft.com/5", datetime: nowSec },
      { id: "6", headline: "Headline 6 should be sliced off", source: "Ignored", url: "https://x.com", datetime: nowSec },
    ];

    vi.mocked(useFinnhubNews).mockReturnValue({
      data: mockArticles,
      isPending: false,
      isError: false,
    } as never);

    render(<Rightbar />);

    expect(screen.getByText("Fed holds benchmark interest rates steady")).toBeInTheDocument();
    expect(screen.getByText("Tech giants report quarterly earnings beat")).toBeInTheDocument();
    expect(screen.queryByText("Headline 6 should be sliced off")).not.toBeInTheDocument();

    const link = screen.getByRole("link", { name: /Fed holds benchmark interest rates steady/i });
    expect(link).toHaveAttribute("href", "https://bloomberg.com/news/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
