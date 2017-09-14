在shell脚本中，很多时候需要使用ssh远程执行服务器上指令。通常会使用ssh密钥认证，但是，在没有部署密钥的时候，通过密码登录，则存在一个交互步骤。

如何让脚本自动执行而无需人工干预呢？

`sshpass`工具提供了密码传递给`ssh`免交互的方法：

```
sshpass -p "YOUR_PASSWORD" ssh -o StrictHostKeyChecking=no YOUR_USERNAME@SOME_SITE.COM
```

注意：在脚本中直接保存明文密码是非常危险的。所以，建议把明文密码保存在独立文件中，并设置文件权限为`600`，避免其他用户查看。

# 参考

* [Automatically enter SSH password with script](https://stackoverflow.com/questions/12202587/automatically-enter-ssh-password-with-script)