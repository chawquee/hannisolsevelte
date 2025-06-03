// ==============================================
// HANNISOL SOLANA ADDRESS CHECKER - ESLINT CONFIG
// ==============================================

import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // ==============================================
  // BASE JAVASCRIPT CONFIGURATION
  // ==============================================
  js.configs.recommended,
  
  // ==============================================
  // GLOBAL CONFIGURATION
  // ==============================================
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022
      }
    }
  },
  
  // ==============================================
  // TYPESCRIPT FILES
  // ==============================================
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte']
      }
    },
    plugins: {
      '@typescript-eslint': ts
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      
      // Hannisol-specific TypeScript rules
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I']
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase']
        },
        {
          selector: 'enum',
          format: ['PascalCase']
        }
      ]
    }
  },
  
  // ==============================================
  // SVELTE FILES
  // ==============================================
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte']
      }
    },
    plugins: {
      svelte,
      '@typescript-eslint': ts
    },
    rules: {
      ...svelte.configs.recommended.rules,
      
      // Svelte-specific rules
      'svelte/no-unused-svelte-ignore': 'error',
      'svelte/no-dom-manipulating': 'error',
      'svelte/no-dupe-else-if-blocks': 'error',
      'svelte/no-dupe-style-properties': 'error',
      'svelte/no-dynamic-slot-name': 'error',
      'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
      'svelte/no-inner-declarations': 'error',
      'svelte/no-not-function-handler': 'error',
      'svelte/no-object-in-text-mustaches': 'error',
      'svelte/no-reactive-functions': 'error',
      'svelte/no-reactive-literals': 'error',
      'svelte/no-shorthand-style-property-overrides': 'error',
      'svelte/no-unknown-style-directive-property': 'error',
      'svelte/no-unused-class-name': 'warn',
      'svelte/no-useless-mustaches': 'error',
      'svelte/prefer-class-directive': 'error',
      'svelte/prefer-style-directive': 'error',
      'svelte/require-optimized-style-attribute': 'error',
      'svelte/sort-attributes': 'off',
      'svelte/spaced-html-comment': 'error',
      
      // Hannisol brand consistency rules
      'svelte/html-quotes': ['error', { prefer: 'double' }],
      'svelte/indent': ['error', { indent: 2 }],
      'svelte/max-attributes-per-line': [
        'error',
        {
          multiline: 1,
          singleline: 3
        }
      ]
    }
  },
  
  // ==============================================
  // JAVASCRIPT FILES
  // ==============================================
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      // General JavaScript rules
      'no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'array-callback-return': 'error',
      'consistent-return': 'error'
    }
  },
  
  // ==============================================
  // SVELTEKIT SPECIFIC FILES
  // ==============================================
  {
    files: [
      '**/routes/**/*.ts',
      '**/routes/**/*.js',
      '**/**/+*.ts',
      '**/**/+*.js',
      '**/app.html',
      '**/hooks.server.ts',
      '**/hooks.client.ts'
    ],
    rules: {
      // SvelteKit route files
      'no-console': 'off', // Allow console in server-side code
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^event$|^url$|^params$|^route$',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  
  // ==============================================
  // API ROUTE FILES
  // ==============================================
  {
    files: ['**/api/**/*.ts', '**/api/**/*.js'],
    rules: {
      // API-specific rules
      'no-console': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'consistent-return': 'error',
      
      // Security rules for API routes
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error'
    }
  },
  
  // ==============================================
  // CONFIGURATION FILES
  // ==============================================
  {
    files: [
      '*.config.js',
      '*.config.ts',
      'ecosystem.config.js',
      'svelte.config.js',
      'vite.config.js',
      'tailwind.config.js'
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  
  // ==============================================
  // TEST FILES
  // ==============================================
  {
    files: [
      '**/*.test.ts',
      '**/*.test.js',
      '**/*.spec.ts',
      '**/*.spec.js',
      '**/tests/**/*'
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.vitest
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },
  
  // ==============================================
  // DATABASE FILES
  // ==============================================
  {
    files: [
      '**/database/**/*.ts',
      '**/database/**/*.js',
      '**/migrations/**/*.ts',
      '**/migrations/**/*.js'
    ],
    rules: {
      'no-console': 'off', // Allow logging in database operations
      '@typescript-eslint/no-explicit-any': 'off' // Database operations may need any
    }
  },
  
  // ==============================================
  // LIBRARY FILES
  // ==============================================
  {
    files: ['**/lib/**/*.ts', '**/lib/**/*.js'],
    rules: {
      // Library code should be more strict
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': 'error'
    }
  },
  
  // ==============================================
  // COMPONENT FILES
  // ==============================================
  {
    files: ['**/components/**/*.svelte'],
    rules: {
      // Component-specific rules
      'svelte/no-unused-svelte-ignore': 'error',
      'svelte/prefer-class-directive': 'error',
      'svelte/prefer-style-directive': 'error',
      
      // Hannisol brand consistency for components
      'svelte/html-quotes': ['error', { prefer: 'double' }]
    }
  },
  
  // ==============================================
  // SECURITY RULES (Global)
  // ==============================================
  {
    files: ['**/*.ts', '**/*.js', '**/*.svelte'],
    rules: {
      // Security-focused rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'error',
      'yoda': 'error'
    }
  },
  
  // ==============================================
  // HANNISOL SPECIFIC RULES
  // ==============================================
  {
    files: ['**/*.ts', '**/*.js', '**/*.svelte'],
    rules: {
      // Brand consistency rules
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      
      // Code quality for financial application
      'eqeqeq': ['error', 'always'],
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1, 100, 1000],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true
        }
      ],
      'max-len': [
        'warn',
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true
        }
      ]
    }
  },
  
  // ==============================================
  // IGNORED FILES AND DIRECTORIES
  // ==============================================
  {
    ignores: [
      'build/',
      '.svelte-kit/',
      'dist/',
      'node_modules/',
      'coverage/',
      '*.min.js',
      'static/build/',
      'database/*.db',
      'logs/',
      '*.log',
      '.env*',
      'ecosystem.config.js.bak'
    ]
  },
  
  // ==============================================
  // PRETTIER INTEGRATION
  // ==============================================
  prettier
];