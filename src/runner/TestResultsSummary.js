'use strict';

const { ArgumentGuard, TypeUtils, GeneralUtils } = require('@applitools/eyes-common');
const { TestFailedError } = require('@applitools/eyes-sdk-core');
const { TestResultsStatus } = require('@applitools/eyes-sdk-core');

const { TestResultContainer } = require('./TestResultContainer');

class TestResultsSummary {
  /**
   * @param {(TestResults|Error|TestResultContainer)[]} allResults
   */
  constructor(allResults) {
    ArgumentGuard.isArray(allResults, 'ArgumentGuard');

    this._passed = 0;
    this._unresolved = 0;
    this._failed = 0;
    this._exceptions = 0;
    this._mismatches = 0;
    this._missing = 0;
    this._matches = 0;

    this._allResults = [];

    for (let result of allResults) {
      if (!(result instanceof TestResultContainer)) {
        if (result instanceof TestFailedError) {
          result = new TestResultContainer(result.getTestResults(), result);
        } else if (result instanceof Error) {
          result = new TestResultContainer(undefined, result);
        } else {
          result = new TestResultContainer(result);
        }
      }

      this._allResults.push(result);

      if (result.getException() !== undefined){
        this._exceptions++;
      }

      const testResults = result.getTestResults();
      if (TypeUtils.isNotNull(testResults)) {
        if (TypeUtils.isNotNull(testResults.getStatus())) {
          switch (testResults.getStatus()) {
            case TestResultsStatus.Failed:
              this._failed++;
              break;
            case TestResultsStatus.Passed:
              this._passed++;
              break;
            case TestResultsStatus.Unresolved:
              this._unresolved++;
              break;
          }
        }

        this._matches += testResults.getMatches();
        this._missing += testResults.getMissing();
        this._mismatches += testResults.getMismatches();
      }
    }
  }

  /**
   * @return {TestResultContainer[]}
   */
  getAllResults() {
    return this._allResults;
  }

  /**
   * @return {string}
   */
  toString() {
    return "result summary {" +
      "\n\tall results=\n\t\t" + GeneralUtils.toString(this._allResults) +
      "\n\tpassed=" + this._passed +
      "\n\tunresolved=" + this._unresolved +
      "\n\tfailed=" + this._failed +
      "\n\texceptions=" + this._exceptions +
      "\n\tmismatches=" + this._mismatches +
      "\n\tmissing=" + this._missing +
      "\n\tmatches=" + this._matches +
      "\n}";
  }
}

exports.TestResultsSummary = TestResultsSummary;
