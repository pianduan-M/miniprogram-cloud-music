// pages/play_music/index.js
import request from '../../request/index.js'
import { showToast } from '../../utils/util'
import PubSub from 'pubsub-js'
import moment from 'moment'

// var this = getApp();
// 音乐url
import { BASE_SONG_URL } from '../../utils/constant.js'

var appInst = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当前播放歌曲信息
    currentSong: {},
    // 当前播放列表索引
    currentIndex: 0,
    // 控制播放
    isPlay: true,
    // 当前播放列表
    playlist: [],
    duration: 0,
    currentTime: 0,
    // 进度条播放进度
    progress: 0,
    // 手动滑动进度条
    isMove: false,
    progeress_ele: {},
    // 显示播放列表
    isShowSongList: false,
    playMode: 'list',
    bg_list: ['//s3.music.126.net/mobile-new/img/disc_default.png'],
    // 记录歌词时间
    times: [],
    // 歌词
    lyrics: [],
    // 当前歌词id
    lrc_id: '',
    isShowCover: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取背景音乐管理
    this.BackgroundAudioManager = wx.getBackgroundAudioManager();
    const { currentSong, playlist, playMode, isMusicPlay } = appInst.globalData
    // 如果没有id 说明是从tabbar进来的 从全局读取数据
    if (!options.id) {
      this.setData({
        currentSong,
        playlist,
        playMode,
        isPlay: isMusicPlay
      })
      // 如果当前是暂停状态
      if (!isMusicPlay) {
        const { duration, currentTime } = appInst.globalData
        this.setData({
          duration,
          currentTime
        })
        // 设置进度条
        this.setProgress(currentTime, duration)
        this.BackgroundAudioManager.src = url
        this.BackgroundAudioManager.title = currentSong.name
      }

    } else {
      // 得到当前id
      const songId = options.id
      // 设置歌单
      this.setData({
        playlist,
        playMode,
        isPlay: isMusicPlay
      })
      // 设置音乐链接
      this.setSongSrc(songId)
    }
    // 监听播放事件
    this.BackgroundAudioManager.onPlay(() => {
      this.changPlayState(true)
    })
    // 监听暂停
    this.BackgroundAudioManager.onPause(() => {
      this.changPlayState(false)
    })
    // 监听音乐播放进度
    this.BackgroundAudioManager.onTimeUpdate(() => {
      // 如果手动滑动进度 直接返回
      if (!this.data.isMove) {
        let currentTime = this.BackgroundAudioManager.currentTime

        const duration = this.BackgroundAudioManager.duration
        if (currentTime < this.data.currentTime && duration === this.data.duration) {
          currentTime = this.data.currentTime
        }

        this.setProgress(currentTime, duration)
        if (!this.data.duration) {
          this.setData({
            duration
          })
          appInst.globalData.duration = duration
        }
        appInst.globalData.currentTime = currentTime

        if (this.data.isShowCover) return
        // 匹配歌词
        const { times, lrc_id } = this.data
        // 已经是最后一条歌词 就不需要在匹配了
        if (lrc_id === times.length) return
        let index = times.findIndex(item => currentTime <= item)

        if (index !== lrc_id) {
          if (lrc_id > 0 && index === -1) {
            index = times.length
          }
          this.setData({
            lrc_id: index
          })
          if (index < 5) return

          this.lrcScroll.scrollTo({
            top: (index - 5) * 42,
            animated: true,
            duration: 300
          })
        }

      }
    })
    // 监听音频可以播放状态
    this.BackgroundAudioManager.onCanplay(() => {
      const duration = this.BackgroundAudioManager.duration
      this.setData({
        duration
      })
      appInst.globalData.duration = duration
      if (appInst.globalData.isMusicPlay) {
        this.BackgroundAudioManager.play()
      }
    })
    // 监听音频播放错误事件
    this.BackgroundAudioManager.onError(res => {
      this.setData({
        isPlay: false
      })
      appInst.globalData.isMusicPlay = false
    })

    // 监听音频播放停止事件
    this.BackgroundAudioManager.onStop(res => {
      this.setData({
        isPlay: false,
      })
      appInst.globalData.isMusicPlay = false
    })

    // 播放结束事件
    this.BackgroundAudioManager.onEnded(() => {
      // 单曲循环
      if (this.data.playMode === 'one') {
        this.BackgroundAudioManager.play()
      } else {
        this.handleSwicth()
      }
      this.setData({
        currentTime: 0,
        lrc_id: 0
      })
    })
    // 获取歌词元素实例
    this.getNode()
  },

  onReady() {
    const query = wx.createSelectorQuery().in(this)
    query.select('.progress_wrap').boundingClientRect(res => {
      this.setData({
        progeress_ele: res
      })
    })
    query.exec()
  },
  // 播放暂停状态
  changPlayState(isPlay) {
    this.setData({
      isPlay
    })
    appInst.globalData.isMusicPlay = isPlay
    // 通知tabbar
    // const isMusicPlay = isPlay
    // PubSub.publish('isMusicPlay', isMusicPlay)
  },
  // 上一首 / 下一首
  handleSwicth(e) {
    let { currentIndex, playlist, playMode } = appInst.globalData
    let { id } = e ? e.currentTarget.dataset : ''

    id = id ? id : 'next'
    // 列表循环
    if (playMode === 'list' || playMode === 'one') {
      if (id === 'pre') {
        currentIndex--
      } else {
        currentIndex++
      }
    }
    // 随机播放
    if (playMode === 'random') {
      currentIndex = Math.floor(Math.random() * playlist.length)
    }

    currentIndex = currentIndex < 0 ? playlist.length - 1 : currentIndex
    const songId = playlist[currentIndex].id
    appInst.globalData.currentIndex = currentIndex
    this.setSongSrc(songId)
  },
  // 根据索引设置歌曲链接
  async setSongSrc(id) {

    let { playlist, bg_list } = this.data
    // 读取当前id 在播放列表中的索引 读取当前歌曲信息

    const currentIndex = playlist.findIndex(item => (item.id == id))
    let currentSong = playlist[currentIndex]
    // 如果歌曲信息中没有封面信息 需要获取
    if (!currentSong || !currentSong.al) {
      const res = await request({ url: '/song/detail', data: { ids: id } })
      currentSong = res.data.songs[0]
    }

    // 背景图片 
    if (bg_list.length <= 2) {
      bg_list.push(currentSong.al.picUrl)
    }
    // 后台获取播放链接
    const res = await request({ url: '/song/url', data: { id, br: 320000 } })
    const { url } = res.data.data[0] || ""

    // 如果当前歌曲播放不了 直接下一首
    if (!url) {
      showToast({
        title: '当前音乐不能播放'
      })
      this.handleSwicth()
      return
    }

    const lyric = await request({ url: '/lyric', data: { id: id } })
    this.parseLyric(lyric.data.lrc.lyric)

    this.BackgroundAudioManager.src = url
    this.BackgroundAudioManager.title = currentSong.name

    this.setData({
      currentSong,
      bg_list,
      currentIndex
    })
    // 保存到全局变量
    appInst.globalData.currentSong = currentSong
    appInst.globalData.url = url
    appInst.globalData.currentIndex = currentIndex
    // 通知tabbar
    // PubSub.publish('currentSong', currentSong)

  },
  // 设置进度条 时间/进度
  setProgress(currentTime, duration) {
    // 读取当前播放进度 并设置
    let progress = currentTime / duration * 100
    progress = progress > 100 ? 100 : progress
    this.setData({
      currentTime,
      progress
    })
  },
  // 手指触摸进度条
  handleTouchProgress(e) {

    const { progeress_ele, duration } = this.data

    let pageX = e.changedTouches[0].pageX - progeress_ele.left

    pageX = pageX > progeress_ele.width ? progeress_ele.width : pageX
    pageX = pageX < 0 ? 0 : pageX

    const progress_width = progeress_ele.width
    const currentTime = pageX / progress_width * duration
    this.setData({
      currentTime
    })
    if (e.type == 'touchstart') {
      // 停止自动进度条
      this.setData({
        isMove: true
      })
      this.setProgress(pageX, progress_width)
    }
    if (e.type == 'touchmove') {
      if (this.isFlag) return

      setTimeout(() => {
        this.isFlag = false

      }, 100);
      this.setProgress(pageX, progress_width)
      this.isFlag = true
    }

    if (e.type == 'touchend') {
      this.BackgroundAudioManager.pause()
      this.BackgroundAudioManager.seek(currentTime)
      this.BackgroundAudioManager.play()
      // 开启自动进度条
      this.setData({
        isMove: false
      })
    }
  },
  // 播放暂停按钮点击
  swicthPlay() {
    const { isPlay } = this.data
    if (isPlay) {
      this.BackgroundAudioManager.pause()
    } else {
      if (!this.BackgroundAudioManager.src) {
        const { currentSong } = this.data
        this.BackgroundAudioManager.src = BASE_SONG_URL + currentSong.id
        this.BackgroundAudioManager.title = currentSong.name
      }
      this.BackgroundAudioManager.play()
    }
  },
  // 显示播放列表
  showSongList() {
    this.setData({
      isShowSongList: !this.data.isShowSongList
    })
  },
  // 列表播放
  playListSong(e) {
    this.setData({
      currentIndex: e.detail
    })
    this.setSongSrc(e.detail)
  },
  // 背景图片 流畅过度
  handleBgImage(e) {
    const { index } = e.currentTarget.dataset
    if (index !== 0) return
    let { bg_list } = this.data
    bg_list = bg_list.splice(1, 1)
    this.setData({
      bg_list
    })
  },
  // 切换播放模式
  handlePlayMode() {

    let { playMode } = appInst.globalData
    let message = ''
    switch (playMode) {
      case 'list':
        playMode = 'one'
        message = '单曲循环'
        break;
      case 'one':
        playMode = 'random'
        message = '随机播放'
        break;
      case 'random':
        playMode = 'list'
        message = '列表循环'
        break;
    }
    showToast({ title: message })

    this.setData({
      playMode
    })
    appInst.globalData.playMode = playMode
  },
  // 返回上一个页面
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },
  // 解析歌词
  parseLyric(data) {
    // 一定要清空上一首歌曲的歌词和时间
    const times = [];
    const lyrics = [];
    var array = data.split("\n");
    // console.log(array);
    // [00:00.92]
    var timeReg = /\[(\d*:\d*\.\d*)\]/
    // 遍历取出每一条歌词
    array.forEach(ele => {
      // 处理歌词
      var lrc = ele.split("]")[1];
      // 排除空字符串(没有歌词的)
      if (!lrc) return;
      lyrics.push(lrc);

      // 处理时间
      var res = timeReg.exec(ele);
      // console.log(res);
      if (res == null) return true;
      var timeStr = res[1]; // 00:00.92
      var res2 = timeStr.split(":");
      var min = parseInt(res2[0]) * 60;
      var sec = parseFloat(res2[1]);
      var time = parseFloat(Number(min + sec).toFixed(2));
      times.push(time);
    });

    this.setData({
      times,
      lyrics
    })
    appInst.globalData.times = times
    appInst.globalData.lyrics = lyrics
  },
  // 切换 歌词 / 封面
  handleSwichtCoverLrc(e) {

    if (e.type === 'touchstart') {
      this.x = e.changedTouches[0].pageX
    }
    if (e.type === 'touchend') {
      if (this.x === e.changedTouches[0].pageX) {
        this.setData({
          isShowCover: !this.data.isShowCover
        })
      }
    }
  },
  // 获取node实例
  getNode() {
    const that = this
    wx.createSelectorQuery().select('.scrollLyrics').node(function (res) {
      that.lrcScroll = res.node // 节点对应的 Canvas 实例。
      that.lrcScroll.showScrollbar = false
    }).exec()
  }
})