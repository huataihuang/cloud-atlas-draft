AWS的EC2实例不提供密码登陆方法（存在安全隐患），而是采用创建虚拟机时候提供密钥，强制用户采用ssh密钥登陆方式。

在创建实例时候，提示生成一个密钥，密钥文件名为`aws.pem`，同时AWS为每个创建的实例的公网IP地址提供了一个域名解析，可以将自动生成的主机名解析成IP地址。所以，用户在登陆和适用时，不要使用IP登陆（动态IP有可能会改变），而是采用AWS提供的虚拟机主机名登陆。

> AWS提供的域名解析在Instance管理界面可以看到，类似 `xx-yy-zz-abc.us-west-1.compute.amazonaws.com`

针对不同的镜像，EC2默认有不同的登陆账号（比较合理的是，如果你采用非允许的登陆账号登陆，ssh服务器断开连接前会给予提示）：

* “ec2-user” (Amazon Linux, Red Hat Linux, SUSE Linux)
* “root” (Red Hat Linux, SUSE Linux)
* “ubuntu” (Ubuntu Linux distribution)
* “fedora” (Fedora Linux distribution)

将创建实例时下载的`aws.pem`存放到本地目录，例如`~/.ssh`目录，然后设置正确的文件权限：

```
chmod 400 ~/.ssh/aws.pem
```

> ssh的安全策略会拒绝使用文件权限错误的密钥文件，对于ssh私钥，强制要求文件权限属性`600`，即只能被所有者读写。

使用如下命令登陆：

```
ssh -i "aws.pem" ec2-user@xx-yy-zz-abc.us-west-1.compute.amazonaws.com
```

> 注意：这个`aws.pem`只有一次下载机会，Amazon不保存你的私钥，所以如果遗失，就是只能通过WEB登陆账号，删除掉旧的key pair，然后重新生成一个。

如果要方便登陆，可以配置`~/.ssh/config`配置文件添加如下：

```
Host aws
    HostName xx-yy-zz-abc.us-west-1.compute.amazonaws.com
    User ec2-user
    IdentityFile ~/.ssh/aws.pem
```

这样就可以简化登陆命令，只要执行`ssh aws`就可以了。

# 参考

* [How to SSH to EC2 Instance on AWS (for Beginners)](https://99robots.com/how-to-ssh-to-ec2-instance-on-aws/)
* [SSH Config Files](https://michaelheap.com/ssh-config-files/)