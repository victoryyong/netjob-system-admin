<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="用户名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button :disabled="addOprt" type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="50">
			</el-table-column>
			<el-table-column type="index" width="50">
			</el-table-column>
			<el-table-column prop="name" label="账号" >
			</el-table-column>
			<el-table-column prop="realName" label="姓名">
			</el-table-column>
			<el-table-column prop="phone" label="电话" >
			</el-table-column>
			<el-table-column prop="cityName" label="代理城市" >
			</el-table-column>
			<!--<el-table-column prop="email" label="邮箱">
			</el-table-column>-->
			<!--<el-table-column prop="logins" label="登录次数">
			</el-table-column>-->
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="level" label="类型" :formatter="levelFormat">
			</el-table-column>
			<el-table-column prop="admin" label="超管" :formatter="adminFormat">
			</el-table-column>
			<!--<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat">
			</el-table-column>-->
			<el-table-column label="操作" width="200">
				<template scope="scope">
					<el-button size="small" :disabled="editOprt" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button size="small" :disabled="authcOprt" @click="handleRole(scope.row.id,scope.row.admin,scope.row.level)">角色</el-button>
					<el-button type="danger" :disabled="deleteOprt" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0||deleteOprt">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="账号" prop="name">
					<el-input v-model="editForm.name" :disabled="true"></el-input>
				</el-form-item>
				<el-form-item label="姓名" prop="realName">
					<el-input v-model="editForm.realName"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="phone">
					<el-input v-model="editForm.phone"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				 <el-form-item label="类型" prop="level" v-if="showLevel">
			         <el-select v-model="editForm.level" placeholder="请选择" @change="changeLevel">
				          <el-option
				            v-for="item in levels"
				            :key="item.value"
				            :label="item.text"
				            :value="item.value">
				          </el-option>
		          	</el-select>
        		</el-form-item>
        		<el-form-item label="省份" v-if="showProvince">
					<el-select  v-model="editForm.province" placeholder="请选择" @change="initCitys"  v-if="showProvince">
						<el-option
								v-for="item in provinces"
								:key="item.index"
								:label="item.name"
								:value="item.adcode">
							<span style="float: left">
								{{ item.name }}
							</span>
						</el-option>
					</el-select>
					<span  v-if="showProvince">城市 </span>
					<el-select v-model="addForm.citycode"  v-if="showProvince" placeholder="请选择">
						<el-option
								v-for="item in citys"
								:key="item.index"
								:label="item.name"
								:value="item.citycode">
							<span style="float: left">{{ item.name }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="editForm.status" :disabled="editForm.statusDisabled">
						<el-radio class="radio" :label="0" >冻结</el-radio>
						<el-radio class="radio" :label="1">激活</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="账号" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input type="password" v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="姓名" prop="realName">
					<el-input v-model="addForm.realName"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="level" v-if="showLevel">
		        	<el-select v-model="addForm.level" placeholder="请选择" @change="changeLevel">
			          <el-option
			            v-for="item in levels"
			            :key="item.value"
			            :label="item.text"
			            :value="item.value">
			          </el-option>
		          	</el-select>
        		</el-form-item>
        		
        		<el-form-item label="省份" v-if="showProvince">
					<el-select  v-model="addForm.province" placeholder="请选择" @change="initCitys"  v-if="showProvince">
						<el-option
								v-for="item in provinces"
								:key="item.index"
								:label="item.name"
								:value="item.adcode">
							<span style="float: left">
								{{ item.name }}
							</span>
						</el-option>
					</el-select>
					<span  v-if="showProvince">城市 </span>
					<el-select v-model="addForm.citycode" v-if="showProvince" placeholder="请选择">
						<el-option
								v-for="item in citys"
								:key="item.index"
								:label="item.name"
								:value="item.citycode">
							<span style="float: left">{{ item.name }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="手机" prop="phone">
					<el-input v-model="addForm.phone"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="addForm.status">
						<el-radio class="radio" :label="0" >冻结</el-radio>
						<el-radio class="radio" :label="1">激活</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--用户授权-->
		<el-dialog title="用户授权" v-model="roleFormVisible" :close-on-click-modal="false">
			<el-tree
			  :data="roles"
			  show-checkbox
			  node-key="id"
			  ref="roleTree"
			  :default-expand-all="true">
			</el-tree>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="roleFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="roleSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util';
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listUser,addUser,deleteUser,editUser,listAllRole,authcUser,userRole,getCitys,getProvinces} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				users: [],
				roles:[{id:"default",label:"用户授权",children:[]}],
				checkRoles:[],
				editUserId:"",
				total: 0,
				showLevel:true,
				showCity:false,
				showProvince:false,
				provinces:[],
				citys:[],
				pageIndex: 1,
				pageSize: 20,
				listLoading: false,
				sels: [],//列表选中列
				roleFormVisible:false,
				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					realName: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
						
					],
					citycode:[
						{ required: true, message: '请选择城市', trigger: 'blur' }
					],
					phone: [
						{ required: true, message: '请输入手机号码', trigger: 'blur' },
			            { validator:(rule,value,callback)=>{
			                if(/^1(3|4|5|7|8)\d{9}$/.test(value) == false){
			                    callback(new Error("请输入正确格式的手机号码"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
					],
					email: [
						{ required: true, message: '请输入邮箱', trigger: 'blur' },
			            { validator:(rule,value,callback)=>{
			                if(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value) == false){
			                    callback(new Error("请输入正确格式的邮箱"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					email:'',
					phone:'',
					status:0,
					realName:'',
					level:1,
					province:'',
					citycode:'',
					cityName:'',
					statusDisabled:false
				},
				levels:[
			         {
			             text:'系统用户',
			             value:1 
			          },{
			             text:'代理用户',
			             value:2 
			          }
		        ],
				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入账号', trigger: 'blur' }
						
					],
					citycode:[
						{ required: true, message: '请选择城市', trigger: 'blur' }
					],
					password: [
						{ required: true, message: '请输入密码', trigger: 'blur' }
						
					],
					realName: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
						
					],
					phone: [
						{ required: true, message: '请输入手机号码', trigger: 'blur' },
			            { validator:(rule,value,callback)=>{
			                if(/^1(3|4|5|7|8)\d{9}$/.test(value)  == false){
			                    callback(new Error("请输入正确的手机号码"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
						
					],
					email: [
						{ required: true, message: '请输入邮箱', trigger: 'blur' },
			            { validator:(rule,value,callback)=>{
			                if(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value) == false){
			                    callback(new Error("请输入正确格式的邮箱"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
						
					]
				},
				//新增界面数据
				addForm: {
					email:'',
					password:'',
					phone:'',
					level:1,
					cityName:'',
					citycode:'',
					province:'',
					status:0,
					realName:''
				}

			}
		},
		methods: {
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getUsers();
			},
			//获取用户列表
			getUsers() {
				let para = {
					currentPage: this.page,
					pageSize:this.pageSize,
					name: this.filters.name
				};
				this.listLoading = true;
				NProgress.start();
				listUser(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.users = body.list;
					}
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					NProgress.start();
					let para = { userIds: row.id };
					deleteUser(para).then((body) => {
						this.listLoading = false;
						NProgress.done();
						if(body){
							this.$message({
								message: '删除成功',
								type: 'success'
							});
							this.getUsers();
						}
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editForm.statusDisabled=false;
				this.editForm = Object.assign(this.editForm, row);
				if(row.admin=='1'){
					this.editForm.statusDisabled=true;
				}
				if(row.level==2){
					this.showProvince=true;
				}else{
					this.showProvince=false;
				}
				if(!row.citycode||!row.province){
					this.editForm.province=this.provinces[0].adcode;
					this.initCitys(this.editForm.province);
				}
				this.editFormVisible = true;
			},
			//显示新增界面
			handleAdd: function () {
				this.showProvince = false;
				this.addFormVisible = true;
			},
			//显示用户授权界面
			handleRole: function (id,admin,level) {
				if(admin){
					this.$message({
						message: '超管拥有所有权限',
						type: 'warning'
					});
					return;
				}
				this.editUserId = id;
				this.checkRoles = [];
				let para = {status:1};
				if(level!=1){
					para.level = level;
				}
				listAllRole(para).then((body) => {
					if(body){
						for(let i=0;i<body.list.length;i++){
							body.list[i].label = body.list[i].name;
						}
						this.roles[0].children = body.list;
					}
					para = {userId:id};
					userRole(para).then((body) => {
						this.$refs.roleTree.setCheckedKeys(this.checkRoles=[]);
						if(body&&body.length>0){
							for(let i=0;i<body.length;i++){
								this.checkRoles.push(body[i].id);
							}
							this.$refs.roleTree.setCheckedKeys(this.checkRoles);
						}
					});


				});
				
				this.roleFormVisible = true;
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							NProgress.start();
							let para = Object.assign({}, this.editForm);
							if(this.editForm.citycode){
								for (let i = 0; i < this.citys.length; i++) {
									if(this.citys[i].citycode==this.editForm.citycode){
		                                para.cityName = this.citys[i].name;
									}
		                        }
							}
							para.createDate=null;
							editUser(para).then((body) => {
								this.editLoading = false;
								NProgress.done();
								if(body){
									this.$message({
										message: '提交成功',
										type: 'success'
									});
									this.$refs['editForm'].resetFields();
									this.editFormVisible = false;
									this.getUsers();
								}
							});
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							NProgress.start();
							if(this.addForm.citycode){
								for (let i = 0; i < this.citys.length; i++) {
									if(this.citys[i].citycode==this.addForm.citycode){
		                                para.cityName = this.citys[i].name;
									}
		                        }
							}
							let para = Object.assign({}, this.addForm);
							addUser(para).then((body) => {
								this.addLoading = false;
								NProgress.done();
								if(body){
									this.$message({
										message: '提交成功',
										type: 'success'
									});
									this.$refs['addForm'].resetFields();
									this.addFormVisible = false;
									this.getUsers();
								}
							});
						});
					}
				});
			},
			//用户授权
			roleSubmit: function () {
				this.addLoading = true;
				NProgress.start();
				let keys = this.$refs.roleTree.getCheckedKeys();
				if(keys.length>0){
					for(let i=0;i<keys.length;i++){
						if(keys[i]=='default'){
							keys.splice(i,1);
							break;
						}
					}
				}
				let para = {userId:this.editUserId,roleIds:keys};
				authcUser(para).then((body) => {
					this.addLoading = false;
					NProgress.done();
					if(body){
						this.$message({
							message: '提交成功',
							type: 'success'
						});
						this.roleFormVisible = false;
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					let para = { userIds: ids };
					deleteUser(para).then((body) => {
						this.listLoading = false;
						NProgress.done();
						if(body){
							this.$message({
								message: '删除成功',
								type: 'success'
							});
							this.getUsers();
						}
					});
				}).catch(() => {

				});
			},
			//获取区域
            initProvinces:function() {
                getProvinces().then((body) => {
                    if(body){
                    	this.provinces=body;
                    	this.addForm.province=this.provinces[0].adcode;
                    	this.initCitys(this.provinces[0].adcode);
                    }
                });
            },
            initCitys:function(adcode) {
				let param ={adcode:adcode};
                getCitys(param).then((body) => {
                    if(body){
                    	this.citys=body;
                    	this.addForm.citycode=body[0].citycode;
                    	this.editForm.citycode=body[0].citycode;
                    }
                });
            },
            changeLevel:function(type){
            	if(type==1){
            		this.showProvince=false;
            	}else if(type==2){
            		this.showProvince=true;
            	}
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
			     if (status == 0) { 
			       return "冻结"; 
			     }else if(status == 1) {
			       return "激活"; 
			     }
		      }  ,
		      //状态格式化 
		      adminFormat:function(row, column) { 
		        var admin = row[column.property]; 
			     if (admin) { 
			       return "是"; 
			     }else{
			       return "否"; 
			     }
		      }   ,
		      //类型
		      levelFormat:function(row, column) { 
		        var level = row[column.property]; 
			     if (level==1) { 
			       return "系统用户"; 
			     }else if (level==2) {
			       return "代理用户"; 
			     }else{
			     	return "未知"; 
			     }
		      }  
		},
		mounted() {
			this.initProvinces();
			this.getUsers();
		},
		computed: {  
	      addOprt:function(){
	        return !util.hasOprt(this,'admin.user.add');
	      },
	      editOprt:function(){
	        return !util.hasOprt(this,'admin.user.edit');
	      },
	      deleteOprt:function(){
	        return !util.hasOprt(this,'admin.user.delete');
	      },
	      authcOprt:function(){
	        return !util.hasOprt(this,'admin.user.delete');
	      }  
    	}
	}

</script>

<style scoped>

</style>