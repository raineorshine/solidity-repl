#!/usr/bin/env node
'use strict'

const Repl = require('./index.js')

const printPrompt = () => process.stdout.write('> ')

console.log('Welcome to the Solidity REPL!')
printPrompt()

let repl = Repl()

process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', command => {
  if (command === 'quit\n') {
    process.exit()
  } else if (command === 'clear\n') {
    repl = Repl()
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
