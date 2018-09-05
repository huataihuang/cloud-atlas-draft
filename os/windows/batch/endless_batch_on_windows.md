在Linux上，很容易实现无限循环的脚本：

```bash
while true; do
    echo "I will continue loop..."
    sleep 1
done
```

在Windows中，可以通过`goto`

```bat
@echo off

:begin

    echo "I will continue loop..."
    sleep 1

goto begin
```

# 参考

* [How To Create Batch File With Endless For Loop On Windows 7?](https://www.walkernews.net/2011/06/04/how-to-create-batch-file-with-endless-for-loop-on-windows-7/)