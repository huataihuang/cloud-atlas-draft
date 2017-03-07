获取系统CPU数量可以使用

```
import multiprocessing
multiprocessing.cpu_count()
```

这个模块现在已经从2.6 backport到2.5，应该可以通用

* [Python multiprocessing.cpu_count() returns '1' on 4-core Nvidia Jetson TK1](http://stackoverflow.com/questions/31344582/python-multiprocessing-cpu-count-returns-1-on-4-core-nvidia-jetson-tk1)