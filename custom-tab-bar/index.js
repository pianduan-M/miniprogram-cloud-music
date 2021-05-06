
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
    }]
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      console.log('组件执行');
      const audio = wx.createAudioContext('audio')
      this.audio = audio
      console.log(audio);
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      console.log(data);
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    },
    handlePlay() {
      this.audio.play()
    }
  }
})