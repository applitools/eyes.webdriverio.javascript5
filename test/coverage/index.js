const chromedriver = require('chromedriver');
const {remote} = require('webdriverio');
const {By} = require('selenium-webdriver');
const {makeRun} = require('@applitools/sdk-test-kit')
const {Eyes, BatchInfo, RectangleSize, StitchMode, VisualGridRunner} = require('../../index')

const sdkName = 'eyes.webdriverio.javascript5'
const batch = new BatchInfo(`JS Coverage Tests - ${sdkName}`)

async function initialize(displayName, executionMode) {
  let eyes
  let driver
  driver = await remote({
    logLevel: 'error',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--disable-infobars',
          '--headless',
        ]
      }
    }
  })
  if (executionMode.isVisualGrid) {
    eyes = new Eyes(new VisualGridRunner())
  } else if (executionMode.isCssStitching) {
    eyes = new Eyes()
    eyes.setStitchMode(StitchMode.CSS)
  } else if (executionMode.isScrollStitching) {
    eyes = new Eyes()
    eyes.setStitchMode(StitchMode.SCROLL)
  }
  eyes.setBatch(batch)

  async function visit(url) {
    await driver.url(url)
  }

  async function open(options) {
    driver = await eyes.open(
      driver,
      sdkName,
      displayName,
      RectangleSize.parse(options.viewportSize),
    )
    return driver
  }

  async function check(options = {}) {
    if (options.isClassicApi) {
      options.locator ? await eyes.checkRegionBy(By.css(options.locator)) : await eyes.checkWindow()
    } else {
      options.locator
        ? await eyes.check(undefined, Target.region(By.css(options.locator)).fully())
        : await eyes.check(undefined, Target.window().fully())
    }
  }

  async function close(options) {
    await driver.deleteSession()
    await eyes.close(options)
  }

  return {visit, open, check, close}
}

const supportedTests = [
  //{name: 'checkRegionClassic', executionMode: {isVisualGrid: true}},
  {name: 'checkRegionClassic', executionMode: {isCssStitching: true}},
  {name: 'checkRegionClassic', executionMode: {isScrollStitching: true}},
  //{'checkRegionFluent', executionMode: {isVisualGrid: true}},
  //{'checkRegionFluent', executionMode: {isCssStitching: true}},
  //{'checkRegionFluent', executionMode: {isScrollStitching: true}},
  //{'checkWindowClassic', executionMode: {isVisualGrid: true}},
  //{'checkWindowClassic', executionMode: {isCssStitching: true}},
  //{'checkWindowClassic', executionMode: {isScrollStitching: true}},
  //{'checkWindowFluent', executionMode: {isVisualGrid: true}},
  //{'checkWindowFluent', executionMode: {isCssStitching: true}},
  //{'checkWindowFluent', executionMode: {isScrollStitching: true}},
]

const returnPromise = true
chromedriver.start(['--port=4444', '--url-base=wd/hub'], returnPromise).then(() => {
  makeRun(sdkName, initialize).run(supportedTests).then(() => {
    chromedriver.stop()
  })
})
