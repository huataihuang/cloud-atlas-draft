[youtube-dl](https://github.com/rg3/youtube-dl)是使用python编写的开源视频下载工具，不仅可以下载YouTube视频，也可以下载国内很多视频网站内容（如B站）。

# 使用简介

* 列出目标视频详情

```
youtube-dl -F https://www.bilibili.com/video/av25468686/
```

* 根据需要视频格式下载指定格式（例如下载格式2）

```
youtube-dl -f 2 https://www.bilibili.com/video/av25468686/
```

* 下载YouTube视频需要使用代理，参数 `--proxy`，可以将需要学习的视频下载到本地在空闲时候学习

# 参考

* [怎样在电脑上下载哔哩哔哩的视频？](https://www.zhihu.com/question/41367609)
* [youtube-dl](https://github.com/rg3/youtube-dl)