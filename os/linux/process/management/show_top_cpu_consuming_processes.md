我们在运维系统的时候，经常需要找出系统中最消耗资源的异常进程，这里汇总一些方法以备参考。

# 使用`ps`命令获得消耗资源的进程

* 系统中最消耗cpu资源的5个进程：

```bash
ps aux | sort -nrk 3,3 | head -n 5
```

上述命令最关键是 `sort -nrk 3,3` :

  * `-n` , `--numeric-sort` 将字符串作为数值进行排序
  * `-r` , `--reverse` 反转排序，也就是数字从大到小
  * `-k` , `--key=KEYDEF` 通过一个key进行排序，这里 KEYDEF 获得位置和类型，由于 `ps aux` 的第三列是CPU使用率，所以 `-k 3,3` 排序就是按照CPU使用率排序

> 上述命令也特别适合查找出系统中占用内存的进程，非常方便，因为 `ps aux` 命令输出的内容包含：
>
> `USER        PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND`

输出信息举例

```
root     192325 13.8  0.1 10615856 49848 ?      Ssl   2020 7290:46 etcd --advertise-client-urls=https://172.19.0.5:2379 --cert-file=/etc/kubernetes/pki/etcd/server.crt --client-cert-auth=true --data-dir=/var/lib/etcd --initial-advertise-peer-urls=https://172.19.0.5:2380 --initial-cluster=dev-control-plane=https://172.19.0.5:2380 --key-file=/etc/kubernetes/pki/etcd/server.key --listen-client-urls=https://127.0.0.1:2379,https://172.19.0.5:2379 --listen-metrics-urls=http://127.0.0.1:2381 --listen-peer-urls=https://172.19.0.5:2380 --name=dev-control-plane --peer-cert-file=/etc/kubernetes/pki/etcd/peer.crt --peer-client-cert-auth=true --peer-key-file=/etc/kubernetes/pki/etcd/peer.key --peer-trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt --snapshot-count=10000 --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
root     306574 11.0  0.1 1939632 52268 ?       Ssl  20:01   0:00 /usr/bin/kubelet --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf --config=/var/lib/kubelet/config.yaml --container-runtime=remote --container-runtime-endpoint=/run/containerd/containerd.sock --fail-swap-on=false --node-ip= --fail-swap-on=false
root     306503  7.8  0.1 171716 46496 ?        Ssl  20:01   0:00 kube-apiserver --advertise-address=172.19.0.5 --allow-privileged=true --authorization-mode=Node,RBAC --client-ca-file=/etc/kubernetes/pki/ca.crt --enable-admission-plugins=NodeRestriction --enable-bootstrap-token-auth=true --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key --etcd-servers=https://127.0.0.1:2379 --insecure-port=0 --kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt --kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key --requestheader-allowed-names=front-proxy-client --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt --requestheader-extra-headers-prefix=X-Remote-Extra- --requestheader-group-headers=X-Remote-Group --requestheader-username-headers=X-Remote-User --secure-port=6443 --service-account-key-file=/etc/kubernetes/pki/sa.pub --service-cluster-ip-range=10.96.0.0/12 --tls-cert-file=/etc/kubernetes/pki/apiserver.crt --tls-private-key-file=/etc/kubernetes/pki/apiserver.key
root     306175  4.2  0.1 3046892 64940 ?       Ssl  20:01   0:00 /usr/bin/kubelet --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf --kubeconfig=/etc/kubernetes/kubelet.conf --config=/var/lib/kubelet/config.yaml --container-runtime=remote --container-runtime-endpoint=/run/containerd/containerd.sock --fail-swap-on=false --node-ip= --fail-swap-on=false
root       1549  3.0  0.2 3289084 68588 ?       Ssl   2020 3974:41 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
```

* `ps` 命令也直接支持输出列定制，并且直接支持按照某列进行排序，例如：

```bash
ps -Ao user,uid,comm,pid,pcpu,tty --sort=-pcpu | head -n 6
```

输出举例

```
USER       UID COMMAND            PID %CPU TT
root         0 etcd            192325 13.8 ?
root         0 kubelet         308079  5.5 ?
root         0 kube-apiserver  307961  4.8 ?
root         0 kubelet         307616  3.6 ?
root         0 dockerd           1549  3.0 ?
```

* 使用 `ps` 命令还可以采用

```bash
ps -eo pcpu,pid,user,args --no-headers| sort -t. -nk1,2 -k4,4 -r |head -n 5
```

# 使用top命令

top提供了batch模式，可以只输出一次采样，然后进行排序：

```
top -b -n 1 | head -n 12  | tail -n 5
```

`top` 命令的参数：

  * `-b` 表示 batch批处理
  * `-n 1` 表示只采样一次

举个例子:

```bash
process=java
top -bn 1 | grep "^ *[1-9]" | grep $process| awk '{ if($9 > 20) print $1}'
```

> 这里 `grep "^ *[1-9]"` 过滤数字开头的行，也就是进程号

# 参考

* [Show top five CPU consuming processes with `ps`](https://unix.stackexchange.com/questions/13968/show-top-five-cpu-consuming-processes-with-ps)