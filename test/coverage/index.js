const {remote} = require('webdriverio');
const {By} = require('selenium-webdriver');
const {makeRunTests} = require('@applitools/sdk-test-kit')
const {Eyes, BatchInfo, RectangleSize, StitchMode, VisualGridRunner, Target} = require('../../index')

const sdkName = 'eyes.webdriverio.javascript5'
const batch = new BatchInfo(`JS Coverage Tests - ${sdkName}`)
const supportedTests = require('./supported-tests')

async function initialize({baselineTestName, branchName, executionMode, host}) {
  let eyes
  let driver

  async function _setup() {
    driver = await remote({
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
    eyes = executionMode.isVisualGrid ? new Eyes(new VisualGridRunner()) : new Eyes()
    executionMode.isCssStitching ? eyes.setStitchMode(StitchMode.CSS) : undefined
    executionMode.isScrollStitching ? eyes.setStitchMode(StitchMode.SCROLL) : undefined
    eyes.setBatch(batch)
  }

  async function visit(url) {
    await driver.url(url)
  }

  async function open({appName, viewportSize}) {
    driver = await eyes.open(driver, appName, baselineTestName, RectangleSize.parse(viewportSize))
  }

  async function checkFrame(
    target,
    {isClassicApi = false, isFully = false, tag, matchTimeout} = {},
  ) {
    if (isClassicApi) {
      await eyes.checkFrame(By.css(target), matchTimeout, tag)
    } else {
      let _checkSettings
      if (Array.isArray(target)) {
        target.forEach((entry, index) => {
          index === 0
            ? (_checkSettings = Target.frame(By.css(entry)))
            : _checkSettings.frame(By.css(entry))
        })
      } else {
        _checkSettings = Target.frame(By.css(target))
      }
      _checkSettings.fully(isFully)
      await eyes.check(tag, _checkSettings)
    }
  }

  async function checkRegion(
    target,
    {isClassicApi = false, isFully = false, inFrame, ignoreRegion, tag, matchTimeout} = {},
  ) {
    if (isClassicApi) {
      inFrame
        ? await eyes.checkRegionInFrame(By.css(inFrame), By.css(target), matchTimeout, tag, isFully)
        : await eyes.checkRegion(By.css(target), matchTimeout, tag)
    } else {
      let _checkSettings
      if (inFrame) _checkSettings = Target.frame(By.css(inFrame))
      if (Array.isArray(target)) {
        target.forEach((entry, index) => {
          index === 0 && _checkSettings === undefined
            ? (_checkSettings = Target.region(_makeRegionLocator(entry)))
            : _checkSettings.region(_makeRegionLocator(entry))
        })
      } else {
        _checkSettings
          ? _checkSettings.region(_makeRegionLocator(target))
          : (_checkSettings = Target.region(_makeRegionLocator(target)))
      }
      if (ignoreRegion) {
        _checkSettings.ignoreRegions(_makeRegionLocator(ignoreRegion))
      }
      _checkSettings.fully(isFully)
      await eyes.check(tag, _checkSettings)
    }
  }

  const _makeRegionLocator = target => {
    if (typeof target === 'string') return By.css(target)
    else if (typeof target === 'number') return target
    else return new Region(target)
  }

  async function checkWindow({
    isClassicApi = false,
    isFully = false,
    ignoreRegion,
    floatingRegion,
    scrollRootElement,
    tag,
    matchTimeout,
  } = {}) {
    if (isClassicApi) {
      await eyes.checkWindow(tag, matchTimeout, isFully)
    } else {
      let _checkSettings = Target.window()
        .fully(isFully)
        .ignoreCaret()
      if (scrollRootElement) {
        _checkSettings.scrollRootElement(By.css(scrollRootElement))
      }
      if (ignoreRegion) {
        _checkSettings.ignoreRegions(_makeRegionLocator(ignoreRegion))
      }
      if (floatingRegion) {
        _checkSettings.floatingRegion(
          _makeRegionLocator(floatingRegion.target),
          floatingRegion.maxUp,
          floatingRegion.maxDown,
          floatingRegion.maxLeft,
          floatingRegion.maxRight,
        )
      }
      await eyes.check(tag, _checkSettings)
    }
  }

  async function close(options) {
    await eyes.close(options)
  }

  async function _cleanup() {
    await driver.deleteSession()
  }

  async function abort() {
    await eyes.abortIfNotClosed()
  }

  async function scrollDown(pixels) {
    await driver.execute(`window.scrollBy(0,${pixels})`)
  }

  async function switchToFrame(selector) {
    const element = await driver.findElement(By.css(selector))
    await driver.switchToFrame(element)
  }

  async function type(selector, text) {
    await browser.elementSendKeys(selector, text)
  }

  return {
    abort,
    visit,
    open,
    checkFrame,
    checkRegion,
    checkWindow,
    close,
    scrollDown,
    switchToFrame,
    type,
    _cleanup,
    _setup,
  }
}

module.exports = {
  name: sdkName,
  initialize,
  supportedTests,
  options: { needsChromeDriver: true, chromeDriverOptions: ['--port=4444', '--url-base=wd/hub', '--silent'] },
}
