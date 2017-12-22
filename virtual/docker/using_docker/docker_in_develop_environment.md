> 本文是一个简单的python容器部署工作流，按照「Docker开发指南」一书实践。
>
> 案例是采用Flask实现的一个简单web程序，仅用于展示Docker工作流程。

# 简单的Web服务代码

* 示例程序名字是`identidock`，创建程序目录

```
mkdir -p identidock/app
cd identidock/app
vi identidock.py
```

* 创建Web服务

按照以下目录结构

```
]$ tree identidock/
identidock/
└── app
    └── identidock.py
```

`identidock.py`代码内容如下

```python
from flask import Flask
app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello Docker!\n'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
```

* 在`identidock`目录下创建Dockerfile内容如下：

```dockerfile
From python:3.4

RUN pip install Flask==0.12.2
WORKDIR /app
COPY app /app

CMD ["python", "identidock.py"]
```

以上Dockerfile使用Python 3的官方基础镜像，并在镜像基础之上安装 Flask ，然后复制代码进去，并运行identidock代码。

> 许多流行的编程语言，例如 Python、Go 和 Ruby，它们的官方仓库中都有多个变种镜像以供不同用途：
>
> * slim - 这种镜像是标准镜像的精简版本。它们缺少很多常见的软件包和库。适合在生产环境部署，但是不适合开发环境（缺少标准镜像中的工具软件包等）
> * onbuild - 这种镜像使用 Dockerfile 的 ONBUILD 指令，它会把某些命令延后至继承这个 onbuild 镜像的“子镜像”中执行，而执行的时刻便是新建这个子镜像的时候。

* 构建运行

```
cd identidock
docker build -t identidock .
```

* 运行

```
docker run -d -p 5000:5000 identidock
```

> * `-d` 参数表示后台运行启动容器
>
> * `-p` 固定端口映射，如果使用`-p 5000`则会把容器内的5000端口动态随机映射到host上。通常我们用于在host上运行大量容器，则采用随机动态端口映射。
>
> 这里没有指定容器的名字(`--name`)，也没有指定容器内运行的主机名（`--hostname`），所以会随机生成一个容器名称

上述运行的容器对外5000端口是容器内flash的端口，可以直接通过浏览器访问 http://127.0.0.1:5000  （或者host主机的IP地址），或者用命令行检测：

```
$ curl localhost:5000
Hello Docker!
```

# uWSGI

> 由于容器提供了隔离，所以在部署Python服务时可以不使用virtualenv。不过，这种情况适用于真正采用了容器的轻量级部署（serverless）。如果还是部署以前的完整操作系统，则会抵消掉容器的灵活性和轻量级特性，此时再使用virtualenv隔离应用也可作为补充。
>
> 但是，依然建议真正使用容器来做隔离，抛弃以往既定的服务器部署思维。

[uWSGI](https://uwsgi-docs.readthedocs.org/en/latest/) 是一个可以用于生产环境的应用服务器，并且可以部署在Web服务器如Nginx后端。

> 请参考以下关于uWSGI部署方法：
> 
> * [设置Django和Nginx uWSGI](../../../service/nginx/setup_django_with_uwsgi_nginx)
> * [设置Django和Nginx uWSGI的多站点](../../../service/nginx/setup_multi_site_django_with_uwsgi_nginx)

改进Dockerfile，引入uWSGI:

```dockerfile
From python:3.4

RUN pip install Flask==0.12.2 uWSGI==2.0.8
WORKDIR /app
COPY app /app

CMD ["uwsgi", "--http", "0.0.0.0:9090", "--wsgi-file", "/app/identidock.py", \
"--callable", "app", "--stats", "0.0.0.0:9191"]
```

> * 添加uWSGI
> * 运行uWSGI监听9090端口的http服务，并从`/app/identidock.py`运行app应用
> * 在9191启动一个数据统计服务

* 构建容器镜像

```
docker build -t identidock .
```

> 注意：这里再次使用了同名的`identidock`作为构建容器镜像的名字。那么docker会如何处理重名的镜像呢？是报错么？
>
> 不是，docker构建了新的同名镜像，并且把老的镜像改名成`<none>`

```
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
identidock          latest              b70ba6cb3422        7 seconds ago       698 MB
<none>              <none>              924f1a3c4b36        7 weeks ago         696 MB
```

* 启动容器

```
docker run -d -p 9090:9090 -p 9191:9191 identidock
```

* 同样测试

```
$ curl localhost:9090
Hello Docker!
```

使用`curl localhost:9191`可以看到统计信息

> 注意：上述docker容器中运行uWSGI是使用root身份运行的，这是一个安全漏洞。需要在Dockerfile中指定运行服务的用户身份：

```dockerfile
From python:3.4

# 添加用户账号
RUN groupadd -r uwsgi && useradd -r -g uwsgi uwsgi

RUN pip install Flask==0.12.2 uWSGI==2.0.8
WORKDIR /app
COPY app /app

# 输出端口
EXPOSE 9090 9191
# 切换后续命令的运行者身份，可多次使用USER指令，每次切换代表后续命令的运行者身份
USER uwsgi

CMD ["uwsgi", "--http", "0.0.0.0:9090", "--wsgi-file", "/app/identidock.py", \
"--callable", "app", "--stats", "0.0.0.0:9191"]
```

> **`注意`** 在任何Dockerfile中都要注意配置正确的`USER`设置以便能够以正确的身份运行服务！！！

在`docker run`指令中加上`-P`参数，则不绑定主机端口，会随机选择高端口，并自动将它们映射到容器每个声明的`EXPOSE`端口。不过，此时要访问容器服务前，先要检查容器随机选择的输出端口：

```
docker port port-test
```

# 测试环境和生产环境的切换

为了能够适用于开发环境和生产环境，可以采用脚本来判断环境变量来采用不同的启动命令：

```bash
#!/bin/bash
set -e

if [ "$ENV" = 'DEV' ]; then
  echo "Running Development Server"
  exec python "identidock.py"
else
  echo "Running Production Server"
  exec uwsgi --http 0.0.0.0:9090 --wsgi-file /app/identidock.py \
             --callable app --stats 0.0.0.0:9191
fi
```

将上述脚本保存成`cmd.sh`就可以修改Dockerfile如下

```dockerfile
FROM python:3.4

RUN groupadd -r uwsgi && useradd -r -g uwsgi uwsgi
RUN pip install Flask==0.10.1 uWSGI==2.0.8
WORKDIR /app
COPY app /app
COPY cmd.sh /

EXPOSE 9090 9191
USER uwsgi

CMD ["/cmd.sh"]
```

然后执行如下命令启动容器

```bash
chmod +x cmd.sh
docker build -t identidock .

docker run -e "ENV=DEV" -p 5000:5000 identidock
```