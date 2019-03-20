在Kubernetes集群中，某个容器crash时，Kubernetes会自动重建容器。但是，我们需要排查容器crash的原因，方法步骤如下：

* 检查元集群信息，获取具体集群名称:

```
kubectl --kubeconfig meta/admin.kubeconfig.yaml get cluster
```

可以看到集群列表：

```
NAME              CREATED AT
perf-test         11d
example-k8s-1          48d
...
```

* 检查节点状态：

由于收到 `dc-k8s-1` 集群的manager服务器报警，所以检查对应集群的节点状态：

```
kubectl --kubeconfig online/example-k8s-1/admin.kubeconfig.yaml get nodes | grep controller-manager
```

可以看到这个集群的管控服务器容器已经有2个都自动重启过（见 `RESTARTS` 字段)

```
NAME                                          READY   STATUS    RESTARTS   AGE
example-controller-manager-786b4cc6d4-2bpdc    1/1     Running   0          4d
example-controller-manager-786b4cc6d4-9bjk6    1/1     Running   1          4d
example-controller-manager-786b4cc6d4-dfxhc    1/1     Running   1          4d
```

* 检查上述Pod中的容器名字，这是通过 `describe pod` 指令来完成的，可以完整查看pod信息：

```
kubectl --kubeconfig meta/admin.kubeconfig.yaml -n example-k8s-1 describe pod example-controller-manager-786b4cc6d4-9bjk6
```

此时可以看到pod的详细输出信息：

```
Name:           example-controller-manager-786b4cc6d4-9bjk6
Namespace:      example-k8s-1
...
Containers:
  example-controller-manager:   <=这个值就是容器名字
    Container ID:  ...
    Image:         ...
    Image ID:      ...
```

> 查询pod的容器信息方法： `kubectl describe pod podname`

* 检查pod中指定容器的上次重启日志，也就是crash的那次日志

```
kubectl --kubeconfig meta/admin.kubeconfig.yaml  -n example-k8s-1 logs example-controller-manager-786b4cc6d4-9bjk6 -c example-controller-manager --previous
```

> 查询pod的指定容器日志语法是： `kubectl logs podname -c containername --previous`

# 参考

* [How do I tell when/if/why a container in a kubernetes cluster restarts?](https://serverfault.com/questions/727104/how-do-i-tell-when-if-why-a-container-in-a-kubernetes-cluster-restarts)