> 当在公司和个人开发不同项目，使用针对不同git服务器使用不同的git账号提交。例如：工作时可能使用公司的内部git仓库，个人业余开发可能使用github。

# 使用ssh客户端配置

> 注意：即使用户(`git`)和主机相同，依然可以在`~/.ssh/config`中区分开账号

```
Host gitolite-as-alice
  HostName git.company.com
  User git
  IdentityFile /home/whoever/.ssh/id_rsa.alice
  IdentitiesOnly yes

Host gitolite-as-bob
  HostName git.company.com
  User git
  IdentityFile /home/whoever/.ssh/id_dsa.bob
  IdentitiesOnly yes
```

然后使用`gitolite-as-alice`和`gitolite-as-bob`来代替URL中的主机名：

```
git remote add alice git@gitolite-as-alice:whatever.git
git remote add bob git@gitolite-as-bob:whatever.git
```

> 注意：这里包含了`IdentitiesOnly yes`来避免使用默认的id，否则如果有匹配默认名字的id文件，git会首先尝试而不是使用`IdentityFile`现象添加的标识来尝试。参考 https://serverfault.com/questions/450796/how-could-i-stop-ssh-offering-a-wrong-key/450807#450807

# 使用`ssh-agent`命令加载key

如果不使用 ssh config 方式，也可以使用`ssh-agent`命令来加载key：

```
ssh-agent bash -c 'ssh-add /somewhere/yourkey; git clone git@github.com:user/project.git'
```

如果希望使用subshell，则可以使用：

```
ssh-agent $(ssh-add /somewhere/yourkey; git clone git@github.com:user/project.git)
```

# 参考

* [Specify an SSH key for git push for a given domain](https://stackoverflow.com/questions/7927750/specify-an-ssh-key-for-git-push-for-a-given-domain)
* [Specify private SSH-key to use when executing shell command with or without Ruby?](https://stackoverflow.com/questions/4565700/specify-private-ssh-key-to-use-when-executing-shell-command-with-or-without-ruby)