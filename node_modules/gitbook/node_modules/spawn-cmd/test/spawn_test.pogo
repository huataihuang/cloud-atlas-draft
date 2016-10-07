spawn = require '../spawn.js'.spawn
os = require 'os'

describe 'spawn'

    it 'spawns a process' @(done)
        stdout = ''
        stderr = ''

        spawned = spawn('echo', ['zomg'])

        spawned.stdout.on "data" @(data)
            stdout := stdout + data.toString()

        spawned.stderr.on "data" @(data)
            stderr := stderr + data.toString()

        spawned.on 'exit' @(code)
            set timeout
              stderr.should.equal ""
              stdout.should.match r/zomg/
              code.should.equal 0
              done()
            1
