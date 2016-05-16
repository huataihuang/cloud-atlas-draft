* NFC TagWriter by NXP
* Trigger
* NFC Tools
* NFC TagInfo by NXP
* NFC ReTag

# NFC不能工作的异常排查

我第一次使用NFC软件，发现多个软件都没有反应。怀疑手机存在硬件问题，参考[
Nexus 5: NFC not working](https://productforums.google.com/forum/#!msg/nexus/bRGi6yhDCyE/nErnJfGCsWMJ)

有两种建议：

* 反复揉搓挤压后盖，大概是中间位置，在挤压后，直到听到喀哒声，然后就可以正常工作NFC

前几天我的手机在地上摔了一下，怀疑可能是触点不良。因为我记得以前黑莓手机的NFC，在后盖和主板之间是通过2个金属触点连接的。有可能手机摔了以后，触点接触不良。

* 尝试启动到安全模式，进行排查：
	* 确保屏幕点亮状态，然后按住并保持电源按钮按下状态
	* 当出现**`Power off`**对话框以后，按住屏幕上的**`Power off`**触摸按钮，并保持按住状态
	* 此时对话框会转成"是否要切换成safe mode"，则确认后重启进入安全模式


# 参考

* [Top 7 Android NFC Apps](http://rapidnfc.com/blog/131/top_7_android_nfc_apps)