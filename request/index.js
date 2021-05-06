
const bese_url = 'http://localhost:5000'

export default function request(params) {

  let CookieSrt = wx.getStorageSync('Cookie');

  if (CookieSrt) {
    CookieSrt = CookieSrt.split(";").find(item => item.indexOf("MUSIC_U") !== -1)

  }

  if (params.header && Object.keys(params.header).length > 0) {
    params.header.Cookie = CookieSrt
  } else {
    params.header = {
      Cookie: CookieSrt
    }
  }
  if (params.data && Object.keys(params.data).length > 0) {
    params.data.proxy = 'your-proxy'
  } else {
    params.data = {
      proxy: 'your-proxy'
    }
  }
  return new Promise((resolve, reject) => {
    wx.request({
      ...params,
      url: bese_url + params.url,
      success: (result) => {
        resolve(result)
      },
      fail: (err) => {
        reject(err)
      },
    });
  })
}