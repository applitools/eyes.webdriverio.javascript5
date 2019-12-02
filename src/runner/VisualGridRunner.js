'use strict';

const {EyesRunner} = require('./EyesRunner');
const {TestResultsSummary} = require('./TestResultsSummary');

class VisualGridRunner extends EyesRunner {
  // this class is just a mock for compatibility with Java

  /**
   * @param {number} [concurrentSessions]
   */
  constructor(concurrentSessions) {
    super();

    this._concurrentSessions = concurrentSessions;
  }

  /**
   * @return {number}
   */
  getConcurrentSessions() {
    return this._concurrentSessions;
  }

  /**
   * @param {boolean} [throwEx=true]
   * @return {Promise<TestResultsSummary>}
   */
  async getAllTestResults(throwEx = true) {
    if (this._eyesInstances.length === 1) {
      return this._eyesInstances[0].closeAndReturnResults(throwEx);
    } else if (this._eyesInstances.length > 1) {
      const resultsPromise = [];
      const allResults = [];

      for (const eyesInstance of this._eyesInstances) {
        resultsPromise.push(eyesInstance.closeAndReturnResults(false));
      }

      const results = await Promise.all(resultsPromise);
      for (const result of results) {
        allResults.push(...result.getAllResults());
      }

      if (throwEx === true) {
        for (const result of allResults) {
          if (result.getException()) {
            throw result.getException();
          }
        }
      }

      await this._closeAllBatches();
      return new TestResultsSummary(allResults);
    }

    return null;
  }
}

exports.VisualGridRunner = VisualGridRunner;
