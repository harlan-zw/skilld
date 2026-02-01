'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Matrix = _interopDefault(require('ml-matrix'));

class LogisticRegressionTwoClasses {
  constructor(options = {}) {
    const { numSteps = 50000, learningRate = 5e-4, weights = null } = options;
    this.numSteps = numSteps;
    this.learningRate = learningRate;
    this.weights = weights ? Matrix.checkMatrix(weights) : null;
  }

  train(features, target) {
    let weights = Matrix.zeros(1, features.columns);

    for (let step = 0; step < this.numSteps; step++) {
      const scores = features.mmul(weights.transpose());
      const predictions = sigmoid(scores);

      // Update weights with gradient
      const outputErrorSignal = Matrix.columnVector(predictions)
        .neg()
        .add(target);
      const gradient = features.transpose().mmul(outputErrorSignal);
      weights = weights.add(gradient.mul(this.learningRate).transpose());
    }

    this.weights = weights;
  }

  testScores(features) {
    const finalData = features.mmul(this.weights.transpose());
    return sigmoid(finalData);
  }

  predict(features) {
    const finalData = features.mmul(this.weights.transpose());
    return sigmoid(finalData).map(Math.round);
  }

  static load(model) {
    return new LogisticRegressionTwoClasses(model);
  }

  toJSON() {
    return {
      numSteps: this.numSteps,
      learningRate: this.learningRate,
      weights: this.weights,
    };
  }
}

function sigmoid(scores) {
  scores = scores.to1DArray();
  let result = [];
  for (let i = 0; i < scores.length; i++) {
    result.push(1 / (1 + Math.exp(-scores[i])));
  }
  return result;
}

function transformClassesForOneVsAll(Y, oneClass) {
  let y = Y.to1DArray();
  for (let i = 0; i < y.length; i++) {
    if (y[i] === oneClass) {
      y[i] = 0;
    } else {
      y[i] = 1;
    }
  }
  return Matrix.columnVector(y);
}

class LogisticRegression {
  constructor(options = {}) {
    const {
      numSteps = 50000,
      learningRate = 5e-4,
      classifiers = [],
      numberClasses = 0,
    } = options;
    this.numSteps = numSteps;
    this.learningRate = learningRate;
    this.classifiers = classifiers;
    this.numberClasses = numberClasses;
  }

  train(X, Y) {
    this.numberClasses = new Set(Y.to1DArray()).size;
    this.classifiers = new Array(this.numberClasses);

    // train the classifiers
    for (let i = 0; i < this.numberClasses; i++) {
      this.classifiers[i] = new LogisticRegressionTwoClasses({
        numSteps: this.numSteps,
        learningRate: this.learningRate,
      });
      let y = Y.clone();
      y = transformClassesForOneVsAll(y, i);
      this.classifiers[i].train(X, y);
    }
  }

  predict(Xtest) {
    let resultsOneClass = new Array(this.numberClasses).fill(0);
    let i;
    for (i = 0; i < this.numberClasses; i++) {
      resultsOneClass[i] = this.classifiers[i].testScores(Xtest);
    }
    let finalResults = new Array(Xtest.rows).fill(0);
    for (i = 0; i < Xtest.rows; i++) {
      let minimum = 100000;
      for (let j = 0; j < this.numberClasses; j++) {
        if (resultsOneClass[j][i] < minimum) {
          minimum = resultsOneClass[j][i];
          finalResults[i] = j;
        }
      }
    }
    return finalResults;
  }

  static load(model) {
    if (model.name !== 'LogisticRegression') {
      throw new Error(`invalid model: ${model.name}`);
    }
    const newClassifier = new LogisticRegression(model);
    for (let i = 0; i < newClassifier.numberClasses; i++) {
      newClassifier.classifiers[i] = LogisticRegressionTwoClasses.load(
        model.classifiers[i],
      );
    }
    return newClassifier;
  }

  toJSON() {
    return {
      name: 'LogisticRegression',
      numSteps: this.numSteps,
      learningRate: this.learningRate,
      numberClasses: this.numberClasses,
      classifiers: this.classifiers,
    };
  }
}

module.exports = LogisticRegression;
