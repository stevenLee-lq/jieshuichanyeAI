export const CATEGORIES_HIERARCHY = [
  {
    id: "device_material",
    name: "节水设备材料",
    subCategories: [
      {
        name: "灌溉设备",
        items: ["喷灌机", "微灌设备", "电磁阀", "智能控制器", "墒情传感器"]
      },
      {
        name: "清洗设备",
        items: ["农产品清洁机械", "水洗塔", "蒸馏锅", "高压热水清洗机", "自动清洗机", "洗涤机械", "洗衣龙"]
      },
      {
        name: "冷却设备",
        items: ["冷却塔", "冷却器", "冷凝器", "闭式冷却塔", "干冷器"]
      },
      {
        name: "控制设备",
        items: ["水泵", "阀门", "消防栓", "消防旋塞", "流量计", "压力变送器"]
      },
      {
        name: "节水管材",
        items: ["塑料管", "铸铁管", "钢管", "金属软管", "PPR管", "PE管"]
      },
      {
        name: "节水药剂",
        items: ["减水剂", "表面活性剂", "助剂", "洗涤剂", "缓蚀阻垢剂"]
      }
    ]
  },
  {
    id: "water_treatment",
    name: "水处理设备材料",
    subCategories: [
      {
        name: "曝气设备",
        items: ["微孔曝气器", "机械曝气机", "射流曝气器"]
      },
      {
        name: "过滤设备",
        items: ["多介质过滤器", "活性炭过滤器", "石英砂过滤器"]
      },
      {
        name: "膜平衡/药剂",
        items: ["反渗透膜", "超滤膜", "纳滤膜", "膜清洗剂"]
      },
      {
        name: "消毒设备",
        items: ["紫外线消毒器", "臭氧发生器", "次氯酸钠发生器"]
      }
    ]
  },
  {
    id: "monitoring",
    name: "计量监测设备仪器",
    subCategories: [
      {
        name: "流量仪表",
        items: ["超声波流量计", "电磁流量计", "涡街流量计", "智能水表"]
      },
      {
        name: "压力监测",
        items: ["压力传感器", "压力变送器", "压力记录仪"]
      },
      {
        name: "水质监测",
        items: ["浊度仪", "余氯监测仪", "COD分析仪", "PH计"]
      },
      {
        name: "漏损检测",
        items: ["听漏仪", "相关仪", "分区计量管控系统"]
      }
    ]
  },
  {
    id: "living_appliances",
    name: "节水生活器具",
    subCategories: [
      {
        name: "节水家电",
        items: ["洗碗机", "净水器", "洗衣机", "电热水器", "家用清洁器具"]
      },
      {
        name: "卫浴水暖",
        items: ["马桶", "淋浴器", "水龙头", "感应冲洗阀", "恒温混水阀"]
      },
      {
        name: "公共建筑",
        items: ["脚踏阀", "红外感应龙头", "延时自闭阀"]
      }
    ]
  },
  {
    id: "non_conventional",
    name: "非常规水源供应",
    subCategories: [
      {
        name: "再生水利用",
        items: ["中水处理站", "再生水管网", "回用水泵房"]
      },
      {
        name: "雨水收集",
        items: ["雨水模块", "弃流装置", "雨水调蓄池"]
      },
      {
        name: "海水利用",
        items: ["海水淡化工程", "海水直接利用系统"]
      }
    ]
  },
  {
    id: "service",
    name: "节水服务类",
    subCategories: [
      {
        name: "咨询评价",
        items: ["水平衡测试", "节水载体创建", "节水规划编制"]
      },
      {
        name: "合同节水",
        items: ["托管型合同节水", "节费型合同节水", "改造升级服务"]
      },
      {
        name: "技术培训",
        items: ["节水技术交流", "标准宣贯", "人才培育"]
      }
    ]
  }
];

export const CATEGORIES = CATEGORIES_HIERARCHY.map(c => c.name);

export const PRODUCTS = [
  {
    id: 1,
    name: "高精度超声波水表",
    category: "智能节水仪表",
    scenario: "城镇供水现状监测",
    info: "具备高量程比，支持远传数据监控，漏损实时报警。",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
    supplier: "水麒麟科技有限公司"
  },
  {
    id: 2,
    name: "工业微波节水冷却塔",
    category: "工业节水设备",
    scenario: "火力发电、化工循环水",
    info: "通过微波技术提升冷却效率，减少漂水蒸发损失30%。",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    supplier: "蓝绿工业科技集团"
  },
  {
    id: 3,
    name: "AI多光谱智能节水灌溉机器人",
    category: "智慧农业",
    scenario: "大面积农田精准节水",
    info: "采用多光谱成像技术与边缘AI算力，精准识别作物渴度，实现厘米级按需滴灌，节水率突破60%。",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400",
    supplier: "丰登农业智能"
  },
  {
    id: 4,
    name: "智能节水淋浴控制器",
    category: "卫浴生活器具",
    scenario: "酒店、员工宿舍、健身房",
    info: "集成恒温芯片与流量监测，智能限制洗浴时长，防止超时浪费。",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    supplier: "广西卫浴智能先锋"
  },
  {
    id: 5,
    name: "循环冷却水缓蚀阻垢剂 (SG-500)",
    category: "节水化学药剂",
    scenario: "电厂、钢厂循环冷却系统",
    info: "高效能环保配方，显著降低排污水量，提高循环倍数，延长设备寿命。",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=400",
    supplier: "博世科环保科技"
  }
];

export const TECH_CASES = [
  {
    id: 1,
    name: "某大型火力发电厂中水回用项目",
    category: "工业",
    description: "采用超滤+反渗透工艺处理城市生活污水并回用于冷却循环系统，年节水量约为300万吨。",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    name: "智慧农业精准滴灌试点工程",
    category: "农业",
    description: "通过集成土壤水分监测、自动控制阀门和微滴灌技术，实现水分利用效率提升40%以上。",
    image: "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    name: "市政非常规水源综合调配中心",
    category: "非常规水",
    description: "集中收集雨水与中水，通过智能管网对城市绿化及景观用水进行统一调配，打造海绵城市典范。",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    name: "老旧小区节水型器具整体化改造",
    category: "城镇",
    description: "对老旧社区公共厕所及居民家庭进行节水龙头、智能座便器改造，综合节水率可达25%。",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    name: "企业水平衡测试与节水潜力识别平台",
    category: "通用",
    description: "利用数字化平台进行水平衡动态测试，实时识别漏损点位，适用于各类大中型工业、商贸、机关事业单位。",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
  }
];

export const DEMANDS = [
  { id: 1, title: "XX造纸厂急需中水回用成套设备", scene: "工业", time: "2小时前", likes: 124, user: "造纸厂采购办" },
  { id: 2, title: "某县农业灌溉区求购低功耗电磁阀", scene: "农业", time: "5小时前", likes: 89, user: "兴农合作社" },
  { id: 3, title: "五星级酒店节水器具整体化升级方案", scene: "城镇", time: "昨天", likes: 56, user: "锦江酒店技术部" },
  { id: 4, title: "矿区疏干水提质净化系统整体解决方案", scene: "非常规水", time: "30分钟前", likes: 42, user: "润华矿业总务" },
  { id: 5, title: "全产业链节水数字化监测审计服务需求", scene: "通用", time: "1小时前", likes: 31, user: "某大数据产业园" }
];

export const STANDARDS = [
  { id: 1, name: "《节水型产品通用技术要求》", code: "GB/T 31436-2015", time: "2015-10-01" },
  { id: 2, name: "《工业用水压力传感器技术标准》", code: "JB/T 1234-2022", time: "2022-05-15" },
  { id: 3, name: "《农业节水灌溉工程验收标准》", code: "SL 236-1999", time: "2000-01-01" }
];

export const NEWS = [
  { id: 1, title: "2024国际节水技术博览会圆满落幕", content: "本次博览会吸引了超过500家参展商，展示了最前沿的智能水务与节水材料技术。", image: "https://images.unsplash.com/photo-1540575861501-7ad0582373f3?auto=format&fit=crop&q=80&w=400" },
  { id: 2, title: "水麒麟平台AI诊断模块正式上线", content: "基于先进AI模型，为企业提供一键式节水诊断服务，助力精准识别节水潜力。", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400" },
  { id: 3, title: "三部门联合发布国家水效标识管理办法", content: "旨在引导消费者选购节水产品，推动节水器具市场的健康发展。", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" }
];

export const POLICIES = [
  { id: 1, name: "《节水型社会建设“十四五”规划》", publisher: "国家发展改革委", time: "2023-11-20", content: "全文解读节水重点工程与目标，明确了全国各区域的节水任务指标。" },
  { id: 2, name: "关于进一步加强非常规水源利用的指导意见", publisher: "水利部", time: "2024-02-15", content: "明确了跨区域水资源配置中非常规水源的占比，以及相关奖惩机制。" },
  { id: 3, name: "广西壮族自治区节约用水条例（2024修订）", publisher: "广西人大", time: "2024-03-01", content: "针对本地工业特点进行了差异化节水要求补充。" }
];
