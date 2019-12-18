const chromedriver = require('chromedriver');
const {remote} = require('webdriverio');
const {By} = require('selenium-webdriver');
const {makeRun} = require('@applitools/sdk-test-kit')
const {Eyes, BatchInfo, RectangleSize, StitchMode, VisualGridRunner, Target} = require('../../index')

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
      options.locator ? await eyes.checkRegion(By.css(options.locator)) : await eyes.checkWindow()
    } else {
      options.locator
        ? await eyes.check(undefined, Target.region(By.css(options.locator)).fully())
        : await eyes.check(undefined, Target.window().fully())
    }
  }

  async function close(options) {
    try {
      await driver.deleteSession()
    } catch (error) {
      console.error(error)
    } finally {
      await eyes.close(options)
    }
  }

  return {visit, open, check, close}
}

const supportedTests = [
  {name: 'checkRegionClassic', executionMode: {isVisualGrid: true}},
  {name: 'checkRegionClassic', executionMode: {isCssStitching: true}},
  {name: 'checkRegionClassic', executionMode: {isScrollStitching: true}},
  {name: 'checkRegionFluent', executionMode: {isVisualGrid: true}},
  {name: 'checkRegionFluent', executionMode: {isCssStitching: true}},
  {name: 'checkRegionFluent', executionMode: {isScrollStitching: true}},
  {name: 'checkWindowClassic', executionMode: {isVisualGrid: true}},
  {name: 'checkWindowClassic', executionMode: {isCssStitching: true}},
  {name: 'checkWindowClassic', executionMode: {isScrollStitching: true}},
  {name: 'checkWindowFluent', executionMode: {isVisualGrid: true}},
  {name: 'checkWindowFluent', executionMode: {isCssStitching: true}},
  {name: 'checkWindowFluent', executionMode: {isScrollStitching: true}},
]

const returnPromise = true
chromedriver.start(['--port=4444', '--url-base=wd/hub', '--silent'], returnPromise).then(() => {
  makeRun(sdkName, initialize).run(supportedTests).then(() => {
    chromedriver.stop()
  })
}).catch(console.error)
