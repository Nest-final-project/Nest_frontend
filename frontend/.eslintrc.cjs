module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true,
    vitest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'build', '.eslintrc.cjs', 'node_modules'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: { 
    react: { version: '18.2' } 
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': ['warn', { 
      varsIgnorePattern: '^(React|_)$',
      argsIgnorePattern: '^_'
    }],
    'no-undef': 'error'
  },
  globals: {
    process: 'readonly',
    SockJS: 'readonly',
    tokenAPI: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly'
  }
}
