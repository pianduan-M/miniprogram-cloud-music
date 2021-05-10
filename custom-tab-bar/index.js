
import PubSub from 'pubsub-js'
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
      // // 接受一个新的歌曲信息
      // PubSub.subscribe('currentSong', ((msg, currentSong) => {
      //   this.setData({
      //     currentSong
      //   })
      //   // 取消订阅
      //   PubSub.unsubscribe('musicId');
      // }))
      // PubSub.subscribe('isMusicPlay', ((msg, isMusicPlay) => {
      //   console.log('++++++++++', isMusicPlay);
      //   this.setData({
      //     isMusicPlay
      //   })
      //   console.log(this.data.isMusicPlay);
      //   // 取消订阅
      //   PubSub.unsubscribe('isMusicPlay');
      // }))

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