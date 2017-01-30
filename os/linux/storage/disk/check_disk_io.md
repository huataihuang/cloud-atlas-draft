> 本文汇总一些检查磁盘io的方法和脚本供参考。

# lsof检查文件访问

lsof可检查某个磁盘上的读写进程

```
gddg:~ # lsof /dev/xvda2 |head
COMMAND     PID       USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME
init          1       root  cwd    DIR  202,2     4096      2 /
init          1       root  rtd    DIR  202,2     4096      2 /
init          1       root  txt    REG  202,2    40784 193218 /sbin/init
init          1       root  mem    REG  202,2    19114   8063 /lib64/libdl-2.11.1.so
init          1       root  mem    REG  202,2  1661454   8057 /lib64/libc-2.11.1.so
init          1       root  mem    REG  202,2   236384   8114 /lib64/libsepol.so.1
init          1       root  mem    REG  202,2   113904   8115 /lib64/libselinux.so.1
init          1       root  mem    REG  202,2   149797   8050 /lib64/ld-2.11.1.so
kthreadd      2       root  cwd    DIR  202,2     4096      2 /
```

然后可以通过`lsof -p $pid`来查看某个进程的详细打开的文件

```
gddg:~ # lsof -p 32597
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME
bash    32597 root  cwd    DIR  202,2     4096  16097 /root
bash    32597 root  rtd    DIR  202,2     4096      2 /
bash    32597 root  txt    REG  202,2   584016  32203 /bin/bash
bash    32597 root  mem    REG  202,2   293936   8125 /lib64/libncurses.so.5.6
bash    32597 root  mem    REG  202,2  1661454   8057 /lib64/libc-2.11.1.so
bash    32597 root  mem    REG  202,2    19114   8063 /lib64/libdl-2.11.1.so
bash    32597 root  mem    REG  202,2   263568   8153 /lib64/libreadline.so.5.2
bash    32597 root  mem    REG  202,2   149797   8050 /lib64/ld-2.11.1.so
bash    32597 root  mem    REG  202,2   217016  16498 /var/run/nscd/passwd
```

# `cat /proc/$pid/io`

内核版本大于 `2.6.20` 就支持通过 `cat /proc/pid/io` 获取进程的io信息

```
gddg:~ # cat /proc/4140/io
rchar: 197448798054        // 读出的总字节数，read()或者pread()中的长度参数总和(pagecache中统计而来，不代表实际磁盘的读入)
wchar: 209896059897        // 写入的总字节数，write()或者pwrite()中的长度参数总和
syscr: 6491904             // read()或者pread()总的调用次数
syscw: 13633940            // write()或者pwrite()总的调用次数
read_bytes: 49616125952    // 实际从磁盘中读取的字节总数
write_bytes: 14038130688   // 实际写入到磁盘中的字节总数
cancelled_write_bytes: 2473984     // 由于截断pagecache导致应该发生而没有发生的写入字节数
```

# `block_dump`

通过 `echo 1 > /proc/sys/vm/block_dump` 可以把 block 读写 （WRITE/READ/DIRTY）情况dump到日志里面，通过`dmesg`命令查看

```
#!/bin/sh

/etc/init.d/syslog stop
echo 1 > /proc/sys/vm/block_dump

sleep 60
dmesg | awk '/(READ|WRITE|dirtied)/ {process[$1]++} END {for (x in process) \
print process[x],x}' |sort -nr |awk '{print $2 " " $1}' | \
head -n 10

#dmesg | egrep "READ|WRITE|dirtied" | egrep -o '([a-zA-Z]*)' | sort | uniq -c | sort -rn | head

echo 0 > /proc/sys/vm/block_dump
/etc/init.d/syslog start
```

输出类似如下

```
pdflush(10423): 4000
nginx(1167): 179
nginx(1229): 172
nginx(1187): 111
nginx(1243): 105
nginx(1213): 92
nginx(1233): 69
nginx(1157): 61
nginx(1161): 50
nginx(1155): 32
```

或者参考 http://stackoverflow.com/questions/249570/how-can-i-record-what-process-or-kernel-activity-is-using-the-disk-in-gnu-linux

```
sudo -s
dmesg -c
/etc/init.d/klogd stop
echo 1 > /proc/sys/vm/block_dump
rm /tmp/disklog
watch "dmesg -c >> /tmp/disklog"
   CTRL-C when you're done collecting data
echo 0 > /proc/sys/vm/block_dump
/etc/init.d/klogd start
exit (quit root shell)

cat /tmp/disklog | awk -F"[() \t]" '/(READ|WRITE|dirtied)/ {activity[$1]++} END {for (x in activity) print x, activity[x]}'| sort -nr -k2
```

# `iotop`类脚本

python版本

```
#!/usr/bin/python
# Monitoring per-process disk I/O activity
# written by http://www.vpsee.com 

import sys, os, time, signal, re

class DiskIO:
    def __init__(self, pname=None, pid=None, reads=0, writes=0):
        self.pname = pname 
        self.pid = pid
        self.reads = 0
        self.writes = 0

def main():
    argc = len(sys.argv)
    if argc != 1:
        print "usage: ./iotop"
        sys.exit(0)

    if os.getuid() != 0:
        print "must be run as root"
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    os.system('echo 1 > /proc/sys/vm/block_dump')
    print "TASK              PID       READ      WRITE"
    while True:
        os.system('dmesg -c > /tmp/diskio.log')
        l = []  
        f = open('/tmp/diskio.log', 'r')
        line = f.readline()
        while line:
            m = re.match(\
                '^(\S+)\((\d+)\): (READ|WRITE) block (\d+) on (\S+)', line)
            if m != None:
                if not l:       
                    l.append(DiskIO(m.group(1), m.group(2)))
                    line = f.readline() 
                    continue            
                found = False   
                for item in l:  
                    if item.pid == m.group(2):
                        found = True            
                        if m.group(3) == "READ":
                            item.reads = item.reads + 1 
                        elif m.group(3) == "WRITE":
                            item.writes = item.writes + 1
                if not found:   
                    l.append(DiskIO(m.group(1), m.group(2)))
            line = f.readline()
        time.sleep(1)
        for item in l:
            print "%-10s %10s %10d %10d" % \
                (item.pname, item.pid, item.reads, item.writes)

def signal_handler(signal, frame):
    os.system('echo 0 > /proc/sys/vm/block_dump')
    sys.exit(0)

if __name__=="__main__":
    main()
```

* perl版本 - http://www.xaprb.com/blog/2009/08/23/how-to-find-per-process-io-statistics-on-linux/

```
#!/usr/bin/env perl
# This program is part of Aspersa (http://code.google.com/p/aspersa/)

=pod

=head1 NAME

iodump - Compute per-PID I/O stats for Linux when iotop/pidstat/iopp are not available.

=head1 SYNOPSIS

Prepare the system:

  dmesg -c
  /etc/init.d/klogd stop
  echo 1 > /proc/sys/vm/block_dump

Start the reporting:

  while true; do sleep 1; dmesg -c; done | perl iodump
  CTRL-C

Stop the system from dumping these messages:

  echo 0 > /proc/sys/vm/block_dump
  /etc/init.d/klogd start

=head1 AUTHOR

Baron Schwartz

=cut

use strict;
use warnings FATAL => 'all';
use English qw(-no_match_vars);
use sigtrap qw(handler finish untrapped normal-signals);

my %tasks;

my $oktorun = 1;
my $line;
while ( $oktorun && (defined ($line = <>)) ) {
   my ( $task, $pid, $activity, $where, $device );
   ( $task, $pid, $activity, $where, $device )
      = $line =~ m/(\S+)\((\d+)\): (READ|WRITE) block (\d+) on (\S+)/;
   if ( !$task ) {
      ( $task, $pid, $activity, $where, $device )
         = $line =~ m/(\S+)\((\d+)\): (dirtied) inode \(.*?\) (\d+) on (\S+)/;
   }
   if ( $task ) {
      my $s = $tasks{$pid} ||= { pid => $pid, task => $task };
      ++$s->{lc $activity};
      ++$s->{activity};
      ++$s->{devices}->{$device};
   }
}

printf("%-15s %10s %10s %10s %10s %10s %s\n",
   qw(TASK PID TOTAL READ WRITE DIRTY DEVICES));
foreach my $task (
   reverse sort { $a->{activity} <=> $b->{activity} } values %tasks
) {
   printf("%-15s %10d %10d %10d %10d %10d %s\n",
      $task->{task}, $task->{pid},
      ($task->{'activity'}  || 0),
      ($task->{'read'}      || 0),
      ($task->{'write'}     || 0),
      ($task->{'dirty'}     || 0),
      join(', ', keys %{$task->{devices}}));
}

sub finish {
   my ( $signal ) = @_;
   if ( $oktorun ) {
      print STDERR "# Caught SIG$signal.\n";
      $oktorun = 0;
   }
   else {
      print STDERR "# Exiting on SIG$signal.\n";
      exit(1);
   }
}
```

# iostat.c

http://code.google.com/p/tester-higkoo/source/browse/trunk/Tools/iostat/iostat.c

# 参考

* [查看磁盘IO负载 - 看哪些进程在读写磁盘](www.cnblogs.com/cloudstorage/archive/2012/11/11/2764623.html)
* [监测 Linux 进程的实时 IO 情况](http://www.vpsee.com/2010/07/monitoring-process-io-activity-on-linux-with-block_dump/)