'use strict';

const {Target, Eyes} = require('@applitools/eyes-webdriverio');
const {Configuration} = require('@applitools/eyes-selenium');

let eyes;
let driver;

describe('applitools', function () {

  beforeEach(function () {
    eyes = new Eyes();

    const configuration = new Configuration();
    configuration.setAppName('Eyes Example');
    configuration.setTestName('My first Javascript test!');

    eyes.setConfiguration(configuration);

    driver = browser.call(() => eyes.open(browser));
  });

  afterEach(function () {
    try {
      const result = browser.call(() => eyes.close(false));
      console.log('Result:', result);
    } catch (e) {
      browser.call(() => eyes.abortIfNotClosed());
    }
  });

  it('eyes should work', () => {
    try {
      browser.url('./helloworld');

      browser.call(() => eyes.check('Main Page', Target.window()));

      $('button').click();

      browser.call(() => eyes.check('Click!', Target.window()));
    } catch (e) {
      console.log('Error:', e);
    }
  })
});
