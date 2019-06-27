[sudo](https://en.wikipedia.org/wiki/Sudo)是Linux/Unix系统上非常常用的命令：通常我们日常工作会采用一个普通账号，例如，个人账号`huatai`或者标记为管理员的`admin`账号，而仅在需要超级权限的时候切换到`root`身份执行命令。这样可以降低重大误操作的概率。

`sudo`可以切换到指定用户身份进行一些操作，以下是一些常用案例，不断积累汇总：

# 账号管理配置文件`/etc/sudoers`

`/etc/sudoers`对普通用户不可读取（系统默认设置文件权限是`440`），其中包含了不同账号切换的配置，即可以用密码认证后切换，也可以设置无需密码切换。该配置文件有很详细的注释，通常我们需要设置的场景在这个配置文件中都有案例和说明。

# 以另一个用户身份及其环境执行shell脚本

shell脚本的执行和用户环境有密切关联，所以切换到另外一个用户的账号执行shell，不仅要切换权限，而且要切换执行环境：

* `-H` - `-H`表示`HOME`，这个选项和策略相关，有可能是默认特性，表示使用米标账号的HOME环境。
* `-u user` - 这个`-u`表示`user`，则以指定用户账号来运行脚本，通常用用户名作为参数，也可以使用`uid`。在使用`uid`时候，很多shell要求在`uid`之前加上`#`以及转义符`\`。

```
sudo -u \#501 ls -lh /home/huatai/
```

> 上例是`admin`用户临时使用`huatai`用户（`uid=501`）身份查看其HOME目录内容。

# sudo的密码参数

对于sudo执行时需要密码的情况，如果需要在脚本命令中执行，显然无法手工输入密码。此时需要采用

```
echo <password> | sudo -S <command>
```

例如

```
./configure && make && echo <password> | sudo -S make install && halt
```

# 参考

* [Run a shell script as another user that has no password](https://askubuntu.com/questions/294736/run-a-shell-script-as-another-user-that-has-no-password)
* [sudo with password in one command line?](https://superuser.com/questions/67765/sudo-with-password-in-one-command-line)