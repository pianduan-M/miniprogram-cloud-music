
var appInst = getApp();

Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#f64649",
    list: [{
      "pagePath": "/pages/index/index",
      "text": "发现",
      "iconPath": "../assets/icon/faxian.png",
      "selectedIconPath": "../assets/icon/faxian-s.png"
    },
    {
      "pagePath": "/pages/user/index",
      "text": "我的",
      "iconPath": "../assets/icon/wode.png",
      "selectedIconPath": "../assets/icon/wode-s.png"
    }],
    currentSong: {},
    isMusicPlay: false
  },
  lifetimes: {
    attached: function () {
      // 获取背景音乐管理
      this.BackgroundAudioManager = wx.getBackgroundAudioManager();

      // 初始化数据 从全局变量读取
      const { currentSong, isMusicPlay } = appInst.globalData
      this.setData({
        currentSong,
        isMusicPlay
      })
    }

  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    },
    switchPlay() {
      let isMusicPlay = this.data.isMusicPlay
      if(!appInst.globalData.url) {
        wx.navigateTo({
          url: '/pages/play_music/index',
        });
        return
      } 
      if (isMusicPlay) {
        this.BackgroundAudioManager.pause()
        isMusicPlay = false
      } else {
        this.BackgroundAudioManager.play()
        isMusicPlay = true
      }
      this.setData({
        isMusicPlay
      })
      appInst.globalData.isMusicPlay = isMusicPlay
    },
  }
})