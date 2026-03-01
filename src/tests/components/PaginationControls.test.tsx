import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaginationControls } from "@/components/ui/PaginationControls";

describe("PaginationControls", () => {
  it("returns null when totalPages <= 1", () => {
    const { container } = render(
      <PaginationControls
        page={1}
        totalPages={1}
        totalItems={5}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows total items count", () => {
    render(
      <PaginationControls
        page={1}
        totalPages={3}
        totalItems={42}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByText("42 total items")).toBeInTheDocument();
  });

  it("shows current page / total pages", () => {
    render(
      <PaginationControls
        page={2}
        totalPages={5}
        totalItems={50}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("calls onPrev when prev button clicked", () => {
    const onPrev = vi.fn();
    render(
      <PaginationControls
        page={2}
        totalPages={3}
        totalItems={30}
        onPrev={onPrev}
        onNext={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it("calls onNext when next button clicked", () => {
    const onNext = vi.fn();
    render(
      <PaginationControls
        page={1}
        totalPages={3}
        totalItems={30}
        onPrev={vi.fn()}
        onNext={onNext}
      />
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("disables prev button on page 1", () => {
    render(
      <PaginationControls
        page={1}
        totalPages={3}
        totalItems={30}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(
      <PaginationControls
        page={3}
        totalPages={3}
        totalItems={30}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeDisabled();
  });

  it("enables both buttons on a middle page", () => {
    render(
      <PaginationControls
        page={2}
        totalPages={3}
        totalItems={30}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });
});
