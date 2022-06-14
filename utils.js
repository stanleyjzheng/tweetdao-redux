function secondsFormatter(seconds) {
  let text = ''

  if (seconds >= 604800) {
    text += `${Math.floor(seconds / 604800)} weeks`
    seconds = seconds % 604800
  }
  if (seconds >= 86400) {
    if (text.length > 0) text += ', '
    text += `${Math.floor(seconds / 86400)} days`
    seconds = seconds % 86400
  }
  if (seconds >= 3600) {
    if (text.length > 0) text += ', '
    text += `${Math.floor(seconds / 3600)} hours`
    seconds = seconds % 3600
  }
  if (seconds >= 60) {
    if (text.length > 0) text += ', '
    text += `${Math.floor(seconds / 60)} minutes`
    seconds = seconds % 60
  }

  return text
}

function utf8ToB64(str) {
  return window.btoa(unescape(encodeURIComponent(str)))
}

export { secondsFormatter, utf8ToB64 }
