# 远程执行脚本

远程ssh到服务器上执行命令，最头疼的是符号转义问题，特别是`awk`涉及到很多`$`和`&`符号，转义后会导致问题。比较简单的方法是在本地编辑好shell脚本，然后复制到远程服务器上，再通过ssh调用脚本执行，就没有这个问题。

不过，对于一条简单的命令，有时候也不想写脚本然后复制再执行，可以在本地写好脚本，然后通过如下方式执行（脚本是设置`netserver`的`cpu_affinity`）

```bash
echo "taskset -p 2 `ps aux | awk '/netserver/ && !/grep/ {print $2}'`" > netserver_taskset.sh
for i in `cat vm_havs_ip`;do ssh root@$i "sh -s" < netserver_taskset.sh;done
```

即脚本可以通过`ssh SERVER_IP "sh -s" < script.sh`来执行

# 参考

* [使用SSH远程执行awk命令遇到的转义问题](http://bbs.chinaunix.net/thread-4134845-1-1.html)