在生产环境上，如果出现inode大量消耗的情况，是需要通过快速定位[找出使用inode最多的文件目录](os/linux/storage/filesystem/ext/find_where_inodes_are_being_used.md)。但是，我们还需要进一步找出大量生成文件的原因。

我们已经定位了大量文件存在于 `tmp/exec` 目录，现在我们排查文件写入的进程来源。

虽然文件大量快速生成，但是进程写文件都是瞬间完成，无法简单通过iotop找出源头。所以，我们同样需要使用 [audit](audit_architecture) 来审计记录文件生成来源。

* 启用audit

```
systemctl start auditd
```

* 然后记录谁写了这个目录

```
auditctl -w /tmp/exec -S execve
```

提示错误

```
WARNING - 32/64 bit syscall mismatch, you should specify an arch
Error sending add rule data request (Rule exists)
```

改成

```
auditctl -w /tmp/exec -F arch=b64 -S execve
```

提示

```
arch must be before -S
```

* 添加规则

```
auditctl -a create -F arch=b64 -S execve -k MYEXEC
auditctl -w /tmp/exec -p war -k whatsgoingon
```

* 显示当前rule

```
auditctl -l
```

清理rule

```
auditctl -D
```

* 记录下

```
type=CWD msg=audit(1596944388.142:53167): cwd="/"
type=PATH msg=audit(1596944388.142:53167): item=0 name="/tmp/exec/" inode=920446 dev=fd:01 mode=040755 ouid=0 ogid=0 rdev=00:00 nametype=PARENT
type=PATH msg=audit(1596944388.142:53167): item=1 name="/tmp/exec/0bcdb0aa41ab2fbd1ac798559f8ff0258c470f55c206a6de953ff2ca31e89222.done" inode=589773 dev=fd:01 mode=0100755 ouid=0 ogid=0 rdev=00:00 nametype=CREATE
type=PROCTITLE msg=audit(1596944388.142:53167): proctitle=646F636B65722D686F73742D6578656300306263646230616134316162326662643161633739383535396638666630323538633437306635356332303661366465393533666632636133316538393232320066616C7365
type=USER_END msg=audit(1596944388.143:53168): pid=37943 uid=0 auid=4294967295 ses=4294967295 msg='op=PAM:session_close grantors=pam_keyinit,pam_limits acct="root" exe="/usr/bin/sudo" hostname=? addr=? terminal=? res=success'
type=CRED_DISP msg=audit(1596944388.143:53169): pid=37943 uid=0 auid=4294967295 ses=4294967295 msg='op=PAM:setcred grantors=pam_env,pam_unix acct="root" exe="/usr/bin/sudo" hostname=? addr=? terminal=? res=success'
type=SYSCALL msg=audit(1596944388.144:53170): arch=c000003e syscall=257 success=yes exit=3 a0=ffffffffffffff9c a1=c0005c62d0 a2=80241 a3=1ff items=2 ppid=54667 pid=37768 auid=4294967295 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=(none) ses=4294967295 comm="exe" exe="/usr/local/bin/pouchd" key="whatsgoingon"

type=CWD msg=audit(1596944388.150:53171): cwd="/"
type=PATH msg=audit(1596944388.150:53171): item=0 name="/tmp/exec/" inode=920446 dev=fd:01 mode=040755 ouid=0 ogid=0 rdev=00:00 nametype=PARENT
type=PATH msg=audit(1596944388.150:53171): item=1 name="/tmp/exec/7cdd887ff4f5f2013521782b7f3fe49d8de6a1fb12a20198b0d5d5725c4b6821.stdout" inode=589775 dev=fd:01 mode=0100644 ouid=0 ogid=0 rdev=00:00 nametype=CREATE
type=PROCTITLE msg=audit(1596944388.150:53171): proctitle=646F636B65722D686F73742D6578656300376364643838376666346635663230313335323137383262376633666534396438646536613166623132613230313938623064356435373235633462363832310066616C7365
type=SYSCALL msg=audit(1596944388.150:53172): arch=c000003e syscall=257 success=yes exit=7 a0=ffffffffffffff9c a1=c0004e02a0 a2=80242 a3=1b6 items=2 ppid=54667 pid=37770 auid=4294967295 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=(none) ses=4294967295 comm="exe" exe="/usr/local/bin/pouchd" key="whatsgoingon"
```

这里有一个问题，可以看到不断有新的线程创建文件，例如上面的 `ppid=54667 pid=37768`

* 抓到了：

```
#ps aux | grep 54667
root      34505  0.0  0.0 112708  2312 pts/0    S+   11:44   0:00 grep --color=auto 54667
root      54667 57.4  0.0 9538840 164552 ?      Ssl  Aug04 3852:09 /usr/local/bin/pouchd
```

原来进程是 pouchd

* audit对系统有影响，所以排查完问题之后我们可能需要停止audit

奇怪，无法停止auditd

```
#systemctl stop auditd
Failed to stop auditd.service: Operation refused, unit auditd.service may be requested by dependency only (it is configured to refuse manual start/stop).
See system logs and 'systemctl status auditd.service' for details.
```

这个问题在 [Prevent stop auditd service in Redhat 7](https://stackoverflow.com/questions/38520295/prevent-stop-auditd-service-in-redhat-7) 有解释

```bash
#systemctl cat auditd
# /usr/lib/systemd/system/auditd.service
[Unit]
Description=Security Auditing Service
DefaultDependencies=no
After=local-fs.target systemd-tmpfiles-setup.service
Conflicts=shutdown.target
Before=sysinit.target shutdown.target
RefuseManualStop=yes
ConditionKernelCommandLine=!audit=0

[Service]
ExecStart=/sbin/auditd -n
## To not use augenrules, copy this file to /etc/systemd/system/auditd.service
## and comment/delete the next line and uncomment the auditctl line.
## NOTE: augenrules expect any rules to be added to /etc/audit/rules.d/
ExecStartPost=-/sbin/augenrules --load
#ExecStartPost=-/sbin/auditctl -R /etc/audit/audit.rules
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
```

原来 systemd 配置中禁止手工停止auditd `RefuseManualStop=yes`

所以改为传统命令停止方式

```
service auditd stop
```

# 清理文件

既然我们已经找出了大量生成文件的原因，除了我哦们需要进一步排查pouch大量生成异常文件的原因，我们还需要做文件清理。但是文件系统中大量文件清理是非常消耗资源和缓慢的，我们需要有一个 [高效清理文件系统大量文件的方法](remove_massive_amounts_of_file)