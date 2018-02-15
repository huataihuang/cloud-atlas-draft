在Python程序中，如果需要访问数据库等系统，需要使用账号和密码。将密码硬编码到程序中是非常危险的，解决的简便方法是采用环境变量。即把密码设置在操作系统的环境变量文件中，然后让Python程序运行时能够获得环境变量中的账号信息。

举例，在`Django`中，需要在`settings.py`中设置访问MySQL数据库账号信息，则设置：

```python
DATABASES = {
    'default': {
        'ENGINE': os.getenv('MYAPP_DB_ENGINE'),
        'NAME': os.getenv('MYAPP_DB_NAME'),
        'USER': os.getenv('MYAPP_DB_USER'),
        'PASSWORD': os.getenv('MYAPP_DB_PASSWORD'),
        'HOST': os.getenv('MYAPP_DB_HOST'),
        'PORT': os.getenv('MYAPP_DB_PORT'),
    }
}
```

然后配置`~/.bash_profle`中：

```bash
MYAPP_DB_ENGINE=django.db.backends.mysql
MYAPP_DB_NAME=myappdb
MYAPP_DB_USER=myapp
MYAPP_DB_PASSWORD="MYPASSWORD"
MYAPP_DB_HOST=127.0.0.1
MYAPP_DB_PORT=3306
```

这样只需要登陆系统中，加载了环境变量，就可以正常运行Django Python程序，因为所有的数据库配置信息都从环境变量中获得。

# 参考

* [Working with Environment Variables in Python](https://godjango.com/blog/working-with-environment-variables-in-python/)