# 多巴胺中餐局

一个纯前端单页网站，用 HTML、CSS、JavaScript 和 localStorage 模拟中餐外卖点单体验。

## 第一阶段功能

- 菜单展示
- 加入购物车
- 数量增加、减少、删除
- 总价计算
- 提交订单
- 2 分钟配送倒计时
- 送达动画
- 订单历史
- 配送中和已完成订单持久化
- 购物车持久化
- 移动端适配

## 文件结构

```text
.
├── index.html
├── css
│   └── styles.css
├── js
│   ├── data.js
│   ├── storage.js
│   ├── cart.js
│   ├── orders.js
│   ├── delivery.js
│   └── app.js
└── assets
    └── images
```

## 菜品图片

当前版本已经预留图片路径。把图片放到 `assets/images` 并使用下列文件名即可自动显示：

```text
kung-pao-chicken.jpg
yu-xiang-pork.jpg
mapo-tofu.jpg
hong-shao-rou.jpg
shui-zhu-beef.jpg
suan-cai-yu.jpg
tomato-eggs.jpg
xiao-chao-beef.jpg
lazi-chicken.jpg
sweet-sour-pork.jpg
yangzhou-fried-rice.jpg
scallion-noodles.jpg
```

没有图片时，页面会使用彩色占位图。
