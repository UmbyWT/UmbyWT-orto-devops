import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

// Linting di tutto il codice: frontend React in src/, backend in server/
// e api/. Se una regola fallisce, `npm run lint` esce con errore e la
// pipeline si ferma prima del deploy.
export default [
  { ignores: ['dist', 'coverage', '.vercel', 'node_modules'] },

  js.configs.recommended,

  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // le regole degli hook trovano bug veri: effetti con dipendenze
      // sbagliate, setState che provocano render a catena
      ...reactHooks.configs.flat.recommended.rules,
    },
  },

  {
    files: ['server/**/*.js', 'api/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },

  {
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
];
