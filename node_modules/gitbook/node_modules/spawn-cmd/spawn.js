(function() {
    var self = this;
    var spawn, windowsSpawn;
    spawn = require("child_process").spawn;
    windowsSpawn = function(executable, args, options) {
        return spawn(process.env.comspec || "cmd.exe", [ "/c", executable ].concat(args), options);
    };
    if (process.platform === "win32") {
        exports.spawn = windowsSpawn;
    } else {
        exports.spawn = spawn;
    }
}).call(this);