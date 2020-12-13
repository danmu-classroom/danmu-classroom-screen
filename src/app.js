const path = require('path');
const log = require('electron-log');

const App = {
  root: path.join(__dirname),
  env: process.env.NODE_ENV || 'production',
  log: log,
};
App.config = require(path.join(App.root, `config/${App.env}.json`));

module.exports = {
  App: App,
};
