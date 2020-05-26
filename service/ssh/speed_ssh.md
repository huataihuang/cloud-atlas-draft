# 关闭DNS反向解析

在使用ssh远程登陆服务器时候，经常会遇到ssh登陆缓慢问题，通常原因如下:

* ssh服务器默认启用了DNS反向解析，对ssh client的IP反向解析无法完成，需要DNS反向解析超时后才能继续。
* CentOS ssh客户端默认启用了`GSSAPIAuthentication`，这个安全认证选项是结合Kerberos使用的，如果没有配置Kerberos会导致登陆缓慢

通过 `ssh -vvv` 可以看到完整的ssh登陆过程，例如，如果启用了`GSSAPIAuthentication`，会看到：

```
debug1: Authentications that can continue: publickey,gssapi-keyex,gssapi-with-mic,password
debug3: start over, passed a different list publickey,gssapi-keyex,gssapi-with-mic,password
debug3: preferred gssapi-with-mic,publickey,keyboard-interactive,password
debug3: authmethod_lookup gssapi-with-mic
debug3: remaining preferred: publickey,keyboard-interactive,password
debug3: authmethod_is_enabled gssapi-with-mic
debug1: Next authentication method: gssapi-with-mic
debug3: Trying to reverse map address 172.16.3.34.
debug1: Unspecified GSS failure.  Minor code may provide more information
Unknown code krb5 195
```

实际上，对于很多环境，如果没有使用公钥认证登陆，而是使用密码认证，则在密码认证之前，默认会尝试`GSSAPIAuthentication`。此时会浪费掉数十秒时间，导致ssh执行脚本效率降低。

解决方法：

```
ssh -o GSSAPIAuthentication=no 172.16.3.34
```

也可以将将这配置写入到 `/etc/ssh/ssh_config` 中：

```
GSSAPIAuthentication no
```

则后续采用密码认证就非常快速。

# 跳过密码错误的节点

我经常使用 for 循环来执行一些命令，例如一些环境不能使用pssh。但是有一个问题，就是遇到某些服务器无法直接登陆，会提示密码输入。而我需要忽略这个错误继续执行循环，反复敲击回车实在太垃圾了。

参考 [How do I make ssh fail rather than prompt for a password if the public-key authentication fails?](https://serverfault.com/questions/61915/how-do-i-make-ssh-fail-rather-than-prompt-for-a-password-if-the-public-key-authe) 有一个解决方法，就是使用BatchMode，这个方式会忽略掉需要密码输入的ssh登陆。

```
ssh -oBatchMode=yes -l <user> <host> <dostuff>
```

另外通常还可以在客户端关闭掉密码认证，即配置 `~/.ssh/config` 添加:

```
Host host1 host2 host3...
    PasswordAuthentication no
```

这样就会忽略密码认证节点

# 参考

* [Slow SSH Client and Quick Hack](http://www.doublecloud.org/2013/06/slow-ssh-client-and-quick-hack/)
* [SSH客户端(如PuTTY)ssh远程登录Linux非常慢的解决方法](http://blog.useasp.net/archive/2014/05/19/solved-the-problem-of-ssh-client-such-as-putty-remote-login-linux-very-slowly.aspx)