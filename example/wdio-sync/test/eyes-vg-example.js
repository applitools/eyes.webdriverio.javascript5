'use strict';

const {Target, Eyes, VisualGridRunner} = require('@applitools/eyes-webdriverio');
const {BrowserType, Configuration, DeviceName, ScreenOrientation} = require('@applitools/eyes-selenium');

let eyes;
let driver;

describe('applitools', function () {

  beforeEach(function () {
    eyes = new Eyes(new VisualGridRunner(3));

    const configuration = new Configuration();
    configuration.setAppName('Eyes VG Example');
    configuration.setTestName('My first Javascript test!');
    configuration.addBrowser(800, 600, BrowserType.CHROME);
    configuration.addBrowser(500, 400, BrowserType.FIREFOX);
    configuration.addBrowser(500, 400, BrowserType.IE_11);
    configuration.addDeviceEmulation(DeviceName.iPhone_4, ScreenOrientation.PORTRAIT);

    eyes.setConfiguration(configuration);

    driver = browser.call(() => eyes.open(browser));
  });

  afterEach(function () {
    try {
      const results = browser.call(() => eyes.getRunner().getAllTestResults(false));
      console.log('Result:', results);
    } catch (e) {
      browser.call(() => eyes.abortIfNotClosed());
    }
  });

  it('should work', () => {
    try {
      browser.url('./helloworld');

      browser.call(() => eyes.check('Main Page', Target.window()));

      $('button').click();

      browser.call(() => eyes.check('Click!', Target.window()));
    } catch (e) {
      console.log(e);
    }
  })
});
