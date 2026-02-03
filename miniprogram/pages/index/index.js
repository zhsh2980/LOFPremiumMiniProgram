// pages/index/index.js
Page({
    data: {
        lofList: [],
        updateTime: '',
        currentTab: 'lof', // lof, qdii, index
        currentFilter: 'limited',
        loading: true,
        error: null,
        scrollTop: 0,
        scrollLeft: 0
    },

    onLoad: function () {
        this.fetchData()
    },

    // 下拉刷新
    onPullDownRefresh: function () {
        this.fetchData().finally(() => {
            wx.stopPullDownRefresh()
        })
    },

    // 切换 Tab
    onTabChange: function (e) {
        const tab = e.currentTarget.dataset.tab
        if (tab === this.data.currentTab) return

        this.setData({
            currentTab: tab,
            loading: true,
            error: null,
            scrollTop: 0,
            scrollLeft: 0
        })
        this.fetchData()
    },

    // 切换筛选（只对 LOF 套利有效）
    onFilterChange: function (e) {
        const status = e.currentTarget.dataset.status
        if (status === this.data.currentFilter) return

        this.setData({
            currentFilter: status,
            loading: true,
            error: null
        })
        this.fetchData()
    },

    // 左侧滚动触发
    onLeftScroll: function (e) {
        this.setData({
            scrollTop: e.detail.scrollTop
        })
    },

    // 右侧滚动触发（同时处理纵向和横向）
    onRightScroll: function (e) {
        this.setData({
            scrollTop: e.detail.scrollTop,
            scrollLeft: e.detail.scrollLeft
        })
    },

    // 获取数据
    fetchData: function () {
        const that = this

        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'getLofData',
                data: {
                    type: that.data.currentTab,
                    status: that.data.currentFilter
                }
            }).then(res => {
                const result = res.result
                if (result.success) {
                    // 格式化更新时间
                    let updateTimeStr = ''
                    if (result.data.update_time) {
                        const date = new Date(result.data.update_time)
                        const hours = date.getHours().toString().padStart(2, '0')
                        const minutes = date.getMinutes().toString().padStart(2, '0')
                        updateTimeStr = `${hours}:${minutes}`
                    }

                    that.setData({
                        lofList: result.data.items,
                        updateTime: updateTimeStr,
                        loading: false,
                        error: null
                    })
                    resolve()
                } else {
                    that.setData({
                        loading: false,
                        error: result.msg || '加载失败'
                    })
                    reject(new Error(result.msg))
                }
            }).catch(err => {
                console.error('云函数调用失败:', err)
                that.setData({
                    loading: false,
                    error: err.message || '网络错误，请重试'
                })
                reject(err)
            })
        })
    },

    // 分享给朋友
    onShareAppMessage: function () {
        return {
            title: 'LOF溢价监控 - 实时查看LOF基金溢价率',
            path: '/pages/index/index',
            imageUrl: ''
        }
    },

    // 分享到朋友圈
    onShareTimeline: function () {
        return {
            title: 'LOF溢价监控',
            query: '',
            imageUrl: ''
        }
    }
})
