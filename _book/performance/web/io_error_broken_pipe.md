`IO error: Broken Pipe`的错误日志经常会在服务器日志中看到，如java服务，TFS服务。

这个错误意味着客户端在等待了一定时间后，主动关闭了和服务器之间的socket连接。此时服务器不知道客户端断开，依然在持续从数据源获取数据。然后服务器在尝试通过前期创建的socket连接发送数据客户端的时候，才知道客户端已经关闭了连接。这样就会在服务器日志中看到`IO error:Broken pipe`错误。

# 参考

* ["IO error: Broken Pipe" what does this mean?](https://www.quora.com/IO-error-Broken-Pipe-what-does-this-mean)
* [How can I fix a Broken Pipe error?](http://superuser.com/questions/554855/how-can-i-fix-a-broken-pipe-error)
* [What makes a Unix process die with Broken pipe?](http://unix.stackexchange.com/questions/84813/what-makes-a-unix-process-die-with-broken-pipe) - 这个文档提供了详细的实验方法