module.exports = {
  "extends": [
    "eslint:recommended",
    "react-app",
    "react-app/jest"
  ],
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "env": { "browser": true, "es6": true, "node": true },
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      "globals": { "Atomics": "readonly", "SharedArrayBuffer": "readonly" },
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "ecmaFeatures": { "jsx": true },
        "ecmaVersion": 2018,
        "sourceType": "module",
        "project": "./tsconfig.json"
      },
      "plugins": ["@typescript-eslint", "formatjs"],
      "rules": {
        "indent": ["error", 2, { "SwitchCase": 1 }],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "comma-dangle": ["error", "always-multiline"],
        "@typescript-eslint/no-explicit-any": 0
      }
    }
  ]
}