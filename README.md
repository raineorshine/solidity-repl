# solidity repl

![REPL Screenshot](https://raw.githubusercontent.com/raineorshine/solidity-repl/master/screenshot.png)

## Requirements

The Solidity REPL requires node v4 and testrpc.

```sh
$ npm install -g ethereumjs-testrpc
$ testrpc
```

## Installation

```sh
$ npm install -g solidity-repl
```

## Usage

```sh
$ solr
Welcome to the Solidity REPL!
> uint a = 10
> uint b = 20
> a + b
30
```

## Help Wanted

Here are some features that are great candidates for pull requests! Start an issue to let me know you are working on it.

1. Can we run testrpc internally to avoid the external dependency?
1. Print an informative error message for when testrpc is not running.
1. Add command line argument for testrpc port.
1. Add command line argument for verbose output.
1. Add `yargs` for cli help.
1. Add support for function declarations.

## License

ISC
