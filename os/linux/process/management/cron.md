`cron`作为定时任务配置服务，可以通过`crontab`进行交互式编辑，或者通过`/etc/cron.d/`目录下配置文件设置：

* `/etc/cron.d`目录采用了各自独立的配置文件，适合通过脚本进行管理。
* `/etc/cron.d`文件名命名必须符合`run-parts`命名方式，即使用字母，数字，下划线和中划线（不能使用点符号）
* `/etc/cron.d`中配置文件必须指定脚本运行的用户名，以便使用指定用户身份运行：

```
0,15,30,45 * * * * root /backup.sh >/dev/null 2>&1
```

* `/etc/cron.d`中配置文件的文件属性必须是非可执行的且属于`root`用户（`-rw-r--r--` 属主 `root:root` ），否则cron服务会拒绝执行该配置
* 被引用的脚本必须是可执行属性的（`-rwxr-xr-x`）

# 无法运行的`/etc/cron.d/XXXX`

最近遇到一个通过脚本配置的`/etc/cron.d/my_cron_script`无法执行，非常奇特的是，同样的配置内容，之前在测试集群是完全正常的。

```
* * * * * root /opt/my_cron_script.sh > /dev/null 2>&1
```

反复检查了执行脚本的属性，手工执行都没有错误，对比了测试集群和线上集群的配置，也看不出差异。

参考 [Why doesn't my cron.d per minute job run?](https://superuser.com/questions/664454/why-doesnt-my-cron-d-per-minute-job-run) okoloBasii 的答复：

> A possible mistake here is how a single line file is created. From Ubuntu Documentation:
>
>> ...line has five time-and-date fields, followed by a command, followed by a  **`newline character`** .

原因是在crontab配置中，必须确保每行命令之后有一个换行符号`\n`。这个符号是不可见字符，所以需要非常小心关注。

如何确保脚本使用创建文件行最后有一个换行符，并且能够观察到呢？

`cat`命令有一个`-A`参数可以实现这个功能，正确配置的命令行最后会有一个类似`$`符号显示：

```
cat -A /etc/cron.d/my_cron_script
```

显示如下

```
* * * * * root /opt/my_cron_script.sh > /dev/null 2>&1$
```

# 参考

* [What is the difference between cron.d (as in /etc/cron.d/) and crontab?](https://unix.stackexchange.com/questions/417323/what-is-the-difference-between-cron-d-as-in-etc-cron-d-and-crontab)
* [CronHowto](https://help.ubuntu.com/community/CronHowto)