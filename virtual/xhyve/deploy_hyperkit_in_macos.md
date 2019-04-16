* 为了在块设备后端支持qcow，需要安装OCaml `OPAM <https://opam.ocaml.org/>`_ 开发环境带有qcow模块

```
brew install opam libev
opam init
eval `opam config env`
opam install uri qcow.0.10.4 conduit.1.0.0 lwt.3.1.0 qcow-tool mirage-block-unix.2.9.0 conf-libev logs fmt mirage-unix prometheus-app
```

为了能够在编译hyperkit之前找到ocaml环境，必须在编译前执行一次 ``opam config env``

可以通过以下命令移除之前旧版本的 ``mirage-block-unix`` 的 ``pin`` 或者 ``qcow`` ::

```
opam update
opam pin remove mirage-block-unix
opam pin remove qcow
```

安装HyperKit

```
git clone https://github.com/moby/hyperkit
cd hyperkit
make
```

> 二进制执行程序位于 ``build/hyperkit``