# Patterns（模具）

在Ansible中Patterns是我们决定哪些主机进行管理。Patterns表示哪些主机进行通讯，而[Playbooks](../playbooks/README.md)则表示是主机应用配置或处理过程。

基本的使用方法类似

```bash
ansible <pattern_goes_here> -m <module_name> -a <arguments>
```

例如

```bash
ansible webservers -m service -a "name=httpd state=restarted"
```

pattern通常指一组服务器，例如上述的`webservers`服务器组。

> 可以使用`all`或`*`表示所有主机。

可以使用`:`来分隔多个组，表示`OR`，意味着主机或者是一个组或者是另外一组

```bash
webservers
webservers:dbservers
```

也可以指代所有主机必须是`webservers`组，但是不能是`phoenix`组

```bash
webservers:!phoenix
```

也可以指定主机必须在`webservers`组并且主机必须在`staging`组

```bash
webservers:&staging
```

更为复杂：所有在`webservers`和`dbservers`组中同时必须在`staging`组，但不能是`phoenix`组

```bash
webservers:dbservers:&staging:!phoenix
```

可以使用通配符`*`

```bash
*.example.com
*.com

one*.com:dbservers
```

如果要使用 **`正则表达式`** ，只需要在开头使用 `~`

```bash
~(web|db).*\.example\.com
```

可以使用排除方式

```bash
ansible-playbook site.yml --limit datacenter2
```

可以从一个文件中读取主机列表，只需要在文件名前面加上`@`

```bash
ansible-playbook site.yml --limit @retry_hosts.txt
```