虽然python 2已经停止升级，但是依然有少量程序，例如 [pssh](../../shell/utilities/pssh) 运行在Python 2环境，所以我还是设置了macOS的python 2的virtualenv环境来运行。

* 安装pip

```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# 使用python 2来安装pip，注意需要切换到root身份以便能够安装到系统目录
sudo su -
python2.7 get-pip.py

# 然后安装virtualenv工具
pip2 install virtualenv
```

* 创建Python virtualenv环境

```bash
cd ~
virtualenv -p /usr/bin/python2.7 venv2
. venv2/bin/activate
```

* 现在我们可以安装pssh了

```
pip install pssh
```

* 安装完成后，我们来试试这个工具 - `hosts` 文件中包含了我需要批量处理的主机IP地址列表

```
pssh -l huatai -A -ih hosts uptime
```

Cool!

# 参考

- [Installing and using virtualenv with Python 2](https://help.dreamhost.com/hc/en-us/articles/215489338-Installing-and-using-virtualenv-with-Python-2)