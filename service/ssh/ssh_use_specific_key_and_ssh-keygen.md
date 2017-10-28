在脚本中使用ssh远程登陆执行命令时，需要使用ssh密钥。默认使用的密钥是登陆账号的`~/.ssh/id_rsa`私钥，但是在脚本中，有可能希望指定私钥，并且要求这个私钥没有密码保护，以便能够无需人员干预就自动完成脚本。

# 生成无密码保护的密钥对

`ssh-keygen`工具可以用来生成密钥对，其中参数`-f`用来指定输出文件，`-q -N ""`则生成空白密码的密钥

```
ssh-keygen -b 2048 -t rsa -f id_rsa -q -N ""
```

上述命令执行完成后，会生成密钥对`id_rsa`和`id_rsa.pub`，其中`id_rsa.pub`就是需要复制到目标登陆服务器的公钥。

# 指定登陆密钥

为了避免使用默认的密钥对，ssh使用`-i`参数指定使用密钥对：

```
ssh -i /path/to/id_rsa user@server
```

# 参考

* [Force SSH Client To Use Given Private Key ( identity file )](https://www.cyberciti.biz/faq/force-ssh-client-to-use-given-private-key-identity-file/)