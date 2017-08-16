# solidity repl

![REPL Screenshot](https://raw.githubusercontent.com/raineorshine/solidity-repl/master/screenshot.png)

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
> msg.sender
0x2f42491c0a08e4bc0cd3d5a96533a69727e16911
```

## Help Wanted

Here are some features that are great candidates for pull requests! Start an issue to let me know you are working on it.

1. Make it work in the browser!
1. Fix `1 ether`
1. Fix `this`
1. Add support for function declarations.
1. Add up and down arrow
1. Add `yargs` for cli help.

# Developer Notes

- bignumber.js is included because it is missing from a dependency

## License

ISC
