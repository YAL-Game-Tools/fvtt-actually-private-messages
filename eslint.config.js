import js from '@eslint/js';
import globals from 'globals';
import stylisticJs from '@stylistic/eslint-plugin-js';
import jsdoc from 'eslint-plugin-jsdoc';
import { foundry } from './eslint.foundry.js';

export default [
	js.configs.recommended,
	{
		// files: ["src/**/*.mjs"],
		ignores: [
			'**/node_modules/**/*',
			'**/dist/**/*',
			'**/foundry*.js',
		],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.jquery,
				...foundry,
			},
			parserOptions: {
				ecmaFeatures: {
					globalReturn: false,
					impliedStrict: true,
				},
			},
		},
		rules: {
			'no-undef': ['error', { typeof: true }],
			'no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
			],
			'no-redeclare': ['warn', { builtinGlobals: false }],
			'no-shadow': [
				'warn',
				{
					builtinGlobals: false,
					hoist: 'never',
					allow: ['event', 'parent', 'name'],
				},
			],
			'no-global-assign': ['error'],
			'no-var': ['error'],
			// Styling
			curly: ['off', 'multi-or-nest'],
			// Spacing
			'no-irregular-whitespace': ['warn', { skipRegExps: true }],
			// Other
			'no-lone-blocks': ['error'],
			'no-empty-character-class': ['error'],
			'no-duplicate-imports': ['error', { includeExports: true }],
			'no-array-constructor': ['error'],
			'no-octal-escape': ['error'],
			'no-self-compare': ['error'],
			'no-template-curly-in-string': ['warn'],
			'no-unneeded-ternary': ['error'],
			'no-await-in-loop': ['warn'],
			'no-loss-of-precision': ['warn'],
			'no-useless-backreference': ['error'],
			'array-callback-return': ['error'],
			'no-loop-func': ['error'],
			'no-useless-concat': ['error'],
			'no-useless-return': ['error'],
			'no-return-await': ['error'],
			'prefer-regex-literals': ['error'],
			'prefer-const': ['error'],
			'prefer-named-capture-group': ['warn'],
			// "no-use-before-define": ["error"],
			// "no-magic-numbers": ["warn", { "ignore": [0,1] }],
			'class-methods-use-this': [
				'off',
				{
					exceptMethods: ['getData', '_updateObject'],
				},
			],
			'no-fallthrough': ['warn'],
			strict: ['warn', 'global'],
			// "arrow-body-style": ["error", "as-needed"], // as-needed is default
		},
	},
	// Stylistic
	// https://eslint.style/packages/default
	{
		plugins: {
			style: stylisticJs,
		},
		rules: {
			'style/quotes': ['error', 'single'],
			'style/quote-props': ['error', 'as-needed'],
			'style/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
			'style/no-multi-spaces': ['error'],
			'style/space-infix-ops': ['error'],
			'style/no-trailing-spaces': ['error'],
			'style/spaced-comment': ['error', 'always'],
			'style/semi-spacing': ['error'],
			'style/rest-spread-spacing': ['error', 'never'],
			'style/template-curly-spacing': ['error', 'never'],
			'style/array-bracket-spacing': ['error', 'never'],
			'style/space-in-parens': ['error', 'never'],
			'style/block-spacing': ['error'],
			'style/comma-spacing': ['error'],
			'style/comma-style': ['error', 'last'],
			'style/key-spacing': ['error'],
			'style/keyword-spacing': ['error'],
			'style/space-before-blocks': ['error'],
			'style/comma-dangle': ['error', 'always-multiline'],
			'style/dot-location': ['error', 'property'],
			'style/object-property-newline': [
				'error',
				{ allowAllPropertiesOnSameLine: true },
			],
			'style/array-element-newline': [
				'error',
				{
					ArrayExpression: 'consistent',
					ArrayPattern: 'never',
				},
			],
			'style/array-bracket-newline': ['error', 'consistent'],
			// Objects
			'style/object-curly-newline': [
				'warn',
				{
					ObjectExpression: { consistent: true },
					ObjectPattern: { consistent: true },
					ImportDeclaration: 'never',
					ExportDeclaration: 'never',
				},
			],
			'style/object-curly-spacing': ['error', 'always'],
			// Other
			'style/implicit-arrow-linebreak': ['error', 'beside'],
			'style/linebreak-style': ['error', 'unix'],
			'style/lines-between-class-members': [
				'error',
				'always',
				{ exceptAfterSingleLine: true },
			],
			'style/padded-blocks': ['error', 'never'],
			'style/eol-last': ['error', 'always'],
			'style/no-multiple-empty-lines': [
				'error',
				{ max: 1, maxEOF: 1, maxBOF: 0 },
			],
			'style/indent': [
				'error',
				'tab',
				{
					SwitchCase: 1,
					VariableDeclarator: 1,
					MemberExpression: 1,
					ArrayExpression: 1,
					ObjectExpression: 1,
				},
			],
			// "style/arrow-spacing": true, // default { "before": true, "after": true }
			semi: ['error', 'always'],
		},
	},
	// JSDoc
	jsdoc.configs['flat/recommended-typescript-flavor'],
	{
		plugins: {
			jsdoc,
		},
		rules: {
			'jsdoc/require-jsdoc': ['warn', { enableFixer: false }],
			'jsdoc/no-blank-blocks': ['error', { enableFixer: true }],
			'jsdoc/require-param-description': 0,
			'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
		},
	},
];
