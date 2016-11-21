在一些数学公式中经常需要使用希腊字母，输入特殊字母的方法

* 使用`Special Characters window`功能输入特殊字符

`ctrl`+`command`+`space`可以显示特殊字符输入，此时输入 `theta` 就可以显示希腊字母 θ

* `hold key`输入特殊字符
  * 增加`hold key`输入特殊字符的配置

Lion版本之后的MacOS提供了hold key输入方法，也就是持续按住键可以弹出可选的特殊字符，例如持续安装`o`键可以显示并输入`ø`

编辑系统文件`/System/Library/Input Methods/PressAndHold.app/Contents/Resources/Keyboard-en.plist`添加以下配置（例如增加如下配置）

```
<key>Roman-Accent-t</key>
    <dict>
            <key>Direction</key>
            <string>right</string>
            <key>Keycaps</key>
            <string>t θ</string>
            <key>Strings</key>
            <string>t θ</string>
    </dict>
```

注意：字母是大小写区别的，`Roman-Accent-T`和`Roman-Accent-t`是 **不同** 的。这是一个系统级别的修改，所以要非常小心并且需要做好备份

# 参考

* [How do you type Theta on a Mac?](http://apple.stackexchange.com/questions/62273/how-do-you-type-theta-on-a-mac)