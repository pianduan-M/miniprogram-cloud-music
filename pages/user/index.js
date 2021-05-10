// pages/user/index.js
import request from '../../request/index.js'
var appInst = getApp();

Page({
  data: {
    userInfo: {},
    playlist: {
      created: [],
      collect: [],
      like: {},
    },
    // 控制 歌单tabs 定位 
    isFixed: false,
    // tabs 页面 top、值
    playlistTabTop: '',
    // 创建歌单元素  页面 top、值
    playlistCreatedTop: '',
    // 收藏歌单元素  页面 top、值
    playlistCollectTop: '',
    // 当前选中tabs  页面 top、值
    playlistType: 'created',
    // 当前页面的scroll 值
    scrollTop: 0,
    isClick: false,
    view: ''
  },
  onLoad() {
    this.getUsetInfo()

  },
  onShow() {
    // 自定义tabbar 切换
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      const { isMusicPlay, currentSong } = appInst.globalData
      this.getTabBar().setData({
        selected: 1,
        isShow: true,
        isMusicPlay,
        currentSong
      })
    }

    // 读取userinfo
    this.getUsetInfo()
    if (!this.data.playlist.like.nickname && this.data.userInfo.nickname) {
      // 获取用户歌单
      this.getPlaylist()
    }
    // 重新更新 top值
    this.getEleTopValue()
  },
  onReady() {

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
    if (this.data.userInfo.nickname) return

    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo
    })

  },
  // 获取歌单列表 top值
  getEleTopValue() {
    wx.nextTick(() => {
      setTimeout(() => {
        const query = wx.createSelectorQuery().in(this)
        query.select('#playlist_tab').boundingClientRect()
        query.select('#playlist_created').boundingClientRect()
        query.select('#playlist_collect').boundingClientRect()

        const that = this
        query.exec(function (res) {
          that.setData({
            playlistTabTop: res[0].top,
            playlistCreatedTop: res[1].top - 50,
            playlistCollectTop: res[2].top - 50
          })
        })
      }, 400);
    });
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
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/playlist_detail/index?id=' + id,
    });
  },
  // 收藏/创建 歌单切换
  choosePlaylist(e) {

    // 拿到点击元素
    const { id } = e.target
    if (id) {
      // 判断
      const playlistType = id === 'created_btn' ? 'created' : 'collect'
      const view = id === 'created_btn' ? 'playlist_created' : 'playlist_collect'

      // 设置
      this.setData({
        playlistType,
        isClick: true,
        view
      })
      // 设置scrollTop

      // 滚动结束 回调 解决tab栏 选中项抖动问题
      setTimeout(() => {
        this.setData({
          isClick: false
        })
      }, 300);
    }
  },
  // 监听页面滚动
  handleScroll(e) {
    // 取值
    const { scrollTop } = e.detail
    this.setPlaylistTop(scrollTop)
    this.setData({
      scrollTop
    })
  },
  // 歌单标题联动效果
  setPlaylistTop(scrollTop) {
    const { playlistTabTop,
      isFixed,
      playlistType,
      playlistCollectTop,
      playlistCreatedTop,
      isClick
    } = this.data
    // 如果页面scrollTop 大于 歌单tab的 top值 就让它定位
    if (playlistTabTop && scrollTop >= playlistTabTop && !isFixed) {
      this.setData({
        isFixed: true,
      })
    }
    // 否则隐藏
    if (playlistTabTop && scrollTop <= playlistTabTop && isFixed) {
      this.setData({
        isFixed: false
      })
    }
    // 根据滑动的位置联动tab栏
    if (playlistCollectTop && scrollTop >= playlistCollectTop && playlistType === "created") {
      if (isClick) return
      this.setData({
        playlistType: 'collect',
      })
    }
    if (playlistCreatedTop && scrollTop < playlistCollectTop && playlistType === "collect") {
      if (isClick) return
      this.setData({
        playlistType: 'created',
      })
    }
  },

})