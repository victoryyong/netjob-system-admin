<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.provinceName" placeholder="省"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.cityName" placeholder="市"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getServes">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="serves" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="title" label="名称" >
			</el-table-column>
			<el-table-column prop="memberName" label="用户名" >
			</el-table-column>
			<el-table-column prop="provinceName" label="省" >
			</el-table-column>
			<el-table-column prop="cityName" label="市" >
			</el-table-column>
			<el-table-column prop="firstMenuName" label="主类型" >
			</el-table-column>
			<el-table-column prop="menuName" label="类型" >
			</el-table-column>
			<el-table-column prop="validity" label="有效期" >
			</el-table-column>
			<el-table-column prop="serveTime" label="需求时间" >
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button type="danger" size="small" :disabled="deleteOprt" @click="deleteHandle(scope.row.id)">删除</el-button>
					<el-button type="info" size="small" @click="showDetail(scope.row)">详情</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		
		<!--详情界面-->
		<el-dialog title="详情" v-model="detailFormVisible" :close-on-click-modal="false" size="small">
			<el-form :model="detailForm" label-width="120px" ref="detailForm">
				<el-form-item label="文件：" prop="face">
					<div v-for="(link, index) in detailForm.links">
						<img v-if="link.type=='image'" :src="link.src" style="width:320px;height:240px"/>
						<video v-if="link.type=='video'" :src="link.src" controls="controls"></video>
					</div>
				</el-form-item>
				<el-form-item label="标题：" prop="title">
					{{detailForm.title}}
				</el-form-item>
				<el-form-item label="发布时间：" prop="createDate">
					{{detailForm.createDate|detailDateFormat}}
				</el-form-item>
				<el-form-item label="服务时间：" prop="serveTime">
					{{detailForm.serveTime}}
				</el-form-item>
				<el-form-item label="有效期：" prop="validity">
					{{detailForm.validity}}
				</el-form-item>
				<el-form-item label="报价方式：" prop="priceType">
					{{detailForm.priceType==1?'一口价':'商议'}}
				</el-form-item>
				<el-form-item v-if="detailForm.priceType=='1'" label="价格：">
					{{detailForm.price}}
				</el-form-item>
				<el-form-item label="需求方式：" prop="workType">
					{{detailForm.workType==1?'线上':'线下'}}
				</el-form-item>
				<el-form-item label="结算方式：" prop="payType">
					{{detailForm.payType==1?'线上':'线下'}}
				</el-form-item>
				<el-form-item label="省市区：">
					{{detailForm.provinceName}}-{{detailForm.cityName}}-{{detailForm.area}}
				</el-form-item>
				<el-form-item label="详细地址：" prop="detailAddress">
					{{detailForm.detailAddress}}
				</el-form-item>
				<el-form-item label="服务描述：" prop="description">
					<el-input :disabled=true type="textarea" v-model="detailForm.description"></el-input>
				</el-form-item>
			</el-form>
			</el-dialog>
		
		
	</section>
</template>

<script>
	import util from '../../common/js/util';
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listServe,deleteServe} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: '',
					provinceName: '',
					cityName: ''
				},
				serves: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				authId:'',
				status:'',
				listLoading: false,
				detailFormVisible: false,//编辑界面是否显示
				detailLoading: false,
				authFormVisible:false,
				//编辑界面数据
				detailForm: {
					name:'',
					links:''
				}
			}
		},
		methods: {
			handleClose(done){
				var videos = document.getElementsByTagName("video")
				if(videos){
					for(var i=0;i<videos.length;i++){
						videos[i].pause();
					}
				}
				done();
			},
			handleCurrentChange(val) {
				this.currentPage = val;
				this.getServes();
			},
			//获取用户列表
			getServes() {
				let para = {
					currentPage: this.currentPage,
					pageSize:this.pageSize,
					type:2
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listServe(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.serves = body.list;
					}
				});
			},
			//显示编辑界面
			showDetail: function (row) {
				this.detailFormVisible = true;
				this.detailForm = Object.assign({}, row);
				if(this.detailForm.links){
					var srcs=eval('(' + this.detailForm.links + ')');
					this.detailForm.links=[];
					for(var i=0;i<srcs.length;i++){
						if(srcs[i].toLowerCase().indexOf('.jpg')>0||srcs[i].toLowerCase().indexOf('.jpeg')>0||srcs[i].toLowerCase().indexOf('.png')>0){
							this.detailForm.links.push({src:srcs[i],type:'image'});
						}else if(srcs[i].toLowerCase().indexOf('.mp4')>0){
							this.detailForm.links.push({src:srcs[i],type:'video'});
						}
					}
				}
			},
			  //时间格式化 
	      dateFormat:function(row, column) { 
	        var date = row[column.property]; 
		     if (date == undefined) { 
		       return ""; 
		     } 
	     	return moment(date).format("YYYY-MM-DD"); 
	      },
	      statusFormat:function(row, column) { 
	        var status = row[column.property]; 
		     if (status == 1) { 
		       return "未审核"; 
		     } else if(status == 2){
		     	return "已通过"; 
		     }else if(status == 3){
		     	return "未通过"; 
		     }
	     	return "未知"; 
	      }
		},
		filters:{
			  //时间格式化 
		      detailDateFormat:function(column) { 
			     if (column == undefined) { 
			       return ""; 
			     } 
		     	return moment(column).format("YYYY-MM-DD HH:mm:ss"); 
		      }
		},
		mounted() {
			this.getServes();
		},
		computed: {  
	      deleteOprt:function(){
	        return !util.hasOprt(this,'admin.serve.delete');
	      }
    	}
	}

</script>

<style scoped>

</style>