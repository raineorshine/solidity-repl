# [solidity-repl](https://github.com/raineorshine/solidity-repl) on win64

* uninstall node 4.4.2, install node 4.4.6 with node-v4.4.6-x64.msi  

### OpenSSL 
(needed for secp256k1 needed for ethereumjs-util needed for ethereumjs-testrpc), otherwise 

> fatal error LNK1181: cannot open input file 'C:\OpenSSL-Win64\lib\libeay32.lib' 

Download [AMD64-Win64OpenSSL-0_9_8g.zip](http://www.indyproject.org/Sockets/fpc/AMD64-Win64OpenSSL-0_9_8g.zip) from e.g. [here](http://www.indyproject.org/Sockets/fpc/OpenSSLforWin64.en.aspx), then unpack to `C:\OpenSSL-Win64\`   (exact path!)

Fix [secp256k1-node/binding.gyp](https://github.com/cryptocoinjs/secp256k1-node/blob/d2f18a44da7fc3e5020fc80824ae75012898cd1c/binding.gyp#L120) problem, either by (new folder, rename, copy), or by

    cd C:\OpenSSL-Win64
    mkdir lib
    copy libeay32.lib lib

### dependencies

    npm install -g node-gyp
    npm install -g ethereumjs-testrpc
    npm install -g web3
    
### solidity-repl
    npm install -g solidity-repl


### run

Two terminals (cmd.exe):

    testrpc

and 

    solr

### example input

    Welcome to the Solidity REPL!
    > uint a=2**255
    > a - 1 + a
    1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77
    > a - 1 + a + 1
    0


----
created 24/6/2016 [my github](https://github.com/drandreaskrueger), [my twitter](https://twitter.com/drandreaskruger)
