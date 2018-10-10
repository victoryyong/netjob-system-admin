<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item prop="name">
					<el-input v-model="filters.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getVodTypes()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :disabled="addOprt" v-on:click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="vodTypes" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange">
			<el-table-column prop="sort" width="200" label="排序号">
			</el-table-column>
			<el-table-column prop="name" width="200" label="名称">
			</el-table-column>
			<el-table-column prop="folder" label="文件夹">
			</el-table-column>
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button  :disabled="editOprt" size="small" @click="handleEdit(scope.row)">修改</el-button>
					<el-button  :disabled="deleteOprt" type="danger" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>


		<!--编辑界面-->
		<el-dialog title="修改" v-model="editVisible" :close-on-click-modal="false" size="small">
			<el-form :model="editForm" label-width="80px" :rules="editRules" ref="editForm">
				<!--<el-form-item label="图片">
					<el-upload
					  class="avatar-uploader"
					  :action="uploadUrl"
					  :show-file-list="false"
					  :on-success="afterEditSuccess">
					  <img v-if="editForm.image" :src="editForm.image" class="avatar">
					  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>-->
				<el-form-item label="名称" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="文件夹" prop="folder">
					<el-input v-model="editForm.folder"></el-input>
				</el-form-item>
				<el-form-item label="排序号" prop="sort">
					<el-input v-model="editForm.sort" ></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="editForm.status">
						<el-radio class="radio" :label="0" >屏蔽</el-radio>
						<el-radio class="radio" :label="1">激活</el-radio>
					</el-radio-group>
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
				<!--<el-form-item label="图片" prop="image">					
					<el-upload
					  class="avatar-uploader"
					  :action="uploadUrl"
					  :on-success="afterAddSuccess"
					  :show-file-list="false">
					  <img v-if="addForm.image" :src="addForm.image" class="avatar">
					  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>	
				</el-form-item>-->
				<el-form-item label="名称" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="文件夹" prop="folder">
					<el-input v-model="addForm.folder"></el-input>
				</el-form-item>
				<el-form-item label="排序号" prop="sort">
					<el-input v-model="addForm.sort" ></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="addForm.status">
						<el-radio class="radio" :label="0" >屏蔽</el-radio>
						<el-radio class="radio" :label="1">激活</el-radio>
					</el-radio-group>
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
	import { listVodType,editVodType,addVodType,deleteVodType} from '../../api/api';
	import util from '../../common/js/util';
	import axios from 'axios';

	export default {
		data() {
			return {
				editVisible:false,
				addVisible:false,
				filters: {
					name:''
				},
        		editRules:{
        		 
        		  name: [
						{ required: true, message: '请输名称', trigger: 'blur' }
		          ],
		          folder: [
						{ required: true, message: '文件夹名称', trigger: 'blur' }
		          ],
		          sort:[
			            { required: true,message: '请输入排序号', trigger: 'blur' },
			            { validator:(rule,value,callback)=>{
			              try{
			                if(/^[0-9]*[1-9][0-9]*$/.test(parseInt(value)) == false){
			                    callback(new Error("请输入正整数"));
			                }else{
			                    callback();
			                }
			              }catch(e){
			                callback(new Error("请输入正整数"));
			              }
			              },trigger: 'blur' }
         			 ]
        		},
        		addRules:{
        		  name: [
						{ required: true, message: '请输名称', trigger: 'blur' }
		          ],
		          folder: [
						{ required: true, message: '文件夹名称', trigger: 'blur' }
		          ],
		          sort:[
			            { required: true,message: '请输入排序号', trigger: 'blur' },
			            { validator:(rule,value,callback)=>{
			              try{
			                if(/^[0-9]*[1-9][0-9]*$/.test(parseInt(value)) == false){
			                    callback(new Error("请输入正整数"));
			                }else{
			                    callback();
			                }
			              }catch(e){
			                callback(new Error("请输入正整数"));
			              }
			              },trigger: 'blur' }
         			 ]
        		},
				total:0,
				listLoading : false,
				addLoading:false,
				editLoading:false,
				sels:[],
				vodTypes: [],
				pageIndex: 1,
				pageSize: 15,
				editForm:{
					name:null,
					folder:null,
					sort:null,
					status:0
				},
				addForm:{
					name:null,
					folder:null,
					sort:null,
					status:0
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getVodTypes();
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//获取用户列表
			getVodTypes() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listVodType(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.vodTypes = body.list;
					}
				});
			},
			handleEdit(row){
				this.editForm={
					name:null,
					folder:null,
					sort:null,
					status:0
				}
				this.editForm  = Object.assign(this.editForm,row);
				this.editForm.sort=this.editForm.sort+'';
				this.editVisible = true;
			},
			editSubmit(row){
				
				this.$refs.editForm.validate((valid) => {
					if(valid){
						this.editLoading= true;
						this.editVisible = true;
						let para = {
							id:row.id
						};
						para = Object.assign(para,this.editForm);
						para.createDate = null;
						para.expireDate = null;
						para.publishDate = null;
						console.log(JSON.stringify(para));
						editVodType(para).then((body) => {
							this.$message({
								message: '修改成功',
								type: 'success'
							});
							this.editLoading= false;
							this.editVisible = false;
							this.getVodTypes();
						});
					}
				});
			},
			handleAdd(){
				this.addForm={
					name:null,
					folder:null,
					sort:null,
					status:0
				}
				this.addVisible = true;
			},
			deleteHandle(id){
				 this.$confirm('确认删除该记录吗?', '提示', {
			          type: 'warning'
			        }).then(() => {
			          this.listLoading = true;
			          NProgress.start();
			          let para = { vodTypeIds: id };
			          deleteVodType(para).then((body) => {
			            this.listLoading = false;
			            NProgress.done();
			            if(body){
			              this.$message({
			                message: '删除成功',
			                type: 'success'
			              });
			              this.getVodTypes();
			            }
			          });
			        }).catch(() => {

			        });
			},
			addSubmit(row){
				
				this.$refs.addForm.validate((valid) => {
					if(valid){
						this.addLoading  = true;
						let para = {
							
						}
						para = Object.assign({},this.addForm);
						if(para.expireDate){
							para.expireDateStr = moment(new Date(para.expireDate).getTime()).format("YYYY-MM-DD HH:mm:ss");
						} 
						para.publishDate = null;
						para.expireDate = null;
						console.log(JSON.stringify(para));
						addVodType(para).then((body) => {
							if(body){
								this.$message({
									message: '添加成功',
									type: 'success'
								});
							}
							this.addLoading = false;
							this.addVisible = false;
							this.getVodTypes();
						});
					}
				});
			},
		      //状态格式化 
		     statusFormat:function(row, column) { 
		        var status = row[column.property]; 
			     if (status == 0) { 
			       return "屏蔽"; 
			     }else if(status == 1) {
			       return "激活"; 
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
			this.getVodTypes();
		},
		computed:{
			editOprt:function(){
				return !util.hasOprt(this,'admin.vodType.edit');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.vodType.delete');
			},
			addOprt:function(){
				return !util.hasOprt(this,'admin.vodType.add');
			}
		}
	}

</script>

<style scoped>
</style>