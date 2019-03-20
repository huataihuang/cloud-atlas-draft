* 检查kubernetes master节点版本

使用元集群配置检查指定集群信息，输出指定yaml格式

```
kubectl --kubeconfig meta/admin.kubeconfig.yaml get cluster mycluster-1 -o yaml
```

* 输出kubernetes的apiserver版本

```
kubectl version
```

# 参考

* [What is command to find detailed information about Kubernetes master(s) using kubectl?](https://stackoverflow.com/questions/38230452/what-is-command-to-find-detailed-information-about-kubernetes-masters-using-ku/38230708)