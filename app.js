// app.js
App({
  onLaunch() {
    this.BackgroundAudioManager = wx.getBackgroundAudioManager()
  },
  onShow() {
    this.globalData.currentSong = wx.getStorageSync('currentSong');
    this.globalData.url = wx.getStorageSync('url');
    this.globalData.isMusicPlay = wx.getStorageSync('isMusicPlay') || false;
    this.globalData.playlist = wx.getStorageSync('playlist');
    this.globalData.playMode = wx.getStorageSync('playMode') || 'list';
    this.globalData.currentIndex = wx.getStorageSync('currentIndex') || 0
    this.globalData.currentTime = wx.getStorageSync('currentTime') || 0
    this.globalData.duration = wx.getStorageSync('duration') || 0
  },
  onHide() {
    wx.setStorageSync('currentSong', this.globalData.currentSong);
    wx.setStorageSync('url', this.globalData.url);
    wx.setStorageSync('isMusicPlay', this.globalData.isMusicPlay);
    wx.setStorageSync('playlist', this.globalData.playlist);
    wx.setStorageSync('playMode', this.globalData.playMode);
    wx.setStorageSync('currentIndex', this.globalData.currentIndex);
    wx.setStorageSync('currentTime', this.globalData.currentTime);
    wx.setStorageSync('duration', this.globalData.duration);
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
    duration: 0
  }
})
