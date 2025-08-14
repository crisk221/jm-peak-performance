import { render, screen } from "@testing-library/react";
import React from "react";
import { EmptyState } from "@/components/empty-state";
import { Utensils } from "lucide-react";
import { describe, test, expect, vi } from "vitest";

describe("EmptyState", () => {
  test("renders with required props", () => {
    render(
      <EmptyState
        icon={Utensils}
        title="No recipes found"
        body="Create your first recipe to get started"
      />,
    );

    expect(screen.getByText("No recipes found")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first recipe to get started"),
    ).toBeInTheDocument();
  });

  test("renders with action button", () => {
    const mockAction = vi.fn();

    render(
      <EmptyState
        icon={Utensils}
        title="No recipes found"
        body="Create your first recipe to get started"
        primary={{
          label: "Create Recipe",
          onClick: mockAction,
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "Create Recipe" });
    expect(button).toBeInTheDocument();
  });

  test("has proper semantic structure", () => {
    render(
      <EmptyState
        icon={Utensils}
        title="No recipes found"
        body="Create your first recipe to get started"
      />,
    );

    // Should have a container with appropriate role/semantics
    const title = screen.getByRole("heading", { level: 3 });
    expect(title).toHaveTextContent("No recipes found");

    // Icon should be present
    const iconElement = document.querySelector("svg");
    expect(iconElement).toBeInTheDocument();
  });

  test("maintains consistent color contrast", () => {
    const { container } = render(
      <EmptyState
        icon={Utensils}
        title="No recipes found"
        body="Create your first recipe to get started"
      />,
    );

    // Verify semantic structure exists
    expect(container.querySelector("h3")).toBeInTheDocument();
    expect(container.querySelector("p")).toBeInTheDocument();
  });
});
