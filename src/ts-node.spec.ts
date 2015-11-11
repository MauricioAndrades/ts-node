import { expect } from 'chai'
import { exec } from 'child_process'
import { join } from 'path'
import proxyquire = require('proxyquire')
import { register, VERSION } from './ts-node'

const cwd = join(__dirname, '../src')
const BIN_EXEC = `node ${join(__dirname, '../dist/bin/ts-node')} --project "${cwd}"`

describe('ts-node', function () {
  this.timeout(10000)

  it('should export the correct version', function () {
    expect(VERSION).to.equal(require('../package.json').version)
  })

  describe('cli', function () {
    it('should execute cli', function (done) {
      exec(`${BIN_EXEC} tests/hello-world`, function (err, stdout) {
        expect(err).to.not.exist
        expect(stdout).to.equal('Hello, world!\n')

        return done()
      })
    })

    it('should print scripts', function (done) {
      exec(`${BIN_EXEC} -p "import { example } from './tests/complex/index';example()"`, function (err, stdout) {
        expect(err).to.not.exist
        expect(stdout).to.equal('example\n')

        return done()
      })
    })

    it('should eval code', function (done) {
      exec(`${BIN_EXEC} -e "import * as m from './tests/module';console.log(m.example('test'))"`, function (err, stdout) {
        expect(err).to.not.exist
        expect(stdout).to.equal('TEST\n')

        return done()
      })
    })

    it('should throw errors', function (done) {
      exec(`${BIN_EXEC} -e "import * as m from './tests/module';console.log(m.example(123))"`, function (err) {
        expect(err.message).to.contain(
          '[eval].ts (1,59): Argument of type \'number\' is not assignable to parameter of type \'string\'. (2345)'
        )

        return done()
      })
    })

    it('should be able to ignore errors', function (done) {
      exec(`${BIN_EXEC} --ignoreWarnings 2345 -e "import * as m from './tests/module';console.log(m.example(123))"`, function (err) {
        expect(err.message).to.match(/TypeError: (?:(?:undefined|foo\.toUpperCase) is not a function|.*has no method \'toUpperCase\')/)

        return done()
      })
    })

    it('should work with source maps', function (done) {
      exec(`${BIN_EXEC} tests/throw`, function (err) {
        expect(err.message).to.contain([
          `${join(__dirname, '../tests/throw.ts')}:3`,
          '  bar () { throw new Error(\'this is a demo\') }',
          '                 ^',
          'Error: this is a demo'
        ].join('\n'))

        return done()
      })
    })

    it('eval should work with source maps', function (done) {
      exec(`${BIN_EXEC} -p "import './tests/throw'"`, function (err) {
        expect(err.message).to.contain([
          `${join(__dirname, '../tests/throw.ts')}:3`,
          '  bar () { throw new Error(\'this is a demo\') }',
          '                 ^',
          'Error: this is a demo'
        ].join('\n'))

        return done()
      })
    })

    it('should ignore all warnings', function (done) {
      exec(`${BIN_EXEC} -d -p "x"`, function (err) {
        expect(err.message).to.contain('ReferenceError: x is not defined')

        return done()
      })
    })
  })

  describe('register', function () {
    register({ project: cwd })

    it('should be able to require typescript', function () {
      const m = require('../tests/module')

      expect(m.example('foo')).to.equal('FOO')
    })

    it('should compile through js and ts', function () {
      const m = require('../tests/complex')

      expect(m.example()).to.equal('example')
    })

    it('should work with proxyquire', function () {
      const m = proxyquire('../tests/complex', {
        './example': 'hello'
      })

      expect(m.example()).to.equal('hello')
    })
  })
})