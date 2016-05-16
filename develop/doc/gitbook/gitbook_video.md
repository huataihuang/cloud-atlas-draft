> 以下插件尚未实践，待验证

Video Player for GitBook要求：

	gitbook >=2.0.0

# 安装

在`book.json`中添加

	{
	    "plugins": ["video-player"]
	}

然后执行

	gitbook install

就可以安装完插件

# 使用方法

	{% videoplayerscripts %}{% endvideoplayerscripts %}

例如

	{% videoplayer id="docker-myvideo" width="640" height="480" posterExt="png" %}https://s3.amazonaws.com/gitbooks/myvideo{% endvideoplayer %}

插件自动加载`myvideo.mp4`，默认使用WebM编码的视频

# 参考

* [Video Player for your GitBook](https://plugins.gitbook.com/plugin/videoplayer)