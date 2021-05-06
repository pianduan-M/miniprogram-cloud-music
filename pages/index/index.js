// index.js
import request from '../../request/index'
// 格式化数字
import { makeFriendly } from '../../utils/util'

// 获取应用实例
const app = getApp()

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
    // this.getRecommend()
    this.getHomePage()
    this.getTopList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("index -- onReady");

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("index -- onHide");

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("index -- onUnload");
  },
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
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
    const res = await request({ url: '/personalized?limit=5' })
    const recommendList = res.data.result
    recommendList.forEach(item => {
      item.playCount = makeFriendly(item.playCount)
    });
    this.setData({
      recommendList
    })
  },
  // 首页数据
  async getHomePage() {
    const res = await request({ url: '/homepage/block/page' })
    // const bannerList = res.data.banners
    let list = res.data.data.blocks
    console.log(list);
    list = list.filter(item => {
      // 判断是歌单类型
      if (item.creatives && item.creatives[0].uiElement && item.creatives[0].uiElement.image) {
        // 循环 格式化播放总数量
        item.creatives.forEach(v => {
          if (v.resources && v.resources[0].resourceExtInfo) {
            v.playCount = makeFriendly(v.resources[0].resourceExtInfo.playCount)
          } else {
            v.playCount = false
          }
        })
        return true

      }
    })
    this.setData({
      list,
      // recommendList
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
        tracks: top.tracks.slice(0,3)
      }
    })
    this.setData({
      topList
    })
  }
})
