#!/usr/bin/env bash

ganache_port=7545

function ganache_running() {
  nc -z localhost "$ganache_port"
}

function cleanup {
  echo "Exiting ganache-cli with pid $ganache_pid"
  kill -9 $ganache_pid
}

function start_ganache {
  ganache-cli -p $ganache_port -e 1000000 -l 7503668 > /dev/null &
  ganache_pid=$!
  echo "Started ganache-cli with pid $ganache_pid"
  trap cleanup EXIT
}

if ganache_running; then
  echo "Using existing ganache instance at port $ganache_port"
else
  echo "Starting our own ganache instance at port $ganache_port"
  start_ganache
fi

truffle test --network development
