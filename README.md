### Note 

IDK why after `npm run test` compiled contracts are removed. Workaround for running tests: put compiled contracts into `build/contracts/` manually.

### Compile

npx truffle compile


### Testing

For each test run:

Run `npx ganache-cli --deterministic --time "1970-01-01T00:00:00+00:00"` to start a chain.

Run the tests using `npm run test`