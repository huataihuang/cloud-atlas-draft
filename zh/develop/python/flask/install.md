# 安装virtualenv和pip

参考[pip安装](../startup/pip.md)完成初始的virtualenv环境设置，然后通过`pip`安装flask

```bash
pip install flask
```

在Debian环境通过`pip`安装`flask`需要编译一些依赖软件包，即需要事先安装对应的`dev`开发包才能编译：

```bash
sudo apt-get install python-dev
sudo apt-get install python3-dev
```

也可以直接使用系统包安装(分两种针对Python2和Python3的包)

```bash
sudo apt-get install python-flask
```

```bash
sudo apt-get install python3-flask
```

安装完`flask`之后，通过在Python解释器中使用`import flask`导入，如果没有报错则表明安装成功

# 参考

* [How To Deploy a Flask Application on an Ubuntu VPS](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-flask-application-on-an-ubuntu-vps)
* [Creating your first Linux App with Python 3 and Flask](http://techarena51.com/index.php/how-to-install-python-3-and-flask-on-linux/)