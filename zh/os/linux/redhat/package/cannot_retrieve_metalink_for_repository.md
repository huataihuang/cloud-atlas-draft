在安装EPEL 7的rpm包

	yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

再执行`yum update`出现了如下报错

	 One of the configured repositories failed (Unknown),
	 and yum doesn't have enough cached data to continue. At this point the only
	 safe thing yum can do is fail. There are a few ways to work "fix" this:

	     1. Contact the upstream for the repository and get them to fix the problem.

	     2. Reconfigure the baseurl/etc. for the repository, to point to a working
	        upstream. This is most often useful if you are using a newer
	        distribution release than is supported by the repository (and the
	        packages for the previous distribution release still work).

	     3. Disable the repository, so yum won't use it by default. Yum will then
	        just ignore the repository until you permanently enable it again or use
	        --enablerepo for temporary usage:

	            yum-config-manager --disable <repoid>

	     4. Configure the failing repository to be skipped, if it is unavailable.
	        Note that yum will try to contact the repo. when it runs most commands,
	        so will have to try and fail each time (and thus. yum will be be much
	        slower). If it is a very temporary problem though, this is often a nice
	        compromise:

	            yum-config-manager --save --setopt=<repoid>.skip_if_unavailable=true

	Cannot retrieve metalink for repository: epel/x86_64. Please verify its path and try again

检查了`/etc/yum.repos.d/epel.repo`

	#baseurl=http://download.fedoraproject.org/pub/epel/7/$basearch
	mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-7&arch=$basearch

发现主要是无法访问 `https://mirrors.fedoraproject.org` ，所以将`/etc/yum.repos.d`目录下`epel.repo`和`epel-testing.repo`配置都修改成

	baseurl=http://download.fedoraproject.org/pub/epel/7/$basearch
	#mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-7&arch=$basearch

重新执行升级安装。

> 这个方法其实不是很好，只是作为退而求其次，绕开镜像网站选择，直接指定软件仓库。