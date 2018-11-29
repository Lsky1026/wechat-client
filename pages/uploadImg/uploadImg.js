
let util = require('../../utils/util.js');
let config = require('../../config');

Page({
    data: {
        today: util.dateFormat('yyyy-MM-dd', new Date())
    },
    chooseImg (){
        let ctx = this;
        
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],   // 压缩图
            sourceType: ['album', 'camera'],    // 来源 ： 相册， 相机
            success: function (res) {
                // console.log(res)
                util.showBusy("上传中...")
                let tempFilePath = res.tempFilePaths[0];
                wx.uploadFile({
                    header: {
                        "Content-Type": "multipart/form-data"
                    },
                    url: config['service']['uploadUrl'],
                    name: 'uploadImg',
                    filePath: tempFilePath,
                    success: function (result) {
                        // console.log(result);
                        try {
                            let _res = JSON.parse(result['data']);
                            if(_res['code'] && _res['image']){
                                util.showSuccess("上传成功!")
                            }else{
                                util.showModel('上传失败', result);
                            }
                        } catch (error) {
                            util.showModel('上传失败', error);
                        }
                    },
                    fail: function (err) {
                        util.showModel('上传失败', err);
                    }
                })
            },
            fail: function (res) {
                util.showModel('上传失败', res);
            }
        })
    }
});