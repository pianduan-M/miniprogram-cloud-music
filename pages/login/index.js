import request from '../../request/index.js'
import { showToast } from '../../utils/util.js'

Page({
  data: {
    // 登录类型
    type: 'id',
    // 账号
    user: {
      value: '',
      roleText: '',
      isLegal: false
    },
    // 密码
    password: {
      value: "",
      roleText: "",
      isLegal: false
    },
    isDisable: false,
    timer: ''
  },
  // 切换登录类型
  handleLoginType(e) {
    const { id } = e.target
    if (id) {
      this.setData({
        type: id,
        // 切换时 重置表单数据
        user: {
          value: '',
          roleText: ''
        },
        password: {
          value: "",
          roleText: ""
        }
      })
    }

  },
  // 表单输入
  changInput(e) {
    const { id } = e.target
    const { value } = e.detail
    this.setData({
      [id]: {
        value,
        isLegal: false
      }
    })
  },
  // 简单处理表单验证
  handleFormRoles(e) {
    const { id } = e.target
    const { value } = e.detail
    const type = this.data.type
    // 账号密码登入
    if (type == 'id') {
      // 账号验证
      if (id == 'user') {
        if (!value.trim()) {
          this.setData({
            user: {
              value,
              roleText: "请输入用户名",
              isLegal: false
            }
          })
        } else {
          this.setData({
            user: {
              value,
              roleText: '',
              isLegal: true
            },
          })
        }
      }
      // 密码验证
      if (id == "password" && value.trim()) {
        if (value.trim().length < 6) {
          this.setData({
            password: {
              value,
              roleText: "密码最少6位",
              isLegal: false
            }
          })
        } else {
          this.setData({
            password: {
              value,
              roleText: '',
              isLegal: true
            },
          })
        }
      }

    }
    // 手机号登入
    if (type == 'phone') {

      // 账号验证
      if (id == 'user' && value) {
        if (!(/^1[3|5|7|8][0-9]\d{8}$/.test(value))) {
          this.setData({
            user: {
              value,
              roleText: '手机号码不正确！',
              isLegal: false
            },
          })
        } else {
          this.setData({
            user: {
              value,
              roleText: '',
              isLegal: true
            },
          })
        }
      }
      // 验证码验证
      if (id == "password" && value.trim()) {

        if (!(/^\d{4}$/.test(value))) {
          this.setData({
            password: {
              value,
              roleText: '验证码不正确！',
              isLegal: false
            },
          })
        } else {
          this.setData({
            password: {
              value,
              roleText: '',
              isLegal: true
            },
          })
        }
      }

    }
  },
  // 发送验证码
  async sendAuth() {
    const { type, user } = this.data
    // 如果不是手机登入模式 支付返回
    if (type !== 'phone') {
      return
    }
    if (!user.value.trim()) {
      this.setData({
        user: {
          value: '',
          roleText: '请输入手机号码！',
          isLegal: false
        }
      })
    }
    // 验证值合法性
    if (user.isLegal) {
      // 发送后台请求
      const res = await request({ url: '/captcha/sent', data: { phone: user.value } })
      if (res.statusCode === 200) {
        // 成功后发送提示
        showToast({ title: '验证码发送成功！' })
        // 设置倒计时
        this.countdown()
      }
    }
  },
  // 验证码倒计时
  countdown() {
    this.intervalId && clearInterval(this.intervalId)
    let index = 60
    this.intervalId = setInterval(() => {
      if (index <= 0) {
        clearInterval(this.intervalId)
        return
      }
      this.setData({
        timer: index,
        isDisable: true
      })
      index--
    }, 1000);
  },
  // 登入业务
  async login() {
    const { user, password, type } = this.data
    // 表单验证不成功 直接返回
    if (!user.isLegal || !password.isLegal) {
      return
    }
    let result = null
    // 账号密码登录
    if (type == 'id') {
      let loginType = 'phone'
      if (/@/.test(user.value)) {
        loginType = 'email'
      }
      const url = '/login' + (loginType == 'phone' ? '/cellphone' : '')

      result = await request({
        url, data: { [loginType]: user.value, password: password.value }
      })
    } else {
      // 手机验证码登录
      result = await request({
        url: '/captcha/verify',
        data: {
          phone: user.value,
          captcha: password.value
        }
      })
    }
    // 处理登录结果
    const { code } = result.data
    // 根据响应码提示响应状态
    switch (code) {
      case 400:
        showToast({ title: '手机号码错误！' })
        break;

      case 502:
        showToast({ title: '账号/密码错误！' })
        break;

      case 200:
        showToast({ title: '登录成功！' })
        break;
    }
    if (code === 200) {
      // 清除获取验证码按钮倒计时
      this.intervalId && clearInterval(this.intervalId)
      // 保存用户信息到缓存
      wx.setStorageSync('userInfo', result.data.profile);
      wx.setStorageSync('token', result.data.token);
      wx.setStorageSync("Cookie", result.data.cookie);
      wx.navigateBack({
        delta: 1
      });
    }
  }
})