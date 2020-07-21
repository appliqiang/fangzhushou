const app = getApp();
import api from '../../../service/api.js';
import {xcxToBase64,formatDate} from '../../../utils/utils.js';
import tools from '../../../utils/tools.js';
import {getToken} from '../../../utils/token.js';

Page({
    data: {
        show:true,
        showIcon: true,
        animate: false,
        decorate:[],
        page:1,
        size:20,
        search:'',
        total:0,

        load: true,//是否可以加载
        loading: false,//加载动画的显示
    },

    onLoad: function(options) {

    },
    onShow(){
    this.initData()
  },
  initData(page=1,size=20){
    wx.showToast({title: '加载中', icon: 'loading', duration: 10000});
    let parmas = {
      page:page,
      size:size,
      search:''};
    api.frontDecorateList(parmas).then(res=>{
      if(res.code == 200) {
        if(res.data.data && res.data.data.length){
          let list = res.data.data,temp=[];

          list.forEach(item=>{
              temp.push({
                decorate_id: item.decorate_id,
                description: item.description,
                address:item.cityname.split(',')[1]+item.cityname.split(',')[2] + item.address,
                name: item.name,
                phone: item.phone,
                thumbnail:item.logo
              });
          })
          this.setData({decorate:temp,total: res.data.total})

        }
      };
      wx.hideToast();
    },err=>{
      console.log(err)
    })
  },
  loadMore(page,size){
    wx.showLoading({title:'加载中',mask:true})
    let parmas = {
      page:page,
      size:size,
      search:''
    };
    api.frontDecorateList(parmas).then(res=>{
      if(res.code == 200) {
        if(res.data.data && res.data.data.length){
          let list = res.data.data,temp=[];
          //
          list.forEach(item=>{
              temp.push({
                decorate_id: item.decorate_id,
                description: item.description,
                address:item.cityname.split(',')[1]+item.cityname.split(',')[2] + item.address,
                name: item.name,
                phone: item.phone,
                thumbnail:item.logo
              });
          });
         let content = this.data.decorate.concat(temp);
         this.setData({
            decorate: content,
            page: this.data.page * 1 + 1,
            load: true,
            loading: false,
         });
        };

        //close loafing
        wx.hideLoading();



      }
    },err=>{
        this.setData({loading: false,load: true,})
        wx.showToast({
          title: '数据异常',
          icon: 'none',
          duration: 2000,
        });
    })
  },

  viewDecorateDetail(e){
     let id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/newsPackage/pages/decorate-detail/decorate-detail?decorate_id='+id
      });
  },
 
  onReachBottom: function () {
    if (this.data.load) {
      if (this.data.decorate.length < this.data.total) {
        this.setData({load: false,loading: true});


        this.loadMore(this.data.page+1,20);
      }
    }
  }
})