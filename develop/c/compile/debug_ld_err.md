在`make`程序的时候出现ld报错：

```
/usr/bin/ld: cannot find -ly
collect2: ld returned 1 exit status
make: *** [bnK-lang] Error 1
```

参考 [usr/bin/ld: cannot find -l<nameOfTheLibrary>](https://stackoverflow.com/questions/16710047/usr-bin-ld-cannot-find-lnameofthelibrary) 原来可以通过设置make的DEBUG方式找到报错原因

```
LD_DEBUG=all make
```

这里出现的报错如下

```
     15208:     calling fini: /lib64/libc.so.6 [0]
     15208:
     15207:     symbol=dcgettext;  lookup in file=make [0]
     15207:     symbol=dcgettext;  lookup in file=/lib64/libc.so.6 [0]
     15207:     binding file make [0] to /lib64/libc.so.6 [0]: normal symbol `dcgettext' [GLIBC_2.2.5]
     15207:     symbol=__fprintf_chk;  lookup in file=make [0]
     15207:     symbol=__fprintf_chk;  lookup in file=/lib64/libc.so.6 [0]
     15207:     binding file make [0] to /lib64/libc.so.6 [0]: normal symbol `__fprintf_chk' [GLIBC_2.3.4]
make: *** [bnK-lang] Error 1
     15207:     symbol=chdir;  lookup in file=make [0]
     15207:     symbol=chdir;  lookup in file=/lib64/libc.so.6 [0]
     15207:     binding file make [0] to /lib64/libc.so.6 [0]: normal symbol `chdir' [GLIBC_2.2.5]
     15207:     symbol=exit;  lookup in file=make [0]
     15207:     symbol=exit;  lookup in file=/lib64/libc.so.6 [0]
     15207:     binding file make [0] to /lib64/libc.so.6 [0]: normal symbol `exit' [GLIBC_2.2.5]
     15207:
     15207:     calling fini: make [0]
     15207:
     15207:
     15207:     calling fini: /lib64/libc.so.6 [0]
```