// cloudfunctions/getLofData/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 配置信息
const API_CONFIG = {
  BASE_URL: 'http://154.8.205.159:8081',
  // 开发阶段暂时硬编码 Token，上线前建议移至云函数环境变量
  TOKEN: 'lofmonitor_b41528863f7bf431126e2afcb00042b7'
}

/**
 * 清理基金名称，去除不必要的标签
 */
function cleanFundName(name) {
  if (!name) return name

  // 只去除交易标签：T+0、QD（保留 LOF）
  let cleaned = name
    .replace(/T\+0/gi, '')    // 去除 T+0
    .replace(/QD/gi, '')      // 去除 QD
    .replace(/\s+/g, ' ')     // 多个空格替换为一个
    .trim()                   // 去除首尾空格

  return cleaned
}

exports.main = async (event, context) => {
  const { status = 'limited', min_premium = 0 } = event

  try {
    // 1. 调用后端 API
    const response = await axios({
      method: 'get',
      url: `${API_CONFIG.BASE_URL}/api/lof/list`,
      params: {
        status: status === 'all' ? 'all' : 'limited',
        min_premium: min_premium
      },
      headers: {
        'Authorization': `Bearer ${API_CONFIG.TOKEN}`
      },
      timeout: 15000  // 增加到 15 秒，适应云函数网络延迟
    })

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'API返回错误')
    }

    const result = response.data.data

    // 2. 数据格式化（适配表格布局）
    const items = result.items.map(item => ({
      code: item.fund_code,
      name: cleanFundName(item.fund_name), // 清理名称
      price: item.price !== null ? item.price.toFixed(3) : '--',
      // 溢价率：保留2位小数，带正负号
      premium_rate: item.premium_rate !== null
        ? (item.premium_rate > 0 ? '+' : '') + item.premium_rate.toFixed(2) + '%'
        : '--',
      premium_val: item.premium_rate, // 用于前端判断颜色
      // 涨跌幅：保留2位小数，带正负号
      change: item.change_pct !== null
        ? (item.change_pct > 0 ? '+' : '') + item.change_pct.toFixed(2) + '%'
        : '--',
      change_val: item.change_pct, // 用于前端判断颜色
      // 状态标签
      status: item.apply_status
    }))

    return {
      success: true,
      data: {
        update_time: result.update_time,
        items: items
      }
    }

  } catch (err) {
    console.error('获取数据失败:', err)
    return {
      success: false,
      msg: '获取数据失败',
      error: err.message
    }
  }
}
