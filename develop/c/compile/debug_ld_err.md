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

# `/usr/bin/ld: cannot find -lc`

在CentOS 8上编译一个简单的c程序，Makefile中指定编译成静态库

* `Makefile`

```makefile
CFLAGS = -Os -Wall -Werror -static -DVERSION=v1.0.0
BIN = pause
SRCS = pause.c

bin: clean
	mkdir -p ./bin
	gcc -v $(CFLAGS) -o ./bin/$(BIN) $(SRCS)

build:
	docker run -it --rm -v $(PWD):/src -w /src gcc make bin

clean:
	rm -rf ./bin

.PHONY: bin clean
```

* `pause.c`

```c
#include <string.h>
#include <stdio.h>
#include <unistd.h>

#define STRINGIFY(x) #x
#define VERSION_STRING(x) STRINGIFY(x)

#ifndef VERSION
#define VERSION HEAD
#endif


int main(int argc, char** argv) {
  int i;
  for (i = 0; i < argc; i++) {
	if(strcasecmp(argv[i], "-v") == 0) {
	  printf("pause.c %s\n", VERSION_STRING(VERSION));
	  return 0;
	}
  }

  for (;;)
	pause();
  fprintf(stderr, "Error: infinite loop terminated\n");
}
```

* 执行 `make` 报错:

```
...
COLLECT_GCC_OPTIONS='-v' '-Os' '-Wall' '-Werror' '-static' '-D' 'VERSION=v1.0.0' '-o' './bin/pause' '-mtune=generic' '-march=x86-64'
 /usr/libexec/gcc/x86_64-redhat-linux/8/collect2 -plugin /usr/libexec/gcc/x86_64-redhat-linux/8/liblto_plugin.so -plugin-opt=/usr/libexec/gcc/x86_64-redhat-linux/8/lto-wrapper -plugin-opt=-fresolution=/tmp/cchETp7U.res -plugin-opt=-pass-through=-lgcc -plugin-opt=-pass-through=-lgcc_eh -plugin-opt=-pass-through=-lc --build-id --no-add-needed --hash-style=gnu -m elf_x86_64 -static -o ./bin/pause /usr/lib/gcc/x86_64-redhat-linux/8/../../../../lib64/crt1.o /usr/lib/gcc/x86_64-redhat-linux/8/../../../../lib64/crti.o /usr/lib/gcc/x86_64-redhat-linux/8/crtbeginT.o -L/usr/lib/gcc/x86_64-redhat-linux/8 -L/usr/lib/gcc/x86_64-redhat-linux/8/../../../../lib64 -L/lib/../lib64 -L/usr/lib/../lib64 -L/usr/lib/gcc/x86_64-redhat-linux/8/../../.. /tmp/ccLUOAd9.o --start-group -lgcc -lgcc_eh -lc --end-group /usr/lib/gcc/x86_64-redhat-linux/8/crtend.o /usr/lib/gcc/x86_64-redhat-linux/8/../../../../lib64/crtn.o
/usr/bin/ld: cannot find -lc
collect2: error: ld returned 1 exit 
make: *** [Makefile:7: bin] Error 1
```

原因参考 [/usr/bin/ld: cannot find -lc while compiling with makefile](https://stackoverflow.com/questions/16024978/usr-bin-ld-cannot-find-lc-while-compiling-with-makefile)

`/usr/bin/ld: cannot find -lc` 报错表示linker找不到静态链接你的库程序的C库。你需要通过 `locate libc.a` 查看一下系统中是否存在 `libc.a` 库文件。如果不存在，则需要安装 `glibc-static` 软件包。

不过，上述 `glibc-static` 软件包在默认repo仓库通道中没有启用，参考 [No package glibc-static available](https://stackoverflow.com/questions/44275897/no-package-glibc-static-available) 

对于CentOS 8，需要激活 `PowerTools` 仓库:

```bash
sudo dnf config-manager --enable powertools
```

然后就可以安装

```
dnf search glibc
dnf provides */libc.a
dnf install glibc-static
```

现在可以编译了