<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.idCard" placeholder="身份证"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.phone" placeholder="电话"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.address" placeholder="地址"></el-input>
				</el-form-item>
				<!--<el-form-item label="类型">
		          <el-select v-model="filters.status" placeholder="全部" v-on:change="handeChange">
		          <el-option
		            v-for="item in statuses"
		            :key="item.value"
		            :label="item.text"
		            :value="item.value">
		          </el-option>
		          </el-select>
		        </el-form-item>--> 
				<el-form-item>
					<el-button type="primary" v-on:click="getMembers">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="members" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="50">
			</el-table-column>
			<el-table-column prop="sysCode.number" label="预选号" >
			</el-table-column>
			<el-table-column prop="name" label="姓名" >
			</el-table-column>
			<el-table-column prop="idCard" label="身份证">
			</el-table-column>
			<el-table-column prop="phone" label="电话" >
			</el-table-column>
			<!--<el-table-column prop="deviceId" label="设备ID">
			</el-table-column>-->
			<!--<el-table-column prop="ip" label="ip" >
			</el-table-column>-->
			<el-table-column prop="address" label="地址" >
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button type="success" size="small" :disabled="authcOprt" @click="authcSubmit(1, scope.row.id)">通过</el-button>
					<el-button type="info" size="small" :disabled="authcOprt" @click="authcSubmit(4, scope.row.id)">授理</el-button>
					<el-button type="danger" size="small" :disabled="authcOprt" @click="authcSubmit(5, scope.row.id)">失败</el-button>
					<el-button type="info" size="small" @click="showDetail(scope.$index, scope.row)">详情</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="success" @click="batchAuthc(1)" :disabled="this.sels.length===0||authcOprt">通过</el-button>
			<el-button type="info" @click="batchAuthc(4)" :disabled="this.sels.length===0||authcOprt">授理</el-button>
			<el-button type="danger" @click="batchAuthc(5)" :disabled="this.sels.length===0||authcOprt">失败</el-button>
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
					<!--失败原因-->
			<el-dialog title="失败原因" v-model="failFormVisible" :close-on-click-modal="false" size="tiny">
				<el-form :model="failForm" label-width="100px" ref="failForm" :rules="failFormRules">
				<el-form-item label="失败原因：" prop="reason">
	          		<el-input type="textarea" v-model="failForm.reason"></el-input>
				</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
						<el-button @click.native="failFormVisible = false">取消</el-button>
						<el-button type="primary" @click.native="failSubmit" :loading="failLoading">提交</el-button>
				</div>
			</el-dialog>


			<el-dialog title="审核意见" v-model="successFormVisible" :close-on-click-modal="false" size="tiny">
				<el-form :model="successForm" label-width="100px" ref="successForm" :rules="successFormRules">
				<el-form-item label="审核意见：" prop="reason">
	          		<el-input type="textarea" v-model="successForm.reason"></el-input>
				</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
						<el-button @click.native="successFormVisible = false">取消</el-button>
						<el-button type="primary" @click.native="successSubmit" :loading="failLoading">提交</el-button>
				</div>
			</el-dialog>


	</section>
</template>

<script>
	import util from '../../common/js/util';
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listAuthc,authcMember} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: '',
					idCard: '',
					phone: '',
					address: '',
					status:3
				},
				statuses:[
        			{
        				text:'全部',
        				value:'',
        				selected:true
        			},
        			{
        				text:'审核成功',
        				value:1
        			},
        			{
        				text:'审核失败',
        				value:5
        			}
        		],
				members: [],
				total: 0,
				pageIndex: 1,
				pageSize: 20,
				authcMemberId:'',
				listLoading: false,
				passLoading:false,
				failLoading:false,
				unPassLoading:false,
				sels: [],//列表选中列
				detailFormVisible: false,//编辑界面是否显示
				detailLoading: false,
				failFormVisible:false,
				successFormVisible:false,
				isBatch:false,
				//编辑界面数据
				detailForm: {
					name:''
				},
				failForm:{
					reason:''
				},
				failFormRules:{
					reason: [
						{ required: true, message: '请输入失败原因', trigger: 'blur' }
						
					]
				},
				successForm:{
					reason:''
				},
				successFormRules:{
					reason: [
						{ required: true, message: '请输入审核意见', trigger: 'blur' }
						
					]
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getMembers();
			},
			handeChange(value){
				this.filters.status=value;
			},
			//获取用户列表
			getMembers() {
				let para = {
					currentPage: this.page,
					pageSize:this.pageSize,
				};
				para = Object.assign({}, this.filters);
				this.listLoading = true;
				NProgress.start();
				listAuthc(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.members = body.list;
					}
				});
			},
			//显示编辑界面
			showDetail: function (index, row) {
				this.authcMemberId = row.id;
				this.detailFormVisible = true;
				this.detailForm = Object.assign({}, row);
			},
			//编辑
			authcSubmit: function (status,memberId) {
				if(memberId)this.authcMemberId = memberId;
				if(status==4){
					this.$confirm('确认提交吗？确认后，数据不可更改', '提示', {}).then(() => {
						this.passLoading=true;
						NProgress.start();
						let para ={memberIds:this.authcMemberId,status:status};
						para.createDate=null;
						authcMember(para).then((body) => {
							this.passLoading=false;
							NProgress.done();
							if(body){
								this.$message({
									message: '成功',
									type: 'success'
								});
								this.detailFormVisible = false;
								this.getMembers();
							}
						});
					});
				}else if(status==5){
					this.isBatch = false;
					this.failFormVisible = true;
				}else if(status==1){
					this.isBatch = false;
					this.successFormVisible = true;
				}
			},
			
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量审核
			batchAuthc: function (status) {
				var ids = this.sels.map(item => item.id).toString();
				var length = this.sels.length;
				var type=' "成功" ';
				if(status==4){
					type=' "授理" ';
				}
				if(status==1){
					this.isBatch = true;
					this.successFormVisible = true;
					return;
				}
				if(status==5){
					this.isBatch = true;
					this.failFormVisible = true;
					return;
				}
				this.$confirm('您已选择'+length+'条记录，审核结果为'+type+'。确认后，数据不可更改。', '提示', {
					type: 'warning'
				}).then(() => {	
						let para = { memberIds: ids,status:status };
						authcMember(para).then((body) => {
							this.listLoading = false;
							NProgress.done();
							if(body){
								this.$message({
									message: '成功',
									type: 'success'
								});
								this.getMembers();
							}
						});
				}).catch(() => {

				});
			},
			failSubmit(){
				let length = 0;
				if(!this.isBatch){
					length = 1;
				}else{
					length = this.sels.length;
				}
				this.$refs.failForm.validate((valid) => {
					if (valid) {
						this.$confirm('您已选择'+length+'条记录，审核结果为失败。确认后，数据不可更改。', '提示', {
						type: 'warning'
						}).then(() => {	
								var ids = null;
								if(!this.isBatch){
									ids = this.authcMemberId;
								}else{
									ids = this.sels.map(item => item.id).toString();
								}
								let para = { memberIds: ids,status:5,reason:this.failForm.reason };
								authcMember(para).then((body) => {
									this.failFormVisible = false;
									this.listLoading = false;
									NProgress.done();
									if(body){
										this.$message({
											message: '成功',
											type: 'success'
										});
										this.getMembers();
									}
								});
						}).catch(() => {

						});
					}
				});
			},
			successSubmit(){
				let length = 0;
				if(!this.isBatch){
					length = 1;
				}else{
					length = this.sels.length;
				}
				this.$refs.successForm.validate((valid) => {
					if (valid) {
						this.$confirm('您已选择'+length+'条记录，审核结果为审核通过。确认后，数据不可更改。', '提示', {
						type: 'warning'
						}).then(() => {	
								var ids = null;
								if(!this.isBatch){
									ids = this.authcMemberId;
								}else{
									ids = this.sels.map(item => item.id).toString();
								}
								let para = { memberIds: ids,status:1,reason:this.successForm.reason };
								authcMember(para).then((body) => {
									this.successFormVisible = false;
									this.listLoading = false;
									NProgress.done();
									if(body){
										this.$message({
											message: '成功',
											type: 'success'
										});
										this.getMembers();
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
		      },
		      //状态格式化 
		      statusFormat:function(row, column) { 
		        var status = row[column.property]; 
			     if (status == 3) { 
			       return "未处理"; 
			     }else {
			       return "已处理"; 
			     }
		      }
		},
		mounted() {
			this.getMembers();
		},
		computed: {  
	      authcOprt:function(){
	        return !util.hasOprt(this,'admin.member.authc');
	      }
    	}
	}

</script>

<style scoped>

</style>