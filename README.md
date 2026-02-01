# LOF溢价监控小程序

一款简洁的 LOF 基金溢价率查询工具小程序。

## 功能特点

- 📊 表格形式展示 LOF 基金溢价数据
- 🔍 支持按「限额」/「全部」筛选
- 📱 固定首列，支持横向滚动查看更多数据
- 🔄 下拉刷新获取最新数据
- 🎨 红涨绿跌，颜色直观区分

## 项目结构

```
LOFPremiumMiniProgram/
├── miniprogram/              # 小程序前端代码
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   └── pages/
│       └── index/            # 首页
├── cloudfunctions/           # 云函数
│   └── getLofData/           # 获取数据云函数
└── project.config.json       # 项目配置
```

## 🚀 开发环境设置

### 前置要求
- 微信开发者工具
- 已注册的微信小程序账号
- Node.js (用于安装云函数依赖)

### 设置步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/zhsh2980/LOFPremiumMiniProgram.git
   cd LOFPremiumMiniProgram
   ```

2. **在微信开发者工具中导入项目**
   - 打开微信开发者工具
   - 选择「导入项目」
   - 选择项目目录
   - 填入你的 AppID

3. **开通云开发**
   - 在微信开发者工具中点击「云开发」
   - 创建云环境（环境名称可自定义）
   - 等待环境初始化完成

4. **配置云函数环境变量**
   
   ⚠️ **重要**：为保护敏感信息，API Token 通过环境变量配置
   
   - 打开云开发控制台
   - 进入「云函数」→ 选择 `getLofData`
   - 点击「配置」标签
   - 在「环境变量」中添加：
     - `LOF_API_TOKEN`: 你的API Token（联系管理员获取或参考 `keys/小程序.txt`）
     - `LOF_API_URL`: `http://154.8.205.159:8081`（可选）

5. **部署云函数**
   - 右键点击 `cloudfunctions/getLofData` 文件夹
   - 选择「上传并部署：云端安装依赖」
   - 等待部署完成

6. **编译运行**
   - 点击工具栏的「编译」按钮
   - 在模拟器中查看效果

## 📱 发布小程序

1. 点击工具栏「上传」按钮
2. 填写版本号和备注
3. 在[微信公众平台](https://mp.weixin.qq.com/)提交审核
4. 审核通过后发布上线

## 数据来源

数据来自 LOF Monitor 服务，通过云函数安全调用 API。

## 安全说明

- ✅ API Token 通过云函数环境变量配置，不提交到代码仓库
- ✅ `keys/` 目录已在 `.gitignore` 中排除
- ⚠️ 请勿将敏感信息硬编码在代码中

## 许可证

MIT License
