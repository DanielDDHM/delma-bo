/**
 * Container Generator
 */

const componentExists = require('../utils/componentExists');

module.exports = {
	description: 'Add a detailed screen component (CRUDS)',
	prompts: [
		{
			type: 'list',
			name: 'type',
			message: 'Select the base component type:',
			default: 'React.Component',
			choices: () => [
				'React.Component',
				'React.PureComponent',
			],
		},
		{
			type: 'input',
			name: 'name',
			message: 'What should it be called?',
			default: 'Form',
			validate: value => {
				if (/.+/.test(value)) {
					return componentExists(value) ? 'A component or screen with this name already exists' : true;
				}

				return 'The name is required';
			},
        },
        {
			type: 'confirm',
			name: 'hasSidebar',
			default: false,
			message: 'Is your detail a drawer (sidebar)?',
		},
		{
			type: 'confirm',
			name: 'wantHeaders',
			default: true,
			message: 'Do you want headers?',
		},
		{
			type: 'confirm',
			name: 'wantStrings',
			default: true,
			message: 'Do you want strings (i.e. will this component use text)?',
		},
		{
			type: 'confirm',
			name: 'wantStyles',
			default: true,
			message: 'Do you want styles (i.e. will this component use css classes)?',
		},
	],
	actions: data => {
		// Generate index.js and index.test.js
		const componentTemplate = './container/detailed/class.js.hbs';

		const actions = [
			{
				type: 'add',
				path: '../../src/screens/{{properCase name}}/index.tsx',
				templateFile: componentTemplate,
				abortOnFail: true,
			}
		];

		// If component wants messages
		if (data.wantStyles) {
			actions.push({
				type: 'add',
				path: '../../src/screens/{{properCase name}}/styles.scss',
				templateFile: './container/detailed/styles.js.hbs',
				abortOnFail: true,
			});
		}

		actions.push({
			type: 'prettify',
			path: '/screens/',
		});

		actions.push({
			type: 'export',
			path: '/screens/',
		  });

		return actions;
	},
};
