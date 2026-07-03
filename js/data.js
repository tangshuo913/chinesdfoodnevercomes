(function () {
  const defaultPortions = [
    { id: "small", name: "小份", priceDelta: -4 },
    { id: "medium", name: "中份", priceDelta: 0 },
    { id: "large", name: "大份", priceDelta: 8 }
  ];

  const dishes = [
    {
      id: "kung-pao-chicken",
      name: "宫保鸡丁",
      price: 28,
      category: "川菜",
      tag: "招牌",
      heat: "微辣",
      description: "鸡丁鲜嫩，花生香脆，入口微辣回甜，是经典下饭川菜。",
      image: "assets/images/kung-pao-chicken.jpg",
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
      image: "assets/images/yu-xiang-pork.jpg",
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
      image: "assets/images/mapo-tofu.jpg",
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
      image: "assets/images/hong-shao-rou.jpg",
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
      image: "assets/images/shui-zhu-beef.jpg",
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
      image: "assets/images/suan-cai-yu.jpg",
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
      image: "assets/images/tomato-eggs.jpg",
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
      image: "assets/images/xiao-chao-beef.jpg",
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
      image: "assets/images/lazi-chicken.jpg",
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
      image: "assets/images/sweet-sour-pork.jpg",
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
      image: "assets/images/yangzhou-fried-rice.jpg",
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
      image: "assets/images/scallion-noodles.jpg",
      color: "green"
    }
  ].map((dish) => ({
    ...dish,
    portions: defaultPortions.map((portion) => ({ ...portion })),
    defaultPortionId: "large"
  }));

  window.DOPAMINE_DISHES = dishes;
})();