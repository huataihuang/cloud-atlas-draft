# RESTful API推荐的设计基本原则

* API与用户的通信协议，总是使用HTTPs协议

* API部署在专用域名之下，例如： https://api.example.com

* 应该将API的版本号放入URL，例如： https://api.example.com/v1/

> github将版本号放在HTTP头信息中，虽然不如放入URL方便和直观

* 在RESTful架构中，每个网址代表一种资源（resource）

所以网址中不能有动词，只能有名词，而且所用的名词往往与数据库的表格名对应。

一般来说，数据库中的表都是同种记录的"集合"（collection），所以API中的名词也应该使用复数。

举例来说，有一个API提供动物园（zoo）的信息，还包括各种动物和雇员的信息，则它的路径应该设计成下面这样。

```
https://api.example.com/v1/zoos
https://api.example.com/v1/animals
https://api.example.com/v1/employees
```

* 对于资源的具体操作类型，由HTTP动词表示

RESTful架构风格规定，数据的元操作，即`CRUD`(增读改删)(create, read, update和delete,即数据的增删查改)操作，分别对应于HTTP方法：GET用来获取资源，POST用来新建资源（也可以用于更新资源），PUT用来更新资源，DELETE用来删除资源

常用的HTTP动词有下面五个（括号里是对应的SQL命令）:

```
GET（SELECT）：从服务器取出资源（一项或多项）。
POST（CREATE）：在服务器新建一个资源。
PUT（UPDATE）：在服务器更新资源（客户端提供改变后的完整资源）。
PATCH（UPDATE）：在服务器更新资源（客户端提供改变的属性）。
DELETE（DELETE）：从服务器删除资源。
```

还有两个不常用的HTTP动词:

```
HEAD：获取资源的元数据。
OPTIONS：获取信息，关于资源的哪些属性是客户端可以改变的。
```

一些例子:

```
GET /zoos：列出所有动物园
POST /zoos：新建一个动物园
GET /zoos/ID：获取某个指定动物园的信息
PUT /zoos/ID：更新某个指定动物园的信息（提供该动物园的全部信息）
PATCH /zoos/ID：更新某个指定动物园的信息（提供该动物园的部分信息）
DELETE /zoos/ID：删除某个动物园
GET /zoos/ID/animals：列出某个指定动物园的所有动物
DELETE /zoos/ID/animals/ID：删除某个指定动物园的指定动物
```

* 如果记录数量很多，服务器不可能都将它们返回给用户。API应该提供参数，过滤返回结果

下面是一些常见的参数。

```
?limit=10：指定返回记录的数量
?offset=10：指定返回记录的开始位置。
?page=2&per_page=100：指定第几页，以及每页的记录数。
?sortby=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序。
?animal_type_id=1：指定筛选条件
```

参数的设计允许存在冗余，即允许API路径和URL参数偶尔有重复。比如，`GET /zoo/ID/animals` 与 `GET /animals?zoo_id=ID` 的含义是相同的。

* 状态码（Status Codes）: 服务器向用户返回的状态码和提示信息，常见的有以下一些（方括号中是该状态码对应的HTTP动词）。

```
200 OK - [GET]：服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
201 CREATED - [POST/PUT/PATCH]：用户新建或修改数据成功。
202 Accepted - [*]：表示一个请求已经进入后台排队（异步任务）
204 NO CONTENT - [DELETE]：用户删除数据成功。
400 INVALID REQUEST - [POST/PUT/PATCH]：用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的。
401 Unauthorized - [*]：表示用户没有权限（令牌、用户名、密码错误）。
403 Forbidden - [*] 表示用户得到授权（与401错误相对），但是访问是被禁止的。
404 NOT FOUND - [*]：用户发出的请求针对的是不存在的记录，服务器没有进行操作，该操作是幂等的。
406 Not Acceptable - [GET]：用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
410 Gone -[GET]：用户请求的资源被永久删除，且不会再得到的。
422 Unprocesable entity - [POST/PUT/PATCH] 当创建一个对象时，发生一个验证错误。
500 INTERNAL SERVER ERROR - [*]：服务器发生错误，用户将无法判断发出的请求是否成功。
```

* 错误处理（Error handling）

如果状态码是`4xx`，就应该向用户返回出错信息。一般来说，返回的信息中将error作为键名，出错信息作为键值即可。

```
{
    error: "Invalid API key"
}
```

* 返回结果

针对不同操作，服务器向用户返回的结果应该符合以下规范。

```
GET /collection：返回资源对象的列表（数组）
GET /collection/resource：返回单个资源对象
POST /collection：返回新生成的资源对象
PUT /collection/resource：返回完整的资源对象
PATCH /collection/resource：返回完整的资源对象
DELETE /collection/resource：返回一个空文档
```

* Hypermedia API

**RESTful API最好做到Hypermedia，即返回结果中提供链接，连向其他API方法，使得用户不查文档，也知道下一步应该做什么。**

比如，当用户向api.example.com的根目录发出请求，会得到这样一个文档。

```
{"link": {
  "rel":   "collection https://www.example.com/zoos",
  "href":  "https://api.example.com/zoos",
  "title": "List of zoos",
  "type":  "application/vnd.yourformat+json"
}}
```

Hypermedia API的设计被称为HATEOAS。Github的API就是这种设计，访问api.github.com会得到一个所有可用API的网址列表。

```
{
  "current_user_url": "https://api.github.com/user",
  "authorizations_url": "https://api.github.com/authorizations",
  // ...
}
```

* 其他
  * API的身份认证应该使用OAuth 2.0框架。
  * 服务器返回的数据格式，应该尽量使用JSON，避免使用XML。

# RESTful设计进阶

## 请求和响应

* 常用的Response要包含的数据和状态码（status code）：
  * 当`GET`, `PUT`和`PATCH`请求成功时，要返回对应的数据，及状态码`200`，即`SUCCESS`
  * 当`POST`创建数据成功时，要返回创建的数据，及状态码`201`，即`CREATED`
  * 当`DELETE`删除数据成功时，不返回数据，状态码要返回`204`，即`NO CONTENT`
  * 当`GET` 不到数据时，状态码要返回`404`，即`NOT FOUND`
  * 任何时候，如果请求有问题，如校验请求数据时发现错误，要返回状态码 `400`，即`BAD REQUEST`
  * 当API 请求需要用户认证时，如果request中的认证信息不正确，要返回状态码 `401`，即`NOT AUTHORIZED`
  * 当API 请求需要验证用户权限时，如果当前用户无相应权限，要返回状态码 `403`，即`FORBIDDEN`

关于Request 和 Response，不要忽略了http header中的Content-Type。以json为例，如果API要求客户端发送request时要传入json数据，则服务器端仅做好json数据的获取和解析即可，但如果服务端支持多种类型数据的传入，如同时支持json和form-data，则要根据客户端发送请求时header中的Content-Type，对不同类型是数据分别实现获取和解析；如果API响应客户端请求后，需要返回json数据，需要在header中添加`Content-Type=application/json`。

## 序列化(Serialization))反序列化（Deserialization）

`RESTful API`以规范统一的格式作为数据的载体，常用的格式为json或xml，以json格式为例，当客户端向服务器发请求时，或者服务器相应客户端的请求，向客户端返回数据时，都是传输json格式的文本，而在服务器内部，数据处理时基本不用json格式的字符串，而是native类型的数据。

最典型的如类的实例，即对象（object），json仅为服务器和客户端通信时，在网络上传输的数据的格式，服务器和客户端内部，均存在将json转为native类型数据和将native类型数据转为json的需求，其中，将native类型数据转为json即为序列化，将json转为native类型数据即为反序列化。

虽然某些开发语言，如Python，其原生数据类型list和dict能轻易实现序列化和反序列化，但对于复杂的API，内部实现时总会以对象作为数据的载体，因此，**确保序列化和反序列化方法的实现，是开发RESTful API最重要的一步准备工作**

序列化和反序列化是RESTful API开发中的一项硬需求，所以几乎每一种常用的开发语言都会有一个或多个优秀的开源库，来实现序列化和反序列化，因此，我们在开发RESTful API时，没必要制造重复的轮子，选一个好用的库即可，如python中的[marshmallow](http://marshmallow.readthedocs.io/en/latest/)，如果基于Django开发，[Django REST Framework](http://www.django-rest-framework.org/)中的serializer即可。

## 数据校验（Validation）

Validation即数据校验，是开发健壮RESTful API中另一个重要的一环。

客户端向服务器发出`post`, `put`或`patch`请求时，通常会同时给服务器发送json格式的相关数据，服务器在做数据处理之前，先做数据校验，是最合理和安全的前后端交互。如果客户端发送的数据不正确或不合理，服务器端经过校验后直接向客户端返回400错误及相应的数据错误信息即可。

常见的数据校验包括：

* 数据类型校验，如字段类型如果是int，那么给字段赋字符串的值则报错
* 数据格式校验，如邮箱或密码，其赋值必须满足相应的正则表达式，才是正确的输入数据
* 数据逻辑校验，如数据包含出生日期和年龄两个字段，如果这两个字段的数据不一致，则数据校验失败

## 认证(Authentication)和权限(Permission)

Authentication指用户认证，Permission指权限机制，这两点是使RESTful API 强大、灵活和安全的基本保障。

常用的认证机制是`Basic Auth`和`OAuth`，RESTful API 开发中，除非API非常简单，且没有潜在的安全性问题，否则，认证机制是必须实现的，并应用到API中去。

Basic Auth非常简单，很多框架都集成了Basic Auth的实现，自己写一个也能很快搞定，OAuth目前已经成为企业级服务的标配，其相关的开源实现方案[非常丰富](http://oauth.net/2/)（[更多](https://github.com/search?utf8=%E2%9C%93&q=oauth)）。

**由于RESTful风格的服务是无状态的，认证机制尤为重要。**常用的认证机制包括 session auth(即通过用户名密码登录)，basic auth，token auth和OAuth，服务开发中常用的认证机制为后三者。

> 参考[RESTful认证和权限机制浅析](restful_authentication_and_permission)

## CORS

CORS即[Cross-origin resource sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)，在RESTful API开发中，主要是为js服务的，解决javascript 调用 RESTful API时的跨域问题。

由于固有的安全机制，js的跨域请求时是无法被服务器成功响应的。现在前后端分离日益成为web开发主流方式的大趋势下，后台逐渐趋向指提供API服务，为各客户端提供数据及相关操作，而网站的开发全部交给前端搞定，网站和API服务很少部署在同一台服务器上并使用相同的端口，js的跨域请求时普遍存在的，开发RESTful API时，通常都要考虑到CORS功能的实现，以便js能正常使用API。

目前各主流web开发语言都有很多优秀的实现CORS的开源库，我们在开发RESTful API时，要注意CORS功能的实现，直接拿现有的轮子来用即可。

> 关于CORS的介绍，请参考阮一峰老师的[跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)

## URL Rules

RESTful API 是写给开发者来消费的，其命名和结构需要有意义。因此，在设计和编写URL时，要符合一些规范。

> 这里补充前述规则

* Nested resources routing - 比较倾向于使用这种方法（而不是filter）

如果要获取一个资源子集，采用 `nested routing` 是一个优雅的方式，如，列出所有文章中属于Gevin编写的文章：

```
# List Gevin's articles
/api/authors/gevin/articles/
```

获取资源子集的另一种方式是基于filter，这两种方式都符合规范，但语义不同：如果语义上将资源子集看作一个独立的资源集合，则使用 nested routing 感觉更恰当，如果资源子集的获取是出于过滤的目的，则使用filter更恰当。

* Filter

对于资源集合，可以通过url参数对资源进行过滤，如：

```
# List Gevin's articles
/api/articles?author=gevin
```

分页就是一种最典型的资源过滤。

* 分页Pagination

对于资源集合，分页获取是一种比较合理的方式。如果基于开发框架（如Django REST Framework），直接使用开发框架中的分页机制即可，如果是自己实现分页机制，可参考Gevin的策略是：

返回资源集合是，包含与分页有关的数据如下：

```
{
  "page": 1,            # 当前是第几页
  "pages": 3,           # 总共多少页
  "per_page": 10,       # 每页多少数据
  "has_next": true,     # 是否有下一页数据
  "has_prev": false,    # 是否有前一页数据
  "total": 27           # 总共多少数据
}
```

当想API请求资源集合时，可选的分页参数为：

| 参数 | 含义 |
| ---- | ---- |
| page | 当前是第几页，默认为1 |
| per_page | 每页多少条记录，默认为系统默认值 |

另外，系统内还设置一个`per_page_max`字段，用于标记系统允许的每页最大记录数，当`per_page`值大于 `per_page_max` 值时，每页记录条数为 `per_page_max`。

* URL设计

> Url是区分大小写的

> Back forward Slash (/) 

目前比较流行的API设计方案，通常建议url以`/`作为结尾，如果API GET请求中，url不以`/`结尾，则重定向到以`/`结尾的API上去（这点现在的web框架基本都支持），因为有没有 `/`，也是两个url，即：

```
/posts/
/posts
```

这也是两个不同的url，可以对应不同的行为和资源

> 连接符 `-` 和 下划线 `_`

RESTful API 应具备良好的可读性，当url中某一个片段（segment）由多个单词组成时，建议使用 `-` 来隔断单词，而不是使用 `_`，即：

```
# Good
/api/featured-post/

# Bad
/api/featured_post/
```

这主要是因为，浏览器中超链接显示的默认效果是，文字并附带下划线，如果API以`_`隔断单词，二者会重叠，影响可读性。



# 参考

> 本文摘自以下两篇博文，原文非常详尽，值得学习

* [阮一峰的网络日志: RESTful API 设计指南](http://www.ruanyifeng.com/blog/2014/05/restful_api.html) - 入门文章
* [RESTful API 编写指南](https://blog.igevin.info/posts/restful-api-get-started-to-write/) - 更为纤细和进阶