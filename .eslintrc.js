module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "react-hooks/exhaustive-deps": "warn", // Cambiado a 'warn' en lugar de 'error'
  },
};
