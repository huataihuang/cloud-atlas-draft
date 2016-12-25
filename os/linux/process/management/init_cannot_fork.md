线上服务器无法ssh，从带外检查看，不断出现

```
2016-12-09 00:21:54	INIT: cannot fork, retry..
2016-12-09 00:21:59	INIT: cannot fork, retry..
2016-12-09 00:23:44	INIT: Id "c0" respawning too fast: disabled for 5 minutes
2016-12-09 00:28:45	INIT: cannot fork, retry..
2016-12-09 00:28:50	INIT: cannot fork, retry..
2016-12-09 00:28:56	INIT: cannot fork, retry..
2016-12-09 00:29:01	INIT: cannot fork, retry..
```

检查服务器，发现最早出现 `init: cannot fork, retry..` 是在 `Oct 30 01:58:26`，实际上之前还有其他`crond`无法fork的报错。所以要追本溯源

```
Oct 30 01:58:01 e46b10504.cloud.nu17 crond[3046]: (CRON) error (can't fork)
Oct 30 01:58:01 e46b10504.cloud.nu17 crond[29427]: (CRON) error (can't fork)
Oct 30 01:58:01 e46b10504.cloud.nu17 crond[42829]: (CRON) error (can't fork)
Oct 30 01:58:06 e46b10504.cloud.nu17 agetty[6685]: bad speed: vt100-nav
Oct 30 01:58:16 e46b10504.cloud.nu17 agetty[6685]: bad speed: vt100-nav
Oct 30 01:58:16 e46b10504.cloud.nu17 automount[12057]: expire_proc: expire thread create for /net failed
Oct 30 01:58:20 e46b10504.cloud.nu17 automount[12057]: expire_proc: expire thread create for /misc failed
Oct 30 01:58:26 e46b10504.cloud.nu17 init: cannot fork, retry..
Oct 30 01:58:31 e46b10504.cloud.nu17 init: cannot fork, retry..
Oct 30 01:58:36 e46b10504.cloud.nu17 init: cannot fork, retry..
```

往前排查，最早的无法fork的记录

```
Oct 29 23:31:01 e46b10504.cloud.nu17 crond[46573]: (CRON) error (can't fork)
Oct 29 23:47:01 e46b10504.cloud.nu17 crond[5840]: (CRON) error (can't fork)
```

```

```