'use strict';

const {TestMobile} = require('./TestMobile');
const Common = require('./Common');

const appName = 'Eyes Selenium SDK - Mobile';
const testedPageUrl = 'http://applitools.github.io/demo/TestPages/FramesTestPage/';


const test = new Common({testedPageUrl: testedPageUrl, mobileBrowser: true});

describe(appName, function () {

  before(function () {
    return test.beforeTest({});
  });

  beforeEach(function () {
    const caps = {};
    caps['browserName'] = 'Chrome';
    caps['appiumVersion'] = '1.7.2';
    caps['deviceName'] = 'Android Emulator';
    caps['deviceOrientation'] = 'portrait';
    caps['platformVersion'] = '6';
    caps['platformName'] = 'Android';

    const browserOptions = {desiredCapabilities: caps};

    return test.beforeEachTest({appName: appName, testName: this.currentTest.title, browserOptions: browserOptions});
  });

  afterEach(function () {
    return test.afterEachTest();
  });

  after(function () {
    return test.afterTest();
  });

  TestMobile.shouldBehaveLike('TestMobile', test);
});
