通常编写shell脚本时，传递参数采用一定顺序，用 `$1` 表示第一个参数，`$2`表示第二个参数，依次类推。（ [shell的特殊变量](special_shell_variable) ）

这种顺序传递参数方法的限制主要是：

* 只能按照顺序传递参数
* 参数不能有空缺，即使有些情况不需要某个参数，也得传递一个表示不使用此参数的值

bash提供了稍微专业一些的参数处理工具：`getops`和`getopt`。

# bash内置`getops`

`getops`传递参数其实还是很简陋的，只能传递单个字符来代表某个设置值

```bash
#!/bin/bash
while getopts 'd:Dm:f:t:' OPT; do
    case $OPT in
        d)
            DEL_DAYS="$OPTARG";;
        D)
            DEL_ORIGINAL='yes';;
        f)
            DIR_FROM="$OPTARG";;
        m)
            MAILDIR_NAME="$OPTARG";;
        t)
            DIR_TO="$OPTARG";;
        ?)
            echo "Usage: `basename $0` [options] filename"
    esac
done

shift $(($OPTIND - 1))

echo "DEL_DAYS: $DEL_DAYS"
```

`getopts`之后的字符串是可用选项列表，每个字母表示一个选项，每个选项字母之后使用一个`:`符号表示选项除了定义自身以外，还会带上参数作为选项的值。例如`d:`在使用中会对应使用`-d 30`这样个方式给选项赋值。而没有带`:`选项表示这个选项是开关选项，不需要指定值，即`true/false`。带上选项表示`true`，没有带选项就是`false`。

如果命令行带了没有在`getopts`列表中的选项会有警告。如果在整个`getopts`字符串前面加上一个`:`就能够消除警告信息。

操作中有两个固定的 **常量** ，`OPTARG`用来选取当前选项的值；另一个是`OPTIND`代表当前选项在参数列表中的位移。

`case`中最后一个选项`?`表示出现了不认识的选项所进行的操作。

选项参数识别完成之后，如果要取剩余的其它命令行参数，可以使用shift把选项参数抹去，就像例子里面的那样，对整个参数列表进行左移操作，最左边的参数就丢失了（已经用`case`判断并进行了处理，不再需要了），位移的长度正好是刚才`case`循环完毕之后的`OPTIND - 1`，因为参数从`1`开始编号，选项处理完毕之后，正好指向剩余其它参数的第一个。

另外需要注意：`getopts`在处理参数的时候，处理一个开关型选项，`OPTIND`加`1`，处理一个带值的选项参数，`OPTIND`则会加`2`。

最后，真正需要处理的参数就是`$1~$#`了，可以用`for`循环依次处理。

`getopts`处理参数限制：

* 选项参数的格式必须是`-d val`，而不能是中间没有空格的`-dval`
* **所有选项参数必须写在其它参数的前面，因为getopts是从命令行前面开始处理，遇到非-开头的参数，或者选项参数结束标记--就中止了，如果中间遇到非选项的命令行参数，后面的选项参数就都取不到了。**
* 不支持长选项， 也就是`--debug`之类的选项

# 外部强大的参数解析工具：`getopt`

`getopt`参数解析工具：

* 外部命令
* 支持长选项，如 `--date`
* 使用`getopt`的时候， 每处理完一个位置参数后都需要自己`shift`来跳到下一个位置。而`getopts`只需要在最后使用 `shift $(($OPTIND - 1))` 来跳到parameter的位置
* 使用`getopt`时，需要和命令行输入参数一致。例如命令参数使用`-t`则`getopt`的case语句使用`-t`。而`getopts`中不需要使用`-`
* `getopt`往往需要和`set`配合使用
* `getopt`会重排参数顺序

```bash
#!/bin/bash

# A small example program for using the new getopt(1) program.
# This program will only work with bash(1)
# An similar program using the tcsh(1) script language can be found
# as parse.tcsh

# Example input and output (from the bash prompt):
# ./parse.bash -a par1 'another arg' --c-long 'wow!*\?' -cmore -b " very long "
# Option a
# Option c, no argument
# Option c, argument `more'
# Option b, argument ` very long '
# Remaining arguments:
# --> `par1'
# --> `another arg'
# --> `wow!*\?'

# Note that we use `"$@"' to let each command-line parameter expand to a
# separate word. The quotes around `$@' are essential!
# We need TEMP as the `eval set --' would nuke the return value of getopt.

#-o表示短选项，两个冒号表示该选项有一个可选参数，可选参数必须紧贴选项
#		如-carg 而不能是-c arg
#--long表示长选项
#"$@" ：参数本身的列表，也不包括命令本身
# -n:出错时的信息
# -- ：举一个例子比较好理解：
#我们要创建一个名字为 "-f"的目录你会怎么办？
# mkdir -f #不成功，因为-f会被mkdir当作选项来解析，这时就可以使用
# mkdir -- -f 这样-f就不会被作为选项。

TEMP=`getopt -o ab:c:: --long a-long,b-long:,c-long:: \
     -n 'example.bash' -- "$@"`

if [ $? != 0 ] ; then echo "Terminating..." >&2 ; exit 1 ; fi

# Note the quotes around `$TEMP': they are essential!
#set 会重新排列参数的顺序，也就是改变$1,$2...$n的值，这些值在getopt中重新排列过了
eval set -- "$TEMP"

#经过getopt的处理，下面处理具体选项。

while true ; do
    case "$1" in
        -a|--a-long) echo "Option a" ; shift ;;
        -b|--b-long) echo "Option b, argument \`$2'" ; shift 2 ;;
        -c|--c-long)
            # c has an optional argument. As we are in quoted mode,
            # an empty parameter will be generated if its optional
            # argument is not found.
            case "$2" in
                "") echo "Option c, no argument"; shift 2 ;;
                *)  echo "Option c, argument \`$2'" ; shift 2 ;;
            esac ;;
        --) shift ; break ;;
        *) echo "Internal error!" ; exit 1 ;;
    esac
done
echo "Remaining arguments:"
for arg do
   echo '--> '"\`$arg'" ;
done
```

# 简洁的`getopt`案例

我找到一个简明清晰的案例 - [cosimo/parse-options.sh](https://gist.github.com/cosimo/3760587) 可以作为样板

```bash
#!/bin/bash
#
# Example of how to parse short/long options with 'getopt'
#

OPTS=`getopt -o vhns: --long verbose,dry-run,help,stack-size: -n 'parse-options' -- "$@"`

if [ $? != 0 ] ; then echo "Failed parsing options." >&2 ; exit 1 ; fi

echo "$OPTS"
eval set -- "$OPTS"

VERBOSE=false
HELP=false
DRY_RUN=false
STACK_SIZE=0

while true; do
  case "$1" in
    -v | --verbose ) VERBOSE=true; shift ;;
    -h | --help )    HELP=true; shift ;;
    -n | --dry-run ) DRY_RUN=true; shift ;;
    -s | --stack-size ) STACK_SIZE="$2"; shift; shift ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

echo VERBOSE=$VERBOSE
echo HELP=$HELP
echo DRY_RUN=$DRY_RUN
echo STACK_SIZE=$STACK_SIZE
```

# C Tutorial: Basics

在 [C Tutorial: Basics -- Processing the command line](https://www.cs.rutgers.edu/~pxk/416/notes/c-tutorials/getopt.html) 提供了在c语言中结合getopt的处理程序样例，可以参考。

# 参考

* [bash/shell 解析命令行参数工具：getopts/getopt](https://my.oschina.net/leejun2005/blog/202376)