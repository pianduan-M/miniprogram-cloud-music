// index.js
import request from '../../request/index'
// 格式化数字
import { makeFriendly, showToast } from '../../utils/util'

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
    topList: [],
    // 控制下拉刷新
    isTriggered: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 先设置加载状态
    wx.showLoading({
      title: '加载中',
    });
    // 统一发请求
    const bannersRes = request({ url: '/banner' })
    const ballListRes = request({ url: '/homepage/dragon/ball' })
    const recommendRes = request({ url: '/personalized?limit=6' })
    const topListRes = request({ url: '/toplist' })

    Promise.all([bannersRes, ballListRes, recommendRes, topListRes])
      .then(res => {
        this.getBanners(res[0])
        this.getBallList(res[1])
        this.getRecommend(res[2])
        // this.getHomePage()
        this.getTopList(res[3])
        // 加载完成在隐藏loading
        wx.hideLoading();
        // 关闭下拉刷新
        this.setData({
          isTriggered: false
        })
      })

    setTimeout(() => {
      wx.hideLoading();
      if (this.data.bannerList.length === 0) {
        showToast({
          title: '网络出错，请重新刷新！'
        })
        wx.hideLoading();
        // 关闭下拉刷新
      }
    }, 5000);
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
  getBanners(res) {
    // const res = await request({ url: '/banner' })
    const bannerList = res.data.banners
    this.setData({
      bannerList
    })

  },
  // 获取首页导航列表数据 
  getBallList(res) {
    // const res = await request({ url: '/homepage/dragon/ball' })
    const ballList = res.data.data
    this.setData({
      ballList
    })
  },
  // 推荐歌单 数据
  getRecommend(res) {
    // const res = await request({ url: '/personalized?limit=6' })
    const recommendList = res.data.result
    recommendList.forEach(item => {
      item.playCount = makeFriendly(item.playCount)
    });
    this.setData({
      recommendList
    })
  },

  // 排行榜
  async getTopList(res) {
    // const res = await request({ url: '/toplist' })
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
    appInst.globalData.playlist = topList[index].tracks

    // 跳转到播放页面
    wx.navigateTo({
      url: '/pages/play_music/index?id=' + id
    });

  },
  // 跳转搜索页面
  goSearch() {
    // 跳转到搜索页面
    wx.navigateTo({
      url: '/pages/search/index',
    });
  },
  // 每日推荐歌曲
  handleUrl(e) {
    const { name } = e.currentTarget.dataset
    if (name == "每日推荐") {
      if (!appInst.globalData.userInfo.userId) {
        showToast({
          title: '请先登录！'
        })
        wx.navigateTo({
          url: '/pages/login/index',
        });
        return
      }
      wx.navigateTo({
        url: '/pages/recommend_songs/index'
      });
    }
  },
  // 下拉刷新
  handleResherrefresh() {
    this.onLoad()
  }

})
