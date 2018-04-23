# 临时系统

`临时系统`一个最小的 Linux 系统。该系统将包含刚刚满足构建最终 LFS 系统所需的工具，以及一个比最小环境具有更好用户便利性的工作环境。 

构建该最小系统有两个步骤：

* 构建一个宿主系统无关的新工具链（编译器、汇编器、链接器、库和一些有用的工具）
* 使用该工具链构建其它的基础工具

> 编译得到的文件将被安装在目录 `$LFS/tools` 中，以使其与安装的文件和宿主系统生成的目录分开。

# 工具链技术备注

工作平台的名称，它通常称作目标系统三段式名称。

目标系统三段式名称可通过运行脚本 `config.guess` 简单获得，许多软件的源码包都附带有该脚本。

> 目标系统三段式名称描述了代码运行的平台，是GNU 构建系统中的一个核心概念，形如 `i686-pc-gnu-linux`。它包含三个字段：CPU家族/型号的名称（如 i686）、供应商（pc）和操作系统名称（如 gnu-linux）。更详细的信息请参阅 http://wiki.osdev.org/Target_Triplet）。

构建方法的几个关键技术点：

* 通过改变 `LFS_TGT` 变量的目标系统三段式中的 “供应商” 字段，从而稍微调整工作平台的名称，以保证第一遍构建 Binutils 和 GCC 时能够生成兼容的交叉链接器和交叉编译器。此处的交叉链接器和交叉编译器生成的二进制文件与当前的硬件兼容，而不是用于其它的硬件架构。
* 临时库经交叉编译获得。由于交叉编译原本就不应该依赖于宿主系统，因此，通过降低宿主系统的头文件或库进入新工具的可能性，该方法可去除目标系统的可能污染。交叉编译的方式，还可以在 64 位硬件平台上同时构建出 32 位和 64 位库。
* 谨慎操作 GCC 源码，以告诉编译器将使用哪个目标系统动态链接器。

## binutils

Binutils 是首个安装的包，这是因为执行 GCC 和 Glibc 的 configure 时都将进行有关汇编器和链接器的多项特性测试，以判断允许或禁用哪些软件特性。

对 GCC 或 Glibc 的错误配置可能导致工具链出现难以捉摸的问题，可能直到整个构建过程接近尾声时才会显现出这些问题。

Binutils 将其汇编器和链接器安装在两个位置，即 `/tools/bin` 和 `/tools/$LFS_TGT/bin`。

链接器的一个重要方面是它的库搜索顺序。可给 `ld` 传递参数 `--verbose` 获得详细信息。如，`ld --verbose | grep SEARCH` 可得到当前的搜索路径及其顺序。

通过编译一个模拟程序并向链接器传递 `--verbose` 开关，可显示 `ld` 都链接了哪些文件。例如，`gcc dummy.c -Wl,--verbose 2>&1 | grep succeeded` 将显示链接过程中成功打开的所有文件。 

## GCC

运行：`gcc -print-prog-name=ld` 可获知 gcc 使用是何种标准链接器。编译模拟程序时，向 `gcc` 传递命令行选项 `-v` 可获得详细信息。例如，`gcc -v dummy.c` 将显示预处理器、编译和汇编阶段的详细信息，包括 `gcc` 的 `include` 搜索路径及其顺序。 

## 经过净化的 Linux API 头文件

经过净化的 Linux API 头文件。这些头文件可使得标准 C 库（Glibc）与 Linux 内核提供的特性进行交行交互。 

## Glibc

构建 Glibc 时，最重要的考量是编译器、二进制工具和内核头文件。

# 第二遍编译

第二遍编译 `Binutils` 过程中，我们能够利用配置开关 `--with-lib-path` 来控制 `ld` 的库搜索路径。

第二遍编译 `GCC` 时，也需要修改其源代码以告诉 `GCC` 使用新的动态链接器。如果不加修改，将会导致 `GCC` 自身的程序嵌入来自宿主系统目录 `/lib` 的动态链接器名称，这将破坏远离宿主系统的目标。

----

# 进入编译环境

```
cd $LFS/sources
```

# Binutils-2.30 - 第一遍

**第一个编译 `Binutils` 软件包很重要，因为 `Glibc` 和 `GCC` 会对可用的链接器和汇编器执行各种测试以决定启用它们自己的哪些功能。**

```
tar xf binutils-2.30.tar.xz
```

> 现代的`tar`工具可以自动检测压缩类型，所以只需要使用`xf`参数，让工具自动检测压缩包类型就可以。

```
cd binutils-2.30
mkdir -v build
cd build
```

> 要检验实际编译安装的时间，可以使用`time`命令，例如` time { ./configure ... && ... && make install; }`

准备

```
../configure --prefix=/tools            \
             --with-sysroot=$LFS        \
             --with-lib-path=/tools/lib \
             --target=$LFS_TGT          \
             --disable-nls              \
             --disable-werror
```

> `--disable-nls`是因为临时系统不需要支持`i18n`

编译

```
make
```

编译完成后，通常现在我们会运行测试套件，但在这个初期阶段，测试套件框架（Tcl、Expect 和 DejaGNU） 还没有就绪。在此进行测试的好处不多，因为第一遍编译的程序很快会被第二遍的代替。

如果是在 x86_64 上编译，创建符号链接，以确保工具链的完整性： 

```
case $(uname -m) in
  x86_64) mkdir -v /tools/lib && ln -sv lib /tools/lib64 ;;
esac
```

安装

```
make install
```

# GCC-7.3.0 - 第一遍

现在 `GCC` 需要 `GMP`、 `MPFR` 和 `MPC` 软件包。在你的主机发行版中可能并不包括这些软件包，它们将和 `GCC` 一起编译。解压每个软件包到 `GCC` 源文件夹并重命名解压后的文件夹，以便 `GCC` 编译过程中能自动使用这些软件： 

```
cd $LFS/sources
tar -xf gcc-7.3.0.tar.xz

cd gcc-7.3.0

tar -xf ../mpfr-4.0.1.tar.xz
mv -v mpfr-4.0.1 mpfr
tar -xf ../gmp-6.1.2.tar.xz
mv -v gmp-6.1.2 gmp
tar -xf ../mpc-1.1.0.tar.gz
mv -v mpc-1.1.0 mpc
```

> [GMP](https://gmplib.org/)是一个开源库，用于任意精确算术运算，可操作有符号整数，有理数和浮点数。
>
> [MPFR](http://www.mpfr.org/)是用于具有正确舍入的多精度浮点计算的C库。
>
> [MPC](http://www.multiprecision.org/mpc/)是一个C语言库，用于对复数进行任意高精度的算术运算并对结果进行正确的舍入。

下面的指令将会修改 `GCC` 默认的动态链接器为安装在 `/tools` 文件夹中的。它也会从 `GCC` 的 `include` 搜索路径中移除 `/usr/include`

```bash
for file in gcc/config/{linux,i386/linux{,64}}.h
do
  cp -uv $file{,.orig}
  sed -e 's@/lib\(64\)\?\(32\)\?/ld@/tools&@g' \
      -e 's@/usr@/tools@g' $file.orig > $file
  echo '
#undef STANDARD_STARTFILE_PREFIX_1
#undef STANDARD_STARTFILE_PREFIX_2
#define STANDARD_STARTFILE_PREFIX_1 "/tools/lib/"
#define STANDARD_STARTFILE_PREFIX_2 ""' >> $file
  touch $file.orig
done
```

> 上述shell解释：
>
> * `gcc/config` 文件夹下的所有命名为 `linux.h`, `linux64.h` 或 `linuxi386.h` 的文件。对于找到的每个文件，我们把它复制到相同名称的文件，但增加了后缀 “.orig”
> * 第一个 sed 表达式在每个 “/lib/ld”, “/lib64/ld” 或 “/lib32/ld” 实例前面增加“/tools”
> * 第二个 sed 表达式替换 “/usr” 的硬编码实例
> * 添加这改变默认 startfile 前缀到文件末尾的定义语句。注意 “/tools/lib/” 后面的 “/” 是必须的
> * 用 `touch` 更新复制文件的时间戳。当与 `cp -u` 一起使用时，可以防止命令被无意中运行两次造成对原始文件意外的更改。

最后，在x86_64主机中，设置默认64位库到`lib`:

```bash
case $(uname -m) in
  x86_64)
    sed -e '/m64=/s/lib64/lib/' \
        -i.orig gcc/config/i386/t-linux64
 ;;
esac
```

GCC文件建议在源文件夹之外一个专门的编译文件夹中编译 GCC：

```bash
mkdir -v build
cd       build
```

准备：

```
../configure                                       \
    --target=$LFS_TGT                              \
    --prefix=/tools                                \
    --with-glibc-version=2.11                      \
    --with-sysroot=$LFS                            \
    --with-newlib                                  \
    --without-headers                              \
    --with-local-prefix=/tools                     \
    --with-native-system-header-dir=/tools/include \
    --disable-nls                                  \
    --disable-shared                               \
    --disable-multilib                             \
    --disable-decimal-float                        \
    --disable-threads                              \
    --disable-libatomic                            \
    --disable-libgomp                              \
    --disable-libmpx                               \
    --disable-libquadmath                          \
    --disable-libssp                               \
    --disable-libvtv                               \
    --disable-libstdcxx                            \
    --enable-languages=c,c++
```

配置选项的含义:

* `--with-newlib`

由于还没有可用的 C 库，这确保编译 `libgcc` 时定义了常数 `inhibit_libc`。这可以防止编译任何需要 `libc` 支持的代码。

* `--without-headers`

创建一个完成的交叉编译器的时候，GCC 要求标准头文件和目标系统兼容。对于我们的目的来说，不需要这些头文件。这个选项可以防止 GCC 查找它们。

* `-with-native-system-header-dir=/tools/include`

GCC 默认会在`/usr/include` 中查找系统头文件。和 `sysroot` 选项一起使用，会转换为 `$LFS/usr/include`。头文件会被安装到 `$LFS/tools/include`。这个选项确保 gcc 能正确找到它们。第二次编译 GCC 时，同样的选项可以保证不会去寻找主机系统的头文件。

* `--disable-shared`

这个选项强制 GCC 静态链接到它的内部库。我们这样做是为了避免与主机系统可能出现的问题。

* `--disable-decimal-float, --disable-threads, --disable-libatomic, --disable-libgomp, --disable-libitm, --disable-libquadmath, --disable-libsanitizer, --disable-libssp, --disable-libvtv, --disable-libcilkrts, --disable-libstdc++-v3`

这些选项取消了对十进制浮点数扩展、线程化、libatomic、 libgomp、 libitm、 libquadmath、 libsanitizer、 libssp、 libvtv、 libcilkrts 和 C++ 标准库的支持。这些功能在编译交叉编译器的时候会导致编译失败，对于交叉编译 临时 libc 来说也没有必要。

* `--disable-multilib`

在 x86_64 机器上， LFS 还不支持 multilib 配置。这个选项对 x86 来说无害。

*  `--enable-languages=c,c++`

这个选项确保只编译 C 和 C++ 编译器。这些是现在唯一需要的语言。

编译：

```
make
```

安装:

```
make install
```

#  Linux-4.16.1 API 头文件

Linux API 头文件（在 `linux-4.16.1.tar.xz` 中）展示了供 Glibc 使用的内核 API。 

Linux 内核需要展示供系统 C 库（在 LFS 中是 Glibc）使用的应用程序编程接口（API）。 这通过在 Linux 内核源代码 tar 包中包括一些 C 头文件来完成。

```
cd $LFS/sources
tar xf linux-4.16.1.tar.xz

cd linux-4.16.1
```

确认这里没有陈旧的文件且不依赖于之前的操作：

```
make mrproper
```

从源代码中提取用户可见的内核头文件。把他们保存在一个临时本地文件夹中然后复制到所需的位置， 因为解压过程会移除目标文件夹中任何已有的文件。

```
make INSTALL_HDR_PATH=dest headers_install
cp -rv dest/include/* /tools/include
```

# Glibc-2.27

> Glibc 软件包包括主要的 C 库。这个库提供了基本的内存分配、文件夹搜素、读写文件、字符串处理、模式匹配、算术等等例程。 

```
cd $LFS/sources
tar xf glibc-2.27.tar.xz

cd glibc-2.27
```

Glibc 手册建议在源文件夹之外的一个专用文件夹中编译 Glibc：

```
mkdir -v build
cd       build
```

准备

```
../configure                             \
      --prefix=/tools                    \
      --host=$LFS_TGT                    \
      --build=$(../scripts/config.guess) \
      --enable-kernel=3.2             \
      --with-headers=/tools/include      \
      libc_cv_forced_unwind=yes          \
      libc_cv_c_cleanup=yes
```

* `--host=$LFS_TGT`

这些选项的组合效果是 Glibc 的构建系统配置它自己用 /tools 里面的交叉链接器和交叉编译器交叉编译自己。

* `--enable-kernel=3.2`

这告诉 Glibc 编译能支持 Linux 3.2 以及之后的内核库。更早的内核版本不受支持。

* `--with-headers=/tools/include`

告诉 Glibc 利用刚刚安装在 tools 文件夹中的头文件编译自身，此能够根据内核的具体特性提供更好的优化。

* `libc_cv_forced_unwind=yes`

由于依赖于工作的链接器，这意味着 `force-unwind` 支持的配置测试会失败。将 `libc_cv_forced_unwind=yes` 变量传递进去告诉 `configure` 命令 `force-unwind` 支持是可用的，不需要进行测试。

* `libc_cv_c_cleanup=yes`

类似的，传递 `libc_cv_c_cleanup=yes` 到 `configure` 脚本跳过测试就完成了 C 清理支持的配置。

* `libc_cv_ctors_header=yes`

类似的，我们传递 `libc_cv_ctors_header=yes` 到 `configure` 脚本跳过测试就完成了 gcc 构建器支持的配置。

编译软件包：

```
make
```

安装软件包：

```
make install
```

确认新工具链的基本功能(编译和链接)都是像预期的那样正常工作。运行下面的命令进行全面的检查： 

```
echo 'int main(){}' > dummy.c
$LFS_TGT-gcc dummy.c
readelf -l a.out | grep ': /tools'
```

如果一切工作正常的话，这里应该没有错误，最后一个命令的输出形式会是：

```
[Requesting program interpreter: /tools/lib64/ld-linux-x86-64.so.2]
```

一旦一切都顺利，清理测试文件：

```
rm -v dummy.c a.out
```

# Libstdc++-7.3.0

> Libstdc++ 是标准的 C++ 库。g++ 编译器正确运行需要它。

Libstdc++ 是 GCC 源文件的一部分。你首先应该解压 GCC 的压缩包，然后进入 `gcc-7.3.0` 文件夹。

```
cd $LFS/sources
# 清理上次源代码目录
rm -rf gcc-7.3.0
tar xf gcc-7.3.0.tar.xz
cd gcc-7.3.0
```

为 Libstdc++ 创建一个文件夹并进入： 

```
mkdir -v build
cd       build
```

准备

```
../libstdc++-v3/configure           \
    --host=$LFS_TGT                 \
    --prefix=/tools                 \
    --disable-multilib              \
    --disable-nls                   \
    --disable-libstdcxx-threads     \
    --disable-libstdcxx-pch         \
    --with-gxx-include-dir=/tools/$LFS_TGT/include/c++/7.3.0
```

配置选项的含义:

* `--host=$LFS_TGT`

指示使用我们刚才编译的交叉编译器，而不是 `/usr/bin` 中的。 

* `--disable-libstdcxx-threads`

由于我们还没有编译 C 线程库，C++ 的也还不能编译。

* `--disable-libstdcxx-pch`

此选项防止安装预编译文件，此步骤并不需要。

* `--with-gxx-include-dir=/tools/$LFS_TGT/include/c++/7.3.0`

这是 C++ 编译器搜索标准 include 文件的位置。在一般的编译中，这个信息自动从顶层文件夹中传入 Libstdc++ configure 选项。在我们的例子中，必须明确给出这信息。

编译 libstdc++:

```
make
```

安装库:

```
make install
```

# Binutils-2.30 - 第2遍

> Binutils 软件包包括一个链接器，汇编器和其它处理目标文件的工具。 

再次新建一个单独的编译文件夹：

```
cd $LFS/sources
cd binutils-2.30

mkdir -v binutils-build
cd binutils-build
```

准备编译 Binutils: 

```
CC=$LFS_TGT-gcc                \
AR=$LFS_TGT-ar                 \
RANLIB=$LFS_TGT-ranlib         \
../configure                   \
    --prefix=/tools            \
    --disable-nls              \
    --disable-werror           \
    --with-lib-path=/tools/lib \
    --with-sysroot
```

* `CC=$LFS_TGT-gcc AR=$LFS_TGT-ar RANLIB=$LFS_TGT-ranlib`

因为这是真正的原生编译 Binutils，设置这些变量能确保编译系统使用交叉编译器和相关的工具，而不是宿主系统中已有的。

* `--with-lib-path=/tools/lib`

这告诉配置脚本在编译 Binutils 的时候指定库搜索目录，此处将 `/tools/lib` 传递到链接器。这可以防止链接器搜索宿主系统的库目录。

* `--with-sysroot`

sysroot 功能使链接器可以找到包括在其命令行中的其它共享对象明确需要的共享对象。 否则的话，在某些主机上一些软件包可能会编译不成功。

编译软件包:

```
make
```

安装软件包:

```
make install
```

为“再调整”阶段准备链接器：

```
make -C ld clean
make -C ld LIB_PATH=/usr/lib:/lib
cp -v ld/ld-new /tools/bin
```

* `-C ld clean`

告诉 make 程序移除所有 ld 子目录中编译过的文件。

* `-C ld LIB_PATH=/usr/lib:/lib`

这个选项重新编译 ld 子目录中的所有文件。在命令行中指定 Makefile 的 LIB_PATH 变量可以使我们能够重写临时工具的默认值并指向正确的最终路径。该变量的值指定链接器的默认库搜索路径。

# GCC-7.3.0 - 第2遍

> GCC 软件包包含 GNU 编译器集合，其中有 C 和 C++ 编译器。 

第一次编译 GCC 的时候安装了一些内部系统头文件。其中的一个 `limits.h` 会反过来包括对应的系统头文件 `limits.h`， 在我们的例子中，是 `/tools/include/limits.h`。但是，第一次编译 gcc 的时候 `/tools/include/limits.h` 并不存在，因此 GCC 安装的内部头文件只是部分的自包含文件， 并不包括系统头文件的扩展功能。这足以编译临时 libc，但是这次编译 GCC 要求完整的内部头文件。 使用和正常情况下 GCC 编译系统使用的相同的命令创建一个完整版本的内部头文件：

```
cd $LFS/sources
# 清理上次源代码目录
rm -rf gcc-7.3.0
tar xf gcc-7.3.0.tar.xz
cd gcc-7.3.0
```

```
cat gcc/limitx.h gcc/glimits.h gcc/limity.h > \
  `dirname $($LFS_TGT-gcc -print-libgcc-file-name)`/include-fixed/limits.h
```

再一次更改 GCC 的默认动态链接器的位置，使用安装在 /tools 的那个

```
for file in gcc/config/{linux,i386/linux{,64}}.h
do
  cp -uv $file{,.orig}
  sed -e 's@/lib\(64\)\?\(32\)\?/ld@/tools&@g' \
      -e 's@/usr@/tools@g' $file.orig > $file
  echo '
#undef STANDARD_STARTFILE_PREFIX_1
#undef STANDARD_STARTFILE_PREFIX_2
#define STANDARD_STARTFILE_PREFIX_1 "/tools/lib/"
#define STANDARD_STARTFILE_PREFIX_2 ""' >> $file
  touch $file.orig
done
```

在x86_64上编译，需要将默认的64位库目录更改为`lib`

```
case $(uname -m) in
  x86_64)
    sed -e '/m64=/s/lib64/lib/' \
        -i.orig gcc/config/i386/t-linux64
  ;;
esac
```

和第一次编译 GCC 一样，它要求 GMP、MPFR 和 MPC 软件包。 解压 tar 包并把它们重名为到所需的文件夹名称： 

```
tar -xf ../mpfr-4.0.1.tar.xz
mv -v mpfr-4.0.1 mpfr
tar -xf ../gmp-6.1.2.tar.xz
mv -v gmp-6.1.2 gmp
tar -xf ../mpc-1.1.0.tar.gz
mv -v mpc-1.1.0 mpc
```

再次创建独立的编译文件夹：

```
mkdir -v build
cd       build
```

在开始编译 GCC 之前，记住取消所有会覆盖默认优化选项的环境变量。 

```
CC=$LFS_TGT-gcc                                    \
CXX=$LFS_TGT-g++                                   \
AR=$LFS_TGT-ar                                     \
RANLIB=$LFS_TGT-ranlib                             \
../configure                                       \
    --prefix=/tools                                \
    --with-local-prefix=/tools                     \
    --with-native-system-header-dir=/tools/include \
    --enable-languages=c,c++                       \
    --disable-libstdcxx-pch                        \
    --disable-multilib                             \
    --disable-bootstrap                            \
    --disable-libgomp
```

新配置选项的含义:

* `--enable-languages=c,c++`

这个选项确保编译了 C 和 C++ 编译器。

* `--disable-libstdcxx-pch`

不为 libstdc++ 编译预编译的头文件(PCH)。这会花费很多时间，却对我们没有用处。

* `--disable-bootstrap`

对于原生编译的 GCC，默认是做一个“引导”构建。这不仅会编译 GCC，而且会多次编译。 它用第一次编译的程序去第二次编译自己，然后同样进行第三次。 比较第二次和第三次迭代确保它可以完美复制自身。这也意味着已经成功编译。 但是，LFS 的构建方法能够提供一个稳定的编译器，而不需要每次都重新引导。

编译软件包:

```
make
```

安装软件包:

```
make install
```

很多程序和脚本执行 `cc` 而不是 `gcc` 来保持程序的通用性， 因而在所有并不总是安装了 GNU C 编译器的 Unix 类型的系统上都可以使用。 运行 `cc` 使得系统管理员不用考虑要安装那种 C 编译器：

```
ln -sv gcc /tools/bin/cc
```

> `注意`
>
> 到了这里，必须停下来确认新工具链的基本功能(编译和链接)都是像预期的那样正常工作。运行下面的命令进行全面的检查： 

```
echo 'int main(){}' > dummy.c
cc dummy.c
readelf -l a.out | grep ': /tools'
```

如果一切工作正常的话，这里应该没有错误，最后一个命令的输出形式会是： 

```
[Requesting program interpreter: /tools/lib64/ld-linux-x86-64.so.2]
```

一旦一切都顺利，清理测试文件：

```
rm -v dummy.c a.out
```

# Tcl-8.6.8

> Tcl软件包包含工具命令语言（Tool Command Language）相关程序。 Tcl和后面三个包（Expect、DejaGNU 和 Check）用来为 GCC 和 Binutils 还有其他的一些软件包的测试套件提供运行支持。

```
cd $LFS/sources
tar xf tcl8.6.8-src.tar.gz
cd tcl8.6.8
```

准备

```
cd unix
./configure --prefix=/tools
```

编译软件包：

```
make
```

安装软件包：

```
make install
```

让安装的库文件可写，这样之后可以删除调试符号。

```
chmod -v u+w /tools/lib/libtcl8.6.so
```

安装Tcl的头文件。后面的Expect软件包在编译的时候要用到。

```
make install-private-headers
```

创建几个必要的软链接：

```
ln -sv tclsh8.6 /tools/bin/tclsh
```

# Expect-5.45.4

> Expect 软件包包含一个实现用脚本和其他交互式程序进行对话的程序。 

```
cd $LFS/sources
tar xf expect5.45.4.tar.gz
cd expect5.45.4
```

首先，强制 `Expect` 的 `configure` 配置脚本使用 `/bin/stty` 替代宿主机系统里可能存在的 `/usr/local/bin/stty`。这样可以保证我们的测试套件工具在工具链的最后一次构建能够正常。 

```
cp -v configure{,.orig}
sed 's:/usr/local/bin:/bin:' configure.orig > configure
```

现在配置 Expect 准备编译： 

```
./configure --prefix=/tools       \
            --with-tcl=/tools/lib \
            --with-tclinclude=/tools/include
```

配置脚本参数的含义：

* `--with-tcl=/tools/lib`

这个选项可以保证 `configure` 配置脚本会从临时工具目录里找 Tcl 的安装位置， 而不是在宿主机系统中寻找。

* `--with-tclinclude=/tools/include`

这个选项会给 Expect 显式地指定 Tcl 内部头文件的位置。通过这个选项可以避免 configure 脚本不能自动发现 Tcl 头文件位置的情况。

编译软件包：

```
make
```

安装软件包：

```
make SCRIPTS="" install
```

make参数的含义：

* `SCRIPTS=""`

这个变量可以避免安装额外的 Expect 脚本，没有必要。

# DejaGNU-1.6.1

> DejaGNU 软件包包含了测试其他程序的框架。 

```
cd $LFS/sources
tar xf dejagnu-1.6.1.tar.gz
cd dejagnu-1.6.1
```

配置 DejaGNU 准备编译：

```
./configure --prefix=/tools
```

编译

```
make
```

编译安装软件包：

```
make install
```

# M4-1.4.18

> DejaGNU 软件包包含了宏处理器

```
cd $LFS/sources
tar xf m4-1.4.18.tar.xz
cd m4-1.4.18
```

准备编译：

```
./configure --prefix=/tools
```

编译

```
make
```

编译安装软件包：

```
make install
```

# Ncurses-6.1

> Ncurses 软件包包含与终端无关的处理字符界面的库。 

```
cd $LFS/sources
tar xf ncurses-6.1.tar.gz
cd ncurses-6.1
```

确保`gawk`在配置时能够首先找到：

```
sed -i s/mawk// configure
```

准备：

```
./configure --prefix=/tools \
            --with-shared   \
            --without-debug \
            --without-ada   \
            --enable-widec  \
            --enable-overwrite
```

* `--without-ada`

这个选项会保证 Ncurse 不会编译对宿主机系统里可能存在的 Ada 编译器的支持， 而这在我们 chroot 切换环境后就不再可用。

* `--enable-overwrite`

这个选项会告诉 Ncurses 安装它的头文件到 `/tools/include` 目录， 而不是 `/tools/include/ncurses` 目录， 保证其他软件包可以正常找到 Ncurses 的头文件。

* `--enable-widec`

这个选项会控制编译宽字符库（比如， `libncursesw.so.6.1`） 而不是默认的普通库（比如，`libncurses.so.6.1`）。 这些宽字符库在多字节和传统的 8 位环境下使用，而普通库只能用于 8 位环境。 宽字符库和普通库的源代码是兼容的，但并不是二进制兼容。

编译

```
make
```

安装

```
make install
```

# Bash-4.4.18

> Bash 软件包包含 Bourne-Again SHell 终端程序。

```
cd $LFS/sources
tar xf bash-4.4.18.tar.gz
cd bash-4.4.18
```

配置 Bash 准备编译：

```
./configure --prefix=/tools --without-bash-malloc
```

* `--without-bash-malloc`

这个选项会禁用 Bash 的内存分配功能（malloc）， 这个功能已知会导致段错误。而禁用这个功能后，Bash 将使用 Glibc 的 malloc 函数，这样会更稳定。

编译软件包：

```
make
```

安装软件包：

```
make install
```

为使用 sh 终端的程序创建一个软链接：

```
ln -sv bash /tools/bin/sh
```

# Bison-3.0.4

> Bison 软件包包含一个语法分析生成器

```
cd $LFS/sources
tar xf bison-3.0.4.tar.xz
cd bison-3.0.4
```

准备：

```
./configure --prefix=/tools
```

编译：

```
make
```

安装：

```
make install
```

# Bzip2-1.0.6

> Bzip2 软件包包含压缩和解压文件的工具。 用 bzip2 压缩文本文件比传统的 gzip 压缩比高得多。 

```
cd $LFS/sources
tar xf bzip2-1.0.6.tar.gz
cd bzip2-1.0.6
```

Bzip2 软件包里没有 configure 配置脚本。用下面的命令编译和测试：

```
make
```

安装软件包：

```
make PREFIX=/tools install
```

# Coreutils-8.29

> Coreutils 软件包包含一套用于显示和设定基本系统属性的工具。 

```
cd $LFS/sources
tar xf coreutils-8.29.tar.xz
cd coreutils-8.29
```

配置 Coreutils 准备编译：

```
./configure --prefix=/tools --enable-install-program=hostname
```

* `--enable-install-program=hostname`

这个选项会允许编译和安装 hostname 程序 – 默认是不安装的但是 Perl 测试套件需要它。

编译软件包：

```
make
```

安装软件包：

```
make install
```

# Diffutils-3.6

> Diffutils软件包包含用来比较文件或目录之间差异的工具。 

```
cd $LFS/sources
tar xf diffutils-3.6.tar.xz
cd diffutils-3.6
```

配置 Diffutils 准备编译：

```
./configure --prefix=/tools
```

编译软件包：

```
make
```

安装软件包：

```
make install
```

# File-5.32

> File 软件包包含用来判断文件类型的工具。 

```
cd $LFS/sources
tar xf file-5.32.tar.gz
cd file-5.32
```

配置 File 准备编译：

```
./configure --prefix=/tools
```

编译软件包：

```
make
```

安装软件包：

```
make install
```

# Findutils-4.6.0

> Findutils 软件包包含用来查找文件的工具。这些工具可以用来在目录树中递归查找，或者创建、维护和搜索数据库（一般会比递归查找快，但是如果不经常更新数据库的话结果不可靠）。 

```
cd $LFS/sources
tar xf findutils-4.6.0.tar.gz
cd findutils-4.6.0
```

配置 Findutils 准备编译：

```
./configure --prefix=/tools
```

编译软件包：

```
make
```

安装软件包：

```
make install
```

# Gawk-4.2.1

> Gawk 软件包包含处理文本文件的工具。 

```
cd $LFS/sources
tar xf gawk-4.2.1.tar.xz
cd gawk-4.2.1
```

配置 Gawk 准备编译：

```
./configure --prefix=/tools
```

编译软件包：

```
make
```

安装软件包：

```
make install
```

# Gettext-0.19.8.1

> Gettext 软件包包含了国际化和本地化的相关应用。它支持程序使用 NLS（本地语言支持）编译，允许程序用用户本地语言输出信息。 

```
cd $LFS/sources
tar xf gettext-0.19.8.1.tar.xz
cd gettext-0.19.8.1
```

对于我们这次用到的临时工具集，我们只需要编译安装 Gettext 软件包里的3个程序。

配置 Gettext 准备编译： 

```
cd gettext-tools
EMACS="no" ./configure --prefix=/tools --disable-shared
```

配置脚本参数的含义：

* `EMACS="no"`

这个选项会禁止配置脚本侦测安装 Emacs Lisp 文件的位置，已知在某些系统中会引起错误。

* `--disable-shared`

这次我们不需要安装任何的 Gettext 动态库，所以不需要编译。

编译软件包：

```
make -C gnulib-lib
make -C intl pluralx.c
make -C src msgfmt
make -C src msgmerge
make -C src xgettext
```

因为只编译了3个程序，不编译 Gettext 的额外支持库的话测试套件不可能成功运行。所以在这个阶段不建议尝试运行测试套件。

安装`msgfmt`、`msgmerge`和`xgettext`程序：

```
cp -v src/{msgfmt,msgmerge,xgettext} /tools/bin
```

# Grep-3.1

> Grep 软件包包含了在文件中搜索的工具。 

```
cd $LFS/sources
tar xf grep-3.1.tar.xz
cd grep-3.1
```

配置 Grep 准备编译：

```
./configure --prefix=/tools
```

编译软件包：

```
make
```

安装软件包：

```
make install
```

# Gzip-1.9

> Gzip 软件包包含压缩和解压缩文件的工具。

```
cd $LFS/sources
tar xf gzip-1.9.tar.xz
cd gzip-1.9
```

配置 Gzip 准备编译：

```
./configure --prefix=/tools
```

编译软件包：

```
make
```

安装软件包：

```
make install
```

# Make-4.2.1

> Make 软件包包含了一个用来编译软件包的程序。 

```
cd $LFS/sources
tar xf make-4.2.1.tar.bz2
cd make-4.2.1
```

配置 Make 准备编译：

```
./configure --prefix=/tools --without-guile
```

配置脚本参数的含义：

* `--without-guile`

这个选项会保证 `Make-4.2.1` 不会链接宿主系统上可能存在的 Guile 库

编译软件包：

```
make
```

报错：

```
glob/libglob.a(glob.o): In function `glob_in_dir':
/mnt/lfs/sources/make-4.2.1/glob/glob.c:1367: undefined reference to `__alloca'
...
```

上述报错在[Make fails to build with `make-4.2/glob/glob.c:1367: undefined reference to `__alloca'` #352](https://github.com/osresearch/heads/issues/352)有相同情况，反馈是在debian sid中编译make 4.2存在报错，但是使用debian stretch则工作正常。

准备更改ubuntu 16.4到最新版本，然后重新开始LFS编译。