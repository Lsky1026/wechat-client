const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

var showTip = text => wx.showToast({
    title: text,
    icon: 'success',
    duration: 20000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
};

var getType = (obj) => {
    /**
     * @function getType
     * @description get obj type
     * @param {*} obj
     * @return {*} type
     * @author lsky
     */
    return obj.__proto__.constructor.name;
};

// 工具方法
var deepCopy =  (obj) => {
    /**
     * @function deepCopy
     * @param {*} obj
     * @return {*} copy
     * @author lsky
     */
    if (obj === null || (typeof obj === "undefined" ? "undefined" : getType(obj)) !== 'object') {
        return obj;
    }

    return JSON.parse(JSON.stringify(obj));
};

var isEmpty = (data) => {
    if(data === null || data === "" || !data){
        return true;
    }else if (getType(data) === "Array") {
        if (data.length <= 0) {
            return true;
        }
    } else if (getType(data) === "Object") {
        if (Object.keys(data).length <= 0) {
            return true;
        }
    }

    return false;
};

/**
 * 封装微信请求  使用 promise
 * @param {String} method 请求方式
 * @param {String} url 请求地址
 * @param {Object} data 参数
 * @param {Promise} promise
 */
var wxRequest = (url = '', data = {}, method = '') => {
    return new Promise ((resolve, reject) => {
        wx.request({
            url: url,
            data: data,
            method: isEmpty(method) ? 'GET' : method.toLocaleUpperCase(),
            success: function (res) {
                if(res['statusCode'] == 200 && res['errMsg'].indexOf(':ok') != -1){
                    resolve(res['data']);
                }else{
                    reject(res);
                }
            },
            fail: function (res) {
                reject(res);
            }
        });
    })
}

module.exports = { formatTime, showBusy, showTip, showSuccess, showModel, getType, deepCopy, isEmpty, wxRequest }
