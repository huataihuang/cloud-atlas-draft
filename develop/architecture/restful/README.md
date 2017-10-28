> 本文主要摘自[阮一峰的网络日志:理解RESTful架构](http://www.ruanyifeng.com/blog/2011/09/restful.html)，感谢原作者阮一峰清晰和形象的解析。

# REST 和 RESTful

REST 全称 `REpresentational State Transfer`，即“表现层状态转化”，RESTful 架构即符合 REST 风格的架构。 REST 设计思想是充分利用 HTTP/HTTPS 协议的特点，比如 HTTP 方法、header 信息、HATEOAS，直接面向资源进行操作。

RESTful 架构，就是目前最流行的一种互联网软件架构。它结构清晰、符合标准、易于理解、扩展方便。

# 概要

要理解RESTful架构，最好的方法就是去理解`Representational State Transfer`这个词组到底是什么意思，它的每一个词代表了什么涵义。

* 资源（Resources）

REST的名称"表现层状态转化" -- "表现层"其实指的是"资源"（Resources）的"表现层"。

所谓"资源"，就是网络上的一个实体，或者说是网络上的一个具体信息。它可以是一段文本、一张图片、一首歌曲、一种服务，总之就是一个具体的实在。你可以用一个`URI（统一资源定位符）`指向它，每种资源对应一个特定的URI。要获取这个资源，访问它的URI就可以，因此URI就成了每一个资源的地址或独一无二的识别符。

* 表现层（Representation）

"资源"是一种信息实体，它可以有多种外在表现形式。我们把"资源"具体呈现出来的形式，叫做它的"表现层"（Representation）。

比如，文本可以用txt格式表现，也可以用HTML格式、XML格式、JSON格式表现，甚至可以采用二进制格式；图片可以用JPG格式表现，也可以用PNG格式表现。

URI只代表资源的实体，不代表它的形式。严格地说，有些网址最后的".html"后缀名是不必要的，因为这个后缀名表示格式，属于"表现层"范畴，而 **URI应该只代表"资源"的位置**。它的具体表现形式，应该在**HTTP请求的头信息中用Accept和Content-Type字段指定，这两个字段才是对"表现层"的描述。**

> 注意：URI是资源，`表现层描述`应该在HTTP头部信息中设置。例如使用`curl`请求资源，提交的HTTP头部信息参数`-H "Accept: version=2,application/json" -H "Content-Type: application/json"`

* 状态转化（State Transfer）

互联网通信协议HTTP协议，是一个无状态协议。这意味着，所有的状态都保存在服务器端。因此，**如果客户端想要操作服务器，必须通过某种手段，让服务器端发生"状态转化"（State Transfer）。而这种转化是建立在表现层之上的，所以就是"表现层状态转化"。**

客户端用到的手段，只能是HTTP协议。具体来说，就是HTTP协议里面，四个表示操作方式的动词：`GET`、`POST`、`PUT`、`DELETE`。它们分别对应四种基本操作：

* GET用来获取资源
* POST用来新建资源（也可以用于更新资源）
* PUT用来更新资源
* DELETE用来删除资源

> **`综述`**
> 
> RESTful架构：
> 
> * 每一个URI代表一种资源
> * 客户端和服务器之间，传递这种资源的某种表现层
> * 客户端通过四个HTTP动词，对服务器端资源进行操作，实现"表现层状态转化"

> **`注意`**
>
> **URI`不应`包含动词**。因为"资源"表示一种实体，所以应该是名词，URI不应该有动词，动词应该放在HTTP协议中。
>
> 举例: 某个URI是`/posts/show/1`，其中show是动词，这个URI就设计**错**了，正确的写法应该是`/posts/1`，然后用`GET`方法表示`show`。

# 参考

* [Django REST framework 笔记](https://blog.windrunner.me/python/web/django-rest-framework.html)
* [阮一峰的网络日志:理解RESTful架构](http://www.ruanyifeng.com/blog/2011/09/restful.html)