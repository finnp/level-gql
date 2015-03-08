
var roughMatch = require('./genotypematch.js')

module.exports = GQL


function GQL(db) {
  if(!(this instanceof GQL)) return new GQL(db)
  this.db = db
  this._tests = []
}

GQL.prototype.add = function (fn) {
  this._tests.push(fn)
}

GQL.prototype.needs = function (n) {
  this.n = n
}

GQL.prototype.exact = function(id, genotype) {
  this.add(function (db, cb) {
    db.get(id, function (err, value) {
      if(err) return cb(null, false) // TODO: test for 404
      cb(null, roughMatch(value, genotype))
    })
  })
}

GQL.prototype.exactNot = function(id, genotype) {
  this.add(function (db, cb) {
    db.get(id, function (err, value) {
      if(err) return cb(null, false) // TODO: test for 404
      cb(null, !roughMatch(value, genotype))
    })
  })
}

GQL.prototype.has = function(id, genotype) {
  this.add(function (db, cb) {
    db.get(id, function (err, value) {
      if(err) return cb(null, false) // TODO: test for 404
      cb(null, value.indexOf(genotype) !== -1)
    })
  })
}

GQL.prototype.hasNot = function(id, genotype) {
  this.add(function (db, cb) {
    db.get(id, function (err, value) {
      if(err) return cb(null, false) // TODO: test for 404
      cb(null, !value.indexOf(genotype) === -1)
    })
  })
}

GQL.prototype.exists = function (id) {
  this.add(function (db, cb) {
    db.get(id, function (err) {
      if(err) return cb(null, false) // TODO: test for 404
      cb(null, true)
    })
  })
}

GQL.prototype.doesntExist = function (id) {
  this.add(function (db, cb) {
    db.get(id, function (err) {
      if(err) return cb(null, true) // TODO: test for 404
      cb(null, false)
    })
  })
}


GQL.prototype.or = function () {
  var args = Array.prototype.slice.call(arguments)
  var tests = this._tests
  args = args.map(function () {
    return tests.pop()
  }) 
  var todo = args.length
  var fullfilled = true
  this.add(function(db, cb) {
    args.forEach(function (test) {
      test(db, function (err, value) {
        if(err) return cb(err)
        todo--
        fullfilled = fullfilled || value
        if(todo === 0) cb(null, fullfilled)
      })
    })
  })  
}

GQL.prototype.and = function () {
  var args = Array.prototype.slice.call(arguments)
  var tests = this._tests
  args = args.map(function () {
    return tests.pop()
  }) 
  var todo = args.length
  var fullfilled = true
  this.add(function(db, cb) {
    args.forEach(function (test) {
      test(db, function (err, value) {
        if(err) return cb(err)
        todo--
        fullfilled = fullfilled && value
        if(todo === 0) cb(null, fullfilled)
      })
    })
  })  
}

GQL.prototype.percentage = function (cb) {
  var db = this.db
  var pass = 0
  var total = this.n || this._tests.length
  var todo = this._tests.length
  this._tests.forEach(function (test) {
    test(db, function (err, value) {
      if(err) return console.error(err)
      if(value) pass++
      todo--
      if(todo === 0) cb(null, pass / total * 100)
    })
  })
}

GQL.prototype.matches = function (cb) {
  var db = this.db
  var pass = 0
  var todo = this._tests.length
  this._tests.forEach(function (test) {
    test(db, function (err, value) {
      if(err) return console.error(err)
      if(value) pass++
      todo--
      if(todo === 0) cb(null, pass)
    })
  })
}

GQL.prototype.fullfills = function (cb) {
  // non-standard
  var db = this.db
  var todo = this._tests.length
  var fullfilled = true
  this._tests.forEach(function (test) {
    test(db, function (err, value) {
      if(err) console.error(err)
      fullfilled = fullfilled && value
      todo--
      if(todo === 0) cb(fullfilled) // not lazy
      
    })
  })
}

// GQL.prototyoe.or = function() {
//   arguments.length
// }




