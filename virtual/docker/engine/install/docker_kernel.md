# Docker内核支持参数汇总

## `CONFIG_MACVLAN`

This allows one to create virtual interfaces that map packets to or from specific MAC addresses to a particular interface.

Macvlan devices can be added using the "ip" command from the iproute2 package starting with the iproute2-2.6.23 release:

	ip link add link <real dev> [ address MAC ] [ NAME ] type macvlan

To compile this driver as a module, choose M here: the module will be called macvlan.

	Symbol: MACVLAN [=m]
	Type  : tristate
	Prompt: MAC-VLAN support
	Location:
	     -> Device Drivers
		        -> Network device support (NETDEVICES [=y])
				         -> Network core driver support (NET_CORE [=y])

Defined at drivers/net/Kconfig:121

Depends on: NETDEVICES [=y] && NET_CORE [=y]


## `CONFIG_CGROUP_HUGETLB`

Provides a cgroup Resource Controller for HugeTLB pages.When you enable this, you can put a per cgroup limit on HugeTLB usage.The limit is enforced during page fault. Since HugeTLB doesn't support page reclaim, enforcing the limit at page fault time implies that, the application will get SIGBUS signal if it tries to access HugeTLB pages beyond its limit. This requires the application to know beforehand how much HugeTLB pages it would require for its use. The control group is tracked in the third page lru pointer. This means that we cannot use the controller with huge page less than 3 pages.

	Symbol: CGROUP_HUGETLB [=y]
	Type  : boolean
	Prompt: HugeTLB Resource Controller for Control Groups
	Location:
	     -> General setup
		        -> Control Group support (CGROUPS [=y])

Defined at init/Kconfig:1055

Depends on: CGROUPS [=y] && HUGETLB_PAGE [=y]

Selects: PAGE_COUNTER [=y]


## `CONFIG_NET_CLS_CGROUP`

classify packets based on the control cgroup of their process.To compile this code as a module, choose M here: the module will be called cls_cgroup.

	Symbol: NET_CLS_CGROUP [=m]
	Type  : tristate
	Prompt: Control Group Classifier
	
	Location:
		-> Networking support (NET [=y])
			-> Networking options
				-> QoS and/or fair queueing (NET_SCHED [=y])

Defined at net/sched/Kconfig:459

Depends on: NET [=y] && NET_SCHED [=y] && CGROUPS [=y]

Selects: NET_CLS [=y] && CGROUP_NET_CLASSID [=y]

## `CONFIG_CGROUP_NET_PRIO`

Cgroup subsystem for use in assigning processes to network priorities on a per-interface basis.                                                                      

	Symbol: CGROUP_NET_PRIO [=y]
	Type  : boolean
	Prompt: Network priority cgroup
	   Location:
	   		-> Networking support (NET [=y])
				-> Networking options

Defined at net/Kconfig:253

Depends on: NET [=y] && CGROUPS [=y]