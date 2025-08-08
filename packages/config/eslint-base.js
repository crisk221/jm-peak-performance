/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
  },
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ["dist", "node_modules", "*.js"],
};
