#!/usr/bin/env node
'use strict'

const yargs = require('yargs')
const pkg = require('./package.json')
const {Repl, specialGlobals} = require('./index.js')
const chalk = require('chalk')

yargs
  .version(pkg.version)
  .wrap(yargs.terminalWidth())
  .usage(`\n${chalk.bold.underline('These are the available commands: [<command>: <returnType>]')}
  \n${specialGlobals.msg.map(m => `msg.${m.prop}: ${m.returnType}`).join('\n')}
  \n${specialGlobals.block.map(m => `block.${m.prop}: ${m.returnType}`).join('\n')}
  \n${specialGlobals.tx.map(m => `tx.${m.prop}: ${m.returnType}`).join('\n')}
  `)
  .epilogue('for more information, look at the code repository at https://github.com/raineorshine/solidity-repl')
  .parse()

console.log('Welcome to the Solidity REPL!')
console.log('For help use solr --help')

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
