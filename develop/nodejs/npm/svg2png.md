在撰写 [在OS X安装Docker](../../../virtual/docker/engine/install/deploy_docker_in_osx.md) 文档时，发现[Docker文档](https://docs.docker.com/engine/installation/mac/)使用的图片是采用SVG（矢量图）。由于这个图形格式是XML文件，我也想转换成PNG图片，所以就google了一下处理的方法。

> [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics)(Scalable Vector Graphics)是一种基于XML的二维矢量图形格式并且支持交互和动画。SVG格式是W3C组织1999年开发的开放标准。由于SVG是通过XML文本文件定义的，所以可以搜索、索引、脚本化和压缩。作为XML文件，SVG图形可以由任何文本编辑程序创建和修改，不过，通常是使用绘图软件。所有主流的web浏览器都支持SVG图形。

# 安装`svg2png`

```bash
nvm use 5.6.0
npm install svg2png -g
```

> `svg2png`要求使用node.js 5.x，我在[开发环境使用nvm管理node.js版本](../startup/nodejs_develop_environment.md)，所以这里切换使用`v5.6.0`

# 使用PlantomJS来进行SVG转换PNG

```javascript
const pn = require("pn"); // https://www.npmjs.com/package/pn 
const svg2png = require("svg2png");
 
pn.readFile("source.svg")
    .then(svg2png)
    .then(buffer => fs.writeFile("dest.png", buffer))
    .catch(e => console.error(e));
```

# Node.js要求

`svg2png`使用了最新的`ES2015`特性，所以要求使用最新版本的Node.js，即只支持Node.js 5.x系列。


# svgexport

[svgexport](https://github.com/shakiba/svgexport)是另外一个Node.js模块和命令行工具，可以将SVG文件输出为PNG和JPEG，也是使用PhantomJS来渲染SVG文件。

安装方法

```bash
npm install svgexport --save
```

使用方法

```bash
svgexport <input file> <output file> <options>
	
	<options>        [<format>] [<quality>] [<input viewbox>] [<output size>] [<resize mode>] [<styles>]
```

```bash
svgexport input.svg output.png 1.5x
```

# 参考

* [Convert SVG to PNG](https://davidwalsh.name/convert-svg-png)
* [ svg2png: Converts SVGs to PNGs, using PhantomJS](https://www.npmjs.com/package/svg2png)