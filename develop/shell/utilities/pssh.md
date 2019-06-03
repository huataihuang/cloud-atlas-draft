在维护集群时，常常需要在大量服务器上执行相同的命令，虽然可以自己写循环执行脚本，但是不仅麻烦而且执行效率不高。此时我们通常会使用pssh工具来并发执行SSH指令。

# 安装pssh

## Ubuntu安装pssh

在Ubuntu上， `pssh` 包安装之后，直接执行 `pssh` 命令会提示无法找到指令。实际上Ubuntu安装 `pssh` 软件包后实际的执行程序是采用了 `parallel-` 开头的命令，例如 `parallel-ssh` 和 `parallel-scp` 等。所以，为了方便使用，可以建立软链接:

```
cd /usr/bin
sudo ln -s parallel-ssh pssh
sudo ln -s parallel-scp pscp
sudo ln -s parallel-rsync prsync
sudo ln -s parallel-nuke pnuke
sudo ln -s parallel-slurp pslurp
```

> 以下在Ubuntu上实践都直接使用 `pssh` 和 `pscp` 等命令，如果你在Ubuntu上看不到这个指令（并且已经安装好 `pssh` 软件包)，可以尝试先通过软链接修正。

## 通过pip安装

pssh实际上是一个python程序，所以可以通过 Python pip方式安装

```
# 如果是RHEL/CentOS则使用以下yum安装命令
yum install python-pip
# 如果是Debian/Ubuntu则使用以下apt安装命令
apt install python-pip

# 通过pip安装pssh
pip install pssh
```

# 命令说明

| 命令 | 说明 |
| ---- | ---- |
| pssh | 并行在多个远程主机上执行ssh命令 |
| pscp | 并行从多个主机上复制文件 |
| prsync | 并行从多个主机使用rsync同步文件 |
| pnuke | 并行在多个主机上杀死进程 |
| pslurp | 并行在多个主机上复制文件到一个中心主机上 |

# 使用pssh指令

* 首先创建一个hosts文件，名字可以按需设置，例如，我要访问ceph集群，则创建 `ceph-hosts` 配置文件，内容如下

```
172.18.0.11
172.18.0.12
172.18.0.13
172.18.0.14
172.18.0.15
```

如果SSH端口不同，可以在主机ip后面加上端口号，例如 `172.18.0.11:2222` 表示该主机的SSH访问端口是 `2222`

* 常用参数

| 参数 | 说明 |
| ---- | ---- |
| -h | 主机名列表文件 |
| -l | 登陆用户名，例如 `-l root` |
| -A | 提供统一的登陆密码 |
| -i | 交互模式，远程服务器的命令执行结果会输出 |

举例：

```
pssh -ih ceph-hosts -l root -A "uptime"
```

# 使用ssh密钥登陆

对于使用SSH密钥的登陆方式，需要使用参数 `-x` 来使用扩展ssh参数指定密钥登陆，举例：

```
pssh  -i  -h list_of_hosts  \
-x "-oStrictHostKeyChecking=no  -i /home/xxx/.ssh/ec2.pem" 'uptime'
```

也可以在 `~/.ssh/config` 指定扩展参数，例如

```
Host *.eu-west-1.compute.amazonaws.com
    StrictHostKeyChecking no
    IdentityFile ~/.ssh/ec2.pem
```

> 不过，最好的方法还是采用 keychain 来解决密钥认证，实际上就不需要使用 `-x` 参数来扩展。

## 对于密码保护的密钥

对于密码保护的密钥，建议使用 keychain 来解决密码输入

```
sudo apt-get install keychain
keychain ~/.ssh/id_rsa
. ~/.keychain/$(uname -n)-sh
```

然后执行 pssh 指令就不再需要输入密钥保护密码了。

建议在 `~/.bashrc` 中添加以下内容，则每次终端登陆就只要输入一次密钥保护密码就可以

```
keychain --clear $HOME/.ssh/id_rsa
. $HOME/.keychain/$(uname -n)-sh
```

> 应该也可以使用 [SSH密钥认证：ssh-agent](../../../service/ssh/ssh_key) 来实现一次输入保护密码的密钥认证

# 参考

* [Pssh – Execute Commands on Multiple Remote Linux Servers Using Single Terminal](https://www.tecmint.com/execute-commands-on-multiple-linux-servers-using-pssh/)
* [parallel-ssh](http://manpages.ubuntu.com/manpages/precise/man1/parallel-ssh.1.html)
* [pssh-howto.md](https://gist.github.com/carlessanagustin/c5e70c8edfa8408547545e26b61ab783)
* [parallel-ssh with Passphrase Protected SSH Key](https://unix.stackexchange.com/questions/128974/parallel-ssh-with-passphrase-protected-ssh-key)