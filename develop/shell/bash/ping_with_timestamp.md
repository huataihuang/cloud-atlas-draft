在做网络稳定性测试时，经常会做大量的ping测试，但是默认ping，只提供了数据包顺序号，但是没有提供这个ping包是什么时候发出，有时候很难和其他一些观察的时间对应起来。

* 检查`ping`返回数据包超过1ms（方法是过滤出不是`time=0.x`）

```
 ping -i 0.1 192.168.1.81 | grep "time=[1-9]"
```

> `-i 0.1`采用间隔0.1秒发出一个ping，加快测试频率

* 注意，为了能够确定ping不受到切换cpu的影响，或者说，要观察切换cpu对ping的影响，需要使用`taskset`来指定处理器

> `taskset -c <cpu_number_list> -p <process_id>`或者使用 `taskset -c <cpu_number_list> <command>`
>
> 举例：以下命令指定在 cpu 0 和 16上执行ping

```
taskset -c 0,16 ping -i 0.1 192.168.1.81 | grep "time=[1-9]"
```

* 循环切换cpu 0 到 31测试ping响应

```bash
pid=`ps aux | grep "ping -i 0.1 192.168.1.81" |  grep -v grep | awk '{print $2}'`
while true;do 
    for i in {0..31};do (taskset -c -p $i $pid;sleep 0.1);done
done
```

* 上述测试不能获得ping时间戳，所以和其他监控对应起来有些麻烦。解决方法是ping之后读取pong，然后输出时间

```bash
ping -i 0.1 192.168.1.81 | while read pong; do echo "$(date +%H:%M:%S): $pong" | grep "time=[1-9]"; done
```

此时再结合另一个窗口中运行的获取ping命令的pid并不断调整cpu的测试

```bash
pid=`ps aux | grep "ping -i 0.1 192.168.1.81" |  grep -v grep | awk '{print $2}'`
while true;do for i in {0..31};do (date +%H:%M:%S;taskset -c -p $i $pid;sleep 0.5);done; done
```

> 在上述脚本中 `{0..31}` 表示数字序列，也可以直接列出 `{12,13,18,19}` 类似方式

* ping flood

ping工具还支持一种称为flood的模式

```
ping -f 192.168.1.81
```

数据包发送洪流

# 参考

* [How to command “Ping” display time and date of ping](https://askubuntu.com/questions/137233/how-to-command-ping-display-time-and-date-of-ping)