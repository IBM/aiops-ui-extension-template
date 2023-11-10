module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "template-curly-spacing": "off",
    "indent": ["error", 2, {
      "ignoredNodes": ["TemplateLiteral"]
    }],
    "formatjs/no-offset": "error",
    "no-trailing-spaces": "error",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": ["tsconfig.eslint.json"],
    "sourceType": "module"
  },
  "plugins": ["formatjs", "@typescript-eslint"]
}