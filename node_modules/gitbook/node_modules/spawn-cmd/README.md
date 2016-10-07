# spawn-cmd

child_process.spawn ignores PATHEXT on Windows:

https://github.com/joyent/node/issues/2318

This tiny shim provides a uniform interface to spawn a process on linux and windows:

    var spawn = require('spawn-cmd').spawn;

    var echo = spawn('echo', ['OHRLLY']);

    echo.stdout.on('data', function() { ... });

This doesn't make commands portable, because this library doesn't do any translation of unix commands to their windows equivalents. It just uses the 'comspec' environment variable on windows. You might want to look at this if you want more:

https://github.com/ForbesLindesay/win-spawn
