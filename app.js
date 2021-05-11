// app.js
App({
  onLaunch() {
    this.BackgroundAudioManager = wx.getBackgroundAudioManager()
    this.globalData.currentSong = wx.getStorageSync('currentSong');
    this.globalData.playlist = wx.getStorageSync('playlist');
    this.globalData.playMode = wx.getStorageSync('playMode') || 'list';
    this.globalData.currentIndex = wx.getStorageSync('currentIndex') || 0
    this.globalData.times = wx.getStorageSync('times') || []
    this.globalData.lyrics = wx.getStorageSync('lyrics') || []
    this.globalData.userInfo = wx.getStorageSync('userInfo') || {}
  },
  onShow() {

  },
  onHide() {
    // this.setStorage()
  },
  globalData: {
    userInfo: null,
    currentSong: {},
    isMusicPlay: false,
    currentTime: '',
    playlist: [],
    url: '',
    currentIndex: 0,
    playMode: 'list',
    currentTime: 0,
    times: [],
    lyrics: []
  },
 
})
