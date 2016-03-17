Progressive JPEG是一种通过优化JEPG方式来优化WEB网站使用体验的方式，和Baseline JPEG不同，Progressive JPEG可以让浏览器下载图片的部分时就显示完整的低分辨率图片，并逐步下载和展示完整的高分辨率图像。这样用户可以对图像有较好的观赏体验。

> 常规的JPEG图片加载是从上往下，也称为baseline图像。

# Baseline JPEG和Progressive JPEG对比

* Baseline JPEG
  
![baseline-JPEG](/img/performance/web/baseline-JPEG.png)

* Progressive JPEG
  
![Progressive-JPEG](/img/performance/web/Progressive-JPEG.png)

# 使用ImageMagick创建优化和progressive JPG

以下命令优化JPG图片并使之实现progressive

```bash
convert -strip -interlace Plane -quality 80 input-file.jpg output-file.jpg
```

批量处理一个目录下的所有图片：

```bash
for i in source/images/backgrounds/*.jpg; do convert -strip -interlace Plane -quality 80 $i $i; done
```

使用Carrierwave和MiniMagick，可以创建一个优化功能模块：

```bash
def optimize
  manipulate! do |img|
      return img unless img.mime_type.match /image\/jpeg/
      img.strip
      img.combine_options do |c|
          c.quality "80"
          c.depth "8"
          c.interlace "plane"
      end
      img
  end
end
```

然后使用如下加载器：

```bash
version :large do
  process :optimize
end
````

> [Use ImageMagick to create optimised and progressive JPGs](https://coderwall.com/p/ryzmaa/use-imagemagick-to-create-optimised-and-progressive-jpgs)

# 参考

* [Progressive JPEGs FTW!](http://blog.patrickmeenan.com/2013/06/progressive-jpegs-ftw.html)
* [Image Optimization, Part 4: Progressive JPEG...Hot or Not?](http://yuiblog.com/blog/2008/12/05/imageopt-4/)
* [Progressive jpegs: a new best practice](http://calendar.perfplanet.com/2012/progressive-jpegs-a-new-best-practice/)
* [Progressive image rendering: Good or evil?](http://www.webperformancetoday.com/2014/09/17/progressive-image-rendering-good-evil/)
* [Use ImageMagick to create optimised and progressive JPGs](https://coderwall.com/p/ryzmaa/use-imagemagick-to-create-optimised-and-progressive-jpgs)
* [Progressive JPEG](https://optimus.io/support/progressive-jpeg/)