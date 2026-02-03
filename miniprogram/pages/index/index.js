// pages/index/index.js
Page({
    data: {
        lofList: [],
        updateTime: '',
        currentFilter: 'limited',
        loading: true,
        error: null
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

    // 切换筛选
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

    // 获取数据
    fetchData: function () {
        const that = this

        return wx.cloud.callFunction({
            name: 'getLofData',
            data: {
                status: this.data.currentFilter
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
            } else {
                throw new Error(result.msg || '获取数据失败')
            }
        }).catch(err => {
            console.error('获取数据失败:', err)
            that.setData({
                loading: false,
                error: err.message || '网络错误，请重试'
            })
        })
    },

    // 分享给朋友
    onShareAppMessage: function () {
        return {
            title: 'LOF溢价监控 - 实时查看LOF基金溢价率',
            path: '/pages/index/index',
            imageUrl: '' // 可选：自定义分享图片，留空则使用页面截图
        }
    },

    // 分享到朋友圈（可选）
    onShareTimeline: function () {
        return {
            title: 'LOF溢价监控',
            query: '',
            imageUrl: '' // 可选：自定义分享图片
        }
    }
})
