gitlab内建了一个wiki系统，称为gollum，可以通过git下载和上传撰写wiki文档，就好像在编程一般。

# 使用gollum

* 安装gollum

```
gem install gollum
```

* Clone Wiki

```
git clone git@gitlab.example.com:doc_project/my_doc.wiki.git
```

* 启动本地gollum

```
cd cpr_support.wiki
gollum
```

此时访问端口 http://IP:4567 就可以看到wiki

# Mac平台安装gollum

在macOS上安装 gollum 会出现需要依赖 icu4c 的报错，参考 [gollum installation](https://github.com/gollum/gollum/wiki/Installation)

> 需要切换到root用户身份安装

```
brew install icu4c
```

提示

```
If you need to have this software first in your PATH run:
  echo 'export PATH="/usr/local/opt/icu4c/bin:$PATH"' >> ~/.bash_profile
  echo 'export PATH="/usr/local/opt/icu4c/sbin:$PATH"' >> ~/.bash_profile

For compilers to find this software you may need to set:
    LDFLAGS:  -L/usr/local/opt/icu4c/lib
    CPPFLAGS: -I/usr/local/opt/icu4c/include
```

```
gem install charlock_holmes -- --with-icu-dir=/usr/local/opt/icu4c
gem install gollum
```

安装完成后，就可以直接启动gollum，可以通过web编辑markdown或者reStructureText格式文档，非常直观方便。

## macOS 安装gollum

