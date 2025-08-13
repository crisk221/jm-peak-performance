#!/usr/bin/env node

/**
 * Contrast validation script for JM Peak Performance
 * Validates WCAG AA compliance for color combinations
 */

// Simple contrast calculation using WCAG formula
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// JM Peak Performance color palette - Updated for WCAG AA
const colors = {
  ink: "#0A0C0F", // Updated darker ink
  paper: "#F8FAFC",
  graphite: "#525760", // Updated for AA compliance
  border: "#E5E7EB",
  primary: "#2563EB",
  success: "#047857", // Updated for AA compliance
  warning: "#B45309", // Updated for AA compliance
  danger: "#B91C1C", // Updated for AA compliance
};

const colorCombinations = [
  { name: "Primary text on paper", fg: colors.ink, bg: colors.paper },
  { name: "Primary button text", fg: colors.paper, bg: colors.primary },
  { name: "Warning text on paper", fg: colors.warning, bg: colors.paper },
  { name: "Danger text on paper", fg: colors.danger, bg: colors.paper },
  { name: "Success text on paper", fg: colors.success, bg: colors.paper },
  { name: "Graphite text on paper", fg: colors.graphite, bg: colors.paper },
  { name: "Paper text on ink (dark mode)", fg: colors.paper, bg: colors.ink },
];

console.log("🎨 JM Peak Performance - Color Contrast Validation\\n");

let allPassed = true;

colorCombinations.forEach(({ name, fg, bg }) => {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);

  if (!fgRgb || !bgRgb) {
    console.log(`❌ ${name}: Invalid color format`);
    allPassed = false;
    return;
  }

  const ratio = getContrastRatio(fgRgb, bgRgb);
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

  const status = passesAA ? "✅" : "❌";
  const level = passesAAA ? "AAA" : passesAA ? "AA" : "FAIL";

  console.log(`${status} ${name}: ${ratio.toFixed(2)}:1 (${level})`);

  if (!passesAA) {
    allPassed = false;
  }
});

console.log(
  `\\n${allPassed ? "🎉 All color combinations pass WCAG AA!" : "⚠️  Some combinations need attention"}`,
);

process.exit(allPassed ? 0 : 1);
