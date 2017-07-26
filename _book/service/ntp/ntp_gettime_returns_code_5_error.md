在XEN Host服务器上执行`ntptime`指令返回

```
ntp_gettime() returns code 5 (ERROR)
  time dc4be211.ddff4000  Mon, Feb 13 2017 15:43:13.867, (.867176),
  maximum error 387516 us, estimated error 16 us
ntp_adjtime() returns code 5 (ERROR)
  modes 0x0 (),
  offset 0.000 us, frequency 0.000 ppm, interval 1 s,
  maximum error 387516 us, estimated error 16 us,
  status 0x40 (UNSYNC),
  time constant 4, precision 1.000 us, tolerance 500 ppm,
```

在KVM Host主机上执行`ntptime`指令则正常

```
ntp_gettime() returns code 0 (OK)
  time dc4ba034.900c4000  Mon, Feb 13 2017 11:02:12.562, (.562687),
  maximum error 202462 us, estimated error 277 us
ntp_adjtime() returns code 0 (OK)
  modes 0x0 (),
  offset 0.000 us, frequency 28.060 ppm, interval 1 s,
  maximum error 202462 us, estimated error 277 us,
  status 0x1 (PLL),
  time constant 6, precision 1.000 us, tolerance 500 ppm,
```

是编译的内核没有提供这个接口么？

# 参考

