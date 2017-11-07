Linux内核子系统的inotify可以用于监视文件系统的任何变化，Python [Watchdog](https://pypi.python.org/pypi/watchdog)模块则可以在Python上实现对inotify事件的处理，实现实时监控和动作触发。

> 注意：高负载和海量文件的生产环境的文件系统监控需要非常谨慎，目前的实践尚未看到有完善的解决方案，有待探索。例如GlusterFS有replication服务，但是以往实践证明系统负载极高且不能保证稳定同步。

# 参考

* [Using Python's Watchdog to monitor changes to a directory](https://www.michaelcho.me/article/using-pythons-watchdog-to-monitor-changes-to-a-directory)
* [Python Watchdog 0.8.2 documentation](https://pythonhosted.org/watchdog/)
* [python watchdog monitoring file for changes](https://stackoverflow.com/questions/18599339/python-watchdog-monitoring-file-for-changes)
* [How do I watch a file for changes?](https://stackoverflow.com/questions/182197/how-do-i-watch-a-file-for-changes)