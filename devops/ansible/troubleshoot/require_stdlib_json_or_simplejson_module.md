执行playbook时候出现如下报错

```
TASK: [Make directory for change] **************************************
failed: [192.168.1.1] => {"failed": true}
msg: Error: ansible requires the stdlib json or simplejson module, neither was found!
failed: [192.168.1.2] => {"failed": true}
msg: Error: ansible requires the stdlib json or simplejson module, neither was found!
......
```

参考 [Error: ansible requires a json module, none found](http://stackoverflow.com/questions/28380771/error-ansible-requires-a-json-module-none-found)

需要安装 `python-simplejson`

```
sudo yum install -y python-simplejson
```