`ssh-keygen` 是一个用于创建新的SSH认证密钥对对工具。这个密钥对用于自动登陆，单一注册以及认证主机。

# SSH密钥和公钥认证

SSH协议使用公钥较密用于认证主机和用户。这个验证密钥，称为SSH keys，是通过keygen程序生成的。

SSH引入的公钥认证比以前基于主机 `.rhosts` 认证要安全很多(原先只比对主机IP地址)，并且公钥认证也避免了需要在文件中存储密码，并降低了不安全服务器窃取用户密码的可能。

然而，SSH密钥是类似密码的认证资格，也就是它们必须通过类似管理用户名和密码进行管理，并且需要能够不再需要密钥是移除它。

# 创建SSH密钥对用于用户认证

- 最简单的生成SSH密钥对方法是使用 `ssh-keygen` 无需参数，此时会提示在哪里存储密钥:

```
ssh-keygen
```

默认的密钥文件名和加密算法相关，并且通常存储在用户目录。当然对于企业环境，存储的位置可能不同。默认使用RSA算法，所以密钥名类似 `id_rsa` 和 `id_rsa.pub` 。也可以选择其他加密算法，生成类似 `id_dsa` 或 `id_ecdsa` 。

交互方式还提供了输入密钥保护密码 `passphrase` ，用于加密密钥，这样其他人就不能获得私钥。

# 选择加密算法和key大小

SSH支持多种认证密钥的公钥算法：

- rsa - 一种公因子大数的旧算法。在RSA建议至少使用2048位；使用4096位更好。注意RSA已经陈旧，选择其他加密算法可能更合适。所有的SSH客户端都支持RAS
- dsa - 一种旧的美国政府数字签名算法，基于难以计算出解密的算法。通常使用2048位。注意，DSA非常陈旧所以不再推荐
- ecdsa - 一种美国政府新的数字签名算法，是当前应用较好的算法。有3中密钥规格，256,384和512位。建议使用 512位，此时密钥依然非常小并且安全性比较小位的密钥好。
- ed25519 - 最新的OpenSSH算法，在 OpenSSH客户端和服务器都支持，但是还没有广泛使用。所以适合非风发都应用程序。

在盛昌密钥时使用`-t`指定算法，并使用  `-b` 来指定密钥长度位数:

```
ssh-keygen -t rsa -b 4096
ssh-keygen -t dsa
ssh-keygen -t ecdsa -b 521
ssh-keygen -t ed25519
```

# 指定生成的文件名

可以通过 `-f <filename>` 指定文件::

   ssh-keygen -f ~/tatu-key-ecdsa -t ecdsa -b 521

# 将公钥复制Server:

要使用公钥认证，公钥必须复制到奥服务器并安装一个 authorized_keys 。这样就能过通过 `ssh-copy-id` 工具复制:

```bash
ssh-copy-id -i ~/.ssh/tatu-key-ecdsa user@host
```

# 将密钥加载到SSH Agent

`ssh-agnet` 是一个可以处理用户私钥的程序，这样私钥保护密码只需要输入一次。一个连接到agent的连接会在需要logging到服务器时被转发，这样就允许服务器上的SSH命令使用运行在用户桌面的agent。

> 详见 [ssh密钥认证](ssh_key)

# 创建主机密钥

主机密钥存储在 `/etc/ssh` 目录。主机密钥也是SSH密钥对。每个主机有一个算法所使用都host密钥。

通常SSH服务器安装时会自动生态城Host key，但是这个host主机密钥对也可以随时生成。但是需要注意，如果主机都主机密钥修改，则客户端可能warn，报告可能存在中间人(mna-in-the-middle)攻击。

# X.509证书用于主机认证

OpenSSH不支持X.509证书。

不过 [Tectia SSH](https://www.ssh.com/products/tectia-ssh/) 支持X.509证书。X.509证书广泛用于大型组织，以便能够基于一个时间周期来更新主机证书以避免客户端不必要报警。

# OpenSSH的专有证书

OpenSSH使用了自己独有的专有证书格式，可以用于签名主机证书或者用户证书。

对于用户身份验证，由于缺乏高度安全的证书颁发机构以及无法通过检查服务器来审核谁可以访问服务器，所以建议不要使用OpenSSH证书进行用户身份验证。

但是，OpenSSH证书非常适合服务器认证，并且可以达到非常类似标准X.509证书的效果。然而，需要自己部署基础架构来颁发证书。

# 密钥管理需要非常小心

虽然非常容易创建新的SSH密钥，但是安全管理证书非常困难。需要精心构建一个安全的管理平台，广泛使用的SSH密钥管理平台工具是 [Universal SSH Key Manager](https://www.ssh.com/products/universal-ssh-key-manager/)

# `确保足够随机`

生成SSH密钥时，确保系统中存在足够不可预测的熵(`unpredictable entropy`)非常重要。

在Internet上曾经发生过由于没有足够的随机生成的服务器密钥导致数千设备使用了相同的主机密钥。

# 通用系统

在通用计算机中，随机生成SSH密钥通常不是问题。在安装OpenSSH服务器时初始生成主机密钥，一般是有SSH软件包需要考虑这个问题。

强烈建议在安装操作系统时收集随机数据，并将随机数据保存到种子文件。然后重新启动系统，在启动过程中再次收集更多的随机数据，然后混合两次采集的随机数据，最后在根据混合后的随机数据来生成主机密钥。这样可以最大程度利用随机性，并确保定期对随机种子文件进行更新，尤其在确保生成SSH主机密钥后对其更新。

很多现代化通用CPU提供了硬件随机数生成器，对解决上述问题很有帮助。最佳时间是结合多种方式收集`熵`，将这些熵保存在随机种子文件中，并从硬件随机数生成器中混合一些熵。这样即使其中之一受到某种程度对损害(例如硬件安全漏洞)，另一个随机数据源也能确保密钥安全。

# 参考

* [ssh-keygen - Generate a New SSH Key](https://www.ssh.com/ssh/keygen/)