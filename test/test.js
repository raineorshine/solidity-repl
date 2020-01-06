'use strict'

/* global describe, it, beforeEach */

const {Repl, specialGlobals} = require('../index.js')
const assert = require('assert')

describe('solidity-repl', () => {
  let repl

  beforeEach(() => {
    repl = Repl()
  })

  it('should return null for non-expression statements', () => {
    return repl('uint a = 10;')
      .then(result => {
        assert.equal(result, null)
      })
  })

  it('should trim the input', () => {
    return repl('  uint a = 10;  ')
      .then(result => {
        assert.equal(result, null)
      })
  })

  it('should return null for empty lines', () => {
    return repl('')
      .then(result => {
        assert.equal(result, null)
      })
  })

  it('should return null for whitespace', () => {
    return repl('    ')
      .then(result => {
        assert.equal(result, null)
      })
  })

  it('should evaluate solidity code and return the result', () => {
    return repl('uint a = 10;')
      .then(() => repl('a'))
      .then(result => {
        assert.equal(result, 10)
      })
  })

  it('should have optional semicolons', () => {
    return repl('uint a = 10')
      .then(() => repl('a'))
      .then(result => {
        assert.equal(result, 10)
      })
  })

  it('should evaluate multiple statements', () => {
    return repl('uint a = 10; a = 11;')
      .then(() => repl('a'))
      .then(result => {
        assert.equal(result, 11)
      })
  })

  it('should evaluate compound expressions', () => {
    return repl('uint a = 10')
      .then(() => repl('uint b = 20'))
      .then(() => repl('a + b'))
      .then(result => {
        assert.equal(result, 30)
      })
  })

  it('should throw if there is an error', () => {
    return repl('$#$*(@)')
      .catch(() => {})
  })

  it('should recover from errors', () => {
    return repl('$#$*(@)')
      .catch(() => {})
      .then(() => repl('uint a = 10'))
      .then(() => repl('a'))
      .then(result => {
        assert.equal(result, 10)
      })
  })

  it('should recover from errors in non-expressions', () => {
    return repl('uint z = %#@*$')
      .catch(() => {})
      .then(() => repl('uint a = 10'))
      .then(() => repl('a'))
      .then(result => {
        assert.equal(result, 10)
      })
  })

  it('should execute special command msg', () => {
    return repl('msg')
      .then(result => {
        const parsedResult = JSON.parse(result)
        assert.equal(Object.keys(parsedResult).length, 5)
        assert.ok("data" in parsedResult)
        assert.ok("gas" in parsedResult)
        assert.ok("sender" in parsedResult)
        assert.ok("sig" in parsedResult)
        assert.ok("value" in parsedResult)
      })
  })

  it('should execute special command block', () => {
    return repl('block')
      .then(result => {
        const parsedResult = JSON.parse(result)
        assert.equal(Object.keys(parsedResult).length, 5)
        assert.ok("coinbase" in parsedResult)
        assert.ok("difficulty" in parsedResult)
        assert.ok("gaslimit" in parsedResult)
        assert.ok("number" in parsedResult)
        assert.ok("timestamp" in parsedResult)
      })
  })

   it('should execute special command tx', () => {
    return repl('tx')
      .then(result => {
        const parsedResult = JSON.parse(result)
        assert.equal(Object.keys(parsedResult).length, 2)
        assert.ok("gasprice" in parsedResult)
        assert.ok("origin" in parsedResult)
      })
  })
})
