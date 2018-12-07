
let util = require('../../utils/util.js');
let config = require('../../config');

Page({
    data: {
        date: util.dateFormat('yyyy-MM-dd', new Date()),
        list: {},
        width: 0
    },
    onLoad (){
        let ctx = this;
        wx.getSystemInfo({
            success: (res) => {
                ctx.setData({
                    width: res.windowWidth * 0.48
                });
            }
        });
    },
    chooseImg (){
        let ctx = this;
        wx.chooseImage({
            count: 1,
          sizeType: ['original'],   // 压缩图
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
                            if(_res['code']){
                                util.showSuccess("上传成功!")
                                ctx.handleImage(_res);
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
    },
    handleImage (obj){
        let ctx = this;
        let temp = util.deepCopy(ctx.data.list);

        let scaleHei = obj['imageHeight'] * (ctx.data.width / obj['imageWidth']);

        let imageObj = {
            'src': `${config.service.imageAddr}/${ctx.data.date}/JPEG/${obj['imageName']}`,
            'height': scaleHei
        };

        if(temp.hasOwnProperty(ctx.data.date)){
            let tar = temp[ctx.data.date];
            if(tar['leftHei'] > tar['rightHei']){
                tar['rightImageArr'].push(imageObj);
                tar['rightHei'] = tar['rightHei'] + scaleHei;
            }else{
                tar['leftImageArr'].push(imageObj);
                tar['leftHei'] = tar['leftHei'] + scaleHei;
            }
        }else{
            let options = {
                'leftHei': scaleHei,
                'rightHei': 0,
                'leftImageArr': [imageObj],
                'rightImageArr': [],
                'dir': ctx.data.date
            };
            temp[ctx.data.date] = options;
        }

        ctx.setData({'list': temp});
    },
    pickerDate (ev){
        this.setData({
            'date': ev.detail.value
        })
    }
});