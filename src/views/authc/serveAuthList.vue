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
		<el-table :data="serves" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="50">
			</el-table-column>
			<el-table-column prop="title" label="名称" >
			</el-table-column>
			<el-table-column prop="validity" label="有效期" >
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
				<el-form-item label="面部图：" prop="face">
					<img :src="detailForm.face" style="width:200px;height:200px"/>
				</el-form-item>
				<el-form-item label="名称：" prop="name">
					{{detailForm.name}}
				</el-form-item>
				<el-form-item label="类型：" prop="phone">
					{{detailForm.kind==2?'企业':'个人'}}
				</el-form-item>
				<el-form-item label="营业执照：" prop="phone" v-if="detailForm.kind==2">
					{{detailForm.licence}}
				</el-form-item>
				<el-form-item label="身份证：" prop="idCard">
					{{detailForm.idCard}}
				</el-form-item>
				<el-form-item label="身份证正面：" prop="face">
					<img :src="detailForm.cardImage" style="width:300px;height:200px"/>
				</el-form-item>
				<el-form-item label="身份证反面：" prop="face">
					<img :src="detailForm.cardReImage" style="width:300px;height:200px"/>
				</el-form-item>
				<el-form-item label="手机：" prop="phone">
					{{detailForm.phone}}
				</el-form-item>
				<el-form-item label="邮箱：" prop="email">
					{{detailForm.email}}
				</el-form-item>
				<el-form-item label="ip：" prop="ip">
					{{detailForm.ip}}
				</el-form-item>
				<el-form-item label="地址：" prop="address">
					{{detailForm.address}}
				</el-form-item>
			</el-form>
			</el-dialog>

			<el-dialog title="审核意见" v-model="authFormVisible" :close-on-click-modal="false" size="tiny">
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
				serves: [],
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
				listServeAuth(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.serves = body.list;
					}
				});
			},
			//显示编辑界面
			showDetail: function (index, row) {
				this.authId = row.id;
				this.detailFormVisible = true;
				this.detailForm = Object.assign({}, row);
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
								let para = {type:2, authIds: ids,status:this.status,content:this.authForm.content };
								authServe(para).then((body) => {
									this.authFormVisible = false;
									this.authLoading = false;
									NProgress.done();
									if(body){
										this.$message({
											message: '成功',
											type: 'success'
										});
										this.getServes();
									}
								});
						}).catch(() => {

						});
					}
				});
			},
			  //时间格式化 
		      dateFormat:function(row, column) { 
		        var date = row[column.property]; 
			     if (date == undefined) { 
			       return ""; 
			     } 
		     	return moment(date).format("YYYY-MM-DD HH:mm:ss"); 
		      }
		},
		mounted() {
			this.getServes();
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