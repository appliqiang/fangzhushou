import api from '../../service/api.js';
import tools from '../../utils/tools.js';
import {getToken,setToken} from '../../utils/token.js';
const app = getApp();

Page({
  data: {
    userInfo: {
      avatarUrl:'',
      nickName:''
    },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad(){
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }else {
      this.isLogin();
    };
  },
  login(){
    let sessionKey = wx.getStorageSync('sessionKey');
    if (sessionKey) {
      this.checkWXSession() //检查用户的登录态在微信服务端是否过期
      .then(() => {
        return this.checkSerSession() // 检查用户登录态在开发者服务器端是否过期
      }).then(res => {
        console.log('sessionKey校验通过')
        resolve()
      })
      .catch((res) => {
        console.log('sessionKey校验未通过，过期了')
        this._wxLogin().then(res => {
          console.log(res)
          return this.serLogin(res.code)
        }).then(() => {
          resolve()
        })
      })
    } else {
      console.log('当前用户没登录不做处理,默认页面');
    }
  },
  //检查微信登录状态
  checkWXSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: () => {
          resolve(true)
        },
        fail: () => {
          reject(false)
        }
      })
    })
  },
  //服务端缓存验证登录状态
  checkSerSession() {
    return new Promise((resolve, reject) => {
      this.request({
        url: api.checkSession,//api 
        header: {
          sessionKey: wx.getStorageSync('sessionKey')
        },
          method: 'POST'
        })
      .then(res => {
        resolve(res);
      })
      .catch(res => {
        reject(res)
        console.log('后台登录态过期')
      })
    })
  },
  //微信login
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res);
          } 
          else {
            reject(res);
          }
        },
        fail: (err) => {
          reject(err);
        }
      })
    })
  },
  serLogin(code,userParams) {
    let params = {
      'code': code,
      'nickName':userParams.nickName,
      'avatarUrl':userParams.avatarUrl,
      'gender': userParams.gender,
      'province':userParams.province,
      'city':userParams.city,
      'country':userParams.country
    };
    api.login(params).then(res=>{
      if(res.code == 200){
        wx.setStorageSync('sessionKey', res.data.token);
        wx.setStorageSync('uid', res.data.user_id);
      }else {
        tools.toast('获取token凭证错误');
      }
      
    },err=>{
      tools.toast('开发者服务器登录失败');
    })
  },
  viewLogin(userParams){
    this.wxLogin().then(res => {
      return this.serLogin(res.code,userParams)
    }).then((res) => {
      console.log(res)
    })
  },

  toAddGroup(){
    wx.navigateTo({
      url: '/helpPackage/pages/add-group/add-group'
    });
  },
  toSaleEnter(){
    let params = {
      user_id: getToken('uid')
    };
    api.querySaler(params).then(res=>{
      if(res.code == 200){
        if(res.data.info){
          if(res.data.info.status == 1){
            tools.toast('您已申请入驻，客服正在审核中。。');
          }else{
            // tools.toast('请继续完善资料，资料务必真实');
            setToken('salerid',res.data.info.saler_id);
            wx.navigateTo({
              url: '/helpPackage/pages/sale-enter/sale-enter?saler_id='+res.data.info.saler_id
            });
          }
        }else {
          wx.navigateTo({
            url: '/helpPackage/pages/sale-enter/sale-enter'
          });
        }
      }else if(res.code == 401){
        tools.toast('登录失效，请重新登录。。');
        wx.navigateTo({url: 'pages/index/index'});

        app.globalData.userInfo = {};
        this.setData({userInfo: {},hasUserInfo: false});


      }
    },err=>{
      console.log(err);
    }); 
  },
  toAddDecorate(){
    let params = {
      user_id: getToken('uid')
    };
    api.queryOne(params).then(res=>{
      if(res.code == 200){
        if(res.data.info.decorate_id){
          let decorate_id = res.data.info.decorate_id;
          if(res.data.info.status == 1){
            tools.toast('您已申请入驻，客服正在审核中。。');
          }else{
            setToken('decorateid',res.data.info.decorate_id);
            wx.navigateTo({
              url: '/helpPackage/pages/decorate-enter/decorate-enter?decorate_id='+decorate_id
            });
          }
        }else {
          wx.navigateTo({
            url: '/helpPackage/pages/decorate-enter/decorate-enter'
          });
        }
      }else if(res.code == 401){
        tools.toast('登录失效，请重新登录。。');
        wx.navigateTo({url: 'pages/index/index'});

        app.globalData.userInfo = {};
        this.setData({userInfo: {},hasUserInfo: false});


      }
    },err=>{
      console.log(err);
    }); 
  },
  toAddReq(){
    wx.navigateTo({
      url: '/newsPackage/pages/topic/topic'
    });
  },
  toAddTopic(){
    wx.navigateTo({
      url: '/helpPackage/pages/addition-question/addition-question'
    });
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo;

    let userParams = {
      nickName:e.detail.userInfo.nickName,
      avatarUrl:e.detail.userInfo.avatarUrl,
      gender:e.detail.userInfo.gender,
      province:e.detail.userInfo.province,
      city:e.detail.userInfo.city,
      country:e.detail.userInfo.country
    };
    

    this.viewLogin(userParams);
    this.setData({userInfo: e.detail.userInfo,hasUserInfo: true});
  },
  isLogin(){
    wx.login({
      success: (res) => {
        if (res.code) {
          let params = {'code': res.code};
          api.isLogin(params).then(res=>{
            if(res.code == 200){
              if(res.data.user_id){
                let resData = {
                  nickName:res.data.nickName,
                  avatarUrl:res.data.avatarUrl,
                  gender:res.data.gender,
                  province:res.data.province,
                  city:res.data.city,
                  country:res.data.country
                };
                this.setData({userInfo: resData,hasUserInfo: true});
                 app.globalData.userInfo = resData;
                 wx.setStorageSync('sessionKey', res.data.token);
                 wx.setStorageSync('uid', res.data.user_id);
              }else {
                 app.globalData.userInfo = null;
              }
            }else {
              app.globalData.userInfo = null;
            }
          },err=>{
            console.log('服务器错误');
          })
        }
      },
      fail: (err) => {
        reject(err);
      }
    })
  }
})

