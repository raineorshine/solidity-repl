#!/usr/bin/env node
'use strict'

const program = require('commander')
const pkg = require('./package.json')
const Repl = require('./index.js')

console.log('Welcome to the Solidity REPL!')

program
  .version(pkg.version)
  .option('--loglevel [value]', 'errors-only (default)/warnings')
  .parse(process.argv)

const printPrompt = () => process.stdout.write('> ')

printPrompt()

let repl = Repl(program)

process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', command => {
  if (command === 'quit\n') {
    process.exit()
  } else if (command === 'clear\n') {
    repl = Repl(program)
    printPrompt()
  } else {
    // evaluate the command
    repl(command)
      .then(result => {
        // if null is returned, it means the last command was not an expression with a return value
        if (result !== null) {
          console.log(result.toString())
        }
      })
      .catch(err => {
        console.log(err)
      })
      .then(printPrompt)
  }
})
