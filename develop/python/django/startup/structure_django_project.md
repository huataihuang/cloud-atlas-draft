# Django目录结构的思考

> 从Ruby on Rails 以及 Django ，都是以rule来帮助完成编程的，约定俗成是非常重要的编程手段。

刚开始学习Django的时候，有一个问题就困扰我，该如何安排Django目录结构。

有两种主要的Django项目目录结构

```
project/
    manage.py
    project/
        app_a/
            models.py
            views.py 
            ...
        app_b/
            models.py
            views.py 
            ...
        settings.py
        wsgi.py
        urls.py
```

```
project/
    manage.py
    project/
        settings.py
        wsgi.py
        urls.py
    app_a/
        models.py
        views.py 
        ...
    app_b/
        models.py
        views.py 
        ...
```

> 目前从Django 1.4开始，推荐采用后者目录结构。主要是因为`app`可以复用到不同的project，所以独立出project目录。

此外，Reddit的讨论[How do you structure your Django project?](https://www.reddit.com/r/django/comments/2tar4q/how_do_you_structure_your_django_project/)也提供了其他的目录结构，例如

```
.
├─── Makefile
├─── etc
│    ├─── uwsgi.ini
│    ├─── requirements.txt
│    └─── nginx
│         ├─── live.conf
│         ├─── staging.conf
│         └─── dev.conf
├─── src
│    ├─── apps
│    │    ├─── app_1
│    │    ├─── app_2
│    │    └─── app_3
│    ├─── core
│    │    ├─── context_processors.py
│    │    ├─── models.py
│    │    ├─── settings
│    │    │    ├─── base.py
│    │    │    ├─── dev.py
│    │    │    └─── live.py
│    │    ├ urls.py
│    │    └ views.py
│    ├─── manage.py
│    ├─── static
│    │    ├─── css
│    │    ├─── images
│    │    └─── js
│    ├─── templates
│    │    ├─── base.html
│    │    └─── index.html
│    └─── wsgi.py
└─── var
     ├─── log
     └───www
```

# 以正确的方式开始Django项目？

Jeff Knupp写过很多有关Python编程经验的blog，有关Djgango的结构先后有3篇，特别是[Starting a Django 1.6 Project the Right Way](https://jeffknupp.com/blog/2013/12/18/starting-a-django-16-project-the-right-way/)，分析很详尽，可作为初学者解惑的起步。

# 混合Djiango REST framework和常规Web结构

现代网站混合了

# 参考

* [How do you structure your Django project?](https://www.reddit.com/r/django/comments/2tar4q/how_do_you_structure_your_django_project/)
* [Starting a Django 1.6 Project the Right Way](https://jeffknupp.com/blog/2013/12/18/starting-a-django-16-project-the-right-way/)
* [Django REST framework how to structure your app](http://danielhnyk.cz/django-rest-framework-how-to-structure-your-app/)