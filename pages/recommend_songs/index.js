// pages/playlist_detail/index.js
import request from '../../request/index'
var appInst = getApp();

Page({
  data: {
    recomend: [],
    mouth: 1,
    day: 1
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

  async getRecommendPlaylist() {
    const res = await request({ url: '/recommend/songs' })
    const recomend = res.data.data.dailySongs
    this.setData({
      recomend
    })
  },
  // 跳转播放
  toPlay(e) {
    // 获取当前歌曲id
    const { id } = e.currentTarget.dataset
    //  保存歌单到全局变量
    appInst.globalData.playlist = this.data.recomend

    // 跳转到播放页面
    wx.navigateTo({
      url: '/pages/play_music/index?id=' + id
    });
  }
})