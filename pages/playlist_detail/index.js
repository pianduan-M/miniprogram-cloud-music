// pages/playlist_detail/index.js
import request from '../../request/index'
var appInst = getApp();


Page({
  data: {
    playlist: {}
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
    const res = await request({ url: '/playlist/detail', data: { id } })
    const playlist = res.data.playlist
    this.setData({
      playlist
    })
  },
  async getRecommendPlaylist() {
    const res = await request({ url: '/recommend/songs' })
    const playlist = res.data.data.dailySongs
    this.setData({
      playlist
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