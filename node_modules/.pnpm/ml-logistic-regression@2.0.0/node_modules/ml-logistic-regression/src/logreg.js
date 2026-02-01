import Matrix from 'ml-matrix';

import LogisticRegressionTwoClasses from './logreg_2classes.js';

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

export default class LogisticRegression {
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
