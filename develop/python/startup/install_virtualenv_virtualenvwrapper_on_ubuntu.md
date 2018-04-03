`virtualenv`是开发Python的抽象，即创建一个存储私有的pytyon,pip,以及其他Python包的目录。通过使用virtual环境，可以使用Python的不同版本以及Python软件包。`virtualenv`可以在系统中建立多个不同并且相互不干扰的虚拟环境。此外，在 `virtualenv` 的虚拟环境中使用 `pip` 安装依赖可以绕过对系统目录权限的限制，构建自己的运行环境。

不过，`virtualenv` 的一个最大的缺点就是，每次开启虚拟环境之前要去虚拟环境所在目录下的 `bin` 目录下 `source` 一下` activate`，这就需要我们记住每个虚拟环境所在的目录。一种可行的解决方案是，将所有的虚拟环境目录全都集中起来，比如放到 `~/virtualenvs/``，并对不同的虚拟环境使用不同的目录来管理。virtualenvwrapper` 正是这样做的。并且，它还省去了每次开启虚拟环境时候的 `source` 操作，使得虚拟环境更加好用。

# 安装

```
sudo apt-get install python-pip python-dev build-essential

sudo pip install virtualenv virtualenvwrapper

sudo pip install --upgrade pip
```

* 在`~/.bashrc`中设置`virtualenvwrapper`

```
# Create a backup of your .bashrc file
cp ~/.bashrc ~/.bashrc-org

# Be careful with this command
printf '\n%s\n%s\n%s' '# virtualenv' 'export WORKON_HOME=~/virtualenvs' \
'source /usr/local/bin/virtualenvwrapper.sh' >> ~/.bashrc
```

* 激活或者退出方法：

```
source ~/.bashrc
```

此时会提示`virtualenvwrapper.user_scripts`创建了对应文件

```
virtualenvwrapper.user_scripts creating /home/huatai/virtualenvs/premkproject
...
virtualenvwrapper.user_scripts creating /home/huatai/virtualenvs/get_env_details
```

创建虚拟环境，例如，这里创建虚拟机环境`api`

```
mkvirtualenv api
```

此时会提示在`virtualenvs`虚拟环境中创建对应项目的虚拟目录

```
New python executable in /home/huatai/virtualenvs/api/bin/python
Installing setuptools, pip, wheel...done.
virtualenvwrapper.user_scripts creating /home/huatai/virtualenvs/api/bin/predeactivate
...
```

退出虚拟环境则使用如下命令

```bash
# Exit the 'api' virtual environment
deactivate
```

如果再次激活`api`虚拟环境，则运行如下命令：

```
workon api
```

* 如果需要删除`api`虚拟环境，则使用：

```
rmvirtualenv api
```

# 在脚本中使用virtualenvwrapper

在脚本中可以使用`virtualenvwrapper`构建Python运行环境，运行Python脚本：

```bash
#!/bin/bash

source /etc/profile
source /home/huatai/.bashrc

/home/huatai/bin/daily_task.py XXXX
```

同时可以设置`crontab`定时运行

```cron
0 9 * * * sh /home/huatai/bin/run_daily_task.sh
```

# 参考

* [Install virtualenv and virtualenvwrapper on Ubuntu](http://exponential.io/blog/2015/02/10/install-virtualenv-and-virtualenvwrapper-on-ubuntu/)
* [Python Environment for Ubuntu: Part 1](http://web.archive.org/web/20160403233119/http://conjurecode.com/python-environment-for-ubuntu-part-1/)
* [聊聊 virtualenv 和 virtualenvwrapper 实践](https://segmentfault.com/a/1190000004079979)