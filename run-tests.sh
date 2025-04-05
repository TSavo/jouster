#!/bin/bash

# Run the tests with the updated configuration
cd $(dirname $0)
npx jest --config jest.config.js --coverage
