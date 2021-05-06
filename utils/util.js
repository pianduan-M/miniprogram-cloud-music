export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}



export const makeFriendly = (num) => {
  if (num >= 100000000) {
    return Math.round(num / 10000000) / 10 + '亿'
  } else if (num >= 10000) {
    return Math.round(num / 1000) / 10 + '万'
  } else {
    return num
  }
}

export const showToast = ({ title, icon = "none", duration = 1500, }) => {
  wx.showToast({
    title,
    icon,
    duration,
    mask: true,
  });
}
