<template>
	<section  style="width:100%;height:100%">
		<div id="allmap" style="width: 100%;height: 100%;overflow: hidden;margin:0;font-family:微软雅黑;"></div>
	</section>
</template>


<script>
	import util from '../../common/js/util';
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listAllMember} from '../../api/api';

	export default {
		data() {
			return {
				members:[],
				markMap:null
			}
		},
		methods: {
			getMembers() {
				listAllMember({}).then((body) => {
					if(body){
					 this.members =  body.list;
					 let self = this;
					 window.setTimeout(function(){
						var map = new BMap.Map("allmap");    // 创建Map实例
						 map.centerAndZoom('深圳',12); 
						 //map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
						 map.setCurrentCity("深圳");          // 设置地图显示的城市 此项是必须设置的
						 map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
						 self.markMap = map;
						 self.markPlace();
					 },2000);
					}
				});
			}, 
			markPlace(){
				if(this.members&&this.members.length>0){
					var member = null;
					var lat = null;
					var ant = null;
					for(var i=0;i<this.members.length;i++){
						member = this.members[i];
						if(member.ip&&member.ip.indexOf(',')>=0){
							lat = member.ip.split(',')[0];
							ant = member.ip.split(',')[1];
							if(lat&&ant){
								if(this.markMap){
									var point = new BMap.Point(lat,ant);
									var marker = new BMap.Marker(point);// 创建标注
									this.markMap.addOverlay(marker);  
									var name = (member.name==null||member.name=='')?'游客':member.name;
									var label = new BMap.Label(name,{offset:new BMap.Size(20,-10)});
									marker.setLabel(label);
								}
							}
						}
					}
					 
				}
		    }
		},
		mounted(){
			this.getMembers();
　　　  }
	}	
</script>

<style scoped>

</style>