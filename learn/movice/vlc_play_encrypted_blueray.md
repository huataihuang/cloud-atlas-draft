> 本文尚未实践，因为当前我观看的蓝光影碟都是普通蓝光，没有加密。不过，本文我作为备用记录。

我之前使用IINA播放视频，也用IINA观看蓝光影碟。不过，我发现对于电视剧蓝光影碟，例如《老友记》，IINA无法正确区分出多集视频，整张蓝光碟只能播放其中一集。所以，我改用VLC播放器，确实能够完整播放不同集视频。

蓝光影碟分区，并且有加密。我目前还没有尝试过不同区蓝光，据说需要换不同的区，等有需要时候再实践。

VLC播放加密蓝光影碟需要从 https://vlc-bluray.whoknowsmy.name/  下载 密钥数据库 和 AACS动态库。

两个文件 - 密钥数据库文件（KEYDB.cfg）和AACS动态库文件（libaacs.dll）

* [KEYDB.cfg](../../img/learn/movice/KEYDB.cfg) 存放到：
  * Windows: put it in C:\ProgramData\aacs\
  * Mac OS X: put it in ~/Library/Preferences/aacs/ (create it if it does not exist)
  * Linux: put it in ~/.config/aacs/

* AACS动态库：
  * VLC 64 bit on Windows: put [libaacs.dll](../../img/learn/movice/libaacs.dll) in your VLC directory
  * Mac OS X: put [libaacs.dylib](../../img/learn/movice/libaacs.dylib) in /usr/local/lib/ directory (create it, if it does not exist)
  * Linux: install libaacs package using your distribution package manager. 



# 参考

* [如何在Windows和Mac上使用VLC播放蓝光电影](https://www.videosolo.com/zh-CN/tutorials/play-blu-ray-with-vlc.html)