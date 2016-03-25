# `Key has already been taken`

在使用`git clone`命令部署`gitlab`的托管项目文件时，需要首先在项目配置中添加`deploy key`，但是也可能会遇到下列报错

```
Key has already been taken
Fingerprint has already been taken
```

这个问题是因为gitlab中已经有其他项目使用了这个部署公钥，所以无法添加到当前项目。

# 多个ssh密钥对的思路

[Managing Multiple SSH Keys](http://www.robotgoblin.co.uk/blog/2012/07/24/managing-multiple-ssh-keys/)提供了一种解决思路，即如果需要对不同的git仓库使用不同的ssh key时候，可以先创建不同的密钥对：

```bash
mkdir ~/.ssh/fedoraproject
cd ~/.ssh/fedoraproject
ssh-keygen -f id_rsa
```

这样就可以在`~/.ssh/fedoraproject`目录下创建独立的`id_rsa`和`id_rsa.pub`密钥对。

然后配置类似如下

```bash
Host github.com
	User git
	Hostname github.com
	PreferredAuthentications publickey
	IdentityFile ~/.ssh/git/id_rsa
Host fedoraproject.org
	Hostname fedoraproject.org
	PreferredAuthentications publickey
	IdentityFile ~/.ssh/fedoraproject/id_rsa
Host fedorapeople.org
	Hostname fedorapeople.org
	PreferredAuthentications publickey
	IdentityFile ~/.ssh/fedoraproject/id_rsa
```

再使用 `git clone git@fedoraproject.org:example/example_repo.git` 就可以使用指定的密钥来完成。

# 结合`ssh-agent`来使用指定私钥

上述思路中使用了多个密钥对来针对不同域名区别使用密钥，在我们这个案例中，域名是不变的，单是我们也需要使用不同的私钥。

可以参考 [Specify private SSH-key to use when executing shell command with or without Ruby?](http://stackoverflow.com/questions/4565700/specify-private-ssh-key-to-use-when-executing-shell-command-with-or-without-ruby) 使用以下命令

```bash
ssh-agent bash -c 'ssh-add /home/christoffer/ssh_keys/theuser; git clone git@github.com:TheUser/TheProject.git'
```

> 此方法测试可用于`git 1.9`，上述方法解决了对特定项目使用指定密钥对的问题。

另一个建议方法测试没有成功：

```bash
ssh-agent $(ssh-add /home/christoffer/ssh_keys/theuser; git clone git@github.com:TheUser/TheProject.git)
```

# 使用git的`GIT_SSH_COMMAND`来使用指定私钥

参考[How to tell git which private key to use?](http://superuser.com/questions/232373/how-to-tell-git-which-private-key-to-use)，即从`git 2.3.0`开始可以指定环境变量

```bash
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa_example" git clone example
```

这里`-i`也可能被配置文件覆盖，所以可以给予SSH一个空白配置

> `GIT_SSH_COMMAND`环境变量对于低于`git 2.3.0`版本无效

```bash
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa_example -F /dev/null" git clone example
```
