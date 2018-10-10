<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item prop="name">
					<el-input v-model="filters.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item label="类型">
		        <el-select v-model="filters.typeId" placeholder="全部" v-on:change="handeChange">
		          <el-option
		            v-for="item in types"
		            :key="item.id"
		            :label="item.name"
		            :value="item.id">
		          </el-option>
		          </el-select>
		        </el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getVods()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :disabled="addOprt" v-on:click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="vods" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange">
			<el-table-column prop="sort" width="200" label="排序号">
			</el-table-column>
			<el-table-column prop="name" width="200" label="名称">
			</el-table-column>
			<el-table-column prop="localUrl" label="本地链接">
			</el-table-column>
			<el-table-column prop="type.name" label="类型">
			</el-table-column>
			<el-table-column prop="qloudId" label="云ID">
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
			<el-form :model="editForm" label-width="120px" :rules="editRules" ref="editForm">
				<el-form-item label="图片" prop="image">					
					<el-upload
					  class="avatar-uploader"
					  :action="uploadImageUrl"
					  :on-success="afterEditUploadSuccess"
					  :show-file-list="false">
					  <img v-if="editForm.image" :src="editForm.image" class="avatar">
					  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>	
				</el-form-item>
				<el-form-item label="点播类型" prop="typeId">
					<el-select v-model="editForm.typeId" placeholder="全部" v-on:change="handeChange">
			          <el-option v-if="item.id"
			            v-for="item in types"
			            :key="item.id"
			            :label="item.name"
			            :value="item.id">
			          </el-option>
		            </el-select>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="视频" prop="localUrl">					
					<el-upload
					  class="avatar-uploader"
					  :action="uploadVideoUrl"
					  :on-success="afterEditVodUploadSuccess"
					  :before-upload="beforeEditVodUpload"
					  :on-progress="editVodProgress"
					  :show-file-list="false">
					  <el-input v-if="!isUploading && editForm.localUrl" v-model="editForm.localUrl" disalbed="true"></el-input>
					  <template v-else> 
					    <div v-if="isUploading">
					    	<el-progress type="circle" :percentage="uploadPercent"></el-progress>
					    </div>
					    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					  </template>
					</el-upload>	
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
				<el-form-item label="描述" prop="description" >
          			<el-input type="textarea" v-model="editForm.description"></el-input>
        		</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addVisible" :close-on-click-modal="false" size="small">
			<el-form :model="addForm" label-width="120px" :rules="addRules" ref="addForm">
				<el-form-item label="图片" prop="image">					
					<el-upload
					  class="avatar-uploader"
					  :action="uploadImageUrl"
					  :on-success="afterAddUploadSuccess"
					  :show-file-list="false">
					  <img v-if="addForm.image" :src="addForm.image" class="avatar">
					  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>	
				</el-form-item>
				<el-form-item label="点播类型" prop="typeId">
					<el-select v-model="addForm.typeId" placeholder="全部" v-on:change="handeChange">
			          <el-option v-if="item.id"
			            v-for="item in types"
			            :key="item.id"
			            :label="item.name"
			            :value="item.id">
			          </el-option>
		          </el-select>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="视频" prop="localUrl">					
					<el-upload
					  class="avatar-uploader"
					  :action="uploadVideoUrl"
					  :on-success="afterAddVodUploadSuccess"
					  :before-upload="beforeAddVodUpload"
					  :on-progress="addVodProgress"
					  :show-file-list="false">
					  <el-input v-if="!isUploading && addForm.localUrl" v-model="addForm.localUrl" disalbed="true"></el-input>
					  <template v-else> 
					    <div v-if="isUploading">
					    	<el-progress type="circle" :percentage="uploadPercent"></el-progress>
					    </div>
					    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					  </template>
					</el-upload>	
					</el-upload>	
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
				<el-form-item label="描述" prop="description" >
          			<el-input type="textarea" v-model="addForm.description"></el-input>
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
	import { listVod,editVod,addVod,deleteVod} from '../../api/api';
	import util from '../../common/js/util';
	import axios from 'axios';

	export default {
		data() {
			return {
				editVisible:false,
				addVisible:false,
				filters: {
					name:'',
					typeId:null
				},
        		editRules:{
    			  typeId:[
        		  	{ validator:(rule,value,callback)=>{
			                if(!this.editForm.typeId){
			                    callback(new Error("请选择点播类型"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
        		  ],
        		  image:[
        		  	{ validator:(rule,value,callback)=>{
			                if(!this.editForm.image){
			                    callback(new Error("请上传点播封面"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
        		  ],
        		  name: [
						{ required: true, message: '请输名称', trigger: 'blur' }
		          ],
		          folder: [
						{ required: true, message: '文件夹名称', trigger: 'blur' }
		          ],
		          localUrl: [
						{ required: true, message: '请上传视频', trigger: 'blur' }
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
        			typeId:[
        		  		{ validator:(rule,value,callback)=>{
			                if(!this.addForm.typeId){
			                    callback(new Error("请选择点播类型"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
        		  	],
    				image:[
        		  	{ validator:(rule,value,callback)=>{
			                if(!this.addForm.image){
			                    callback(new Error("请上传点播封面"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
        		  ],
        		  name: [
						{ required: true, message: '请输名称', trigger: 'blur' }
		          ],
		          localUrl: [
						{ required: true, message: '请上传视频', trigger: 'blur' }
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
				isUploading:false,
				uploadPercent:0,
				uploadImageUrl:null,
				uploadVideoUrl:null,
				sels:[],
				vods: [],
				types:[],
				pageIndex: 1,
				pageSize: 15,
				editForm:{
					name:null,
					folder:null,
					sort:null,
					image:null,
					status:0
				},
				addForm:{
					name:null,
					folder:null,
					sort:null,
					image:null,
					status:0,
					typeId:null
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getVods();
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			handeChange(value){
				this.filters.typeId=value;
			},
			//获取用户列表
			getVods() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listVod(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.vods = body.list;
					 this.types = body.types;
					 if(body.types.length>0){
					 	this.addForm.typeId = body.types[0].id;
					 	this.editForm.typeId = body.types[0].id;
					 }
					 this.types.splice(0,0,{
        				name:'全部',
        				value:null,
        				id:null
        			  });
					}
				});
			},
			handleEdit(row){
				let token  = localStorage.getItem('token');
				axios.post('admin/getFreshTK?token='+token)
			    .then(res => {
			       let data = res.data;
			       if (data.code == -403) {
			            if (data.body) {
			                localStorage.setItem('token', data.body);
			              	this.uploadImageUrl = "admin/vod/uploadImage?token="+token;
			              	this.uploadVideoUrl = "admin/vod/uploadVideo?token="+token;
			                this.editForm={
								name:null,
								folder:null,
								sort:null,
								image:null,
								status:0
							}
							this.isUploading = false;
							this.uploadPercent = 0;
							this.editForm  = Object.assign(this.editForm,row);
							this.editForm.sort=this.editForm.sort+'';
							this.editVisible = true;
			            } else {
			            	this.$message({
								message: data.message,
								type: 'error'
							});
			                vm.$router.push('/login');
			            }
			        } else if (data.code == -406) {
			                this.uploadImageUrl = "admin/vod/uploadImage?token="+token;
			                this.uploadVideoUrl = "admin/vod/uploadVideo?token="+token;
			                this.editForm={
								name:null,
								folder:null,
								sort:null,
								image:null,
								status:0
							}
							this.isUploading = false;
							this.uploadPercent = 0;
							this.editForm  = Object.assign(this.editForm,row);
							this.editForm.sort=this.editForm.sort+'';
							this.editVisible = true;
			        } else {
			            this.$message({
								message: data.message,
								type: 'error'
						});
			            return null;
			        }
			    }).catch(err => {
			        console.log(err);
			        this.$message({
						message: '系统错误，请联系管理员',
						type: 'error'
					});
			    });
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
						para.type = null;
						editVod(para).then((body) => {
							if(body){
								this.$message({
									message: '修改成功',
									type: 'success'
								});
							}
							this.editLoading= false;
							this.editVisible = false;
							this.getVods();
						});
					}
				});
			},
			handleAdd(){
				let token  = localStorage.getItem('token');
					axios.post('admin/getFreshTK?token='+token)
			    .then(res => {
			       let data = res.data;
			       if (data.code == -403) {
			            if (data.body) {
			                localStorage.setItem('token', data.body);
			              	this.uploadImageUrl = "admin/vod/uploadImage?token="+token;
			              	this.uploadVideoUrl = "admin/vod/uploadVideo?token="+token;
			                this.addForm={
								name:null,
								folder:null,
								sort:null,
								image:null,
								status:0,
								typeId:this.addForm.typeId
							}
							this.isUploading = false;
							this.uploadPercent = 0;
							this.addVisible = true;
			            } else {
			            	this.$message({
								message: data.message,
								type: 'error'
							});
			                vm.$router.push('/login');
			            }
			        } else if (data.code == -406) {
			                this.uploadImageUrl = "admin/vod/uploadImage?token="+token;
			                this.uploadVideoUrl = "admin/vod/uploadVideo?token="+token;
			                this.addForm={
								name:null,
								folder:null,
								sort:null,
								image:null,
								status:0,
								typeId:this.addForm.typeId
							}
							this.isUploading = false;
							this.uploadPercent = 0;
							this.addVisible = true;
			        } else {
			            this.$message({
								message: data.message,
								type: 'error'
						});
			            return null;
			        }
			    }).catch(err => {
			        console.log(err);
			        this.$message({
						message: '系统错误，请联系管理员',
						type: 'error'
					});
			    });
			},
			deleteHandle(id){
				 this.$confirm('确认删除该记录吗?', '提示', {
			          type: 'warning'
			        }).then(() => {
			          this.listLoading = true;
			          NProgress.start();
			          let para = { vodIds: id };
			          deleteVod(para).then((body) => {
			            this.listLoading = false;
			            NProgress.done();
			            if(body){
			              this.$message({
			                message: '删除成功',
			                type: 'success'
			              });
			              this.getVods();
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
						addVod(para).then((body) => {
							if(body){
								this.$message({
									message: '添加成功',
									type: 'success'
								});
							}
							this.addLoading = false;
							this.addVisible = false;
							this.getVods();
						});
					}
				});
			},
			afterAddUploadSuccess(data){
				if(data.code==200){
					this.addForm.image= data.body;
				}else if(data.code==-403){
				 	vm.$router.push('/login');
				}
			},
			afterEditUploadSuccess(data){
				if(data.code==200){
					this.editForm.image= data.body;
				}else if(data.code==-403){
				 	vm.$router.push('/login');
				}
			},
			afterAddVodUploadSuccess(data){
				if(data.code==200){
					this.addForm.localUrl= data.body;
					this.isUploading = false;
					this.uploadPercent = 0;
				}else if(data.code==-403){
				 	vm.$router.push('/login');
				}
			},
			afterEditVodUploadSuccess(data){
				if(data.code==200){
					this.editForm.localUrl= data.body;
					this.uploadPercent = 0;
					this.isUploading = false;
				}else if(data.code==-403){
				 	vm.$router.push('/login');
				}
			},
			beforeAddVodUpload(){
				this.isUploading = true;
			},
			addVodProgress(event, file, fileList){
				//isTrusted: true, 
				//percent: 20.01903933778254, 
				//lengthComputable: true, 
				//loaded: 7176192, 
				//total: 35846835
				this.uploadPercent = event.percent;
			},
			beforeEditVodUpload(){
				this.isUploading = true;
			},
			editVodProgress(){
				this.uploadPercent = event.percent;
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
			this.getVods();
		},
		computed:{
			editOprt:function(){
				return !util.hasOprt(this,'admin.vod.edit');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.vod.delete');
			},
			addOprt:function(){
				return !util.hasOprt(this,'admin.vod.add');
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
	    height: 240px;
    	width: 360px;
	    display: block;
	  }
</style>