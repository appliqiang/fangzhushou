
//index.js
const app = getApp();
import api from '../../../service/api.js';
Page({
  data: {
    news_id:'',
    title:'',
    user:'',
    view:0,
    date:'',
    type:{},
    content:"",
    newsData:[],
  },
  onLoad: function (params) {
    this.setData({news_id: params.news_id});
  },
  onShow(){
    this.initData();
  },
  initData(){
    wx.showToast({title: '加载中', icon: 'loading', duration: 10000});
    let params = {
      news_id: this.data.news_id
    };
    api.getNewsDetail(params).then(res=>{
      if(res.code == 200){
        if(res.data.info){
          let info = res.data.info;

          this.setData({
            title: info.news_title,
            user: info.user,
            view:2,
            date: info.add_date,
            type:info.type,
            content: info.news_content
          });
        };



        if(res.data.list && res.data.list.length){
          let list = res.data.list;

          let temp = [];
          list.forEach( (item,index) =>{
            if(item.thumbnails){
              temp.push({
                id: item.news_id,
                title: item.news_title,
                thumbnail: item.thumbnails,
                user: item.user.user_name,
                add_date:item.add_date,
                view:1
              });
            }
          });
          this.setData({newsData:temp})
        }





      };
      wx.hideToast();
    },err=>{
      wx.hideToast();
      console.log(err);
    })
  },
  viewNewsDetail(e){
      let id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/newsPackage/pages/news-detail/news-detail?news_id='+id
      });
  },
  onShareAppMessage: function (res) {
    let news_id = this.data.news_id;
    let title = this.data.title;
    if (res.from === 'button') {
      // 通过按钮触发
      var data = res.target.dataset
      
      return {
        title: title, // data.title
        path: `/newsPackage/pages/news-detail/news-detail?news_id=${data.id}`,
        imageUrl: 'https://fengniaocloud.oss-cn-shanghai.aliyuncs.com/xcx/use/share.png',
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
      title: title,
      path: `/newsPackage/pages/news-detail/news-detail?news_id=${news_id}`,
    };
  },
})