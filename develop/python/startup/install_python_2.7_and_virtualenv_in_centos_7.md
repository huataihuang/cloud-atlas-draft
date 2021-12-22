
# 通过Yum安装（EPEL源）


```
yum -y update
yum -y install python-pip
```

# 通过pip脚本安装

* 安装升级pip - 这个方法是通用安装pip方法，适合所有python环境

> 参考 [PyPA » pip 20.1.1 documentation » Installation](https://pip.pypa.io/en/stable/installing/)

> 注意：如果系统没有setuptools和wheel，则get-pip.py会自动安装

```bash
# First get the script:
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# Then execute it using Python 2.7 and/or Python 3.6:
python2.7 get-pip.py
#python3.6 get-pip.py

# With pip installed you can now do things like this:
pip2.7 install [packagename]
pip2.7 install --upgrade [packagename]
pip2.7 uninstall [packagename]
```

如果系统过于陈旧，可能存在ssl证书报错：

```bash
Could not fetch URL https://pypi.org/simple/pip/: There was a problem confirming the ssl certificate: HTT
PSConnectionPool(host='pypi.org', port=443): Max retries exceeded with url: /simple/pip/ (Caused by SSLEr
ror(CertificateError("hostname 'pypi.org' doesn't match either of 'www.python.org', '*.python.org', 'docs
.python.org', 'downloads.python.org', 'pypi.python.org'",),)) - skipping
```

解决方法参考 [Pip: Could not fetch URL for pypi and issue confirming the ssl certificate](https://stackoverflow.com/questions/42979298/pip-could-not-fetch-url-for-pypi-and-issue-confirming-the-ssl-certificate)

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

我在执行 `virtualenv venv2` 时候遇到一个报错

```bash
Traceback (most recent call last):
  File "/bin/virtualenv", line 7, in <module>
    from virtualenv.__main__ import run_with_catch
  File "/usr/lib/python2.7/site-packages/virtualenv/__init__.py", line 3, in <module>
    from .run import cli_run, session_via_cli
  File "/usr/lib/python2.7/site-packages/virtualenv/run/__init__.py", line 7, in <module>
    from ..app_data import make_app_data
  File "/usr/lib/python2.7/site-packages/virtualenv/app_data/__init__.py", line 9, in <module>
    from platformdirs import user_data_dir
ImportError: No module named platformdirs
```

这个报错原因是因为系统太陈旧，pip版本甚至无法升级

···
You are using pip version 7.1.0, however version 21.3.1 is available.
You should consider upgrading via the 'pip install --upgrade pip' command.
Collecting pip
  Using cached https://files.pythonhosted.org/packages/da/f6/c83229dcc3635cdeb51874184241a9508ada15d8baa3
37a41093fab58011/pip-21.3.1.tar.gz
    Complete output from command python setup.py egg_info:
    Traceback (most recent call last):
      File "<string>", line 20, in <module>
      File "/tmp/pip-build-wfciDf/pip/setup.py", line 7
        def read(rel_path: str) -> str:
                         ^
    SyntaxError: invalid syntax
    
    ----------------------------------------
Command "python setup.py egg_info" failed with error code 1 in /tmp/pip-build-wfciDf/pip
```

所以改为手工升级

```bash
curl https://bootstrap.pypa.io/pip/2.7/get-pip.py -o get-pip.py
python get-pip.py
```


# 参考

* [How to Install Pip on CentOS 7](https://www.liquidweb.com/kb/how-to-install-pip-on-centos-7/)