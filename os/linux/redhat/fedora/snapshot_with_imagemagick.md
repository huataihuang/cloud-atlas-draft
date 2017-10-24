[ImageMagick](http://www.imagemagick.org/)是一个支持非常多格式图形文件读取和转换的工具包（开源GPL协议），而且支持通过命令行批量处理图形文件以及丰富的语言接口，是操作系统非常基础的一个图形软件包。

为了在unix的X平台下快速截图，可以使用ImageMagick中的import命令，格式非常简单
import 文件名
此时会在X中形成一个十字形箭头，拖放一个窗口出来，此窗口内所有图形将被截取，命名为指定文件名。

```
import XXXX.png
```

* 安装软件

```
sudo yum install ImageMagick xclip
```

* 为方便使用，采用`~/bin/snapshot.sh`脚本

```bash
snapshot_time=`date +%Y-%m-%d_%H:%M:%S`
snapshot_file=/home/huatai/Documents/snapshot/${snapshot_time}.png
import $snapshot_file

xclip -selection clipboard -t image/png -i $snapshot_file
```

而且，采用LXQt环境下的快捷键`alt+a`，这样只要在任何情况下按下`alt+a`就可以截图到指定目录下并以时间为文件名保存。

注意，脚本中对文件名要设置完全路径，不能使用类似`~`来指代用户home目录。

# 参考

* [How to copy an image to the clipboard from a file using command line?](https://askubuntu.com/questions/759651/how-to-copy-an-image-to-the-clipboard-from-a-file-using-command-line)