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

提示报错

```
ERROR:  Error installing gollum:
	ERROR: Failed to build gem native extension.

    /System/Library/Frameworks/Ruby.framework/Versions/2.0/usr/bin/ruby extconf.rb
checking for main() in -licui18n... no
checking for main() in -licui18n... no
```

根据 [gollum installation](https://github.com/gollum/gollum/wiki/Installation)

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
sudo gem install charlock_holmes -- --with-icu-dir=/usr/local/opt/icu4c
sudo gem install gollum
```

安装完成后，就可以直接启动gollum，可以通过web编辑markdown或者reStructureText格式文档，非常直观方便。