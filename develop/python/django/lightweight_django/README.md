> 本章节是学习[轻量级Django](https://www.amazon.cn/dp/B01M4S72G0/ref=sr_1_1?s=books&ie=UTF8&qid=1514985216&sr=1-1)的笔记

# 环境准备

开发环境是Fedora 27，安装最新的Python 3.x，然后采用以下方法构建virtualenv:

```
sudo dnf install python3-virtualenv
virtualenv-3 venv3

source venv3/bin/activate
pip install django
```

原书代码样本： https://github.com/lightweightdjango/examples