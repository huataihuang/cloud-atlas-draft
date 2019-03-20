在 `~/.gitconfig` 中添加以下段落

```
[color]
  diff = auto
  status = auto
  branch = auto
  interactive = auto
  ui = true
  pager = true
```

也可以控制特定颜色

```
[color "status"]
  added = green
  changed = red bold
  untracked = magenta bold

[color "branch"]
  remote = yellow
```

或者使用：

```
git config --global color.ui auto
```

或者

```
git config --global color.ui auto
git config --global color.branch auto
git config --global color.status auto
```

# 参考

* [How to colorize output of git?](https://unix.stackexchange.com/questions/44266/how-to-colorize-output-of-git)