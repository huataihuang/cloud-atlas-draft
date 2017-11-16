> 对一个后端开发和运维人员而言，前端各种眼花缭乱的技术难免有些无从下手。如果自己手工写html和css，也很难作出美观的页面。那么，让擅长的人做擅长的事吧，我们专心作底层技术。

从 https://www.quackit.com/html/templates/ 可以下载到基于Bootstrap的模板，可以快速展开项目开发：

![django Portal模板](django_portal_template1.png)

下载模板 - 这里选择 Portal 1a (最上方菜单导航栏固定似乎比较容易转跳)

> 这里案例的项目名称是`dashboard`（控制台）

```
python manage.py startapp dashboard
```

修改项目目录`settings.py`添加

```
INSTALLED_APPS = [
...
    'dashboard',
]

```

上述模板包解压缩以后将`portal-1a`目录中的内容移动存放到django项目的 `dashboard/templates` 目录下


# 参考

* []()