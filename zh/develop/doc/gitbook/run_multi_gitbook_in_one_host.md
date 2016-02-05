# 多端口服务

参考 [How to change default listening port when use gitbook to serve a site?](https://github.com/GitbookIO/gitbook/issues/622)

    gitbook --port 3000 serve

但是，这个方法启动第二个服务时（例如指定端口 `--port 3001` ）依然会遇到报错

    ... Uhoh. Got error listen EADDRINUSE :::35729 ...
    Error: listen EADDRINUSE :::35729
        at Object.exports._errnoException (util.js:874:11)
        at exports._exceptionWithHostPort (util.js:897:20)
        at Server._listen2 (net.js:1234:14)
        at listen (net.js:1270:10)
        at Server.listen (net.js:1366:5)
        at Server.listen (/Users/huatai/.gitbook/versions/2.6.5/node_modules/tiny-lr/lib/server.js:164:15)
        at Promise.apply (/Users/huatai/.gitbook/versions/2.6.5/node_modules/q/q.js:1078:26)
        at Promise.promise.promiseDispatch (/Users/huatai/.gitbook/versions/2.6.5/node_modules/q/q.js:741:41)
        at /Users/huatai/.gitbook/versions/2.6.5/node_modules/q/q.js:1304:14
        at flush (/Users/huatai/.gitbook/versions/2.6.5/node_modules/q/q.js:108:17)
    
    You already have a server listening on 35729
    You should stop it and try again.

使用 `lsof | grep 35729` 可以看到

    tcp46      0      0  *.35729                *.*                    LISTEN

参考 [can not run multi gitbook server in one machine](https://github.com/GitbookIO/gitbook/issues/745) 原来 gitbook 还有一个 `lrport` 参数（动态重新加载服务端口），这个参数

    serve [book] Build then serve a gitbook from a directory
    --port Port for server to listen on (Default is 4000)
    --lrport Port for livereload server to listen on (Default is 35729)
    --watch Enable/disable file watcher (Default is true)
    --format Format to build to (Default is website; Values are website, json, ebook)
    --log Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)

所以第一个服务启动可以使用默认参数（`port 4000`和`lrport 35729`）

    gitbook serve

第二个服务启动应该使用

    gitbook --port 4001 --lrport 35730 serve

依次类推