module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true
    },
    requireConfigFile: false
  },
  extends: ['airbnb', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    es6: true
  },
  plugins: ['react'],
  rules: {
    camelcase: 'warn',
    'max-len': [
      'warn',
      {
        code: 80,
        tabWidth: 2,
        comments: 80,
        ignoreComments: true, // let's disable warnings on the comments
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true
      }
    ],
    'class-methods-use-this': 0,
    'no-console': ['error', { allow: ['error'] }], // only allow `console.error` calls
    'no-unused-vars': 2,
    'no-use-before-define': 0,
    'no-func-assign': 0,
    'no-nested-ternary': 'warn',
    'no-class-assign': 0,
    'no-restricted-syntax': 0,
    'no-continue': 0,
    'jsx-a11y/href-no-hash': ['off'],
    'import/prefer-default-export': 0,
    'import/no-mutable-exports': 0,
    'react/destructuring-assignment': 0,
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-props-no-spreading': 'warn',
    'react/no-multi-comp': 0,
    'react/no-unescaped-entities': 0,
    'react/prop-types': 0,
    'jsx-a11y/click-events-have-key-events': 0
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src']
      }
    }
  }
}
