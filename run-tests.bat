@echo off
REM Run the tests with the updated configuration
cd %~dp0
npx jest --config jest.config.js --coverage
