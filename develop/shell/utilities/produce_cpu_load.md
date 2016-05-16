在测试工作中，有时候需要对cpu施加压力来模拟环境

# 使用`stress`工具

```bash
./stress --cpu 3
```

类似windows环境下的`consume.exe`

# 使用shell

假设是4个cpu core的主机

```bash
for i in 1 2 3 4; do while : ; do : ; done & done
```

如果是bash，还支持 {1..4}

```bash
for i in {1..4}; do while : ; do : ; done & done
```

# python脚本

```python
from multiprocessing import Pool

def f(x):
    # Put any cpu (only) consuming operation here. I have given 1 below -
    while True:
        x * x

# decide how many cpus you need to load with.
no_of_cpu_to_be_consumed = 3

p = Pool(processes=no_of_cpu_to_be_consumed)
p.map(f, range(no_of_cpu_to_be_consumed))
```

# 参考

* [How can I produce high CPU load on a Linux server?](http://superuser.com/questions/443406/how-can-i-produce-high-cpu-load-on-a-linux-server)