module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'warn',
    'prettier/prettier': ['warn', { printWidth: 300, singleQuote: true, trailingComma: true }],
    'max-len': ['warn', { code: 300, tabWidth: 2 }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
