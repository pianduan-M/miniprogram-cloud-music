// index.js
import request from '../../request/index'
// 格式化数字
import { makeFriendly } from '../../utils/util'

// 获取应用实例
var appInst = getApp();

Page({
  data: {
    // banner 数据
    bannerList: [],
    // ball 列表
    ballList: [],
    recommendList: [],
    list: [],
    topList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBanners()
    this.getBallList()
    this.getRecommend()
    // this.getHomePage()
    this.getTopList()


  },
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      const { isMusicPlay, currentSong } = appInst.globalData
      this.getTabBar().setData({
        selected: 0,
        isShow: true,
        isMusicPlay,
        currentSong
      })
    }
  },
  // 获取banner 数据
  async getBanners() {
    const res = await request({ url: '/banner' })
    const bannerList = res.data.banners
    this.setData({
      bannerList
    })
  },
  // 获取首页导航列表数据 
  async getBallList() {
    const res = await request({ url: '/homepage/dragon/ball' })
    const ballList = res.data.data
    this.setData({
      ballList
    })
  },
  // 推荐歌单 数据
  async getRecommend() {
    const res = await request({ url: '/personalized?limit=6' })
    const recommendList = res.data.result
    recommendList.forEach(item => {
      item.playCount = makeFriendly(item.playCount)
    });
    this.setData({
      recommendList
    })
  },

  // 排行榜
  async getTopList() {
    const res = await request({ url: '/toplist' })
    // 先得到榜单ID 再根据请求榜单详情
    const topArr = res.data.list.slice(0, 5)
    const topIds = topArr.reduce((ids, v) => {
      ids.push(v.id)
      return ids
    }, [])
    // 请求榜单详情 得到歌曲列表
    const promises = []
    topIds.forEach(item => {
      promises.push(request({ url: '/playlist/detail', data: { id: item } }))
    })
    let topList = await Promise.all(promises)
    topList = topList.map(item => {
      const top = item.data.playlist
      return {
        id: top.id,
        name: top.name,
        tracks: top.tracks.slice(0, 3)
      }
    })
    this.setData({
      topList
    })
  },
  // 添加到播放列表
  toPlay(e) {
    // 获取当前歌曲id
    const { id, parentid } = e.currentTarget.dataset
    const { topList } = this.data
    const index = topList.findIndex(item => item.id === parentid)
    // 存储当前歌单到缓存
    wx.setStorageSync('playlist', topList[index].tracks);
    // 存储当前歌曲id到缓存
    wx.setStorageSync('songId', id);

    // 跳转到播放页面
    wx.navigateTo({
      url: '/pages/play_music/index?id=' + id
    });

  },
  goSearch() {
    // 跳转到播放页面
    wx.navigateTo({
      url: '/pages/search/index',
    });
  },
  handleUrl(e) {
    const { name } = e.currentTarget.dataset
    if(name == "每日推荐"){
      wx.navigateTo({
        url: '/pages/recommend_songs/index'
      });
    }
  }
})
