import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const i18nImportCheck = {
  name: "nyantara/i18n-import-check",
  plugins: {
    "i18n-check": {
      rules: {
        "no-orphan-t": {
          meta: {
            type: "problem",
            docs: {
              description:
                "Ensure files using t() have access to a translation function via useLocale, a prop, or a local declaration.",
            },
            messages: {
              orphanT:
                "File uses t() but does not import/use useLocale, receive t as a prop, or declare t.",
            },
          },
          create(context) {
            return {
              Program(node) {
                const src = context.sourceCode.text;
                if (!/\bt\(\s*['\"]/.test(src)) return;
                const hasUseLocaleImport =
                  /useLocale\s*\}|useLocale\s*from\s+['\"]/m.test(src) ||
                  /from\s+['\"]@\/context\/LocaleContext['\"]/.test(src);
                const hasTDeclared =
                  /const\s*\{\s*t\s*\}/.test(src) ||
                  /function\s+t\(/.test(src) ||
                  /const\s+t\s*=/.test(src) ||
                  /\(\s*\{[\s\S]*?\bt\b[\s\S]*?\}(?:\s*:\s*[\w<>.]+)?\s*\)/m.test(src);
                if (!hasUseLocaleImport && !hasTDeclared) {
                  context.report({ node, messageId: "orphanT" });
                }
              },
            };
          },
        },
      },
    },
  },
  rules: {
    "i18n-check/no-orphan-t": "error",
  },
};

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  i18nImportCheck,
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'no-use-before-define': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      '@next/next/no-img-element': 'off'
    }
  },
  globalIgnores([
    "scripts/**",
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
