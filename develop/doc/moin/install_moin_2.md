moin2的建议下载方式是从moin2 github软件仓库clone

当前 [moinmoni 2.0 运行环境目前还是需要使用 python 2.7 系列](https://moinmo.in/Python3)，官方说明表示 moinmoin 当前重点是尽快使得 moin 2.0 稳定发布。计划在 moin 2.1 开始支持在 Python 3.x 上运行。

# 下载

```
git clone https://github.com/moinwiki/moin
```

将`moin`目录改名成你需要的项目名字（可选）。

```
mv moin my_works
```

# 准备Pyton 2.75 virtualenv 环境

* 在macOS平台，可以使用默认系统自带python 2.75，并使用其 `easy_install` 工具安装 pip

```
sudo easy_install pip
```

* 安装virtualenv

```
sudo pip2 install virtualenv
```

> 注意：如果使用Python官方提供的Python 3.x 安装包，则环境变量中Python 3.x的路径可能在Python 2.x之前，需要通过指定完整路径来运行Python 2.x的virtualenv指令。

```
cd ~
/usr/local/bin/virtualenv venv2
```

> 如果要激活virtualenv，则执行 `. venv2/bin/activate`。不过，运行moin需要这个命令。

# 安装

使用你自己的普通用户账号，在moin根目录执行以下命令，以便将所有依赖包安装到系统或者virtualenv环境

```
<python> quickinstall.py
```

```
<python> quickinstall.py <path-to-venv>
```

此时会下载所有依赖:

```
python2.7 quickinstall.py ~/venv2
```

安装完成后，就可以在项目目录下直接运行 `./m` 查看所有帮助命令。

# 初始化

* 以下命令将创建一个wiki实例并使用样例数据加载（可选）：

```
m sample   # in Windows
./m sample # in Unix
```

* 如果不想使用样例数据，可以创建一个新的空wiki：

```
m new-wiki   # in Windows
./m new-wiki # in Unix
```

如果要删除wiki，例如`sample`这个样例，则使用：

```
./m del-wiki sample
```

* 然后就可以运行了

```
m run      # in Windows
./m run    # in Unix
```

# 参考

* [MoinMoin Downloading and Installing](https://moin-20.readthedocs.io/en/latest/admin/install.html)