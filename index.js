'use strict'

const solc = require('solc')
const bluebird = require('bluebird')
const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')
const waterfall = require('promise.waterfall')
const newContract = require('eth-new-contract')

const contractName = 'ReplContainer'
const main = 'Main'

// contract template where the user commands are injected before compilation
const template = args => `contract ${contractName} {
  function ${main}() constant returns (${args.returnType}) {
    ${args.content}
    return ${args.returnExpression}
  }
}`

/** Parse the error message thrown with a naive compile in order to determine the actual return type. This is the hacky alternative to parsing an AST. */
const regexpReturnError = /Return argument type (.*) is not implicitly convertible to expected type \(type of first return variable\) bool./
const matchReturnTypeFromError = message => message.match(regexpReturnError)

// setup web3
const web3 = new Web3(TestRPC.provider())
const getAccounts = bluebird.promisify(web3.eth.getAccounts.bind(web3.eth))

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
  if (compilationFirstPass.errors) {
    const match = matchReturnTypeFromError(compilationFirstPass.errors[0])
    if (match) {
      returnType = match[1]
    } else {
      return Promise.reject(compilationFirstPass.errors.join('\n'))
    }
    source = template({ content, returnType, returnExpression: lastCommand })
  }

  const compilation = solc.compile(source)

  if (compilation.errors) {
    return Promise.reject('Error compiling Solidity')
  }

  // if the last command is not an expression with a return value (e.g. an assignment), just return null
  // this still must be done after compilation in case there is an error
  if (!isExpression(lastCommand)) {
    return Promise.resolve(null)
  }

  // if we made it this far, deploy the bytecode
  const bytecode = compilation.contracts[contractName].bytecode
  const abi = JSON.parse(compilation.contracts[contractName].interface)
  const ReplContainer = web3.eth.contract(abi)

  // execute the compiled contract and execute its Main function to get a result
  return waterfall([
    getAccounts,
    accounts => newContract(ReplContainer, { from: accounts[0], data: bytecode, gas: 3e6 }),
    contract => bluebird.promisify(contract[main])()
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
