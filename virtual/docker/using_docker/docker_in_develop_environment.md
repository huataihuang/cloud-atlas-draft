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

以上Dockerfile使用Python 3的官方基础镜像，并在镜像基础之上安装 Flask ，然后复制代码金曲，并运行identidock代码。

> 许多流行的编程语言，例如 Python、Go 和 Ruby，它们的官方仓库中都有多个变种镜像以供不同用途：
>
> * slim - 这种镜像是标准镜像的精简版本。它们缺少很多常见的软件包和库。适合在生产环境部署，但是不适合开发环境（缺少标准镜像中的工具软件包等）
> * onbuild - 这种镜像使用 Dockerfile 的 ONBUILD 指令，它会把某些命令延后至继承这个 onbuild 镜像的“子镜像”中执行，而执行的时刻便是新建这个子镜像的时候。

* 构建运行

```
cd identidock
docker build -t identidock .
```