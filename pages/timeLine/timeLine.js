
let qcloud = require('../../vendor/wafer2-client-sdk/index')
let util = require('../../utils/util.js');
let config = require('../../config');

Page({
    data: {
        list: [],
        width: 0,
        logged: false,
        userInfo: {},
        other: false,
        tipFlag: false,
        tipTitle: '',
        tipMsg: ''
    },
    onLoad: function () {
        if (this.data.logged) return;

        util.showBusy('正在登录');
        var that = this,
            timer = null;

        let randomNum = Math.floor(Math.random() * 4);

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    if(result['type'] == 'me'){
                        // util.showModel(config['msg']['me']['title'], config['msg']['me']['msg']);
                        that.setData({
                            userInfo: result['data'],
                            logged: true,
                            other: false,
                            tipFlag: true,
                            tipTitle: config['msg']['me']['title'],
                            tipMsg: config['msg']['me']['msg']
                        });
                    }else if(result['type'] == 'love'){
                        // util.showModel(config['msg']['love'][randomNum]['title'], config['msg']['love'][randomNum]['msg']);
                        that.setData({
                            userInfo: result['data'],
                            logged: true,
                            other: false,
                            tipFlag: true,
                            tipTitle: config['msg']['love'][randomNum]['title'],
                            tipMsg: config['msg']['love'][randomNum]['msg']
                        });
                    }else{
                        // util.showSuccess('登录成功');
                        that.setData({
                            userInfo: result,
                            logged: true,
                            other: true,
                            tipFlag: true,
                            tipTitle: config['msg']['default']['title'],
                            tipMsg: config['msg']['default']['msg']
                        });
                    }
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        that.setData({
                            tipFlag: false
                        });
                    }, 2000);
                    that.getFolder();
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            if(result['data']['data']['openId'] == config['limit']['me']){
                                // util.showModel(config['msg']['me']['title'], config['msg']['me']['msg']);
                                // util.showModel(config['msg']['love'][randomNum]['title'], config['msg']['love'][randomNum]['msg']);
                                that.setData({
                                    userInfo: result.data.data,
                                    logged: true,
                                    other: false,
                                    tipFlag: true,
                                    tipTitle: config['msg']['me']['title'],
                                    tipMsg: config['msg']['me']['msg']
                                });
                            }else if(result['data']['data']['openId'] == config['limit']['love']){
                                // util.showModel(config['msg']['love'][randomNum]['title'], config['msg']['love'][randomNum]['msg']);
                                that.setData({
                                    userInfo: result['data']['data'],
                                    logged: true,
                                    other: false,
                                    tipFlag: true,
                                    tipTitle: config['msg']['love'][randomNum]['title'],
                                    tipMsg: config['msg']['love'][randomNum]['msg']
                                });
                            }else{
                                // util.showSuccess('登录成功');
                                that.setData({
                                    userInfo: result.data.data,
                                    logged: true,
                                    other: true,
                                    tipFlag: true,
                                    tipTitle: 'Hello',
                                    tipMsg: '欢迎来到虎萄世界'
                                });
                            }
                            clearTimeout(timer);
                            timer = setTimeout(() => {
                                that.setData({
                                    tipFlag: false
                                });
                            }, 5000);

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
        util.wxRequest(config.service.timeLine, {}, 'POST').then(resolve => {
            that.setData({'list': resolve['list']})
            wx.hideToast();
        }).catch(err => {
            util.showModel('error', err);
        })
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