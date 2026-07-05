# 多巴胺中餐局

一个使用 **Vue 3 + Vite** 构建的中餐点单单页应用。项目模拟了从浏览菜品、加入购物车、确认支付到配送倒计时和订单历史的完整前端体验，数据通过 `localStorage` 保存在浏览器本地。

当前 UI 已调整为清新克制的多巴胺风格：

- 主色：柔西柚珊瑚 `#FF6F86`
- 对比色：晴空钴蓝 `#2F80ED`
- 视觉方向：浅色背景、大面积留白、柔和阴影、少量高饱和按钮和状态色

## 功能

- 菜品轮播推荐
- 菜单分类筛选
- 菜品卡片和详情弹窗
- 份量选择和数量选择
- 购物车增减、删除、总价计算
- 结算确认和支付方式选择
- 模拟支付成功
- 2 分钟配送倒计时
- 配送进度弹窗
- 订单历史记录
- 购物车、订单、配送状态本地持久化
- 桌面端和移动端响应式布局

## 技术栈

- Vue 3
- Vite
- Composition API
- CSS Variables 设计 token
- localStorage

## 项目结构

```text
.
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
├─ public/
├─ assets/
├─ src/
│  ├─ main.js
│  ├─ App.vue
│  ├─ data/
│  │  └─ menu.js
│  ├─ utils/
│  │  └─ storage.js
│  ├─ composables/
│  │  ├─ useCart.js
│  │  ├─ useDelivery.js
│  │  └─ useOrders.js
│  ├─ components/
│  │  ├─ PromoCarousel.vue
│  │  ├─ MenuList.vue
│  │  ├─ MenuItem.vue
│  │  ├─ CartPanel.vue
│  │  ├─ CartItem.vue
│  │  ├─ CheckoutConfirm.vue
│  │  ├─ PaymentMethod.vue
│  │  ├─ DeliveryStatus.vue
│  │  ├─ OrderHistory.vue
│  │  └─ OrderCard.vue
│  └─ styles/
│     └─ main.css
├─ css/
└─ js/
```

说明：当前 Vite 应用入口是 `src/main.js` 和 `src/App.vue`。根目录下的 `css/`、`js/` 更像旧版静态实现遗留目录，当前预览和构建主要使用 `src/`。

## 安装依赖

```bash
npm install
```

如果依赖已经安装过，通常不需要重复执行。页面无法访问时，更多时候是开发服务没有启动，而不是依赖丢失。

## 本地开发

```bash
npm run dev
```

项目默认会启动在：

```text
http://127.0.0.1:5173/
```

在 Windows PowerShell 如果遇到 `npm.ps1` 执行策略限制，可以使用：

```bash
npm.cmd run dev
```

如果浏览器提示 `127.0.0.1 拒绝建立连接` 或 `ERR_CONNECTION_REFUSED`，说明 Vite 服务当前没有运行。重新执行上面的开发命令即可，不需要重新安装依赖。

## 生产构建

```bash
npm run build
```

Windows PowerShell 下也可以使用：

```bash
npm.cmd run build
```

构建产物会输出到 `dist/`。

## 本地预览构建产物

```bash
npm run preview
```

## UI 设计说明

主要样式集中在：

```text
src/styles/main.css
```

当前样式使用 CSS 变量维护设计 token，包括：

- `--primary: #ff6f86`
- `--secondary: #2f80ed`
- `--paper`
- `--surface`
- `--line`
- `--muted`
- `--shadow`

主色用于价格、主按钮、选中态和关键行动；蓝色用于配送状态、支付选中态、进度条和辅助强调。这样可以保留多巴胺的活力，同时避免颜色过多造成杂乱。

## 菜品图片

菜单数据在：

```text
src/data/menu.js
```

项目会优先读取：

```text
src/assets/images/
```

如果没有对应图片，会回退到：

```text
public/assets/images/
```

建议图片文件名：

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

没有图片时，页面会使用当前配色体系下的渐变占位图。

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run preview
```

## 数据存储

项目不会连接后端服务，购物车、订单历史和配送状态都保存在浏览器 `localStorage` 中。清空浏览器站点数据后，历史订单和购物车也会被清空。
