import { render, screen } from "@testing-library/react";
import React from "react";
import { MetricBadge } from "@/components/metric-badge";
import { describe, test, expect } from "vitest";

describe("MetricBadge", () => {
  test("renders ok state neutrally", () => {
    render(<MetricBadge label="Protein" value={100} target={100} />);

    expect(screen.getByText(/Protein/i)).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  test("renders warn state with appropriate styling", () => {
    render(<MetricBadge label="Protein" value={80} target={100} />);

    expect(screen.getByText(/Protein/i)).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  test("renders over state with appropriate styling", () => {
    render(<MetricBadge label="Protein" value={130} target={100} />);

    expect(screen.getByText(/Protein/i)).toBeInTheDocument();
    expect(screen.getByText("130")).toBeInTheDocument();
  });

  test("renders without target (neutral state)", () => {
    render(<MetricBadge label="Calories" value={2000} />);

    expect(screen.getByText(/Calories/i)).toBeInTheDocument();
    expect(screen.getByText("2,000")).toBeInTheDocument();
  });

  test("includes unit when provided", () => {
    render(<MetricBadge label="Weight" value={150} unit="lbs" />);

    expect(screen.getByText(/Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/150.*lbs/)).toBeInTheDocument();
  });
});
