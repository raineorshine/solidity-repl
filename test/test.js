'use strict'

/* global describe, it, beforeEach */

const Repl = require('../index.js')
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
})
