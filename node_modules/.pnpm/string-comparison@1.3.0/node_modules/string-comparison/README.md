
# string-comparison
![npm bundle size](https://img.shields.io/bundlephobia/minzip/string-comparison)
![npm](https://img.shields.io/npm/dm/string-comparison)
[![GitHub stars](https://img.shields.io/github/stars/Rabbitzzc/js-string-comparison)](https://github.com/Rabbitzzc/js-string-comparison/stargazers)
[![GitHub license](https://img.shields.io/github/license/Rabbitzzc/js-string-comparison)](https://github.com/Rabbitzzc/js-string-comparison/blob/master/LICENCE)

**JavaScript implementation of [tdebatty/java-string-similarity](https://github.com/tdebatty/java-string-similarity)**

A library implementing different string similarity, distance and sortMatch measures. A dozen of algorithms (including Levenshtein edit distance and sibblings, Longest Common Subsequence, cosine similarity etc.) are currently implemented. Check the summary table below for the complete list...

- [string-comparison](#string-comparison)
  - [Download \& Usage](#download--usage)
  - [OverView](#overview)
  - [Normalized, metric, similarity and distance](#normalized-metric-similarity-and-distance)
    - [(Normalized) similarity and distance](#normalized-similarity-and-distance)
  - [Levenshtein](#levenshtein)
  - [Longest Common Subsequence](#longest-common-subsequence)
  - [Metric Longest Common Subsequence](#metric-longest-common-subsequence)
  - [Cosine similarity](#cosine-similarity)
  - [Sorensen-Dice coefficient](#sorensen-dice-coefficient)
  - [Jaro-Winkler similarity](#jaro-winkler-similarity)
  - [API](#api)
  - [Methods](#methods)
    - [similarity](#similarity)
      - [params](#params)
      - [return](#return)
    - [distance](#distance)
      - [params](#params-1)
      - [return](#return-1)
    - [sortMatch](#sortmatch)
      - [params](#params-2)
      - [return](#return-2)
  - [CHANGELOG](#changelog)
  - [MIT](#mit)


## Download & Usage

download

```shell
npm install string-comparison --save
yarn add string-comparison
pnpm add string-comparison
```
usage

```js
let stringComparison = require('string-comparison')
// or import stringComparison from 'string-comparison'

const Thanos = 'healed'
const Rival = 'sealed'
const Avengers = ['edward', 'sealed', 'theatre']

// use by cosine
let cos = stringComparison.Cosine

console.log(cos.similarity(Thanos, Rival))
console.log(cos.distance(Thanos, Rival))
console.log(cos.sortMatch(Thanos, Avengers))

```

## OverView

The main characteristics of each implemented algorithm are presented below. The "cost" column gives an estimation of the computational cost to compute the similarity between two strings of length m and n respectively.

|                                                                                                                                      | Measure(s)                              | Normalized? | Metric? | Type    | Cost   | Typical usage   |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ----------- | ------- | ------- | ------ | --------------- |
| [Jaccard index](https://github.com/luozhouyang/python-string-similarity/blob/master/README.md#jaccard-index)                         | similarity<br/>distance<br />sortMatch  | Yes         | Yes     | Set     | O(m+n) |                 |
| [Cosine similarity](https://github.com/luozhouyang/python-string-similarity/blob/master/README.md#cosine-similarity)                 | similarity<br/>distance<br />sortMatch  | Yes         | No      | Profile | O(m+n) |                 |
| [Sorensen-Dice coefficient](https://github.com/luozhouyang/python-string-similarity/blob/master/README.md#sorensen-dice-coefficient) | similarity<br/>distance<br />sortMatch  | Yes         | No      | Set     | O(m+n) |                 |
| [Levenshtein](https://github.com/luozhouyang/python-string-similarity/blob/master/README.md#levenshtein)                             | similarity<br />distance<br />sortMatch | No          | Yes     |         | O(m*n) |                 |
| [Jaro-Winkler](https://github.com/luozhouyang/python-string-similarity/blob/master/README.md#jaro-winkler)                           | similarity distance<br />sortMatch      | Yes         | No      |         | O(m*n) | typo correction |

## Normalized, metric, similarity and distance

Although the topic might seem simple, a lot of different algorithms exist to measure text similarity or distance. Therefore the library defines some interfaces to categorize them.

### (Normalized) similarity and distance

- StringSimilarity : Implementing algorithms define a similarity between strings (0 means strings are completely different).
- NormalizedStringSimilarity : Implementing algorithms define a similarity between 0.0 and 1.0, like Jaro-Winkler for example.
- StringDistance : Implementing algorithms define a distance between strings (0 means strings are identical), like Levenshtein for example. The maximum distance value depends on the algorithm.
- NormalizedStringDistance : This interface extends StringDistance. For implementing classes, the computed distance value is between 0.0 and 1.0. NormalizedLevenshtein is an example of NormalizedStringDistance.

## Levenshtein

The Levenshtein distance between two words is the minimum number of single-character edits (insertions, deletions or substitutions) required to change one word into the other.

It is a metric string distance. This implementation uses dynamic programming (Wagner–Fischer algorithm), with only 2 rows of data. The space requirement is thus O(m) and the algorithm runs in O(m.n).

```js
import { levenshtein } from "string-comparison"
import type {SortMatchResultType} from "string-comparison"

const Thanos = 'healed'
const Rival = 'sealed'
const Avengers = ['edward', 'sealed', 'theatre']

console.log(levenshtein.similarity(Thanos, Rival))
console.log(levenshtein.distance(Thanos, Rival))
console.log(levenshtein.sortMatch(Thanos, Avengers) as SortMatchResultType)

// output
0.8333333333333334
1
[
  { member: 'edward', index: 0, rating: 0.16666666666666663 },
  { member: 'theatre', index: 2, rating: 0.4285714285714286 },
  { member: 'sealed', index: 1, rating: 0.8333333333333334 }
]
```


## Longest Common Subsequence

The longest common subsequence (LCS) problem consists in finding the longest subsequence common to two (or more) sequences. It differs from problems of finding common substrings: unlike substrings, subsequences are not required to occupy consecutive positions within the original sequences.

It is used by the diff utility, by Git for reconciling multiple changes, etc.

The LCS distance between strings X (of length n) and Y (of length m) is n + m - 2 |LCS(X, Y)|
min = 0
max = n + m

LCS distance is equivalent to Levenshtein distance when only insertion and deletion is allowed (no substitution), or when the cost of the substitution is the double of the cost of an insertion or deletion.

This class implements the dynamic programming approach, which has a space requirement O(m.n), and computation cost O(m.n).

In "Length of Maximal Common Subsequences", K.S. Larsen proposed an algorithm that computes the length of LCS in time O(log(m).log(n)). But the algorithm has a memory requirement O(m.n²) and was thus not implemented here.

```js
import { longestCommonSubsequence } from "string-comparison"
or 
import { lcs } from "string-comparison"


const Thanos = 'healed'
const Rival = 'sealed'
const Avengers = ['edward', 'sealed', 'theatre']

console.log(lcs.similarity(Thanos, Rival))
console.log(lcs.distance(Thanos, Rival))
console.log(lcs.sortMatch(Thanos, Avengers))

// output
0.8333333333333334
2
[
  { member: 'edward', index: 0, rating: 0.5 },
  { member: 'theatre', index: 2, rating: 0.6153846153846154 },
  { member: 'sealed', index: 1, rating: 0.8333333333333334 }
]
```

## Metric Longest Common Subsequence

Distance metric based on Longest Common Subsequence, from the notes "An LCS-based string metric" by Daniel Bakkelund.
http://heim.ifi.uio.no/~danielry/StringMetric.pdf

The distance is computed as 1 - |LCS(s1, s2)| / max(|s1|, |s2|)

```js
import { metricLcs } from "string-comparison"
or 
import { mlcs } from "string-comparison"

const Thanos = 'healed'
const Rival = 'sealed'
const Avengers = ['edward', 'sealed', 'theatre']

console.log(metricLcs.similarity(Thanos, Rival))
console.log(metricLcs.distance(Thanos, Rival))
console.log(metricLcs.sortMatch(Thanos, Avengers))

// output
0.8333333333333334
0.16666666666666663
[
  { member: 'edward', index: 0, rating: 0.5 },
  { member: 'theatre', index: 2, rating: 0.5714285714285714 },
  { member: 'sealed', index: 1, rating: 0.8333333333333334 }
]
```

## Cosine similarity

Like Q-Gram distance, the input strings are first converted into sets of n-grams (sequences of n characters, also called k-shingles), but this time the cardinality of each n-gram is not taken into account. Each input string is simply a set of n-grams. The Jaccard index is then computed as |V1 inter V2| / |V1 union V2|.

Distance is computed as 1 - similarity.
Jaccard index is a metric distance.

```js
import { cosine } from "string-comparison"
```

## Sorensen-Dice coefficient

Similar to Jaccard index, but this time the similarity is computed as 2 * |V1 inter V2| / (|V1| + |V2|).

Distance is computed as 1 - similarity.

```js
import { diceCoefficient } from "string-comparison"
```

## Jaro-Winkler similarity

The Jaro-Winkler similarity is a string metric measuring edit distance between two strings. Jaro – Winkler Similarity is much similar to Jaro Similarity. They both differ when the prefix of two string match. Jaro – Winkler Similarity uses a prefix scale ‘p’ which gives a more accurate answer when the strings have a common prefix up to a defined maximum length l. 

```js
import { jaroWinkler } from "string-comparison"
```

## API

* `cosine`
* `diceCoefficient`
* `jaccardIndex`
* `levenshtein`
* `lcs` = `longestCommonSubsequence`
* `mlcs` = `metricLcs`
* `jaroWinkler`


## Methods
* `similarity`.
* `distance`.
* `sortMatch`

### similarity

Implementing algorithms define a similarity between strings

#### params

1. thanos [String]
2. rival [String]

#### return

Return a similarity between 0.0 and 1.0

### distance

Implementing algorithms define a distance between strings (0 means strings are identical)

#### params

1. `thanos` [String]
2. `rival` [String]

#### return

Return a number

### sortMatch

#### params

1. thanos [String]
2. avengers [...String]

#### return

Return an array of objects - `SortMatchResultType` ex:
```js
[
  { member: 'edward', rating: 0.16666666666666663 },
  { member: 'theatre', rating: 0.4285714285714286 },
  { member: 'mailed', rating: 0.5 },
  { member: 'sealed', rating: 0.8333333333333334 }
]
```

## CHANGELOG
[CHANGELOG](./CHANGELOG.md)


## MIT
[MIT](./LICENSE)
