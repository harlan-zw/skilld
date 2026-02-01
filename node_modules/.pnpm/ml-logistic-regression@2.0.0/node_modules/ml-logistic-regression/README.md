# logistic-regression

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

This is an implementation of the logistic regression. When there are more than 2 classes, the method used is the _One VS All_.

## Installation

`$ npm i ml-logistic-regression`

## Usage

```js
const { Matrix } = require('ml-matrix');

// Our training set (X,Y).
const X = new Matrix([[0, -1], [1, 0], [1, 1], [1, -1], [2, 0], [2, 1], [2, -1], [3, 2], [0, 4], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5], [3, 4], [1, 10], [1, 12], [2, 10], [2, 11], [2, 14], [3, 11]]);
const Y = Matrix.columnVector([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2]);

// The test set (Xtest, Ytest).
const Xtest = new Matrix([
  [0, -2],
  [1, 0.5],
  [1.5, -1],
  [1, 2.5],
  [2, 3.5],
  [1.5, 4],
  [1, 10.5],
  [2.5, 10.5],
  [2, 11.5],
]);
const Ytest = Matrix.columnVector([0, 0, 0, 1, 1, 1, 2, 2, 2]);

// We will train our model.
const logreg = new LogisticRegression({ numSteps: 1000, learningRate: 5e-3 });
logreg.train(X, Y);

// We try to predict the test set.
const finalResults = logreg.predict(Xtest);

// Now, you can compare finalResults with the Ytest, which is what you wanted to have.
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-logistic-regression.svg
[npm-url]: https://npmjs.org/package/ml-logistic-regression
[ci-image]: https://github.com/mljs/logistic-regression/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/mljs/logistic-regression/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/logistic-regression.svg
[codecov-url]: https://codecov.io/gh/mljs/logistic-regression
[download-image]: https://img.shields.io/npm/dm/ml-logistic-regression.svg
[download-url]: https://npmjs.org/package/ml-logistic-regression
