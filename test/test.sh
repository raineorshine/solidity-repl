ganache-cli & GANACHE_PID="$!"
sleep 5
mocha
kill "$GANACHE_PID"
