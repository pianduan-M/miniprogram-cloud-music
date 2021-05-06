// pages/user/index.js
import request from '../../request/index.js'


Page({
  data: {
    userInfo: {},
    playlist: {
      created: [],
      collect: [],
      like: {}
    },
    isFixed: false,
    playlistTabTop: '',
    playlistCreatedTop: '',
    playlistCollectTop: '',
  },
  onLoad() {
    this.getUsetInfo()
  },
  onShow() {
    // 自定义tabbar 切换
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    // 读取userinfo
    this.getUsetInfo()

    const query = wx.createSelectorQuery()
    query.select('#playlist_collect').boundingClientRect(res => {
      console.log(res);
    })
    query.exec(res => {
      console.log(res);
    })
  },
  onReady() {
    // wx.nextTick(() => {
    //   const query = wx.createSelectorQuery()
    //   query.select('#playlist_tab').boundingClientRect()
    //   query.select('#playlist_created').boundingClientRect()
    //   query.select('#playlist_collect').boundingClientRect()
    //   // query.selectViewport().scrollOffset()
    //   const that = this
    //   query.exec(function (res) {

    //     that.setData({
    //       playlistTabTop: res[0].top,
    //       playlistCreatedTop: res[1].top,
    //       playlistCollectTop: res[2].top
    //     })
    //   })
    // });
    // setTimeout(() => {
    //   const query = wx.createSelectorQuery().in(this)
    //   query.select('#playlist_tab').boundingClientRect()
    //   query.select('#playlist_created').boundingClientRect()
    //   query.select('#playlist_collect').boundingClientRect()

    //   const that = this
    //   query.exec(function (res) {
    //     console.log(res);
    //     // that.setData({
    //     //   playlistTabTop: res[0].top,
    //     //   playlistCreatedTop: res[1].top,
    //     //   playlistCollectTop: res[2].top
    //     // })
    //   }, 10000)
    // });
  },
  login() {
    // 如果已经登入
    if (this.data.userInfo.nickname) return
    wx.navigateTo({
      url: '/pages/login/index',
    })
  },
  // 从缓存中读取账户信息
  getUsetInfo() {
    if (this.data.userInfo.nickname) {
      // 获取用户喜欢的音乐
      this.getPlaylist()
      return
    }

    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo
    })

  },
  // 获取用户歌单
  async getPlaylist() {
    // 发送网络请求
    const res = await request({
      url: '/user/playlist',
      data: { uid: this.data.userInfo.userId, limit: 2 }
    })
    // 创建一个 歌单对象 确认 创建歌单 和 收藏歌单
    let playlist = {
      created: [],
      collect: [],
      like: {}
    }
    // 循环 歌单分类
    res.data.playlist.forEach(item => {
      // 单独拿出 我喜欢的音乐 歌单
      if (item.name == "我喜欢的音乐") {
        playlist.like = item
      } else {
        // 如果用户ID 等于当前登录id 就是用户自己创建的 否则就是收藏
        if (item.userId === this.data.userInfo.userId) {
          playlist.created.push(item)
        } else {
          playlist.collect.push(item)
        }
      }
    })
    this.setData({
      playlist
    })
  },
  // 跳转歌单详情
  toPlaylistDetail(e) {
    console.log(e);
  },
  choosePlaylist() {
    wx.pageScrollTo({
      scrollTop: 1000,
      duration: 300
    });
  }
})