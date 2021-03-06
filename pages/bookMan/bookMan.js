//bookMan.js 图书管理
//获取应用实例
var initdata = function (that) {
    var list = that.data.downLineBooks
    for (var i = 0; i < list.length; i++) {
        list[i].txtStyle = ""
    }
    that.setData({ list: list })
}
var app = getApp()
Page({
    data: {
        downLineBooks:null,
        onLineBooks:null,
        phoneInfo: app.globalData.phoneInfo,
    },
    //事件处理函数
    onLoad: function () {
        var that = this;
        this.initEleWidth();
        wx.request({
            url: ('https://' + app.globalData.apiUrl + '?m=home&c=Api&a=getBookManList&userId=' + app.globalData.userId).replace(/\s+/g, ""),
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                that.setData({
                    downLineBooks: res.data[0]["data"],
                    onLineBooks: res.data[1]["data"]
                })
                
            }
        })
        
    },
    onShow: function () {
        this.onLoad();
    },

    editKeepTime:function(e){
        //编辑
        var canShareId = e.currentTarget.dataset.canshareid;
        var bookId = e.currentTarget.dataset.bookid;
        wx.navigateTo({
            url: '../editTime/editTime?canShareId=' + canShareId + "&bookId=" + bookId
        })
    },

    //下线图书
    downLine:function(e){
        var canShareId = e.currentTarget.dataset.canshareid;
        var that = this;
        wx.request({
            url: ('https://' + app.globalData.apiUrl + '?m=home&c=Api&a=downLine&canShareId=' + canShareId).replace(/\s+/g, ""),
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if(res.data == "downLined"){
                    wx.showToast({
                        title: '您已下线该图书，无需重复！',
                        image: '../../images/warning.png',
                        duration: 2000
                    })
                } else if (res.data == "success"){
                    wx.showToast({
                        title: '下线成功！',
                        icon: 'success',
                        duration: 2000
                    })
                    that.onLoad();
                    
                } else if (res.data == "fail"){
                    wx.showToast({
                        title: '下线失败，请稍后重试！',
                        image: '../../images/fail.png',
                        duration: 2000
                    })
                }
            }
        })

    },

    //上线图书
    onLine: function (e) {
        var canShareId = e.currentTarget.dataset.canshareid;
        var that = this;
        wx.request({
            url: ('https://' + app.globalData.apiUrl + '?m=home&c=Api&a=onLine&canShareId=' + canShareId).replace(/\s+/g, ""),
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if (res.data == "onLined") {
                    wx.showToast({
                        title: '您已上线该图书，无需重复！',
                        image: '../../images/warning.png',
                        duration: 2000
                    })
                } else if (res.data == "success") {
                    wx.showToast({
                        title: '上线成功！',
                        icon: 'success',
                        duration: 2000
                    })
                    that.onLoad();
                } else if (res.data == "fail") {
                    wx.showToast({
                        title: '上线失败，请稍后重试！',
                        image: '../../images/fail.png',
                        duration: 2000
                    })
                }
            }
        })

    },
    touchS: function (e) {
        if (e.touches.length == 1) {
            this.setData({
                //设置触摸起始点水平方向位置  
                startX: e.touches[0].clientX
            });
        }
    },
    touchM: function (e) {
        var that = this
        initdata(that)
        if (e.touches.length == 1) {
            //手指移动时水平方向位置  
            var moveX = e.touches[0].clientX;
            //手指起始点位置与移动期间的差值  
            var disX = this.data.startX - moveX;
            var delBtnWidth = this.data.delBtnWidth;
            var txtStyle = "";
            if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变  
                txtStyle = "left:0px";
            } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离  
                txtStyle = "left:-" + disX + "px";
                if (disX >= delBtnWidth) {
                    //控制手指移动距离最大值为删除按钮的宽度  
                    txtStyle = "left:-" + delBtnWidth + "px";
                }
            }
            //获取手指触摸的是哪一项  
            var index = e.target.dataset.index;
            var list = this.data.list;
            list[index].txtStyle = txtStyle;
            //更新列表的状态  
            this.setData({
                list: list
            });
        }
    },

    touchE: function (e) {
        if (e.changedTouches.length == 1) {
            //手指移动结束后水平位置  
            var endX = e.changedTouches[0].clientX;
            //触摸开始与结束，手指移动的距离  
            var disX = this.data.startX - endX;
            var delBtnWidth = this.data.delBtnWidth;
            //如果距离小于删除按钮的1/2，不显示删除按钮  
            var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
            //获取手指触摸的是哪一项  
            var index = e.target.dataset.index;
            var list = this.data.list;
            list[index].txtStyle = txtStyle;
            //更新列表的状态  
            this.setData({
                list: list
            });
        }
    },
    //获取元素自适应后的实际宽度  
    getEleWidth: function (w) {
        var real = 0;
        try {
            var res = wx.getSystemInfoSync().windowWidth;
            var scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应  
            // console.log(scale);  
            real = Math.floor(res / scale);
            return real;
        } catch (e) {
            return false;
            // Do something when catch error  
        }
    },
    initEleWidth: function () {
        var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
        this.setData({
            delBtnWidth: delBtnWidth
        });
    },
    //点击删除按钮事件  
    delItem: function (e) {
        var that = this
        wx.showModal({
            title: '提示',
            content: '是否删除？',
            success: function (res) {
                if (res.confirm) {
                    //获取列表中要删除项的下标  
                    var index = e.target.dataset.index;
                    var list = that.data.list;
                    //移除列表中下标为index的项  
                    list.splice(index, 1);
                    //更新列表的状态  
                    that.setData({
                        list: list
                    });
                } else {
                    initdata(that)
                }
            }
        })

    }

    
})
