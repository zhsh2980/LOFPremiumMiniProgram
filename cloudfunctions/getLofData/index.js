// cloudfunctions/getLofData/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 配置信息
const API_CONFIG = {
  BASE_URL: process.env.LOF_API_URL || 'http://154.8.205.159:8081',
  TOKEN: process.env.LOF_API_TOKEN || '' // 从云函数环境变量读取
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

/**
 * 获取 LOF 套利数据
 */
async function getLofArbitrage(status) {
  const response = await axios({
    method: 'get',
    url: `${API_CONFIG.BASE_URL}/api/lof/list`,
    params: {
      status: status === 'all' ? 'all' : 'limited',
      min_premium: 0
    },
    headers: {
      'Authorization': `Bearer ${API_CONFIG.TOKEN}`
    },
    timeout: 15000
  })

  if (response.data.code !== 0) {
    throw new Error(response.data.message || 'API返回错误')
  }

  const result = response.data.data

  // 格式化数据
  const items = result.items.map(item => {
    // 确保 styles 有完整的默认结构
    const defaultStyles = {
      change_pct: { color: '#333' },
      premium_rate: { color: '#333' },
      apply_status: { color: '#333' }
    }
    const styles = { ...defaultStyles, ...item.styles }

    return {
      code: item.fund_code,
      name: cleanFundName(item.fund_name),
      price: item.price !== null ? item.price : '--',
      // LOF 套利接口返回的是数字，为了统一展示，添加 % 后缀
      premium_rate: item.premium_rate !== null ? (item.premium_rate + '%') : '--',
      change: item.change_pct !== null ? (item.change_pct + '%') : '--',
      status: item.apply_status,
      limit: item.apply_limit || '',
      amount: item.amount !== null ? item.amount : '--',
      nav_date: item.nav_date || '--',
      shares: item.shares !== null ? item.shares : '--',
      shares_change: item.shares_change !== null ? item.shares_change : '--',
      styles: styles
    }
  })

  return {
    update_time: result.update_time,
    items: items
  }
}

/**
 * 获取 QDII 商品数据
 */
async function getQdiiCommodity() {
  const response = await axios({
    method: 'get',
    url: `${API_CONFIG.BASE_URL}/api/qdii/commodity`,
    headers: {
      'Authorization': `Bearer ${API_CONFIG.TOKEN}`
    },
    timeout: 15000
  })

  if (response.data.code !== 0) {
    throw new Error(response.data.message || 'API返回错误')
  }

  const result = response.data.data

  // 格式化数据 - QDII 商品
  const items = result.items.map(item => {
    // 确保 styles 有完整的默认结构
    const defaultStyles = {
      change_pct: { color: '#333' },
      premium_rate_t1: { color: '#333' },
      rt_premium_rate: { color: '#333' },
      apply_status: { color: '#333' }
    }
    const styles = { ...defaultStyles, ...item.styles }

    return {
      code: item.fund_code,
      name: cleanFundName(item.fund_name),
      price: item.price || '--',
      change: item.change_pct || '--',
      premium_rate_t1: item.premium_rate_t1 || '--', // T-1溢价率
      rt_premium_rate: item.rt_premium_rate || '--', // 实时溢价率
      status: item.apply_status || '--',
      nav_date: item.nav_date || '--',
      valuation_date: item.valuation_date || '--',   // 估值日期
      volume: item.volume || '--',
      shares: item.shares || '--',
      shares_change: item.shares_change || '--',
      styles: styles
    }
  })

  return {
    update_time: result.update_time,
    items: items
  }
}

/**
 * 获取指数 LOF 数据
 */
async function getIndexLof() {
  const response = await axios({
    method: 'get',
    url: `${API_CONFIG.BASE_URL}/api/lof/index`,
    headers: {
      'Authorization': `Bearer ${API_CONFIG.TOKEN}`
    },
    timeout: 15000
  })

  if (response.data.code !== 0) {
    throw new Error(response.data.message || 'API返回错误')
  }

  const result = response.data.data

  // 格式化数据 - 指数 LOF
  const items = result.items.map(item => {
    // 确保 styles 有完整的默认结构
    const defaultStyles = {
      change_pct: { color: '#333' },
      premium_rate: { color: '#333' },
      index_change_pct: { color: '#333' },
      apply_status: { color: '#333' }
    }
    const styles = { ...defaultStyles, ...item.styles }

    return {
      code: item.fund_code,
      name: cleanFundName(item.fund_name),
      price: item.price || '--',
      change: item.change_pct || '--',
      premium_rate: item.premium_rate || '--',
      index_change: item.index_change_pct || '--',
      rt_valuation: item.rt_valuation || '--',
      status: item.apply_status || '--',
      nav: item.nav || '--',
      nav_date: item.nav_date || '--',
      volume: item.volume || '--',
      shares: item.shares || '--',
      shares_change: item.shares_change || '--',
      styles: styles
    }
  })

  return {
    update_time: result.update_time,
    items: items
  }
}

exports.main = async (event, context) => {
  const { type = 'lof', status = 'limited' } = event

  try {
    let data

    switch (type) {
      case 'qdii':
        data = await getQdiiCommodity()
        break
      case 'index':
        data = await getIndexLof()
        break
      case 'lof':
      default:
        data = await getLofArbitrage(status)
        break
    }

    return {
      success: true,
      data: data
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
