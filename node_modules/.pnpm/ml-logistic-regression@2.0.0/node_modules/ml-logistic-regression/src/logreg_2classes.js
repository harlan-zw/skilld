import Matrix from 'ml-matrix';

export default class LogisticRegressionTwoClasses {
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
