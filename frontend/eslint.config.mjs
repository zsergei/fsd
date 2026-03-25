import eslint from '@eslint/js';
import angular from 'angular-eslint';
import boundaries from 'eslint-plugin-boundaries';
import { defineConfig } from 'eslint/config';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig(
	{
		ignores: ['**/node_modules/**', '**/dist/**']
	},
	{
		files: ['**/*.ts'],
		extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
		languageOptions: {
			parserOptions: {
				projectService: true
			}
		},
		processor: angular.processInlineTemplates,
		plugins: {
			boundaries,
			perfectionist,
			'unused-imports': unusedImports
		},
		settings: {
			'boundaries/elements': [
				{ type: 'bootstrap', pattern: 'src/main.ts' },
				{ type: 'environments', pattern: 'src/environments/**/*.ts' },
				{ type: 'core', pattern: 'src/app/core/**/*' },
				{ type: 'features', pattern: 'src/app/features/**/*' },
				{ type: 'shared', pattern: 'src/app/shared/**/*' },
				{ type: 'shell', pattern: 'src/app/*.ts' }
			],
			'boundaries/ignore': ['**/*.spec.ts']
		},
		rules: {
			...boundaries.configs.recommended.rules,
			'boundaries/element-types': [
				'error',
				{
					default: 'disallow',
					rules: [
						{
							from: 'bootstrap',
							allow: ['shell', 'core', 'shared', 'features', 'bootstrap', 'environments']
						},
						{
							from: 'shell',
							allow: ['core', 'shared', 'features', 'shell', 'environments']
						},
						{
							from: 'environments',
							allow: ['environments']
						},
						{
							from: 'core',
							allow: ['core', 'environments', 'shared']
						},
						{
							from: 'features',
							allow: ['core', 'shared', 'features', 'environments']
						},
						{
							from: 'shared',
							allow: ['core', 'shared', 'environments']
						}
					]
				}
			],
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
			'perfectionist/sort-imports': ['error', { type: 'line-length', order: 'asc' }],
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase'
				}
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case'
				}
			],
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-empty-interface': 'off',
			'@angular-eslint/prefer-standalone': 'off',
			'@angular-eslint/component-class-suffix': 'error',
			'@angular-eslint/contextual-lifecycle': 'error',
			'@angular-eslint/directive-class-suffix': 'error',
			'@angular-eslint/no-empty-lifecycle-method': 'error',
			'@angular-eslint/no-host-metadata-property': 'off',
			'@angular-eslint/no-input-rename': 'error',
			'@angular-eslint/no-inputs-metadata-property': 'error',
			'@angular-eslint/no-output-native': 'error',
			'@angular-eslint/no-output-on-prefix': 'error',
			'@angular-eslint/no-output-rename': 'error',
			'@angular-eslint/no-outputs-metadata-property': 'error',
			'@angular-eslint/use-pipe-transform-interface': 'error',
			'@angular-eslint/use-lifecycle-interface': 'warn',
			...eslintConfigPrettier.rules
		}
	},
	{
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {
			'@angular-eslint/prefer-standalone': 'off',
			'@angular-eslint/template/alt-text': 'error',
			'@angular-eslint/template/attributes-order': 'error',
			'@angular-eslint/template/banana-in-box': 'error',
			'@angular-eslint/template/button-has-type': 'off',
			'@angular-eslint/template/click-events-have-key-events': 'error',
			'@angular-eslint/template/conditional-complexity': 'error',
			'@angular-eslint/template/cyclomatic-complexity': ['error', { maxComplexity: 48 }],
			'@angular-eslint/template/elements-content': 'error',
			'@angular-eslint/template/eqeqeq': 'error',
			'@angular-eslint/template/i18n': 'off',
			'@angular-eslint/template/interactive-supports-focus': 'error',
			'@angular-eslint/template/label-has-associated-control': 'error',
			'@angular-eslint/template/mouse-events-have-key-events': 'error',
			'@angular-eslint/template/no-any': 'error',
			'@angular-eslint/template/no-autofocus': 'error',
			'@angular-eslint/template/no-call-expression': 'off',
			'@angular-eslint/template/no-distracting-elements': 'error',
			'@angular-eslint/template/no-duplicate-attributes': 'error',
			'@angular-eslint/template/no-inline-styles': 'off',
			'@angular-eslint/template/no-interpolation-in-attributes': 'error',
			'@angular-eslint/template/no-negated-async': 'error',
			'@angular-eslint/template/no-positive-tabindex': 'error',
			'@angular-eslint/template/prefer-control-flow': 'error',
			'@angular-eslint/template/prefer-ngsrc': 'off',
			'@angular-eslint/template/prefer-self-closing-tags': 'off',
			'@angular-eslint/template/role-has-required-aria': 'error',
			'@angular-eslint/template/table-scope': 'error',
			'@angular-eslint/template/use-track-by-function': 'error',
			'@angular-eslint/template/valid-aria': 'error',
			...eslintConfigPrettier.rules
		}
	}
);
