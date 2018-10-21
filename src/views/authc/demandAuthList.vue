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
					<el-button type="primary" v-on:click="getServers">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="servers" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="50">
			</el-table-column>
			<el-table-column prop="title" label="标题" >
			</el-table-column>
			<el-table-column prop="type" label="来源" >
			</el-table-column>
			<el-table-column prop="validity" label="作者" >
			</el-table-column>
			<el-table-column prop="provinceName" label="省" >
			</el-table-column>
			<el-table-column prop="cityName" label="市" >
			</el-table-column>
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button type="success" size="small" :disabled="authOprt" @click="authHandle(2,scope.row.id)">通过</el-button>
					<el-button type="danger" size="small" :disabled="authOprt" @click="authHandle(3,scope.row.id)">不通过</el-button>
					<el-button type="info" size="small" @click="showDetail(scope.$index, scope.row)">详情</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="success" @click="batchAuth(2)" :disabled="this.sels.length===0||authOprt">通过</el-button>
			<el-button type="danger" @click="batchAuth(3)" :disabled="this.sels.length===0||authOprt">不通过</el-button>
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
				<div style="float:right;margin-bottom:10px">
					<el-button type="danger"  :disabled="authOprt" @click="authHandle(3,detailForm.id)">不通过</el-button>
					<el-button type="success"  :disabled="authOprt" @click="authHandle(2,detailForm.id)">通过</el-button>
				</div>
			</el-form>
			</el-dialog>

			<el-dialog title="审核意见" v-model="authFormVisible" :close-on-click-modal="false" size="tiny" :before-close="handleClose">
				<el-form :model="authForm" label-width="100px" ref="authForm" :rules="authFormRules">
				<el-form-item label="审核意见：" prop="content">
	          		<el-input type="textarea" v-model="authForm.content"></el-input>
				</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
						<el-button @click.native="authFormVisible = false">取消</el-button>
						<el-button type="primary" @click.native="authSubmit" :loading="authLoading">提交</el-button>
				</div>
			</el-dialog>


	</section>
</template>

<script>
	import util from '../../common/js/util';
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listServeAuth,authServe} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: '',
					provinceName: '',
					cityName: ''
				},
				servers: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				authId:'',
				status:'',
				listLoading: false,
				authLoading:false,
				sels: [],//列表选中列
				detailFormVisible: false,//编辑界面是否显示
				detailLoading: false,
				authFormVisible:false,
				isBatch:false,
				//编辑界面数据
				detailForm: {
					name:''
				},
				authForm:{
					reason:''
				},
				authFormRules:{
					content: [
						{ required: true, message: '请输入审核意见', trigger: 'blur' }
						
					]
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
				this.getServers();
			},
			//获取用户列表
			getServers() {
				let para = {
					currentPage: this.currentPage,
					pageSize:this.pageSize,
					type:1
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listServeAuth(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.servers = body.list;
					}
				});
			},
			//显示编辑界面
			showDetail: function (index, row) {
				this.authId = row.id;
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
			//编辑
			authHandle: function (status,authId) {
				this.isBatch = false;
				this.authId = authId;
				this.status = status;
				this.authFormVisible = true;
			},
			
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量审核
			batchAuth: function (status) {
				this.isBatch = true;
				this.status = status;
				this.authFormVisible = true;
			},
			authSubmit(){
				let length = 0;
				if(!this.isBatch){
					length = 1;
				}else{
					length = this.sels.length;
				}
				this.$refs.authForm.validate((valid) => {
					var str = "";
					if(this.status==2){
						str = "通过"
					}else{
						str = "不通过"
					}
					if (valid) {
						this.$confirm('您已选择'+length+'条记录，审核结果为审核'+str+'。确认后，数据不可更改。', '提示', {
						type: 'warning'
						}).then(() => {	
								this.authLoading=true;
								var ids = null;
								if(!this.isBatch){
									ids = this.authId;
								}else{
									ids = this.sels.map(item => item.id).toString();
								}
								let para = {type:1, authIds: ids,status:this.status,content:this.authForm.content };
								authServe(para).then((body) => {
									this.authFormVisible = false;
									this.authLoading = false;
									this.detailFormVisible = false;
									NProgress.done();
									if(body){
										this.$message({
											message: '成功',
											type: 'success'
										});
										this.getServers();
									}
								});
						}).catch(() => {

						});
					}
				});
			},
			  //时间格式化 
		      dateFormat:function(row, column) { 
		      	var date = "";
    			date = row[column.property]; 
			     if (date == undefined) { 
			       return ""; 
			     } 
		     	return moment(date).format("YYYY-MM-DD HH:mm:ss"); 
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
			this.getServers();
		},
		computed: {  
	      authOprt:function(){
	        return !util.hasOprt(this,'admin.serve.auth');
	      }
    	}
	}

</script>

<style scoped>

</style>