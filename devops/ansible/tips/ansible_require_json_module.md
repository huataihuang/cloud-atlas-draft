在管理服务器上执行`ansible-playbook book.yaml`命令出现如下报错

```
failed: [192.168.1.111] => {"failed": true}
msg: Error: ansible requires the stdlib json or simplejson module, neither was found!

FATAL: all hosts have already failed -- aborting

。。。
```

实际上管理服务器并不是对所有服务器都存在问题，而是部分服务器无法执行，部分服务器则正常。

参考 [Error: ansible requires a json module, none found](http://stackoverflow.com/questions/28380771/error-ansible-requires-a-json-module-none-found)

这是因为被管理的目标服务器操作系统版本较低，所以`python-simplejson`需要升级

```
ansible all -i server_ip -m raw -a "sudo yum install -y python-simplejson"
```

上述命令使用`ansible`的`raw`方式将被管理的服务器升级`python-simplejson`包升级好，然后再执行`ansible-playbook`。