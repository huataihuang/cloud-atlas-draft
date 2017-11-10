> 一个初学时候遇到的问题，思考，以下是自己的一些理解，不一定准确。

在Django的project和app中都有views.py，究竟是怎么注册到urls.py的？

* 在每个app中，自包含views.py，并且在各自的urls.py中include进入，这样就互相不会冲突，并且也能够将app移植到其他project
* 如果都在project中import不同的app和project同名的views，会导致出现很奇怪的报错：

```
AttributeError: 'module' object has no attribute 'views'
```