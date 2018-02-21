`virtualenv`是开发Python的抽象，即创建一个存储私有的pytyon,pip,以及其他Python包的目录。通过使用virtual环境，可以使用Python的不同版本以及Python软件包。

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

# 参考

* [Install virtualenv and virtualenvwrapper on Ubuntu](http://exponential.io/blog/2015/02/10/install-virtualenv-and-virtualenvwrapper-on-ubuntu/)
* [Python Environment for Ubuntu: Part 1](http://web.archive.org/web/20160403233119/http://conjurecode.com/python-environment-for-ubuntu-part-1/)