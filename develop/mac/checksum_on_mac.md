在Mac上，当我们下载一个文件或者软件包之后，类似Linux，我们也需要校验文件完整性，确保没有损坏或者被篡改。

> 一句话总结：
>
> 最好的checksum命令是 `openssl` ，这个是跨平台工具

```bash
openssl <checksum算法> /path/to/file
```

例如

```
openssl md5 WebStorm-2017.1.3.dmg
openssl sha1 WebStorm-2017.1.3.dmg
openssl sha256 WebStorm-2017.1.3.dmg
```

# MD5 checksum

传统上，我们都是用MD5校验：

```
md5 /path/to/file
```

也可以使用 openssl 命令检查:

```bash
openssl md5 WebStorm-2017.1.3.dmg
```

# SHA1校验

为了能更准确安全，现在推荐使用SHA算法

* SHA1校验

```
shasum -a 1 WebStorm-2017.1.3.dmg
```

* openssl也至少SHA1

```
openssl sha1 WebStorm-2017.1.3.dmg
```

# SHA256校验

* SHA256校验

```
shasum -a 256 /path/to/file
```

* 使用openssl更为通用

```
openssl sha256 WebStorm-2017.1.3.dmg
```

# SHA512校验

* SHA512

```
shasum -a 512 /path/to/file
```

* 使用openssl

```
oepnssl sha512 WebStorm-2017.1.3.dmg
```

# 参考

* [How to verify checksum on a Mac - MD5, SHA1, SHA256, etc](https://dyclassroom.com/howto-mac/how-to-verify-checksum-on-a-mac-md5-sha1-sha256-etc)