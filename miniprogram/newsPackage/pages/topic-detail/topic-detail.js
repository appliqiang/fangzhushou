//index.js
const app = getApp();
import api from '../../../service/api.js';
Page({
  data: {
    topic_id:'',
    title:'',
    phone:'',
    city:'',
		user:'VIP看房',
		view:0,
		date:'',
		type:{},
		content:"",
    thumbnails:[],
    newsData:[]
  },
  onLoad: function (params) {
    this.setData({topic_id: params.topic_id});
    
  },
  onShow(){
    this.initData();
  },
  initData(){
    let params = {
      topic_id: this.data.topic_id
    };
    api.getTopicDetail(params).then(res=>{
      if(res.code == 200){
        if(res.data.info){
          let info = res.data.info;
          let thumbnails =info.thumbnail.length > 0 ? info.thumbnail.split(',') : [];
          this.setData({
            title:info.title,
            user:info.user.user_name,
            view:info.view,
            phone:info.phone,
            // city:info.city,
            date:info.add_date,
            type:{'id': info.type.type_id,'name': info.type.type_name},
            content:info.description,
            avatar:info.avatarUrl,
            thumbnails:thumbnails
          });
        };

        if(res.data.list && res.data.list.length){
          let list = res.data.list;

          let temp = [];
          list.forEach( (item,index) =>{
              temp.push({
                id: item.topic_id,
                title: item.title,
                thumbnail: item.thumbnail.split(',')[0],
                user: item.nickName,
                add_date:item.add_date.substring(0 ,10),
                view:1
              });
          });
          this.setData({newsData:temp})
        }


      }
    },err=>{
      console.log(err);
    })
  },
  handleImagePreview(e){
    const idx = e.target.dataset.idx
        const images = this.data.thumbnails
        wx.previewImage({
          current: images[idx],
          urls: images, 
        })
  },
  viewTopicDetail(e){
    let id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/newsPackage/pages/topic-detail/topic-detail?topic_id='+id
      });
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 通过按钮触发
      let title = this.data.title;
      return {
        title: title, // data.title
        path: `/newsPackage/pages/topic-detail/topic-detail?topic_id=${this.data.topic_id}`,
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
      path: "/pages/house/house",
    };
  },



})
