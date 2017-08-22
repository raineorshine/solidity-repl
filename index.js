'use strict'

const solc = require('solc')
const Bluebird = require('bluebird')
const chalk = require('chalk')
const waterfall = require('promise.waterfall')
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
// const TestRPC = require('ethereumjs-testrpc')
// TestRPC.provider() gives error "Synchronous requests are not supported."
// during newContract in latest version.
const web3 = new Web3(provider)
const newContract = require('eth-new-contract').default(provider)
const pkg = require('./package.json')

const contractName = 'ReplContainer'
const main = 'Main'

// contract template where the user commands are injected before compilation
const template = args => `pragma solidity ${pkg.dependencies.solc};
contract ${contractName} {
  function ${main}() constant returns (${args.returnType}) {
    ${args.content}
    return ${args.returnExpression}
  }
}`

/** Parse the error message thrown with a naive compile in order to determine the actual return type. This is the hacky alternative to parsing an AST. */
const regexpReturnError = /Return argument type (.*) is not implicitly convertible to expected type \(type of first return variable\) bool./
const matchReturnTypeFromError = message => message.match(regexpReturnError)

// promisified getAccounts because Bluebird.promisify gives "callback is not a function"
const getAccounts = () => {
  return new Bluebird((resolve, reject) => {
    web3.eth.getAccounts((err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/** Takes a list of commands and evaluates them inside a contract. Returns a promised result of the last command. Returns null if the command is not an expression. */
const evalSol = commands => {
  /** Returns true if the given command is an expression that can return a value. */
  const isExpression = command => !/[^=]=[^=]/.test(command)
  const lastCommand = commands[commands.length - 1]

  let returnType = 'bool'
  const content = commands.slice(0, commands.length - 1).join('\n')
  const contentWithReturnExpression = commands.join('\n')
  const sourceFirstPass = template({ content: contentWithReturnExpression, returnType, returnExpression: isExpression(lastCommand) ? lastCommand : 'false;' })
  let source = sourceFirstPass

  // Attempt to compile the first pass knowing that any return value (other than bool) will fail. Parse the error message to determine the correct return value and generate the correct source.
  const compilationFirstPass = solc.compile(sourceFirstPass)

  // get errors and warnings
  // remove "Unused local variable" warning which will always trigger in REPL mode
  if (compilationFirstPass.errors) {
    const errorsFirstPass = compilationFirstPass.errors
      .filter(err => !err.match(/: Warning: /))
    const warnings = compilationFirstPass.errors
      .filter(err => err.match(/: Warning: /) && !err.match('Unused local variable'))

    if (warnings.length) {
      console.log(chalk.yellow(warnings.join('\n')))
    }

    // handle errors
    if (errorsFirstPass.length > 0) {
      const match = matchReturnTypeFromError(errorsFirstPass[0])
      if (match) {
        returnType = match[1]
      } else {
        return Promise.reject(errorsFirstPass.join('\n'))
      }
      source = template({ content, returnType, returnExpression: lastCommand })
    }
  }

  const compilation = solc.compile(source)

  if (compilation.errors) {
    const errors = compilation.errors
      .filter(err => !err.match(/: Warning: /))

    if (errors.length) {
      console.error(chalk.red(`Error compiling Solidity:

${source.split('\n').map((line, n) => (n + 1) + '  ' + line).join('\n')}

  ${errors.join('\n  ')}`, errors))
      return Promise.reject('Error compiling Solidity')
    }
  }

  // if the last command is not an expression with a return value (e.g. an assignment), just return null
  // this still must be done after compilation in case there is an error
  if (!isExpression(lastCommand)) {
    return Promise.resolve(null)
  }

  // if we made it this far, deploy the bytecode
  const contract = compilation.contracts[`:${contractName}`]
  const bytecode = contract.bytecode
  const abi = JSON.parse(contract.interface)
  const ReplContainer = web3.eth.contract(abi)

  // execute the compiled contract and execute its Main function to get a result
  return waterfall([
    getAccounts,
    accounts => newContract(ReplContainer, { from: accounts[0], data: bytecode, gas: 3e6 }),
    contract => Bluebird.promisify(contract[main])()
  ])
}

/** Creates a new repl environment that can evaluate solidity commands. Returns a single function that takes a new command. */
module.exports = () => {
  const commands = []

  /** Takes a new command and returns the result of evaluating it in the current context. */
  return rawCommand => {
    const command = rawCommand.trim()

    // ignore blank lines
    if (command === '') {
      return Promise.resolve(null)
    }

    const commandWithSemi = command + (command.endsWith(';') ? '' : ';')
    return evalSol(commands.concat(commandWithSemi))
      .then(result => {
        commands.push(commandWithSemi)
        return result
      })
  }
}
