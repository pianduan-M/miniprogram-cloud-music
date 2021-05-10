// pages/search/index.js
import request from '../../request/index'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultSearch: '',
    hotSearch: [],
    SearchValue: '',
    historySearch: [],
    // 搜索建议
    suggest: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取默认页面数据
    this.getSearchValue()
  },
  onShow() {
    const historySearch = wx.getStorageSync('historySearch') || [];
    this.setData({
      historySearch
    })
  },
  // 获取默认页面数据
  async getSearchValue() {
    // 默认搜索词
    const res = await request({ url: '/search/default' })
    const defaultSearch = res.data.data.showKeyword
    // 热搜词
    const res1 = await request({ url: '/search/hot/detail' })
    const hotSearch = res1.data.data
    this.setData({
      defaultSearch,
      hotSearch
    })
  },
  // 搜索建议
  handleSearch(e) {
    const { value } = e.detail
    this.setData({
      SearchValue: value
    })
    if (!value) {
      this.setData({
        suggest: []
      })
    }
    // 简单防抖 获取搜索建议
    this.timeoutId && clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(async () => {
      const res = await request({ url: '/search/suggest', data: { type: 'mobile', keywords: value } })
      const suggest = res.data.result.allMatch
      this.setData({
        suggest
      })
    }, 200);
  },
  search(e) {

    const { type, value } = e.currentTarget.dataset
    let { historySearch, SearchValue, defaultSearch } = this.data

    //  搜索按钮
    if (type === 'btn') {
      SearchValue = SearchValue ? SearchValue : defaultSearch
      // 清空原先的值
      this.setData({
        SearchValue: ''
      })
      // 列表
    } else {
      SearchValue = value
    }
    //搜索词保存到缓存
    const index = historySearch.findIndex(item => item == SearchValue)

    // 以前有 先删除 再提到最前面
    if (index !== -1) {
      historySearch.splice(index, 1)
      historySearch.unshift(SearchValue)
    } else {
      // 以前没有自己加到数组里
      historySearch.unshift(SearchValue)
    }
    // 存储到缓存
    wx.setStorageSync('historySearch', historySearch);
    wx.navigateTo({
      url: '/pages/search_result/index?keywords=' + SearchValue,
    });
  },
  // 清空
  cleartHistory(e) {
    const { type } = e.currentTarget.dataset
    // 清空 input 值
    if (type === 'input') {
      this.setData({
        SearchValue: '',
        suggest:[]
      })
    } else {
      // 清空历史搜索
      const { historySearch } = this.data
      wx.setStorageSync('historySearch', []);
      this.setData({ historySearch: [] })
    }
  },
})