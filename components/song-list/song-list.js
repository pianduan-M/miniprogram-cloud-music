
var appInst = getApp();


Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  data: {
    playlist: []
  },
  properties: {
    currentIndex: {
      type: Number,
      value: 0
    },
    playlist: {
      type: Array,
      value: []
    }
  },
  methods: {
    // 显示播放列表
    onCancel() {
      this.triggerEvent('oncancel')
    },
    // 列表播放
    playListSong(e) {
      const { id } = e.currentTarget.dataset
      this.triggerEvent('handlePlay', id)
    },
    // 列表删除
    deleteSong(e) {
      const { id } = e.currentTarget.dataset
      this.triggerEvent('deleteSong', id)
    },
  }
})