# level-gql
[![NPM](https://nodei.co/npm/level-gql.png)](https://nodei.co/npm/level-gql/)

This is an incomplete implementation of a [gql](https://www.npmjs.com/package/gql) interpreter for 
a level key value store backend. 

I did this at my bus ride home after [conc.at](https://conc.at/) where I was inspired by [contras](https://github.com/contra) talk
about genome.js.

It of course runs faster queries, e.g determining if Eric has norovirus immunity took
20.55s with `gql` but 0.16s with `level-gql` on my machine. However you have to create the
[level-dna](https://www.npmjs.com/package/level-dna) store first, which takes much 
longer than 20 seconds. But once you have it there, querying is fast.

## usage

Asume you have a level filled with genome data from [level-dna](https://www.npmjs.com/package/level-dna)
You could run an analysis like this:

```js
var leveldb = require('levelup')
var gql = require('level-gql')

var db = leveldb('./test')

var query = gql(db)

query.needs(3)
query.has('rs10024955', 'A')
query.exists('rs10024986')
query.or(query.has('rs10024955', 'A'), query.exists('rs10024986'))
query.and(query.has('rs10024955', 'A'), query.exists('rs10024986'))
query.percentage(function (err, value) {
  console.log(value)
})
```