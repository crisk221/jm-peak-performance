import { render, screen } from "@testing-library/react";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { describe, test, expect } from "vitest";

describe("Table Semantics", () => {
  test("renders proper table structure", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Protein</TableHead>
            <TableHead>Carbs</TableHead>
            <TableHead>Fat</TableHead>
            <TableHead>Calories</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Chicken Breast</TableCell>
            <TableCell>31g</TableCell>
            <TableCell>0g</TableCell>
            <TableCell>3.6g</TableCell>
            <TableCell>165</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    // Check table structure
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    // Check column headers
    expect(
      screen.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Protein" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Carbs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Fat" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Calories" }),
    ).toBeInTheDocument();

    // Check data cells
    expect(
      screen.getByRole("cell", { name: "Chicken Breast" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "31g" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "165" })).toBeInTheDocument();
  });

  test("has proper header associations", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Rice</TableCell>
            <TableCell>1 cup</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const table = screen.getByRole("table");
    const rows = screen.getAllByRole("row");

    // Should have header row and data row
    expect(rows).toHaveLength(2);

    // Headers should be properly identified
    expect(
      screen.getByRole("columnheader", { name: "Ingredient" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Amount" }),
    ).toBeInTheDocument();
  });

  test("empty table renders correctly", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{/* Empty body */}</TableBody>
      </Table>,
    );

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    // Should still have headers
    expect(
      screen.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Value" }),
    ).toBeInTheDocument();

    // Should have only header row
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(1);
  });

  test("maintains semantic markup structure", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    // Verify proper HTML table elements
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(container.querySelector("tbody")).toBeInTheDocument();
    expect(container.querySelector("th")).toBeInTheDocument();
    expect(container.querySelector("td")).toBeInTheDocument();
  });
});
