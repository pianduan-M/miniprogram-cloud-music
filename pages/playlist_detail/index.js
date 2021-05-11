// pages/playlist_detail/index.js
import request from '../../request/index'
import { showToast } from '../../utils/util'
var appInst = getApp();


Page({
  data: {
    playlist: {},
    isError: false
  },
  onLoad(options) {
    const { id, type } = options
    if (type && type === 'recommend') {
      this.getRecommendPlaylist()
    } else {
      this.getPlaylistDetail(id)
    }
  },
  // 获取歌单详情
  async getPlaylistDetail(id) {
    this.setData({
      isError: false
    })
    // loading
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    // 自动关闭loading 
    setTimeout(() => {
      wx.hideLoading();
    }, 5000);
    // 发送请求
    const res = await request({ url: '/playlist/detail', data: { id } })
    if (res.data.code !== 200) {
      showToast({
        title: '获取歌单失败！请重试'
      })
      this.setData({
        isError: true
      })
      wx.hideLoading();
      return
    }
    wx.hideLoading();
    // 设置数据
    const playlist = res.data.playlist
    this.setData({
      playlist,
      isError: false
    })
  },
  // 跳转播放
  toPlay(e) {
    // 获取当前歌曲id
    const { id } = e.currentTarget.dataset
    //  保存歌单到全局变量
    appInst.globalData.playlist = this.data.playlist.tracks
    wx.setStorageSync('playlist', this.data.playlist.tracks);
    // 跳转到播放页面
    wx.navigateTo({
      url: '/pages/play_music/index?id=' + id
    });
  }
})