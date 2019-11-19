'use strict';

const chromedriver = require('chromedriver');
const {remote} = require('webdriverio');
const {equal} = require('assert');
const {Eyes, Target, StitchMode, MatchLevel} = require('../index');

const Common = require('./Common');

let browser;

describe('CropUrlAndStatusOnIos', function () {
  this.timeout(5 * 60 * 1000);

  before(async function () {
    chromedriver.start();
  });

  beforeEach(async () => {
    const chrome = Common.MOBILE_IOS_SAFARI;
    browser = await remote(chrome);
  });

  afterEach(async () => {
    await browser.deleteSession();
  });

  after(async function () {
    chromedriver.stop();
  });

  it('CheckWindow', async function () {
    await browser.url('https://applitools.com/helloworld');

    const eyes = new Eyes();
    eyes.setApiKey(process.env.APPLITOOLS_API_KEY);
    eyes.setForceFullPageScreenshot(true);
    eyes.setStitchMode(StitchMode.CSS);
    eyes.setMatchLevel(MatchLevel.Strict);
    eyes.setSendDom(false);

    await eyes.open(browser, this.test.parent.title, this.test.title);

    await eyes.check('window', Target.window());

    const result = await eyes.close(false);

    equal(result.isPassed(), true);
  });

});
