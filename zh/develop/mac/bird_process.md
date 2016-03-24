在Mac OS X上，有一个`bird`后台进程，在使用`icloud`存储同步服务时，可能会出现非常高的cpu使用率。

参考 [Process 'Bird' in Activity Monitor](http://forums.macrumors.com/threads/process-bird-in-activity-monitor.1804688/)

> `bird`是一个后台云功能的系统进程，没有配置选项，也不能手工运行。

当有大量文件同步的时候，cpu资源消耗严重。

["bird" process is taking over](https://discussions.apple.com/thread/6606275?tstart=0)提供了一个监视`bird`同步文件的方法：

```bash
brctl log --wait --shorten
```

此时可以看到同步日志

```bash
[note]  4567.467 [2016-03-24 14:33:59.388] sqlite.clientTruth             fs.uploader              BRCFSUploader.m:1051
	uploading 1 documents in com.apple.CloudDocs
[WARN]  4568.320 [2016-03-24 14:34:00.241] NSXPCConnection.user.796       container-metadata         BRContainer.m:1398
	invalid container name (nil)
[ERROR] 4568.320 [2016-03-24 14:34:00.241] NSXPCConnection.user.796       xpc.client                 BRCXPCClient.m:808
	nil error: <NSError:0x7fb9bbc5bea0(NSPOSIXErrorDomain:1) - {
	    NSDescription = "can't create container for (null)";
	}>
[note]  4568.393 [2016-03-24 14:34:00.314] sqlite.clientTruth             fs.uploader              BRCFSUploader.m:1051
	uploading 1 documents in com.apple.CloudDocs
[note]  4577.168 [2016-03-24 14:34:09.089] upload/com.apple.CloudDocs     sync.transfer        BRCTransferBatchOperation.m:227
	finished uploading 1 items (12 KB) in com.apple.CloudDocs
load: 2.22  cmd: brctl 2229 waiting 0.01u 0.01s
```