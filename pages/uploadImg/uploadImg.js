
let util = require('../../utils/util.js');

Page({
    data: {
        today: util.dateFormat('yyyy-MM-dd', new Date())
    }
});