const executionModes = [{isVisualGrid: true}, {isCssStitching: true}, {isScrollStitching: true}]
const tests = [
  'TestCheckFrame',
  'TestCheckRegion',
  'TestCheckRegion2',
  'TestCheckWindow',
  'TestCheckWindowFully',
  'TestCheckFrame_Fluent',
  'TestCheckWindow_Fluent',
]
let supportedTests = []
function addTest(name, executionMode) {
  supportedTests.push({name, executionMode})
}
tests.forEach(name => {
  executionModes.forEach(executionMode => {
    addTest(name, executionMode)
  })
})
addTest('Test Abort', {isVisualGrid: true})
addTest('Test Abort', {isCssStitching: true})

module.exports = supportedTests
