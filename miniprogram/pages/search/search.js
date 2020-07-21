//index.js
const app = getApp();
import {fomatTime} from '../../utils/utils.js';
import api from '../../service/api.js'
import {getToken,setToken} from '../../utils/token.js';
Page({
  data: {
    active: 0,
    index_data: ['history'],
    keywords: '朋友',
    houses:[],
    reqs:[],


    topicPage:1,
    topicSize:20,
    topicTotal:0,
    topicLoad: true,//是否可以加载

    housesPage:1,
    housesSize:20,
    housesTotal:0,
    housesLoad: true,//是否可以加载

  },
  onLoad: function (params) {
  },
  onShow(){
    this.initData();
  },

  initData(){
    wx.showToast({title: '加载中', icon: 'loading', duration: 10000});
    let params = {
      page: 1,
      size: 20,
      cityid: getToken('cityid')
    };
    api.getSearchBoard(params).then(res=>{
      if(res.code == 200){
        
        if(res.data){
          let tempVote = [],tempTopic = [];
          if(res.data.vote  && res.data.vote.data.length){
            let vote = res.data.vote.data;
            vote.forEach(item=>{
              tempVote.push({
                id: item.house_id,
                name: item.house_name,
                score:item.score,
                address: item.county,
                thumbnail: item.thumbnail.split(',')[0]
              });
            });
            this.setData({'houses':tempVote,housesTotal:res.data.vote.total})
          };
          


          //话题
          if(res.data.topic  && res.data.topic.data.length){
            let vote = res.data.topic.data;
           
            vote.forEach(item=>{
               let thumbnail =  item.thumbnail.length > 0 ?  item.thumbnail.split(',') : [];
              tempTopic.push({
                id: item.topic_id,
                title: item.title,
                type_id: item.type_id,
                name:item.nickName,
                avatarUrl:item.avatarUrl,
                thumbnail: thumbnail,
                add_date: fomatTime(  Date.parse(item.add_date))
              });
            });
            this.setData({'reqs':tempTopic,topicLoad:res.data.topic.total})
          };
          



          
        }
      };
      wx.hideToast();
    },err=>{
      console.log(err)
    })
  },
  // 事件触发，调用接口
  nearby_search:function(){
    var _this = this;

    // 调用接口
    qqmapsdk.search({
      keyword: _this.data.keyword,  //搜索关键词
      location: _this.data.latitude+','+_this.data.longitude,  //设置周边搜索中心点
      success: function (res) { 
        var mks = []
        for (var i = 0; i < res.data.length; i++) {
          mks.push({ 
            title: res.data[i].title,
            id: res.data[i].id,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            iconPath:"/housePackage/images/icons/marker.png", //图标路径
            width: 20,
            height: 20
          })
        }
        _this.setData({  markers: mks});
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res){
        console.log(res);
      }
  });
  },
  onChange(event) {
    console.log(event)
    this.setData({active: event.detail.index});
    var iconPath='';
    // this.nearby_search();
  },
  toVote(e){
    let house_id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    let address = e.currentTarget.dataset.address;
    wx.navigateTo({
      url: '/helpPackage/pages/vote/vote?house_id='+house_id+'&house_name='+name+'&address='+address
    });
  },
  toTopicNews(e){
    let topic_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/newsPackage/pages/topic-detail/topic-detail?topic_id='+topic_id
    });
  },
  loadMoreVote(page,size){
    wx.showToast({title: '加载中', icon: 'loading', duration: 10000});
    let params = {
      page:page,
      size: size,
      cityid: getToken('cityid')
    };
    api.getVoteList(params).then(res=>{
      let tempVote = [];
      if(res.data.data  && res.data.data.length){
            let vote = res.data.data;
            vote.forEach(item=>{
              tempVote.push({
                id: item.house_id,
                name: item.house_name,
                score:item.score,
                address: item.county,
                thumbnail: item.thumbnail.split(',')[0]
              });
            });
            let content = this.data.houses.concat(tempVote);
           this.setData({
              houses: content,
              housesPage: this.data.housesPage * 1 + 1,
              housesLoad: true
           });
      };
      wx.hideToast();
    },err=>{
      wx.hideToast();
      console.log(err)
    })
  },
  loadMoreReqs(page,size){
    wx.showToast({title: '加载中', icon: 'loading', duration: 10000});
    let params = {
      page:page,
      size: size
    };
    api.getTopicList(params).then(res=>{
      let tempTopic = [];
      if(res.data.data  && res.data.data.length){
          let reqs = res.data.data;
            reqs.forEach(item=>{
               let thumbnail =  item.thumbnail.length > 0 ?  item.thumbnail.split(',') : [];
              tempTopic.push({
                id: item.topic_id,
                title: item.title,
                type_id: item.type_id,
                name:item.nickName,
                thumbnail:   thumbnail,
                add_date: fomatTime(  Date.parse(item.add_date))
              });
            });
            let content = this.data.reqs.concat(tempTopic);
           this.setData({
              reqs: content,
              topicPage: this.data.topicPage * 1 + 1,
              topicLoad: true
           });
      };
      wx.hideToast();
    },err=>{
      wx.hideToast();
      console.log(err)
    })
  },

  //fresh 
  onReachBottom: function () {
    if(this.data.active == 0) {
      //p平分
      if (this.data.housesLoad) {
        if (this.data.houses.length < this.data.housesTotal) {
          this.setData({housesLoad: false});
          this.loadMoreVote(this.data.housesPage+1,20);
        }
      }
    }else if(this.data.active == 1){
      //发布
      if (this.data.topicLoad) {
        if (this.data.reqs.length < this.data.topicTotal) {
          this.setData({topicLoad: false});
          this.loadMoreReqs(this.data.topicPage+1,20);
        }
      }
    }
    
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 通过按钮触发
      let title = this.data.title;
      return {
        title: title, // data.title
        path: `/pages/search/search/`,
        success: function (res) {
          // 转发成功
          console.log('转发成功')
        },
        fail: function (res) {
          // 转发失败
          console.log('转发失败')
        }
      }
    }
    //通过右上角菜单触发
    return {
      title: '找新房，看房价，房助手更方便',
      path: "/pages/search/search/",
    };
  },



})
