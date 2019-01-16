# 安装python3

* 可以通过[Homebrew](http://brew.sh/)安装

```
xcode-select --install
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo "export PATH=/usr/local/bin:$PATH" >> ~/.bash_profile
```

```
brew install python3
```

* 或者直接通过[Python官方网站](https://www.python.org)下载安装 `macOS 64-bit installer`

> 官方Python 3安装会在用户目录`~/.bash_profile`添加：

```
PATH="/Library/Frameworks/Python.framework/Versions/3.7/bin:${PATH}"
export PATH
```

所以，默认就可以找到 `python3`。注意，这个解析器也要在[VS Code](../../mac/vscode)中设置

# 安装virtualenv

```
pip3 install virtualenv
```

> 可能需要翻墙才能安装

并且可能提示升级pip版本

```
pip3 install --upgrade pip
```

```
$ pip --version
pip 18.1 from /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages/pip (python 3.7)
```

```
$ python3 --version
Python 3.7.0

$ which python3
/Library/Frameworks/Python.framework/Versions/3.7/bin/python3
```

# 参考

* [Install Python 3 on Mac OS X and use virtualenv and virtualenvwrapper](http://www.marinamele.com/2014/07/install-python3-on-mac-os-x-and-use-virtualenv-and-virtualenvwrapper.html)
* [Python3 Virtualenv Setup](https://gist.github.com/pandafulmanda/730a9355e088a9970b18275cb9eadef3)