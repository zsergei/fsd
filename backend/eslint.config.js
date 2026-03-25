import globals from 'globals';
import eslint from '@eslint/js';
import n from 'eslint-plugin-n';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	{
		ignores: ['**/node_modules/**']
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: 'module',
			globals: {
				...globals.node
			}
		},
		plugins: {
			n,
			perfectionist,
			'unused-imports': unusedImports
		},
		rules: {
			...eslint.configs.recommended.rules,
			...n.configs['flat/recommended-module'].rules,
			...eslintConfigPrettier.rules,
			'no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_'
				}
			],
			'perfectionist/sort-imports': ['error', { type: 'line-length', order: 'asc' }]
		}
	},
	{
		files: ['src/index.js'],
		rules: {
			'n/no-process-exit': 'off'
		}
	}
];
