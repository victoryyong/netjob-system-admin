<template>
	<section>
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-button type="primary" :disabled="addOprt" @click="handleAdd(null)">新增字典</el-button>
    	</el-col>
		<!--列表-->
		<el-table :data="tasks" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column prop="bean"  label="类名" min-width="300">
			</el-table-column>
			<el-table-column prop="expression"  label="规则">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button  :disabled="editOprt"   type="info" size="small" @click="handleEdit(scope.row)">修改</el-button>
					<el-button  :disabled="editOprt"   type="info" v-if="scope.row.status=='0'" size="small" @click="handleStart(scope.row.id)">启用</el-button>
					<el-button  :disabled="editOprt"   type="danger" v-if="scope.row.status=='1'" size="small" @click="handlePause(scope.row.id)">暂停</el-button>
					<el-button  :disabled="deleteOprt" type="danger" size="small" @click="batchRemove(scope.row.id)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove()" :disabled="this.sels.length===0||deleteOprt">删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>


		<!--编辑界面-->
		<el-dialog title="修改" v-model="editVisible" :close-on-click-modal="false" size="small">
			<el-form :model="editForm" label-width="80px" :rules="editRules" ref="editForm">
				<el-form-item label="类名" prop="bean">
					<el-input v-model="editForm.bean"></el-input>
				</el-form-item>
				</el-form-item>
				<el-form-item label="规则" prop="expression">
					<el-input v-model="editForm.expression"></el-input>
				</el-form-item>
				<el-form-item label="说明" prop="remark">
					<el-input v-model="editForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addVisible" :close-on-click-modal="false" size="small">
			<el-form :model="addForm" label-width="80px" :rules="addRules" ref="addForm">
				<el-form-item label="类名" prop="bean">
					<el-input v-model="addForm.bean"></el-input>
				</el-form-item>
				</el-form-item>
				<el-form-item label="规则" prop="expression">
					<el-input v-model="addForm.expression"></el-input>
				</el-form-item>
				<el-form-item label="说明" prop="remark">
					<el-text v-model="addForm.remark"></el-text>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listTask,editTask,addTask,deleteTask,pauseTask,startTask} from '../../api/api';
	import util from '../../common/js/util';
	import axios from 'axios';

	export default {
		data() {
			return {
				editVisible:false,
				addVisible:false,
        		editRules:{
        		  bean: [
						{ required: true, message: '请输类名', trigger: 'blur' }
		          ],
		          expression: [
						{ required: true, message: '请输入规则', trigger: 'blur' }
		          ]
        		},
        		addRules:{
        		  bean: [
						{ required: true, message: '请输类名', trigger: 'blur' }
		          ],
		          expression: [
						{ required: true, message: '请输入规则', trigger: 'blur' }
		          ]
        		},
				total:0,
				listLoading : false,
				addLoading:false,
				editLoading:false,
				sels:[],
				tasks: [],
				pageIndex: 1,
				pageSize: 15,
				editTaskId:'',
				editForm:{
					bean:null,
					expression:null,
					remark:null
				},
				addForm:{
					bean:null,
					expression:null,
					remark:null
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getBanners();
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//获取用户列表
			getTasks() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listTask(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.tasks = body.list;
					}
				});
			},
			handleEdit(row){
				let token  = localStorage.getItem('token');
                this.editForm = Object.assign({},row);
				this.editVisible = true;
			},
			editSubmit(row){
				this.$refs.editForm.validate((valid) => {
					if(valid){
						this.editLoading= true;
						this.editTaskId = row.id;
						this.editVisible = true;
						let para = {
							id:row.id
						};
						para = Object.assign(para,this.editForm);
						para.createDate=null;
                        editTask(para).then((body) => {
							this.$message({
								message: '修改成功',
								type: 'success'
							});
							this.editLoading= false;
							this.editVisible = false;
							this.getTasks();
						});
					}
				});
			},
			handleAdd(){
				this.addForm={
					bean:null,
					expression:null,
					remark:null
				}
				this.addVisible = true;
			},
			addSubmit(row){
				
				this.$refs.addForm.validate((valid) => {
					if(valid){
						this.addLoading  = true;
						let para = Object.assign({},this.addForm);
						addTask(para).then((body) => {
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.addLoading = false;
							this.addVisible = false;
							this.getTasks();
						});
					}
				});
			},
			handleStart(id){
				let para={
					id:id
				};
				startTask(para).then((body) => {
					this.$message({
						message: '启动成功',
						type: 'success'
					});
					this.addLoading = false;
					this.addVisible = false;
					this.getTasks();
				});
			},
			handlePause(id){
				let para={
					id:id
				};
				pauseTask(para).then((body) => {
					this.$message({
						message: '暂停成功',
						type: 'success'
					});
					this.addLoading = false;
					this.addVisible = false;
					this.getTasks();
				});
			},
			batchRemove(id){
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					let para={}
					if(id){
						para = {id:id};
					}
					deleteTask(para).then((body) => {
						if(body){
							this.$message({
								message: '删除成功',
								type: 'success'
							});
						}
						this.getTasks();
					});
				}).catch(() => {

				});
			},
		      //状态格式化 
		     statusFormat:function(row, column) { 
		        var status = row[column.property];
			     if (status == 0) { 
			       return "暂停"; 
			     }else if(status == 1) {
			       return "启动"; 
			     }
		      } ,
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
			this.getTasks();
		},
		computed:{
			editOprt:function(){
				return !util.hasOprt(this,'admin.task.edit');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.task.delete');
			},
			addOprt:function(){
				return !util.hasOprt(this,'admin.task.add');
			}
		}
	}

</script>

<style scoped>
	.avatar-uploader .el-upload {
	    border: 1px dashed #d9d9d9;
	    border-radius: 6px;
	    cursor: pointer;
	    position: relative;
	    overflow: hidden;
        max-width: 100%;
    	max-height: 300px
	 }
	 .avatar-uploader .el-upload:hover {
	    border-color: #20a0ff;
	 }
	 .avatar-uploader-icon {
	    font-size: 28px;
	    color: #8c939d;
	    width: 80px;
	    height: 80px;
	    line-height: 80px;
	    text-align: center;
	  }
	  .avatar {
	    width: 100%;
	    height: 100%;
	    display: block;
	  }
</style>