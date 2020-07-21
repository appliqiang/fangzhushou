//index.js
const app = getApp();
import api from '../../service/api.js'
import tools from '../../utils/tools.js';
import {getToken,setToken} from '../../utils/token.js';
import { city } from '../../libs/city';
Page({
  data: {
    index_data: ['history'],
    keywords: '朋友',
    banners: ['https://fengniaocloud.oss-cn-shanghai.aliyuncs.com/xcx/use/vip_des.png'],
    newPersonData:[
    ],
    showIcon: true,
    //filter
    activeFilter: '',
    showFilterView: false,
    addressOption: [
      { text: '区域', value: 0 },
      { text: '蚌山区', value: 340303 },
      { text: '禹会区', value: 340304 },
      { text: '淮上区', value: 340311 },
      { text: '经开区', value: 340324 },
      { text: '龙子湖区', value: 340302 },
      { text: '高新区', value: 340325 },
      { text: '固镇县', value: 340323 },
      { text: '五河县', value: 340322 },
      { text: '怀远县', value: 340321 }
    ],
    priceOption: [
      { text: '价格', value: 0 },
      { text: '5000以下', value: 1 },
      { text: '5000-7000', value: 2 },
      { text: '7000-8000', value: 3 },
      { text: '8000-10000', value: 4 },
      { text: '10000以上', value: 5 }
    ],
    huxingOption: [
      { text: '户型', value: 0 },
      { text: '一室', value: 1 },
      { text: '二室', value: 2 },
      { text: '三室', value: 3 },
      { text: '四室', value: 4 },
      { text: '四室以上', value: 5 }
    ],
    areaOption: [
      { text: '面积', value: 0},
      { text: '50m²以下', value: 1 },
      { text: '50m²-70m²', value: 2 },
      { text: '70m²-90m²', value: 3 },
      { text: '90m²-110m²', value: 4 },
      { text: '110m²-130m²', value: 5 },
      { text: '130m²-150m²', value: 6 },
      { text: '150m²以上', value: 7 }
    ],
    moreTabTitle:'更多',
    view:0,
    addressValue: 0,
    priceValue: 0,
    huxingValue: 0,
    areaValue: 0,
    filterArr:[
      {id: 1,name:'综合排序'},
      {id: 2,name:'点击量排行'},
      {id: 3,name:'评论数排行'},
    ],
    activeFilter:0,

    page:1,
    size:20,
    total:0,
    load: true,//是否可以加载
  },
  onLoad(){
     this.initCity();
  },
  onShow(){
    this.getHouseData();
  },
  getHouseData(page=1,size = 20){
    wx.showToast({title: '加载中', icon: 'loading', duration: 10000});


    //区域
    let [address,price,huxing,area,view ] =  [0,0,0,0,0];
    if(this.data.addressValue){
      address = this.data.addressValue;
    };
    if(this.data.priceValue){
      price = this.data.priceValue;
    };
    if(this.data.huxingValue){
      huxing = this.data.huxingValue;
    };
    if(this.data.areaValue){
      area = this.data.areaValue;
    };
    if(this.data.activeFilter == 1){
      view = 1;
    };



    let params = {
      page:page,
      size: size,
      address: address,
      price: price,
      huxing:huxing,
      area: area,
      view:view,
      cityid: getToken('cityid')
    };
    api.getHouse(params).then(res=>{
      if(res.data && res.data.data.length){
        let list = res.data.data;
        let temp = [];
        list.forEach(item=>{
          temp.push({
            id: item.house_id, 
            name:item.house_name,
            view:item.view,
            address:item.cityname,
            date:item.deliver_time,
            types:item.house_price_range.split(','),
            tags:item.tags.split(','), 
            avatar:item.thumbnail.split(',')[0],
          });
        });
        this.setData({'newPersonData':temp,total:res.data.total });
        wx.hideToast();
      }else {
        tools.toast('没有查询到楼盘');
        this.setData({'newPersonData':[],'total':0})
        wx.hideToast();
      }
    })
  },
  onReachBottom: function () {
    if (this.data.load) {
      if (this.data.newPersonData.length < this.data.total) {
        this.setData({load: false});
        this.loadMore(this.data.page+1,20);
      }
    }
  },
  loadMore(page,size){
    wx.showLoading({title:'加载中',mask:true})
    //区域
    let [address,price,huxing,area,view ] =  [0,0,0,0,0];
    if(this.data.addressValue){
        address = this.data.addressValue;
    };
    if(this.data.priceValue){
        price = this.data.priceValue;
    };
    if(this.data.huxingValue){
       huxing = this.data.huxingValue;
    };
    if(this.data.areaValue){
        area = this.data.areaValue;
    };
    if(this.data.activeFilter == 1){
        view = 1;
    };

    let params = {
      page:page,
      size: size,
      address: address,
      price: price,
      huxing:huxing,
      area: area,
      view:view,
      cityid: getToken('cityid')
    };
    api.getHouse(params).then(res=>{
      if(res.data && res.data.data.length){
        let list = res.data.data;
        let temp = [];
        list.forEach(item=>{
          temp.push({
            id: item.house_id, 
            name:item.house_name,
            view:item.view,
            address:item.cityname,
            date:item.deliver_time,
            types:item.house_price_range.split(','),
            tags:item.tags.split(','), 
            avatar:item.thumbnail.split(',')[0],
          });
        });
        // this.setData({'newPersonData':temp,total:res.data.total })
        let content = this.data.newPersonData.concat(temp);
         this.setData({
            newPersonData: content,
            page: this.data.page * 1 + 1,
            load: true
         });


         //close loafing
        wx.hideLoading();

      }else {
        tools.toast('没有查询到楼盘');
        this.setData({'newPersonData':[],'total':0})
      }
    })
  },

  initCity(){
    let cityid = getToken('cityid');
    let cityArr = [];
    city.forEach(province=>{
      if(province.children.length) {
        let cities = province.children;
        cities.forEach(item=>{
          if(cityid == item.id){
            cityArr.push({ text: '区域', value: 0 });
            item.children.forEach(county =>{
              cityArr.push({ text: county.name, value: county.id });
            });
          }
        });
      }
    });

    this.setData({'addressOption': cityArr})

  },

  // 选项卡
  chooseFilter(e){
    this.setData({
        activeFilter: e.target.dataset.index
    });

    this.getHouseData();
  },
  changeAddress(e){
    this.setData({addressValue: e.detail});
    this.getHouseData();
  },
  changePrice(e){
    this.setData({priceValue: e.detail});
    this.getHouseData();
  },
  changeHuxing(e){
    this.setData({huxingValue: e.detail});
    this.getHouseData();
  },
  changeArea(e){
    this.setData({areaValue: e.detail});
    this.getHouseData();
  },


  viewHouseDetail(e){
    let house_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/housePackage/pages/house-detail/house-detail?house_id='+house_id
    });
  },


  //搜索楼盘
  watchSearch(){
    wx.navigateTo({
      url: '/housePackage/pages/search/search'
    });
  },
  go_to_search_result(){},
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 通过按钮触发
      var data = res.target.dataset
      return {
        title: 'VIP房助手，看最新楼盘，了解最新房价', // data.title
        path: `/newsPackage/pages/news-detail/news-detail?news_id=${data.id}`,
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
