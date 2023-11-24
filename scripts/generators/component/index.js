/**
 * Component Generator
 */

/* eslint strict: ["off"] */

'use strict';

const componentExists = require('../utils/componentExists');

module.exports = {
  description: 'Add an unconnected component',
  prompts: [
    {
      type: 'list',
      name: 'type',
      message: 'Select the type of component',
      default: 'React.Component',
      choices: () => [
        'React.Component',
        'React.PureComponent',
        'Stateless Function',
      ],
    },
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'Button',
      validate: value => {
        if (/.+/.test(value)) {
          return componentExists(value)
            ? 'A component or screen with this name already exists'
            : true;
        }

        return 'The name is required';
      },
    },
    {
      type: 'confirm',
      name: 'wantMessages',
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
    let componentTemplate;

    switch (data.type) {
      case 'Stateless Function': {
        componentTemplate = './component/stateless.js.hbs';
        break;
      }
      default: {
        componentTemplate = './component/class.js.hbs';
      }
    }

    const actions = [
      {
        type: 'add',
        path: '../../src/components/{{properCase name}}/index.tsx',
        templateFile: componentTemplate,
        abortOnFail: true,
      }
    ];

    // If they want a i18n messages file
    if (data.wantStyles) {
      actions.push({
        type: 'add',
        path: '../../src/components/{{properCase name}}/styles.scss',
        templateFile: './component/styles.js.hbs',
        abortOnFail: true,
      });
    }

    actions.push({
      type: 'prettify',
      path: '/components/',
    });

    actions.push({
      type: 'export',
      path: '/components/',
    });

    return actions;
  },
};
