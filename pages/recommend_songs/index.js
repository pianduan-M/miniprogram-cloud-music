// pages/playlist_detail/index.js
import request from '../../request/index'
import { showToast } from '../../utils/util'

var appInst = getApp();

Page({
  data: {
    recomend: [],
    mouth: 1,
    day: 1,
    isError: false
  },
  onLoad(options) {
    // 获取当天日期
    const date = new Date()
    let month = date.getMonth() + 1
    month = month < 10 ? '0' + month : month
    let day = date.getDate()
    day = day < 10 ? '0' + day : day
    this.setData({
      day, month
    })

    this.getRecommendPlaylist()
  },
  // 请求推荐歌单
  async getRecommendPlaylist() {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    // 防止页面一直处于loading状态
    setTimeout(() => {
      wx.hideLoading();
    }, 5000);
    const res = await request({ url: '/recommend/songs' })
    // 请求出错
    if (res.data.code !== 200) {
      showToast({
        title: '加载错误！'
      })
      this.setData({
        isError: true
      })
      wx.hideLoading();
      return
    }
    wx.hideLoading();

    const recomend = res.data.data.dailySongs
    this.setData({
      recomend,
      isError: false
    })
  },
  // 跳转播放
  toPlay(e) {
    // 获取当前歌曲id
    const { id } = e.currentTarget.dataset
    //  保存歌单到全局变量
    appInst.globalData.playlist = this.data.recomend
    wx.setStorageSync('playlist', this.data.recomend);
    // 跳转到播放页面
    wx.navigateTo({
      url: '/pages/play_music/index?id=' + id
    });
  },
  reload() {
    // 简单节流
    if (this.flag) return
    this.flag = true
    // 再次发请求
    this.getRecommendPlaylist()

    setTimeout(() => {
      this.flag = false
    }, 1000);
  }
})