
let qcloud = require('../../vendor/wafer2-client-sdk/index')
let util = require('../../utils/util.js');
let config = require('../../config');

Page({
    data: {
        list: [],
        width: 0,
        logged: false,
        userInfo: {},
        other: false
    },
    onLoad: function () {
        if (this.data.logged) return;

        util.showBusy('正在登录');
        var that = this;

        let randomNum = Math.floor(Math.random() * 4);

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    if(result['type'] == 'me'){
                        util.showModel(config['msg']['me']['title'], config['msg']['me']['msg']);
                        that.setData({
                            userInfo: result['data'],
                            logged: true,
                            other: false
                        });
                    }else if(result['type'] == 'love'){
                        util.showModel(config['msg']['love'][randomNum]['title'], config['msg']['love'][randomNum]['msg']);
                        that.setData({
                            userInfo: result['data'],
                            logged: true,
                            other: false
                        });
                    }else{
                        util.showSuccess('登录成功');
                        that.setData({
                            userInfo: result,
                            logged: true,
                            other: true
                        });
                    }
                    that.getFolder();
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            if(result['data']['data']['openId'] == config['limit']['me']){
                                util.showModel(config['msg']['me']['title'], config['msg']['me']['msg']);
                                // util.showModel(config['msg']['love'][randomNum]['title'], config['msg']['love'][randomNum]['msg']);
                                that.setData({
                                    userInfo: result.data.data,
                                    logged: true,
                                    other: false
                                });
                            }else if(result['data']['data']['openId'] == config['limit']['love']){
                                util.showModel(config['msg']['love'][randomNum]['title'], config['msg']['love'][randomNum]['msg']);
                                that.setData({
                                    userInfo: result['data']['data'],
                                    logged: true,
                                    other: false
                                });
                            }else{
                                util.showSuccess('登录成功');
                                that.setData({
                                    userInfo: result.data.data,
                                    logged: true,
                                    other: true
                                });
                            }
                            that.getFolder();
                        },

                        fail(error) {
                            util.showModel('请求失败', error);
                            console.log('request fail', error);
                        }
                    });
                }
            },

            fail(error) {
                util.showModel('登录失败', error);
                console.log('登录失败', error);
            }
        });

        wx.getSystemInfo({
            success: (res) => {
                let ww = res.windowWidth,
                    imageWidth = ww * 0.48;

                that.setData({
                    width: imageWidth
                });
            }
        });

        wx.setNavigationBarTitle({
            'title': 'Our time'
        });
    },
    getFolder: function () {
        let that = this;
        // 获取文件夹
        let options = {
            url: config.service.timeLine,
            method: 'POST',
            success: function (res) {
                if(res.data && res.data.code){
                    that.setData({
                        'list': res.data.list
                    });
                    wx.hideToast();
                }else{
                    util.showModel('error', res);
                }
            },
            fail: function (res) {
                // console.log(res);
                util.showModel('error', res);
            }
        };

        wx.request(options);
    },
    jumpTo: function (ev) {
        let dateParams = ev.currentTarget.dataset.tar;

        if(util.isEmpty(dateParams)){
            return;
        }

        if(!this.data.other){
            wx.navigateTo({
                'url': '../waterfall/waterfall?dir=' + dateParams + '&imageWidth=' + this.data.width
            });
        }else{
            util.showModel('Notice', '您暂无权限进入属于我和小葡萄的独享页面');
        }
        // console.log(dateParams);
    }
});