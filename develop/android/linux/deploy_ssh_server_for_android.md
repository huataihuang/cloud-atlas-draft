Android虽然可以安装Terminal对后台系统做一些检查，也可以利用Android内键的ssh，完成服务器维护。但是手机输入命令毕竟非常不方便，所以日常工作可以在Android上启动一个ssh服务，通过瘦客户端远程登陆到Android后台进行操作，输入效率也能大大提高。

* [SSHDroid](https://market.android.com/details?id=berserker.android.apps.sshdroid) (does not require rooted phone)
* [QuickSSHD](https://market.android.com/details?id=com.teslacoilsw.quicksshd) (see [this Google thread](http://www.google.com/support/forum/p/android/thread?tid=53194de3f7456bc9&hl=en) for some discussion)
* [Dropbear](http://code.google.com/p/android-dropbear-sshd/) (requires rooted phone, see [this Droidforums thread](http://www.droidforums.net/forum/droid-hacks/9038-ssh-daemon-dropbear-android-2-0-a.html) for some discussion)
* [SSHelper](http://www.droidforums.net/forum/droid-hacks/9038-ssh-daemon-dropbear-android-2-0-a.html) (does not require rooting; free software -- under GPL; it incorporates also code from other projects; [might eventually appear in the F-Droid repository](http://f-droid.org/forums/topic/sshelper/))
* some other free (= libre) software projects of an ssh server have been [mentioned in the discussion of their potential inclusion into F-Droid](http://f-droid.org/forums/topic/droidsshd/)

# 参考

* [Is there some SSH server for android?](https://android.stackexchange.com/questions/9905/is-there-some-ssh-server-for-android)