在最近的一次迁移Docker容器中，意外发现[Docker容器迁移后uWSGI运行报错"ImportError: No module named datetime"](../../../service/nginx/uwsgi_django_no_module_named_datetime)。参考了网上的一些解决方法，似乎大多是升级操作系统导致的virtualenv破坏，需要重建。

虽然我也很怀疑，毕竟Docker容器号称是完全无感知的轻量级虚拟机，迁移环境前后应该完全一致才对（虽然内核会有区别）。但是实在解决不了，只好尝试重建一次Python virtualenv环境。

* 重新创建虚拟环境

```
mv ~/venv2 ~/venv2.bak

virtualenv venv2
source venv2/bin/activate
```

* 将项目中所有使用的模块导出到`requirements.txt`中然后安装这些模块

```bash
source venv2/bin/activate
cd my_project   # 进入项目目录
pip freeze > requirements.txt
```

然后重新安装需要的依赖

```
pip install -r requirements.txt
```

# 参考

* [Rebuilding a Virtualenv](https://help.pythonanywhere.com/pages/RebuildingVirtualenvs/)