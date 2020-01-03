#!/usr/bin/env node
'use strict'

const yargs = require("yargs")
const pkg = require("./package.json")
const {Repl, specialGlobals} = require('./index.js')
const chalk = require("chalk")

yargs
  .version(pkg.version)
  .wrap(yargs.terminalWidth())
  .usage(`\n${chalk.bold("Help for using the Solidity REPL.")}\n${chalk.bold("Try Solidity instantly with a command-line Solidity console.")}\n\n${chalk.bold.underline("Available commands:")}
  \nmsg
  \n${specialGlobals.msg.map(m=>`${m.prop} ${m.returnType}\n`)}
  `)
  .epilogue('for more information, find our repository at https://github.com/raineorshine/solidity-repl')
  .argv

console.log('Welcome to the Solidity REPL!')

const printPrompt = () => process.stdout.write('> ')

printPrompt()

let repl = Repl(yargs)

process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', rawCommand => {
  const command = rawCommand.trim()
  if (command === 'quit') {
    process.exit()
  } else if (command === 'clear') {
    repl = Repl(yargs)
    process.stdout.write('\x1B[2J\x1B[0f')
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
