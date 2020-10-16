在维护线上服务器的时候，经常会发现如果不在终端界面操作，很快就会出现:

```
timed out waiting for input: auto-logout
Shared connection to xx.xx.xx.xx closed.
```

这是因为操作系统环境变量中有一个参数 `TMOUT` 默认设置的值比较段，如果这个环境变量设置180，则你的登录会话就会180秒超时，自动退出。

- 检查方法，在服务器上执行:

```bash
echo $TMOUT
```

输出值可能是:

```
180
```

- 可以通过调整这个环境变量使得超时时间延长(例如，设置成30分钟):

```bash
export TMOUT=1800
```

- 另外，如果这环境变量设置为空，则关闭自动超时功能:

```bash
export TMOUT=
```

- 该环境变量可以在 `/etc/profile` 中配置，这样可以全局生效，也可以在个人目录下配置 `.profile`

# 参考

- [Changing the Auto logout Timeout in SSH](https://www.linvirtshell.com/2017/11/changing-auto-logout-timeout-in-ssh.html)
