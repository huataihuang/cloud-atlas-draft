# Loops

经常会需要在一个任务重完成多件事情，例如创建一批用户，安装一批软件包，或不断重复步骤达到一个确定结果后停止。

# 标准loop

要减少输入，重复的任务可以编写如下：

```
- name: add several users
  user: name={{ item }} state=present groups=wheel
  with_items:
     - testuser1
     - testuser2
```

如果已经在一个变量文件中定义了YAML列表，或'vars'部分，则可以：

```
with_items: "{{ somelist }}"
```

上述等同于：

```
- name: add user testuser1
  user: name=testuser1 state=present groups=wheel
- name: add user testuser2
  user: name=testuser2 state=present groups=wheel
```

loop实际上结合了 `with_ + lookup()`，所以任何lookup插件可以在loop中作为源使用，`items`就是lookup

# 折叠loop

可以参考如下设置nested loops:

```
- name: give users access to multiple databases
  mysql_user: name={{ item[0] }} priv={{ item[1] }}.*:ALL append_privs=yes password=foo
  with_nested:
    - [ 'alice', 'bob' ]
    - [ 'clientdb', 'employeedb', 'providerdb' ]
```

类似`with_items`案例，也可以使用前面定义的变量

```
- name: here, 'users' contains the above list of employees
  mysql_user: name={{ item[0] }} priv={{ item[1] }}.*:ALL append_privs=yes password=foo
  with_nested:
    - "{{ users }}"
    - [ 'clientdb', 'employeedb', 'providerdb' ]
```

# 遍历哈希（Looping over Hashes）

> `loop over` = 遍历

假设定义了以下变量

```
---
users:
  alice:
    name: Alice Appleworth
    telephone: 123-456-7890
  bob:
    name: Bob Bananarama
    telephone: 987-654-3210
```

如果希望打印每个用户的名字和电话号码，可以通过`with_dict`的方法来使用哈希loop through这些元素：

```
tasks:
  - name: Print phone records
    debug: msg="User {{ item.key }} is {{ item.value.name }} ({{ item.value.telephone }})"
    with_dict: "{{ users }}"
```

# 遍历文件

`with_file`则可以从文件列表中提取内容，`item`是依次的每个文的内容集，可以使用类似如下：

```
---
- hosts: all

  tasks:

    # emit a debug message containing the content of each file.
    - debug:
        msg: "{{ item }}"
      with_file:
        - first_example_file
        - second_example_file
```

假设`first_example_file`包含了文本"hello"并且`second_example_file`包含了文本"world"，以下结果

```
TASK [debug msg={{ item }}] ******************************************************
ok: [localhost] => (item=hello) => {
    "item": "hello",
    "msg": "hello"
}
ok: [localhost] => (item=world) => {
    "item": "world",
    "msg": "world"
}
```

# 遍历`Fileglobs`

`with_fileglob`会匹配在单一目录下所有文件，但不支持递归。这个功能调用了[Python's glob library](https://docs.python.org/2/library/glob.html)，可以类似如下使用方法

```
---
- hosts: all

  tasks:

    # first ensure our target directory exists
    - file: dest=/etc/fooapp state=directory

    # copy each file over that matches the given pattern
    - copy: src={{ item }} dest=/etc/fooapp/ owner=root mode=600
      with_fileglob:
        - /playbooks/files/fooapp/*
```

> `注意`
>
> 当在一个角色中以`with_fileglob`使用一个相关路径，Ansible会将路径解析到`roles/<rolename/files`目录下

# 基于数据并行集的loop

> 注意：这个功能不是常用的方法

假设在某个位置使用了以下变量数据

```
---
alpha: [ 'a', 'b', 'c', 'd' ]
numbers:  [ 1, 2, 3, 4 ]
```

并且你想设置`(a, 1)`和`(b, 2)`类似，可以使用`with_together`注意：这个功能不是常用的方法

```
tasks:
    - debug: msg="{{ item.0 }} and {{ item.1 }}"
      with_together:
        - "{{ alpha }}"
        - "{{ numbers }}"
```

# 遍历子因素

假设你需要遍历一系列用户，创建用户账号并通过设置SSH key来允许这些用户登录。

假设你通过以下定义并通过`var_files`或`group_vars/all`文件

```
---
users:
  - name: alice
    authorized:
      - /tmp/alice/onekey.pub
      - /tmp/alice/twokey.pub
    mysql:
        password: mysql-password
        hosts:
          - "%"
          - "127.0.0.1"
          - "::1"
          - "localhost"
        privs:
          - "*.*:SELECT"
          - "DB1.*:ALL"
  - name: bob
    authorized:
      - /tmp/bob/id_rsa.pub
    mysql:
        password: other-mysql-password
        hosts:
          - "db1"
        privs:
          - "*.*:SELECT"
          - "DB2.*:ALL"
```

然后通过如下方法

```
- user: name={{ item.name }} state=present generate_ssh_key=yes
  with_items: "{{ users }}"

- authorized_key: "user={{ item.0.name }} key='{{ lookup('file', item.1) }}'"
  with_subelements:
     - "{{ users }}"
     - authorized
```

提供mysql主机和私有key列表，可以遍历（iterate over）一个列表的折叠subkey：

```
- name: Setup MySQL users
  mysql_user: name={{ item.0.name }} password={{ item.0.mysql.password }} host={{ item.1 }} priv={{ item.0.mysql.privs | join('/') }}
  with_subelements:
    - "{{ users }}"
    - mysql.hosts
```

subelement遍历哈希的列表（通过字典）并且穿过一个在这些记录的给定（折叠子健的）键的列表。

可选的，你可以在子因素列表中添加一个第三方因素，来保存字典的标记。当前你可以添加`skip_missing`标记。如果设置成`True`，则查询插件就会忽略这个列表并跳过对所给的子健。没有这个标记，或者这个标记设置为`False`插件就会弹出错误并报告丢失子健。

# 遍历整数序列

`with_sequence`生成增长的整数序列，可以指定开始，结束以及步长值。

数值可以是十进制，十六进制（0x3f8）或八进制（0600）。不支持负数：

```
---
- hosts: all

  tasks:

    # create groups
    - group: name=evens state=present
    - group: name=odds state=present

    # create some test users
    - user: name={{ item }} state=present groups=evens
      with_sequence: start=0 end=32 format=testuser%02x

    # create a series of directories with even numbers for some reason
    - file: dest=/var/stuff/{{ item }} state=directory
      with_sequence: start=4 end=16 stride=2

    # a simpler way to use the sequence plugin
    # create 4 groups
    - group: name=group{{ item }} state=present
      with_sequence: count=4
```

# 随机选择

`random_choice`功能可以随机选择。但是它不是一个负载均衡（有专门的模块）。有时候可以用于作为砸MacGyver作为环境来实现"穷人的负载均衡":

```
- debug: msg={{ item }}
  with_random_choice:
     - "go through the door"
     - "drink from the goblet"
     - "press the red button"
     - "do nothing"
```

...

# 参考

* [Loops](http://docs.ansible.com/ansible/playbooks_loops.html)