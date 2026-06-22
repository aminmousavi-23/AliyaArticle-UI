import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // This app fetches data with plain useEffect + useState (no React
      // Query/SWR), so the standard "setLoading(true) at the top of an
      // effect" pattern is intentional here, not a bug.
      'react-hooks/set-state-in-effect': 'off',
      // AuthContext/ToastContext intentionally export both a Provider
      // component and a paired hook (useAuth/useToast) — a standard React
      // context pattern that doesn't affect fast-refresh in practice.
      'react-refresh/only-export-components': 'off',
    },
  },
])
