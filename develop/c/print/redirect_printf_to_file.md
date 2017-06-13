一个简单的检查进程延迟的c程序[latency.c](http://eaglet.rain.com/rick/linux/schedstat/v9/latency.c)

```c
/*
 * latency -- measure the scheduling latency of a particular process from
 *	the extra information provided in /proc/<pid>stat by version 4 of
 *	the schedstat patch. PLEASE NOTE: This program does NOT check to
 *	make sure that extra information is there; it assumes the last
 *	three fields in that line are the ones it's interested in.  Using
 *	it on a kernel that does not have the schedstat patch compiled in
 *	will cause it to happily produce bizarre results.
 *
 *	Note too that this is known to work only with versions 4 and 5
 *	of the schedstat patch, for similar reasons.
 *
 *	This currently monitors only one pid at a time but could easily
 *	be modified to do more.
 */
#include <stdio.h>
#include <getopt.h>

extern char *index(), *rindex();
char procbuf[512];
char statname[64];
char *Progname;
FILE *fp;

void usage()
{
    fprintf(stderr,"Usage: %s [-s sleeptime ] <pid>\n", Progname);
    exit(-1);
}

/*
 * get_stats() -- we presume that we are interested in the last three
 *	fields of the line we are handed, and further, that they contain
 *	only numbers and single spaces.
 */
void get_stats(char *buf, char *id, unsigned int *run_ticks,
	       unsigned int *wait_ticks, unsigned int *nran)
{
    char *ptr;

    ptr = index(buf, ')') + 1;
    *ptr = 0;
    strcpy(id, buf);
    *ptr = ' ';

    ptr = rindex(buf,' ');
    if (!ptr) return;

    *nran = atoi(ptr--);

    while (isdigit(*ptr) && --ptr != buf);
    if (ptr == buf) return;

    *wait_ticks = atoi(ptr--);

    while (isdigit(*ptr) && --ptr != buf);
    if (ptr == buf) return;

    *run_ticks = atoi(ptr);
}

main(int argc, char *argv[])
{
    int c;
    unsigned int sleeptime = 5, pid = 0, verbose = 0;
    char id[32];
    unsigned int run_ticks, wait_ticks, nran;
    unsigned int orun_ticks=0, owait_ticks=0, oran=0;

    Progname = argv[0];
    id[0] = 0;
    while ((c = getopt(argc,argv,"s:v")) != -1) {
	switch (c) {
	    case 's':
		sleeptime = atoi(optarg);
		break;
	    case 'v':
		verbose++;
		break;
	    default:
		usage();
	}
    }

    if (optind < argc) {
	pid = atoi(argv[optind]);
    }

    if (!pid)
	usage();

    /*
     * now just spin collecting the stats
     */
    sprintf(statname,"/proc/%d/stat", pid);
    while (fp = fopen(statname, "r")) {
	    if (!fgets(procbuf, sizeof(procbuf), fp))
		    break;

	    get_stats(procbuf, id, &run_ticks, &wait_ticks, &nran);

	    if (verbose)
		printf("%s %d(%d) %d(%d) %d(%d) %4.2f %4.2f\n",
		    id, run_ticks, run_ticks - orun_ticks,
		    wait_ticks, wait_ticks - owait_ticks,
		    nran, nran - oran,
		    nran - oran ?
			(double)(run_ticks-orun_ticks)/(nran - oran) : 0,
		    nran - oran ?
			(double)(wait_ticks-owait_ticks)/(nran - oran) : 0);
	    else
		printf("%s avgrun=%4.2fms avgwait=%4.2fms\n",
		    id, nran - oran ?
			(double)(run_ticks-orun_ticks)/(nran - oran) : 0,
		    nran - oran ?
			(double)(wait_ticks-owait_ticks)/(nran - oran) : 0);
	    fclose(fp);
	    oran = nran;
	    orun_ticks = run_ticks;
	    owait_ticks = wait_ticks;
	    sleep(sleeptime);
	    fp = fopen(statname,"r");
	    if (!fp)
		    break;
    }
    if (id[0])
	printf("Process %s has exited.\n", id);
    else 
	printf("Process %d does not exist.\n", pid);
    exit(0);
}
```

但是，这个程序针对某个名为`example_process`线程`10601`进行统计

```
./latency -s 1 10601
```

屏幕输出

```
10601 (example_process) run_count=11 avgrun=0.24ms avgwait=0.00ms
10601 (example_process) run_count=10 avgrun=0.20ms avgwait=0.01ms
10601 (example_process) run_count=10 avgrun=0.21ms avgwait=0.02ms
10601 (example_process) run_count=10 avgrun=0.20ms avgwait=0.03ms
```

但是我却无法将屏幕输出重定向到日志文件

```
./latency -s 1 10601 >> log.txt
```

`log.txt`内容始终是空。我也尝试了将标准输出和标准错误都定向到同一个文件

```
./latency -s 1 10601 2>&1 > log.txt
```

但是依然没有成功。所以，考虑将`printf`输出直接定向到日志文件。

# `freopen()`

`freopen()`是一个将日志文件

修订其中一段输出

```
#include <stdio.h>
...
FILE *fq;
...
...
        if((fq=freopen("/tmp/latency.log","a",stdout))!=NULL){
            printf("%s run_count=%d avgrun=%4.2fms avgwait=%4.2fms\n",
            id, nran - oran, nran - oran ?
            (double)(run_ticks-orun_ticks)/1000000 : 0,
            (double)(wait_ticks-owait_ticks)/1000000);
        fclose(fq);
        }
```

然后执行`gcc -o latency_log latency_log.c`编译后执行如下方法

```
/apsara/river/river_admin server dump_machine_view 10.154.126.21:1122 | grep -A 17 easy_worker_thread | grep ThreadInfo | awk -F\, '{print $3}' | awk -F\= '{print $2}' | tee /tmp/easy_worker_thread_tid

for i in `cat /tmp/easy_worker_thread_tid`;do (nohup /home/admin/latency_log $i -s 60 &);done
```

则输出信息记录到 `/tmp/latency.log`

# 参考

* [Redirect the printf to file](http://www.java2s.com/Code/C/File/Redirecttheprintftofile.htm)