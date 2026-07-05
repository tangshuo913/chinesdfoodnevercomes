const defaultPortions = [
  { id: "small", name: "小份", priceDelta: -4 },
  { id: "medium", name: "中份", priceDelta: 0 },
  { id: "large", name: "大份", priceDelta: 8 }
];

const imageModules = import.meta.glob("../assets/images/*", {
  eager: true,
  query: "?url",
  import: "default"
});

function imageFor(fileName) {
  return imageModules[`../assets/images/${fileName}`] || `/assets/images/${fileName}`;
}

export const dessertCategories = [
  "全部",
  "蛋糕甜点",
  "奶茶果茶",
  "冰淇淋",
  "中式糖水",
  "烘焙面包",
  "咖啡可可",
  "低卡轻甜",
  "季节限定",
  "人气爆款"
];

const dessertVisuals = [
  "dessert-strawberry-cake.svg",
  "dessert-mango-sago.svg",
  "dessert-boba-tea.svg",
  "dessert-ice-cream.svg",
  "dessert-tiramisu.svg",
  "dessert-peach-tea.svg",
  "dessert-matcha.svg",
  "dessert-bakery.svg"
];

const rawMenu = [
  {
    id: "kung-pao-chicken",
    name: "宫保鸡丁",
    price: 28,
    category: "川菜",
    tag: "招牌",
    heat: "微辣",
    description: "鸡丁鲜嫩，花生香脆，入口微辣回甜，是经典下饭川菜。",
    image: imageFor("gong-bao-ji-ding.jpg"),
    color: "red"
  },
  {
    id: "yu-xiang-pork",
    name: "鱼香肉丝",
    price: 32,
    category: "川菜",
    tag: "下饭",
    heat: "微辣",
    description: "酸甜咸香层次丰富，肉丝滑嫩，配米饭很合适。",
    image: imageFor("yu-xiang-rou-si.jpg"),
    color: "orange"
  },
  {
    id: "mapo-tofu",
    name: "麻婆豆腐",
    price: 18,
    category: "川菜",
    tag: "热销",
    heat: "中辣",
    description: "豆腐细嫩，酱香和花椒香明显，热乎乎地拌饭很舒服。",
    image: imageFor("ma-pu-dou-fu.jpg"),
    color: "red"
  },
  {
    id: "hong-shao-rou",
    name: "红烧肉",
    price: 38,
    category: "江浙",
    tag: "经典",
    heat: "不辣",
    description: "肥瘦相间，酱汁浓郁，甜咸平衡，适合慢慢吃。",
    image: imageFor("hong-shao-rou.jpg"),
    color: "brown"
  },
  {
    id: "shui-zhu-beef",
    name: "水煮牛肉",
    price: 42,
    category: "川菜",
    tag: "高能",
    heat: "中辣",
    description: "牛肉滑嫩，汤底麻辣鲜香，蔬菜吸满汤汁。",
    image: imageFor("shui-zhu-niu-rou.jpg"),
    color: "red"
  },
  {
    id: "suan-cai-yu",
    name: "酸菜鱼",
    price: 48,
    category: "川菜",
    tag: "大份",
    heat: "微辣",
    description: "鱼片细嫩，酸菜开胃，汤底鲜亮，适合多人分享。",
    image: imageFor("suan-cai-yu.JPG"),
    color: "green"
  },
  {
    id: "tomato-eggs",
    name: "番茄炒蛋",
    price: 16,
    category: "家常",
    tag: "清爽",
    heat: "不辣",
    description: "番茄酸甜，鸡蛋松软，是稳定温柔的家常选择。",
    image: imageFor("fan-qie-chao-dan.JPG"),
    color: "yellow"
  },
  {
    id: "xiao-chao-beef",
    name: "小炒黄牛肉",
    price: 39,
    category: "湘菜",
    tag: "爆香",
    heat: "中辣",
    description: "牛肉香辣有锅气，青椒提味，适合想吃重口的时候。",
    image: imageFor("xiao-chao-huang-niu-rou.jpg"),
    color: "green"
  },
  {
    id: "lazi-chicken",
    name: "辣子鸡",
    price: 36,
    category: "川菜",
    tag: "酥香",
    heat: "重辣",
    description: "鸡块外酥里嫩，干辣椒香气足，越嚼越香。",
    image: imageFor("la-zi-ji.jpg"),
    color: "red"
  },
  {
    id: "sweet-sour-pork",
    name: "糖醋里脊",
    price: 34,
    category: "鲁菜",
    tag: "酸甜",
    heat: "不辣",
    description: "外壳轻脆，酸甜酱汁明亮，适合不吃辣的快乐。",
    image: imageFor("tang-cu-li-ji.jpg"),
    color: "pink"
  },
  {
    id: "yangzhou-fried-rice",
    name: "扬州炒饭",
    price: 22,
    category: "主食",
    tag: "饱腹",
    heat: "不辣",
    description: "米粒分明，配料丰富，单点也能吃得很完整。",
    image: imageFor("yang-zhou-chao-fan.jpg"),
    color: "yellow"
  },
  {
    id: "scallion-noodles",
    name: "葱油拌面",
    price: 18,
    category: "主食",
    tag: "快手",
    heat: "不辣",
    description: "葱香浓，面条筋道，简单直接但很有满足感。",
    image: imageFor("cong-you-ban-mian.jpg"),
    color: "green"
  }
];

const rawDesserts = [
  ["strawberry-crepe-cake", "草莓千层", 28, "蛋糕甜点", "爆款", "冰甜", "草莓爆汁，奶油轻盈，层层薄饼叠出粉色快乐。", "cao-mei-qian-ceng.jpg"],
  ["tiramisu-cloud-cup", "云朵提拉米苏杯", 26, "蛋糕甜点", "人气", "微甜", "可可微苦，奶油绵密，适合饭后来一杯。", "yun-duo-ti-la-mi-su-bei.jpg"],
  ["matcha-basque", "抹茶巴斯克", 32, "蛋糕甜点", "新品", "微甜", "抹茶香气清透，芝士口感厚实不腻。", "mo-cha-ba-si-ke.jpg"],
  ["mango-mousse", "芒果慕斯", 29, "蛋糕甜点", "限定", "冰甜", "芒果果香浓，慕斯入口像被阳光抱住。", "mang-guo-mu-si.jpg"],
  ["black-forest-cake", "樱桃黑森林", 31, "蛋糕甜点", "经典", "微甜", "巧克力、奶油和樱桃的稳定组合。", "ying-tao-hei-sen-lin.jpg"],
  ["sea-salt-cheese-cake", "海盐芝士蛋糕", 27, "蛋糕甜点", "轻甜", "微甜", "海盐收住甜度，芝士香气很上头。", "hai-yan-zhi-shi-dan-gao.jpg"],

  ["taro-boba-milk-tea", "芋泥啵啵奶茶", 18, "奶茶果茶", "爆款", "冰甜", "厚芋泥加啵啵，一口糯到心里。", "yu-ni-bo-bo-nai-cha.jpg"],
  ["peach-oolong-tea", "蜜桃乌龙茶", 16, "奶茶果茶", "清爽", "冰甜", "桃香明亮，乌龙回甘，饭后来一杯刚好。", "mi-tao-wu-long-cha.jpg"],
  ["grape-jelly-tea", "葡萄冻柠茶", 19, "奶茶果茶", "高颜值", "冰甜", "葡萄果肉和柠檬茶底一起晃，紫色快乐拉满。", "pu-tao-dong-ning-cha.jpg"],
  ["strawberry-bobo", "草莓啵啵奶", 20, "奶茶果茶", "拍照", "冰甜", "粉色草莓奶底，啵啵弹牙，甜得很直接。", "cao-mei-bo-bo-nai.jpg"],
  ["mango-sago-milk", "杨枝甘露奶茶", 22, "奶茶果茶", "爆款", "冰甜", "芒果、西柚、椰奶一起把热量变快乐。", "yang-zhi-gan-lu-nai-cha.jpg"],
  ["jasmine-lemon-tea", "茉莉柠檬茶", 15, "奶茶果茶", "解腻", "清爽", "茉莉香和柠檬酸度很干净，适合配重口菜。", "mo-li-ning-meng-cha.jpg"],

  ["oreo-snow-ice", "奥利奥雪冰", 24, "冰淇淋", "爆款", "冰爽", "雪冰松软，奥利奥碎铺满，每一勺都很脆。", "ao-li-ao-xue-bing.jpg"],
  ["mango-shaved-ice", "芒果绵绵冰", 26, "冰淇淋", "大份", "冰爽", "绵绵冰入口即化，芒果块给得很足。", "mang-guo-mian-mian-bing.jpg"],
  ["strawberry-sundae", "草莓圣代", 17, "冰淇淋", "人气", "冰爽", "草莓酱绕着奶香冰淇淋，快乐很快到账。", "cao-mei-sheng-dai.jpg"],
  ["matcha-redbean-ice", "抹茶红豆冰", 23, "冰淇淋", "日式", "微甜", "抹茶微苦，红豆软糯，甜度刚刚好。", "mo-cha-hong-dou-bing.jpg"],
  ["coconut-snow-top", "椰椰雪顶", 21, "冰淇淋", "清爽", "冰爽", "椰香很轻，雪顶很厚，适合夏天。", "ye-ye-xue-ding.jpg"],
  ["choco-crispy-icecream", "巧克力脆皮冰淇淋", 16, "冰淇淋", "经典", "冰爽", "脆皮咔嚓一声，里面是浓郁奶香。", "qiao-ke-li-cui-pi-bing-qi-lin.jpg"],

  ["double-skin-milk", "顺德双皮奶", 18, "中式糖水", "经典", "温甜", "奶皮细腻，入口滑，甜度温柔。", "shun-de-shuang-pi-nai.jpg"],
  ["taro-ball-grass-jelly", "芋圆仙草", 19, "中式糖水", "料足", "冰甜", "芋圆、仙草、红豆同框，嚼感很丰富。", "yu-yuan-xian-cao.jpg"],
  ["peach-gum-soup", "桃胶银耳羹", 20, "中式糖水", "润甜", "温甜", "银耳软糯，桃胶弹润，适合慢慢喝。", "tao-jiao-yin-er-geng.jpg"],
  ["red-bean-soup", "陈皮红豆沙", 16, "中式糖水", "暖心", "温甜", "红豆沙细密，陈皮香把甜味托起来。", "chen-pi-hong-dou-sha.jpg"],
  ["ginger-milk-curd", "姜撞奶", 17, "中式糖水", "广式", "温甜", "姜香轻轻冒头，奶冻滑得很认真。", "jiang-zhuang-nai.jpg"],
  ["osmanthus-rice-ball", "桂花酒酿圆子", 18, "中式糖水", "季节", "温甜", "桂花香、酒酿甜和小圆子一起暖起来。", "gui-hua-jiu-niang-yuan-zi.jpg"],

  ["cream-croissant", "奶油可颂", 18, "烘焙面包", "酥香", "微甜", "可颂外层酥脆，奶油夹心很轻。", "nai-you-ke-song.jpg"],
  ["dirty-bun", "巧克力脏脏包", 22, "烘焙面包", "浓郁", "甜香", "巧克力粉扑满，咬下去很有满足感。", "qiao-ke-li-zang-zang-bao.jpg"],
  ["pork-floss-cake", "海苔肉松小贝", 19, "烘焙面包", "咸甜", "微甜", "肉松蓬松，沙拉酱咸甜，越吃越想加购。", "hai-tai-rou-song-xiao-bei.jpg"],
  ["pineapple-bun", "冰火菠萝包", 16, "烘焙面包", "港式", "甜香", "酥皮热，黄油凉，冷热反差很迷人。", "bing-huo-bo-luo-bao.jpg"],
  ["cheese-bagel", "芝士贝果", 20, "烘焙面包", "饱腹", "咸甜", "贝果有嚼劲，芝士香气很扎实。", "zhi-shi-bei-guo.jpg"],
  ["coconut-bread", "椰蓉奶酥包", 15, "烘焙面包", "椰香", "甜香", "椰蓉香甜，奶酥柔软，适合当下午茶。", "ye-rong-nai-su-bao.jpg"],

  ["coconut-latte", "生椰拿铁", 19, "咖啡可可", "爆款", "冰爽", "椰香和咖啡融合得很顺，清醒又快乐。", "sheng-ye-na-tie.jpg"],
  ["thick-milk-latte", "厚乳拿铁", 18, "咖啡可可", "醇厚", "微甜", "厚乳放大奶香，咖啡苦味很温柔。", "hou-ru-na-tie.jpg"],
  ["iced-americano", "冰美式", 13, "咖啡可可", "清醒", "清爽", "干净利落，适合给甜品留空间。", "bing-mei-shi.jpg"],
  ["mocha-cocoa", "摩卡可可", 20, "咖啡可可", "浓郁", "甜香", "巧克力香和咖啡香一起冲上来。", "mo-ka-ke-ke.jpg"],
  ["caramel-macchiato", "焦糖玛奇朵", 21, "咖啡可可", "甜香", "微甜", "焦糖甜感很香，奶泡顺滑。", "jiao-tang-ma-qi-duo.jpg"],
  ["matcha-latte", "抹茶拿铁", 19, "咖啡可可", "轻甜", "微甜", "抹茶细腻，奶香柔和，绿色治愈系。", "mo-cha-na-tie.jpg"],

  ["low-sugar-yogurt-bowl", "低糖酸奶碗", 24, "低卡轻甜", "低糖", "轻甜", "酸奶、莓果和谷物组合，轻盈但不无聊。", "di-tang-suan-nai-wan.jpg"],
  ["chia-pudding", "奇亚籽布丁", 21, "低卡轻甜", "低卡", "轻甜", "奇亚籽饱满，椰奶底清爽。", "qi-ya-zi-bu-ding.jpg"],
  ["oat-cup", "燕麦水果杯", 20, "低卡轻甜", "轻食", "轻甜", "燕麦、香蕉、莓果叠层，早餐感很足。", "yan-mai-shui-guo-bei.jpg"],
  ["soy-milk-box", "低糖豆乳盒子", 23, "低卡轻甜", "低糖", "微甜", "豆乳香气细腻，甜度压得很克制。", "di-tang-dou-ru-he-zi.jpg"],
  ["coconut-jelly", "椰子冻", 18, "低卡轻甜", "清爽", "冰甜", "椰香清透，冻感滑滑的，饭后无负担。", "ye-zi-dong.jpg"],
  ["light-cheese-cake", "轻乳酪", 22, "低卡轻甜", "轻甜", "微甜", "奶酪香柔柔的，口感像云一样。", 0],

  ["lychee-rose-ice", "荔枝玫瑰冰", 24, "季节限定", "限定", "冰爽", "荔枝清甜，玫瑰香微微上扬。", 3],
  ["peach-panna-cotta", "蜜桃奶冻", 22, "季节限定", "拍照", "冰甜", "蜜桃粉和奶冻白叠在一起，颜值很能打。", 5],
  ["green-grape-jasmine", "青提茉莉", 21, "季节限定", "清爽", "冰甜", "青提爆汁，茉莉茶底很干净。", 5],
  ["strawberry-snow-mountain", "草莓雪山", 26, "季节限定", "爆款", "冰甜", "草莓铺成小雪山，奶盖厚厚一层。", 0],
  ["chestnut-mont-blanc", "栗子蒙布朗", 29, "季节限定", "秋冬", "微甜", "栗子泥浓郁，奶油柔软，适合慢慢吃。", 4],
  ["grapefruit-yakult", "西柚养乐多", 17, "季节限定", "酸甜", "清爽", "西柚微苦，乳酸清甜，解腻很快。", 5],

  ["signature-dessert-box", "甜品快乐盒", 39, "人气爆款", "爆款", "混合", "千层、奶冻、雪冰一盒打包，选择困难直接解决。", 0],
  ["mango-sago", "招牌杨枝甘露", 22, "人气爆款", "必点", "冰甜", "芒果浓、椰奶香、西柚酸，经典就是经典。", 1],
  ["pink-boba-party", "粉色啵啵派对", 25, "人气爆款", "高颜值", "冰甜", "草莓奶、啵啵、奶盖叠满，多巴胺很足。", 2],
  ["oreo-cream-cup", "奥利奥奶油杯", 20, "人气爆款", "爆款", "甜香", "奥利奥碎和奶油层层叠，挖着吃很快乐。", 4],
  ["peach-oolong-snow", "蜜桃乌龙雪顶", 23, "人气爆款", "拍照", "冰甜", "乌龙茶底加蜜桃雪顶，香气很漂亮。", 5],
  ["matcha-redbean-cup", "抹茶红豆杯", 21, "人气爆款", "日式", "微甜", "抹茶和红豆的稳定搭档，越吃越顺。", 6]
].map(([id, name, price, dessertCategory, tag, heat, description, visual], index) => ({
  id,
  name,
  price,
  category: "甜品饮品",
  dessertCategory,
  tag,
  heat,
  description,
  sales: 280 + ((index * 137) % 820),
  rating: Number((4.6 + ((index % 4) * 0.1)).toFixed(1)),
  image: imageFor(typeof visual === "string" ? visual : dessertVisuals[visual]),
  color: "pink",
  isDessert: true
}));

rawMenu.push(...rawDesserts);

export const menuItems = rawMenu.map((dish) => ({
  ...dish,
  portions: defaultPortions.map((portion) => ({ ...portion })),
  defaultPortionId: "large"
}));

export const categories = ["全部", ...new Set(menuItems.map((dish) => dish.category))];

export function getDishById(dishId) {
  return menuItems.find((dish) => dish.id === dishId) || null;
}

export function getPortion(dish, portionId) {
  if (!dish) return null;
  const preferredId = portionId || dish.defaultPortionId || "large";
  return dish.portions.find((portion) => portion.id === preferredId) || dish.portions[0] || null;
}

export function getPortionPrice(dish, portion) {
  if (!dish || !portion) return 0;
  return Math.max(1, dish.price + portion.priceDelta);
}
