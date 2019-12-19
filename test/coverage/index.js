const chromedriver = require('chromedriver');
const {remote} = require('webdriverio');
const {By} = require('selenium-webdriver');
const {makeRun, makeResourcePool, findResourceInPool} = require('@applitools/sdk-test-kit')
const {Eyes, BatchInfo, RectangleSize, StitchMode, VisualGridRunner, Target} = require('../../index')

const sdkName = 'eyes.webdriverio.javascript5'
const batch = new BatchInfo(`JS Coverage Tests - ${sdkName}`)

function initialize(context) {
  let eyes
  let driver

  async function beforeAll() {
    const resourcePool = await makeResourcePool(10, async () => {
      const driver = await remote({
        logLevel: 'error',
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              '--headless',
            ]
          }
        }
      })
      return { driver, isAvailable: true }
    })
    return { resourcePool }
  }

  async function afterAll(sharedContext) {
    for (const index in sharedContext.resourcePool) {
      await sharedContext.resourcePool[index].driver.deleteSession()
    }
  }

  async function beforeEach() {
    resource = await findResourceInPool(context.executionMode.resourcePool, resource => {
      return resource.isAvailable
    })
    driver = resource.driver
    resource.isAvailable = false
    if (context.executionMode.isVisualGrid) {
      eyes = new Eyes(new VisualGridRunner())
    } else if (context.executionMode.isCssStitching) {
      eyes = new Eyes()
      eyes.setStitchMode(StitchMode.CSS)
    } else if (context.executionMode.isScrollStitching) {
      eyes = new Eyes()
      eyes.setStitchMode(StitchMode.SCROLL)
    }
    eyes.setBatch(batch)
  }

  function afterEach() {
    resource.isAvailable = true
  }

  async function visit(url) {
    await driver.url(url)
  }

  async function open(options) {
    await eyes.open(
      driver,
      sdkName,
      context.displayName,
      RectangleSize.parse(options.viewportSize),
    )
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
    await eyes.close(options)
  }

  return {beforeAll, afterAll, beforeEach, afterEach, visit, open, check, close}
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
