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

## 开发指南

### 1. 导入项目

使用微信开发者工具导入本项目，AppID 已配置在 `project.config.json` 中。

### 2. 开通云开发

1. 在微信开发者工具中点击「云开发」按钮
2. 开通云开发环境
3. 记录环境 ID

### 3. 部署云函数

1. 右键点击 `cloudfunctions/getLofData` 目录
2. 选择「上传并部署：云端安装依赖」

### 4. 运行小程序

部署完成后，点击「编译」即可预览小程序。

## 数据来源

数据来自 LOF Monitor 服务，通过云函数安全调用 API。

## 许可证

MIT License
