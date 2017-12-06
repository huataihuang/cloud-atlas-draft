
# 通过Yum安装（EPEL源）


```
yum -y update
yum -y install python-pip
```

# 通过pip脚本安装

* 安装升级pip

```bash
# First get the script:
wget https://bootstrap.pypa.io/get-pip.py

# Then execute it using Python 2.7 and/or Python 3.6:
python2.7 get-pip.py
#python3.6 get-pip.py

# With pip installed you can now do things like this:
pip2.7 install [packagename]
pip2.7 install --upgrade [packagename]
pip2.7 uninstall [packagename]
```

* 安装虚拟环境`virtualenv`

```bash
# Install virtualenv for Python 2.7 and create a sandbox called "venv2"
pip2.7 install virtualenv  # need root privilege
virtualenv venv2    # normal user's privilege

# Activate the venv2 sandbox:
source venv2/bin/activate
# Check the Python version in the sandbox (it should be Python 2.7.14):
python --version
# Deactivate the sandbox:
deactivate
```

# 参考

* [How to Install Pip on CentOS 7](https://www.liquidweb.com/kb/how-to-install-pip-on-centos-7/)