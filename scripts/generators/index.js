/**
 * generator/index.js
 *
 * Exports the generators so plop knows them
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const componentGenerator = require('./component/index.js');
const containerGenerator = require('./container/index.js');
const detailedContainerGenerator = require('./container/detailed.js');

module.exports = plop => {
  plop.setGenerator('component', componentGenerator);
  plop.setGenerator('screen', containerGenerator);
  plop.setGenerator('detailed screen', detailedContainerGenerator);
  plop.addHelper('directory', comp => {
    try {
      fs.accessSync(
        path.join(__dirname, `../../src/screens/${comp}`),
        fs.F_OK,
      );
      return `screens/${comp}`;
    } catch (e) {
      return `components/${comp}`;
    }
  });
  plop.addHelper('curly', (object, open) => (open ? '{' : '}'));
  plop.setActionType('prettify', (answers, config) => {
    const folderPath = `${path.join(
      __dirname,
      '/../../src/',
      config.path,
      plop.getHelper('properCase')(answers.name),
      '**.tsx',
    )}`;
    exec(`npm run prettify -- "${folderPath}"`);
    return folderPath;
  });
  plop.setActionType('export', (answers, config) => {
    const file = `${path.join(
      __dirname,
      '/../../src/',
      config.path,
      'index.tsx',
    )}`;
    const name = plop.getHelper('properCase')(answers.name);
    fs.appendFileSync(file, `\r\nexport { default as ${name} } from './${name}';`);
    return name;
  });
};
