在palybook中使用变量遇到了麻烦

```bash
  vars:
    package_1: example-package-release13.el5.x86_64.rpm
  tasks:
  - name: copy {{ package_1 }}
    copy:
      src: {{ package_1 }}
      dest: /tmp/{{ vars.package_1 }}	
```

```bash
ERROR: Syntax Error while loading YAML script, kvm-vcpu-tool.yaml
---
Note: The error may actually appear before this position: line 10, column 13

    copy:
      src: {{ package_1 }}
            ^
We could be wrong, but this one looks like it might be an issue with
missing quotes.  Always quote template expression brackets when they
start a value. For instance:

    with_items:
      - {{ foo }}

Should be written as:

    with_items:
      - "{{ foo }}"
```

这个报错让我摸不着头脑，参考 [Chapter 4. Variables and Facts](https://www.safaribooksonline.com/library/view/ansible-up-and/9781491915318/ch04.html) ，早期版本可以采用类似shell中使用`$`表示变量，不过现在都使用`{{ }}`。不过，参考章节2中的说明：

> 如果刚好在模块声明之后引用变量，YAML解析器会将这个变量引用误解为内联字典，此时必须使用引号将参数引起来

修改成 

```bash
- hosts: all
  vars:
    package_1: example-package-release13.el5.x86_64.rpm
  tasks:
  - name: "copy {{ package_1 }}"
    copy:
      src: "{{ package_1 }}"
      dest: /tmp/{{ package_1 }}
  - name: Install {{ package_1 }}
    sudo: true
    yum:
      name: /tmp/{{ package_1 }}
      state: present
```

则能够正常引用变量`package_1`。

不过，`name: copy {{ package_1 }}`这个方法不正确，输出信息并没有正确替换变量，而是显示

```bash
TASK: [copy {{ package_1 }}] **************************************************
ok: [192.168.1.11]
ok: [192.168.1.12]
```

但是，软件包`example-package-release13.el5.x86_64.rpm`确实是正确复制到目标服务器的。

这个`name`中不能是哟个变量的问题比较奇怪，参考 [Variable substitution in task names](https://github.com/ansible/ansible/issues/3103): inventory变量是主机相关的，不是全局变量，所以在ansible中，不能在`name`中使用变量。（`The variable you are using is in inventory scope, so it can't be substituted.`）