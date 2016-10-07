spawn = require 'child_process'.spawn

windows spawn (executable, args, options) =
    spawn (process.env.comspec || 'cmd.exe', ['/c', executable].concat(args), options)

if (process.platform == 'win32')
    exports.spawn = windows spawn
else
    exports.spawn = spawn
