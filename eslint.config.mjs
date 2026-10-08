import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

// Flat config native (tanpa FlatCompat) — kombinasi typescript-eslint versi
// baru + FlatCompat/eslint-config-next kadang bentrok ("circular structure
// to JSON") di beberapa kombinasi versi, jadi di sini plugin Next.js
// dipasang langsung tanpa lapisan bridge itu.
export default tseslint.config(
  { ignores: [".next/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
