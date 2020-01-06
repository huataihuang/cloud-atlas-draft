zsh兼容bash，并且可以通过插件增强功能。为了能够方便使用，[oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)提供了全面的美化和插件定义。

# 安装

* 安装oh my zsh

```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

## 修改用户目录属主需要重新设置oh my zsh安全

我修改了 `/home/huatai` 目录的属主id，重新登陆发现提示

```
zsh compinit: insecure directories, run compaudit for list.
```

如果忽略安全警告，则会提示

```
zsh compinit: insecure directories, run compaudit for list.
Ignore insecure directories and continue [y] or abort compinit [n]? y[oh-my-zsh] Insecure completion-dependent directories detected:
drwxrwsr-x 2 root staff 4096 Jul 10 09:47 /usr/local/share/zsh/site-functions

[oh-my-zsh] For safety, we will not load completions from these directories until
[oh-my-zsh] you fix their permissions and ownership and restart zsh.
[oh-my-zsh] See the above list for directories with group or other writability.

[oh-my-zsh] To fix your permissions you can do so by disabling
[oh-my-zsh] the write permission of "group" and "others" and making sure that the
[oh-my-zsh] owner of these directories is either root or your current user.
[oh-my-zsh] The following command may help:
[oh-my-zsh]     compaudit | xargs chmod g-w,o-w

[oh-my-zsh] If the above didn't help or you want to skip the verification of
[oh-my-zsh] insecure directories you can set the variable ZSH_DISABLE_COMPFIX to
[oh-my-zsh] "true" before oh-my-zsh is sourced in your zshrc file.
```

这个问题是因为一个空的 `/usr/local/share/zsh/site-functions` 导致，删除这个目录避免安全告警。

* 增加主机名显示

默认ozsh没有显示主机名和登陆账号，参考 [zsh prompt and hostname](https://stackoverflow.com/questions/30199068/zsh-prompt-and-hostname) 在 `~/.zshrc` 添加:

```
export PROMPT='%(!.%{%F{yellow}%}.)$USER@%{$fg[white]%}%M ${ret_status} %{$fg[cyan]%}%c%{$reset_color%} $(git_prompt_info)'
```

# 插件

Oh My Zsh包含了常用插件用于增强系统，但是你需要在 `.zshrc`中激活(默认只激活了git)

```
plugins=(
  git
  bundler
  dotenv
  osx
  rake
  rbenv
  ruby
)
```

# 主题

`oh-my-zsh`提供了多种驻地，主题配置在 `~/.zshrc` 中可以查看:

```
ZSH_THEME="robbyrussell"
```

> 可以从 [oh-my-zsh themes](https://github.com/robbyrussell/oh-my-zsh/wiki/Themes) 找到喜欢的主题。

* 推荐主题 [agnoster](https://github.com/robbyrussell/oh-my-zsh/wiki/Themes#agnoster)

## 安装 Powerline字体

> 注意：很多主题要求安装字体 [Powerline Fonts](https://github.com/powerline/fonts) :

```
sudo apt-get install fonts-powerline
```

### OS X平台

* 下载 [powerline-fonts](https://github.com/powerline/fonts)

```
# clone
git clone https://github.com/powerline/fonts.git --depth=1
# install
cd fonts
./install.sh
# clean-up a bit
cd ..
rm -rf fonts
```

安装字体以后，在macOS的iterm2中选择字体 `12pt Meslo LG M Regular for Powerline` 就可以正常显示[agnoster](https://github.com/robbyrussell/oh-my-zsh/wiki/Themes#agnoster)。不过，我试用之后感觉不是很美观，还是返回默认的theme。

```
pip install --user powerline-status
```

# 命令补全

在bash中，tab可以补全命令， oh-my-zsh 提供了更多选项。

* 路径补全 `cd /usr/local/nginx` 可以使用 `cd /u/l/n` 然后按tab补全

* git 按两下tab，返回命令提示

> 建议安装 [zsh-autosuggestions
](https://github.com/zsh-users/zsh-autosuggestions) 方便命令行提示：

```
brew install zsh-autosuggestions
```

在 `~/.zshrc` 中添加:

```
source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
```

# 目录穿越

按下 `d` 命令会列出最近的目录历史，并且用序号表示最近目录，直接输入序号则会进入目录

# 快捷键

快捷键参考：

* [zsh快捷操作](https://www.jianshu.com/p/44e8deab1839)
* [bash/zsh 快捷键](https://blog.csdn.net/C_SESER/article/details/78108661)

# 参考

* [Linux 效率神器——开始使用 Zsh](https://zhuanlan.zhihu.com/p/63585679)