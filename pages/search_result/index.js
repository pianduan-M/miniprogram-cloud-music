import request from '../../request/index'
var appInst =  getApp();

// pages/search_result/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchGroupList: [
      '综合', '单曲', '歌单', '视频', '歌手', '播单', '歌词', '专辑', '声音', '云圈', '用户'
    ],
    navId: '',
    Navleft: 0,
    songs: [],
    suggest: [],
    SearchValue: '',
    historySearch: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { keywords } = options

    // 搜索
    this.getSearchResult(keywords)
  },
  onShow() {
    const historySearch = wx.getStorageSync('historySearch') || [];
    this.setData({
      historySearch
    })
  },
  async getSearchResult(keywords) {
    const res = await request({ url: '/search', data: { keywords } })
    if (res.data.code !== 200) return
    const songs = res.data.result.songs
    this.setData({
      songs
    })
  },
  // 导航栏
  changeNav(e) {
    const navId = e.target.id
    const { id } = e.currentTarget.dataset
    this.setData({
      navId
    })
    this.setData({
      Navleft: id * 54
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
      if (res.data.code !== 200) return
      const suggest = res.data.result.allMatch
      this.setData({
        suggest
      })
    }, 200);
  },
  // 清空
  cleartHistory(e) {
    this.setData({
      SearchValue: '',
      suggest: []
    })
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
    // 发搜索请求
    this.getSearchResult(SearchValue)
    this.setData({
      suggest: []
    })
  },
  async toPlay(e) {
    const { id } = e.currentTarget.dataset
    const currentSong = this.data.songs.find(item => item.id === id)
    appInst.globalData.playlist = [currentSong]

    wx.navigateTo({
      url: '/pages/play_music/index?id=' + id
    });
  }
})