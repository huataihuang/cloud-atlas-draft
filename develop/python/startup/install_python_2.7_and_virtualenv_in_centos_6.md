> 最近有遇到一个古老的CentOS 6环境安装Python 2.7并且部署virtualenv的需求，稍微整理一下笔记

维护老系统，需要升级python 2.7已更好支持pssh运行。系统python版本2.6，比较古老，但是不能直接升级，所以采用在个人HOME目录独立编译安装python 2.7，然后构建virtualenv环境运行应用。

* 编译python

```bash
PREFIX=/home/admin/huatai

wget https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tgz
tar xfz Python-2.7.18.tgz
cd Python-2.7.18/
./configure --prefix=$PREFIX
make
make install
```

* 设置环境变量

```bash
echo "export PATH=$HOME/huatai/bin:$PATH" >> $PREFIX/profile
. $PREFIX/profile
```

* 安装virtualenv

```bash
pip2 install virtualenv
```

* 创建Python virtualenv环境

```bash
cd /home/admin/huatai.huang
virtualenv -p /home/admin/huatai.huang/bin/python2.7 venv2
. venv2/bin/activate
```

* 安装pssh

```bash
pip install pssh
```

现在就可以顺利使用升级后的Python 2.7以及通过virtualenv工作。