<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="角色名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getRoles">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button :disabled="addOprt" type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="roles" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="50">
			</el-table-column>
			<el-table-column type="index" width="80" label="序号">
			</el-table-column>
			<el-table-column prop="name" label="角色名">
			</el-table-column>
			<el-table-column prop="code" label="角色码">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<!--<el-table-column prop="createBy" label="创建人" width="310">
			</el-table-column>-->
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column label="操作" width="200">
				<template scope="scope">
					<el-button  :disabled="editOprt" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button  :disabled="authcOprt" size="small" @click="handlePerm(scope.row.id,scope.row.level)">权限</el-button>
					<el-button  :disabled="deleteOprt" type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
				<el-form-item label="角色名" prop="name">
					<el-input v-model="editForm.name" :disabled="true"></el-input>
				</el-form-item>
				<el-form-item label="角色码" prop="code">
					<el-input v-model="editForm.code"></el-input>
				</el-form-item>
				<el-form-item label="级别" prop="level">
		          <el-select v-model="editForm.level" placeholder="请选择">
		          <el-option
		            v-for="item in levels"
		            :key="item.value"
		            :label="item.text"
		            :value="item.value">
		          </el-option>
		          </el-select>
        		</el-form-item>
				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="editForm.status">
						<el-radio class="radio" :label="0" >屏蔽</el-radio>
						<el-radio class="radio" :label="1">激活</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="描述" prop="description" >
					<el-input type="textarea" v-model="editForm.description" ></el-input>
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
				<el-form-item label="角色名" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="角色码" prop="code">
					<el-input v-model="addForm.code"></el-input>
				</el-form-item>
				<el-form-item label="级别" prop="level">
		          <el-select v-model="addForm.level" placeholder="请选择">
		          <el-option
		            v-for="item in levels"
		            :key="item.value"
		            :label="item.text"
		            :value="item.value">
		          </el-option>
		          </el-select>
        		</el-form-item>
				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="addForm.status">
						<el-radio class="radio" :label="0" >屏蔽</el-radio>
						<el-radio class="radio" :label="1">激活</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input type="textarea" v-model="addForm.description"  rows=4></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>


		<!--权限配置-->
		<el-dialog title="权限配置" v-model="permissionFormVisible" :close-on-click-modal="false">
			<el-tree
			  :data="permissions"
			  show-checkbox
			  node-key="id"
			  ref="permissionTree"
			  :props="treeProp"
			  :default-expand-all="false">
			</el-tree>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="permissionFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="permissionSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util';
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listRole,addRole,deleteRole,editRole,listAllPerm,rolePerm,authcRole} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				treeProp:{
					label:"name",
					children:"children"
				},
				permissions: [],
				roles: [],
				total: 0,
				pageIndex: 1,
				pageSize: 20,
				editRoleId:'',
				listLoading: false,
				sels: [],//列表选中列
		        levels:[
			         {
			             text:'系统级别',
			             value:1 
			          },{
			             text:'代理级别',
			             value:2 
			          }
		        ],
				editFormVisible: false,//编辑界面是否显示
				permissionFormVisible:false,
				checkPermissions:[],
				editPermissionId:"",
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
						
					],
					code: [
						{ required: true, message: '请输入角色码', trigger: 'blur' }
						
					]
				},
				//编辑界面数据
				editForm: {
					name:'',
					code:'',
					status:0,
					level:1
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
						
					],
					code: [
						{ required: true, message: '请输入角色码', trigger: 'blur' }
						
					]
				},
				//新增界面数据
				addForm: {
					name:'',
					code:'',
					status:0,
					level:1
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
				this.getRoles();
			},
			//获取用户列表
			getRoles() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name
				};
				this.listLoading = true;
				NProgress.start();
				listRole(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.roles = body.list;
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
					let para = { roleIds: row.id };
					deleteRole(para).then((body) => {
						this.listLoading = false;
						NProgress.done();
						if(body){
							this.$message({
								message: '删除成功',
								type: 'success'
							});
							this.getRoles();
						}
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editForm = Object.assign({}, row);
				this.editFormVisible = true;
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					name:'',
					code:'',
					status:0,
					level:1,
					description:''
				};
			},
			//显示权限配置界面
			handlePerm: function (id,level) {
				this.editRoleId = id;
				this.checkPermissions = [];
				let para = {};
				if(level!=1){
					para ={level:level};
				}
				listAllPerm(para).then((body) => {
					if(body){
						this.permissions = body.list;
					}
					para = {roleId:id};
					rolePerm(para).then((body) => {
						this.$refs.permissionTree.setCheckedKeys(this.checkPermissions);
						if(body&&body.length>0){
							for(let i=0;i<body.length;i++){
								this.checkPermissions.push(body[i].id);
						}
						this.$refs.permissionTree.setCheckedKeys(this.checkPermissions);
						}
					});


				});
				
				this.permissionFormVisible = true;
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							NProgress.start();
							let para = Object.assign({}, this.editForm);
							para.createDate=null;
							editRole(para).then((body) => {
								this.editLoading = false;
								NProgress.done();
								if(body){
									this.$message({
										message: '提交成功',
										type: 'success'
									});
									this.$refs['editForm'].resetFields();
									this.editFormVisible = false;
									this.getRoles();
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
							let para = Object.assign({}, this.addForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							addRole(para).then((body) => {
								this.addLoading = false;
								NProgress.done();
								if(body){
									this.$message({
										message: '提交成功',
										type: 'success'
									});
									this.$refs['addForm'].resetFields();
									this.addFormVisible = false;
									this.getRoles();
								}
							});
						});
					}
				});
			},
			//角色配置
			permissionSubmit: function () {
				this.addLoading = true;
				NProgress.start();
				let keys = this.$refs.permissionTree.getCheckedKeys();
				let para = {roleId:this.editRoleId,permissionIds:keys};
				authcRole(para).then((body) => {
					this.addLoading = false;
					NProgress.done();
					if(body){
						this.$message({
							message: '提交成功',
							type: 'success'
						});
						this.permissionFormVisible = false;
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
					this.listLoading = true;
					NProgress.start();
					let para = { roleIds: ids };
					deleteRole(para).then((res) => {
						this.listLoading = false;
						NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getRoles();
					});
				}).catch(() => {

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
			     if (status == 0) { 
			       return "屏蔽"; 
			     }else if(status == 1) {
			       return "激活"; 
			     }
		      }  
		},
		mounted() {
			this.getRoles();
		},
		computed:{
			addOprt:function(){
				return !util.hasOprt(this,'admin.role.add');
			},
			editOprt:function(){
				return !util.hasOprt(this,'admin.role.edit');
			},
			authcOprt:function(){
				return !util.hasOprt(this,'admin.role.authc');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.role.delete');
			},
		}
	}

</script>

<style scoped>

</style>