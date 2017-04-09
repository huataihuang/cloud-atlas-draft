在排查系统内核crash时，需要升级CentOS/RHEL 5自带的crash工具，否则会提示

```
crash: cannot resolve: "xtime"
```

从[crash官网](http://people.redhat.com/anderson/)下载源代码，在CentOS 5.11上编译（默认使用了最小化安装操作系统），发现有如下报错

```
c-exp.o: In function `main':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/c-exp.c:1: multiple definition of `main'
../../crashlib.a(main.o):/home/huatai/crash-7.1.8/main.c:81: first defined here
/usr/bin/ld: Warning: size of symbol `main' changed from 13344 in ../../crashlib.a(main.o) to 3 in c-exp.o
cp-name-parser.o: In function `main':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-name-parser.c:1: multiple definition of `main'
../../crashlib.a(main.o):/home/huatai/crash-7.1.8/main.c:81: first defined here
f-exp.o: In function `main':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/f-exp.c:1: multiple definition of `main'
../../crashlib.a(main.o):/home/huatai/crash-7.1.8/main.c:81: first defined here
p-exp.o: In function `main':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/p-exp.c:1: multiple definition of `main'
../../crashlib.a(main.o):/home/huatai/crash-7.1.8/main.c:81: first defined here
go-exp.o: In function `parse_string_or_char':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/go-exp.y:943: undefined reference to `c_parse_escape'
macroexp.o: In function `get_string_literal':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/macroexp.c:418: undefined reference to `c_parse_escape'
macroexp.o: In function `get_character_constant':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/macroexp.c:364: undefined reference to `c_parse_escape'
c-lang.o:(.rodata+0x368): undefined reference to `c_parse'
c-lang.o:(.rodata+0x370): undefined reference to `c_error'
c-lang.o:(.rodata+0x488): undefined reference to `c_parse'
c-lang.o:(.rodata+0x490): undefined reference to `c_error'
c-lang.o:(.rodata+0x5a8): undefined reference to `c_parse'
c-lang.o:(.rodata+0x5b0): undefined reference to `c_error'
c-lang.o:(.rodata+0x6c8): undefined reference to `c_parse'
c-lang.o:(.rodata+0x6d0): undefined reference to `c_error'
d-lang.o:(.rodata+0x1e8): undefined reference to `c_parse'
d-lang.o:(.rodata+0x1f0): undefined reference to `c_error'
f-lang.o:(.rodata+0x28): undefined reference to `f_parse'
f-lang.o:(.rodata+0x30): undefined reference to `f_error'
objc-lang.o:(.rodata+0x28): undefined reference to `c_parse'
objc-lang.o:(.rodata+0x30): undefined reference to `c_error'
opencl-lang.o:(.rodata+0x328): undefined reference to `c_parse'
opencl-lang.o:(.rodata+0x330): undefined reference to `c_error'
p-lang.o:(.rodata+0x2a8): undefined reference to `pascal_parse'
p-lang.o:(.rodata+0x2b0): undefined reference to `pascal_error'
cp-support.o: In function `cp_remove_params':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:876: undefined reference to `cp_demangled_name_to_comp'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:903: undefined reference to `cp_demangled_name_parse_free'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:901: undefined reference to `cp_comp_to_string'
cp-support.o: In function `cp_func_name':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:847: undefined reference to `cp_demangled_name_to_comp'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:855: undefined reference to `cp_comp_to_string'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:857: undefined reference to `cp_demangled_name_parse_free'
cp-support.o: In function `cp_canonicalize_string':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:582: undefined reference to `cp_demangled_name_to_comp'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:587: undefined reference to `cp_comp_to_string'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:588: undefined reference to `cp_demangled_name_parse_free'
cp-support.o: In function `mangled_name_to_comp':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:644: undefined reference to `cp_demangled_name_to_comp'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:629: undefined reference to `cp_new_demangle_parse_info'
cp-support.o: In function `method_name_from_physname':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:826: undefined reference to `cp_comp_to_string'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:830: undefined reference to `cp_demangled_name_parse_free'
cp-support.o: In function `cp_class_name_from_physname':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:738: undefined reference to `cp_comp_to_string'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:743: undefined reference to `cp_demangled_name_parse_free'
cp-support.o: In function `replace_typedefs':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:441: undefined reference to `cp_comp_to_string'
cp-support.o: In function `replace_typedefs_qualified_name':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:368: undefined reference to `cp_comp_to_string'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:343: undefined reference to `cp_comp_to_string'
cp-support.o: In function `cp_canonicalize_string_full':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:534: undefined reference to `cp_demangled_name_to_comp'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:541: undefined reference to `cp_comp_to_string'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:545: undefined reference to `cp_demangled_name_parse_free'
cp-support.o: In function `inspect_type':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:260: undefined reference to `cp_demangled_name_to_comp'
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:264: undefined reference to `cp_merge_demangle_parse_infos'
cp-support.o: In function `do_demangled_name_parse_free_cleanup':
/home/huatai/crash-7.1.8/gdb-7.6/gdb/cp-support.c:108: undefined reference to `cp_demangled_name_parse_free'
collect2: ld returned 1 exit status
make[3]: *** [gdb] Error 1
make[2]: *** [rebuild] Error 2
make[1]: *** [gdb_merge] Error 2
make: *** [all] Error 2
```

安装`bison` 之后，报错依旧，再安装`byacc`还是没有解决。我又安装了`gdb`之后，还是`make`报错

参考 [crash-7.0.2 is available](https://www.redhat.com/archives/crash-utility/2013-September/msg00000.html)

```
- Added "bison" to the BuildRequires line of the crash.spec file.
   Without the patch, the build of the embedded gdb-7.6 module will fail
   unless either /usr/bin/bison or /usr/bin/yacc are available.  The 
   failure will result in a stream of error messages from different 
   files that indicate:
 
     multiple definition of 'main'
     undefined reference to 'c_parse_escape'
     undefined reference to 'ada_parse'
     undefined reference to 'ada_error'
     undefined reference to 'c_parse'
     undefined reference to 'c_error'
     undefined reference to 'cp_demangled_name_to_comp'
     undefined reference to 'cp_demangled_name_parse_free'
     undefined reference to 'cp_comp_to_string'
     undefined reference to 'cp_new_demangle_parse_info'
     
   and the build fails like so:
 
     collect2: ld returned 1 exit status
     make[4]: *** [gdb] Error 1
     crash build failed
     
   If building with rpmbuild, the new BuildRequires "bison" entry will 
   prevent the build from initiating unless the bison package has been
   installed.  If building with the tar.gz file, the build attempt will
   proceed and fail unless either the bison or byacc (Berkeley Yacc) 
   package is installed.
   (anderson redhat com)
```

再次尝试，发现删除掉`crash`源代码目录，重新解压缩源代码包，重新`make`之后可以成功编译。
