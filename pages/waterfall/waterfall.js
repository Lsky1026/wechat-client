
let util = require('../../utils/util.js');
let config = require('../../config');

Page({
    data: {
        imageWidth: 0,
        leftImageArr: [],
        rightImageArr: [],
        dir: '',
        pages: 1,
        leftHei: 0,
        rightHei: 0,
        lock: false,
        doubleLock: false,
        currentCount: 0,    // 全部图片数量
        loadCount: 0    // 已加载图片数量
    },
    onLoad: function (opts) {
        // console.log(opts);
        // 每次请求20张图片
        let that = this;
        that.setData({
            imageWidth: opts.imageWidth,
            dir: opts.dir,
            lock:true
        });
        util.showBusy('载入中');
        let options = {
            'url': config.service.waterfall,
            'method': 'GET',
            'data': {
                'dirName': opts.dir,
                'pages': that.data.pages
            },
            success: function (res) {
                // console.log(res);
                if(res.data && res.data.code){
                    if(!util.isEmpty(res.data.list)){
                        that.handleImageList(opts.imageWidth, res.data.list);
                    }else{
                        that.setData({
                            'lock': false,
                            'doubleLock': true
                        });
                    }
                    
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
    handleImageList: function (optsW, list) {
        let that = this;
        let leftHei = that.data.leftHei,
            rightHei = that.data.rightHei;
        
        let leftList = that.data.leftImageArr,
            rightList = that.data.rightImageArr,
            currentCount = that.data.currentCount;

        list.forEach(obj => {
            let scaleHei = obj.height * (optsW / obj.width);
            /**
             * 规则：
             *  如果两边相等 图片添加到左边
             * 否则哪边高度小 则添加
             */
            if(leftHei == rightHei || leftHei < rightHei){
                leftList.push({
                    src: config.service.imageAddr + '/' + that.data.dir + '/' + obj.name,
                    height: scaleHei
                });
                leftHei += scaleHei;
            }else if(leftHei > rightHei){
                rightList.push({
                    src: config.service.imageAddr + '/' + that.data.dir + '/' + obj.name,
                    height: scaleHei
                });
                rightHei += scaleHei;
            }
            
        });

        
        that.setData({
            'leftImageArr': leftList,
            'rightImageArr': rightList,
            'leftHei': leftHei,
            'rightHei': rightHei,
            'currentCount': currentCount + list.length
        });
        wx.hideToast();
    },
    scrolltolowerFun: function (ev) {
        // console.log(ev);
        let that = this;
        if(that.data.currentCount != that.data.loadCount){
            return;
        }
        if(that.data.doubleLock){
            return;
        }

        that.setData({
            'lock': true,
        });

        let pages = that.data.pages + 1,
            options = {
                'url': config.service.waterfall,
                'method': 'GET',
                'data': {
                    'dirName': that.data.dir,
                    'pages': pages
                },
                success: function (res) {
                    if(res.data && res.data.code){
                        if(!util.isEmpty(res.data.list)){
                            that.handleImageList(that.data.imageWidth, res.data.list);
                            that.setData({
                                pages: pages
                            });
                        }else{
                            that.setData({
                                'lock': false,
                                'doubleLock': true
                            });
                        }
                        
                    }else{
                        util.showModel('获取图片失败', res);
                        that.setData({
                            pages: pages
                        });
                    }
                },
                fail: function (res) {
                    util.showModel('数据加载失败', res);
                }
            };

        // console.log(options);
        wx.request(options);
    },
    loadImage: function (ev) {
        // console.log(ev);
        let that = this,
            loadCount = that.data.loadCount;

        loadCount++;
        that.setData({
            'loadCount': loadCount
        });
    }
});