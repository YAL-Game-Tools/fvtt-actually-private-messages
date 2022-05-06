module.exports = {
	parser: '@babel/eslint-parser',
	env: {
		jquery: true,
		browser: true,
		es2021: true,
		node: true
	},
	plugins: ['optimize-regex'],
	extends: [
		'eslint:recommended',
		'plugin:optimize-regex/recommended'
	],
	parserOptions: {
		ecmaVersion: 2021, // = 12; redundant with es2021 option
		sourceType: 'module',
		requireConfigFile: false,
		ecmaFeatures: {
			globalReturn: false,
			impliedStrict: true
		}
	},
	overrides: [
		{
			files: ['**/*.mjs'],
			excludedFiles: 'node_modules/**/*'
		}
	],
	rules: {
		// Styling
		quotes: [
			'error',
			'single'
		],
		'quote-props': [
			'error',
			'as-needed'
		],
		'brace-style': [
			'error',
			'stroustrup',
			{ allowSingleLine: true }
		],
		curly: [
			'off',
			'multi-or-nest'
		],
		// Spacing
		'no-multi-spaces': ['error'],
		'space-infix-ops': ['error'],
		'no-trailing-spaces': ['error'],
		'spaced-comment': [
			'error',
			'always'
		],
		'semi-spacing': ['error'],
		'rest-spread-spacing': [
			'error',
			'never'
		],
		'template-curly-spacing': [
			'error',
			'never'
		],
		'array-bracket-spacing': [
			'error',
			'never'
		],
		'space-in-parens': [
			'error',
			'never'
		],
		'no-irregular-whitespace': [
			'error',
			{ skipRegExps: true }
		],
		'block-spacing': ['error'],
		'comma-spacing': ['error'],
		'key-spacing': ['error'],
		'keyword-spacing': ['error'],
		'space-before-blocks': ['error'],
		// Other
		'comma-dangle': [
			'error',
			'only-multiline'
		],
		'dot-location': [
			'error',
			'property'
		],
		'no-lone-blocks': ['error'],
		'no-empty-character-class': ['error'],
		'no-duplicate-imports': [
			'error',
			{ includeExports: true }
		],
		'no-array-constructor': ['error'],
		'no-octal-escape': ['error'],
		'no-self-compare': ['error'],
		'no-template-curly-in-string': ['warn'],
		'no-unneeded-ternary': ['error'],
		'no-await-in-loop': ['warn'],
		'no-extra-parens': [
			'error',
			'all'
		],
		'no-loss-of-precision': ['warn'],
		'no-useless-backreference': ['error'],
		'require-atomic-updates': ['error'],
		'array-callback-return': ['error'],
		'no-return-await': ['error'],
		'no-loop-func': ['error'],
		'no-useless-concat': ['error'],
		'no-useless-return': ['error'],
		'prefer-regex-literals': ['error'],
		'prefer-const': ['error'],
		'prefer-named-capture-group': ['warn'],
		'no-use-before-define': ['error'],
		// "no-magic-numbers": ["warn", { "ignore": [0,1] }],
		'object-property-newline': [
			'error',
			{ allowAllPropertiesOnSameLine: true }
		],
		'array-element-newline': [
			'error',
			{
				ArrayExpression: 'consistent',
				ArrayPattern: 'never',
			}
		],
		'array-bracket-newline': [
			'error',
			{ multiline: true }
		],
		// Objects
		'object-curly-newline': [
			'error',
			{
				ObjectExpression: { consistent: true, multiline: false, minProperties: 5 },
				ObjectPattern: 'never',
				ImportDeclaration: 'never',
			}
		],
		'object-curly-spacing': [
			'error',
			'always'
		],
		// Other
		'implicit-arrow-linebreak': [
			'error',
			'beside'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'lines-between-class-members': [
			'error',
			'always',
			{ exceptAfterSingleLine: true }
		],
		'padded-blocks': [
			'error',
			'never'
		],
		'eol-last': [
			'error',
			'always'
		],
		'no-multiple-empty-lines': [
			'error',
			{
				max: 1,
				maxEOF: 1,
				maxBOF: 0
			}
		],
		indent: [
			'error',
			'tab',
			{
				SwitchCase: 1,
				VariableDeclarator: 1,
				MemberExpression: 1
			}
		],
		'class-methods-use-this': [
			'off',
			{
				exceptMethods: [
					'getData',
					'_updateObject'
				]
			}
		],
		'no-unused-vars': [
			'warn',
			{ argsIgnorePattern: '^_' }
		],
		'no-shadow': [
			'warn',
			{
				builtinGlobals: true,
				hoist: 'all',
				allow: [
					'event',
					'parent',
					'name'
				]
			}
		],
		strict: [
			'warn',
			'global'
		]
	},
	globals: {
		ActorSheet: 'readonly',
		ItemSheet: 'readonly',
		ActiveEffect: 'readonly',
		Item: 'readonly',
		Actor: 'readonly',
		Token: 'readonly',
		Scene: 'readonly',
		Combat: 'readonly',
		Combatant: 'readonly',
		TokenDocument: 'readonly',
		TokenHUD: 'readonly',
		Dialog: 'readonly',
		FormApplication: 'readonly',
		ChatMessage: 'readonly',
		FormDataExtended: 'readonly',
		Roll: 'readonly',
		CONFIG: 'writable',
		CONST: 'readonly',
		game: 'readonly',
		canvas: 'readonly',
		ui: 'readonly',
		foundry: 'readonly',
		duplicate: 'readonly',
		isObjectEmpty: 'readonly',
		diffObject: 'readonly',
		getProperty: 'readonly',
		setProperty: 'readonly',
		mergeObject: 'readonly',
		expandObject: 'readonly',
		loadTemplates: 'readonly',
		getTemplate: 'readonly',
		flattenObject: 'readonly',
		isNewerVersion: 'readonly',
		randomID: 'readonly',
		renderTemplate: 'readonly',
		Handlebars: 'readonly',
		TextEditor: 'readonly',
		Hooks: 'readonly',
		Actors: 'readonly',
		Macro: 'readonly',
		Die: 'readonly',
		Items: 'readonly'
	},
	root: true
}
