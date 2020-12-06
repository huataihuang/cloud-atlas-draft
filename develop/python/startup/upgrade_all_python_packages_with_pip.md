pip没有内建一条直接更新所有软件包的命令，因为pip建议你在每个项目上创建一个 virtualenv 来运行。为了能够在项目上使用最新的软件包，可以考虑升级软件包，并在 `requirements.txt` 文件中记录所有需要的软件包。

**绝对不要使用 ``sudo pip install`` 命令，也就是不要使用root身份安装Python软件包**

* 全部升级系统或virtual环境的Python软件包

```bash
/Users/huatai/venv3/bin/python -m pip install --upgrade pip
pip list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1  | xargs -n1 pip install -U
```

> `pip list --outdated` 命令可以累出所有不是最新的软件包

* pip也可以将安装包的列表输出到一个requirements文件 `requirements.txt`

```bash
pip freeze > requirements.txt
```

* 然后可以安装升级

```bash
pip install -r requirements.txt --upgrade
```


# 参考

* [How to upgrade all Python packages with pip](https://stackoverflow.com/questions/2720014/how-to-upgrade-all-python-packages-with-pip)
* [How To Update All Python Packages](https://www.activestate.com/resources/quick-reads/how-to-update-all-python-packages/)