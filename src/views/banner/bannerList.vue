<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item prop="title">
					<el-input v-model="filters.title" placeholder="标题"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getBanners()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :disabled="addOprt" v-on:click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="banners" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column prop="name"  label="标题">
			</el-table-column>
			<el-table-column prop="provinceName"  label="省份">
			</el-table-column>
			<el-table-column prop="cityName"  label="城市">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="sort" label="排序号">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button  :disabled="editOprt" size="small" @click="handleEdit(scope.row)">修改</el-button>
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
				<el-form-item label="图片">
					<el-upload
					  class="avatar-uploader"
					  :action="uploadUrl"
					  :show-file-list="false"
					  :on-success="afterEditSuccess">
					  <img v-if="editForm.image" :src="editForm.image" class="avatar">
					  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<el-form-item label="标题" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type">
					<el-select v-model="editForm.type"  placeholder="请选择">
						<el-option
								v-for="item in types"
								:key="item.index"
								:label="item.label"
								:value="item.value">
							<span style="float: left">{{ item.label }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="一级菜单">
					<el-select  v-model="editForm.firstMenuId" placeholder="请选择" @change="initSecondMenus" >
						<el-option
								v-for="item in firsts"
								:key="item.index"
								:label="item.name"
								:value="item.id">
							<span style="float: left">{{ item.name }}</span>
						</el-option>
					</el-select>
					<span v-if="showMenu">二级菜单 </span><el-select v-if="showMenu" v-model="editForm.secondMenuId"  placeholder="请选择">
					<el-option
							v-for="item in seconds"
							:key="item.index"
							:label="item.name"
							:value="item.id">
						<span style="float: left">{{ item.name }}</span>
					</el-option>
				</el-select>
				</el-form-item>
				<el-form-item label="链接" prop="link">
					<el-input v-model="editForm.link"></el-input>
				</el-form-item>
				<el-form-item label="排序号" prop="sort">
					<el-input v-model="editForm.sort"></el-input>
				</el-form-item>
				<el-form-item label="省份" v-if="userLevel==1">
					<el-select  v-model="editForm.province" placeholder="请选择" @change="initCitys" >
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
					<span  v-if="showCity">城市 </span><el-select v-model="addForm.citycode"  v-if="showCity" placeholder="请选择">
					<el-option
							v-for="item in citys"
							:key="item.index"
							:label="item.name"
							:value="item.citycode">
						<span style="float: left">{{ item.name }}</span>
					</el-option>
				</el-select>
				</el-form-item>
				<el-form-item label="是否发布">
					<el-radio-group v-model="editForm.status">
						<el-radio class="radio" :label="0" >否</el-radio>
						<el-radio class="radio" :label="1">是</el-radio>
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
				<el-form-item label="图片" prop="image">					
					<el-upload
					  class="avatar-uploader"
					  :action="uploadUrl"
					  :on-success="afterAddSuccess"
					  :show-file-list="false">
					  <img v-if="addForm.image" :src="addForm.image" class="avatar">
					  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>	
				</el-form-item>
				<el-form-item label="标题" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type">
					<el-select v-model="addForm.type"  placeholder="请选择">
						<el-option
								v-for="item in types"
								:key="item.index"
								:label="item.label"
								:value="item.value">
							<span style="float: left">{{ item.label }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="一级菜单">
					<el-select  v-model="addForm.firstMenuId" placeholder="请选择" @change="initSecondMenus" >
						<el-option
								v-for="item in firsts"
								:key="item.index"
								:label="item.name"
								:value="item.id">
							<span style="float: left">{{ item.name }}</span>
						</el-option>
					</el-select>
					<span v-if="showMenu">二级菜单 </span><el-select v-if="showMenu" v-model="addForm.secondMenuId"  placeholder="请选择">
					<el-option
							v-for="item in seconds"
							:key="item.index"
							:label="item.name"
							:value="item.id">
						<span style="float: left">{{ item.name }}</span>
					</el-option>
				</el-select>
				</el-form-item>
				<el-form-item label="链接" prop="link">
					<el-input v-model="addForm.link"></el-input>
				</el-form-item>
				<el-form-item label="排序号" prop="sort">
					<el-input v-model="addForm.sort"></el-input>
				</el-form-item>
				<el-form-item label="省份" v-if="userLevel==1">
					<el-select  v-model="addForm.province" placeholder="请选择" @change="initCitys" >
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
					<span  v-if="showCity">城市 </span><el-select v-model="addForm.citycode"  v-if="showCity" placeholder="请选择">
						<el-option
								v-for="item in citys"
								:key="item.index"
								:label="item.name"
								:value="item.citycode">
							<span style="float: left">{{ item.name }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="是否发布">
					<el-radio-group v-model="addForm.status">
						<el-radio class="radio" :label="0" >否</el-radio>
						<el-radio class="radio" :label="1">是</el-radio>
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
	import { listBanner,editBanner,addBanner,deleteBanner,getCitys,getProvinces,firstMenus,secondMenus} from '../../api/api';
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
                showCity:true,
				showMenu:false,
				provinces:[],
				citys:[],
				userLevel:'',
				firsts:[],
				seconds:[],
				types:[
					{
					    "label":"图片广告",
                    	"value":"image"
                    },
                    {
                        "label":"视频广告",
						"value":"video"
                    }
				],
        		editRules:{
        		  image:[
        		  	{ validator:(rule,value,callback)=>{
			                if(!this.editForm.image){
			                    callback(new Error("请上传广告图片"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
        		  ],
        		  name: [
						{ required: true, message: '请输广告标题', trigger: 'blur' }
		          ],
		          link: [
						{ required: true, message: '请输入广告链接', trigger: 'blur' }
		          ],
					sort:[
                        { required: true,message: '请输入排序号', trigger: 'blur' },
                        { validator:(rule,value,callback)=>{
                                try{
                                    if(/^[0-9]*[1-9][0-9]*$/.test(value) == false){
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
        		  image:[
        		  	{ validator:(rule,value,callback)=>{
			                if(!this.addForm.image){
			                    callback(new Error("请上传广告图片"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
        		  ],
        		  name: [
						{ required: true, message: '请输广告标题', trigger: 'blur' }
		          ],
		          link: [
						{ required: true, message: '请输入广告链接', trigger: 'blur' }
		          ],
					sort:[
						{ required: true,message: '请输入排序号', trigger: 'blur' },
						{ validator:(rule,value,callback)=>{
								try{
									if(/^[0-9]*[1-9][0-9]*$/.test(value) == false){
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
        		addressMap:null,
				total:0,
				listLoading : false,
				addLoading:false,
				editLoading:false,
				sels:[],
				banners: [],
				pageIndex: 1,
				pageSize: 15,
				editBannerId:'',
				uploadUrl:'',
				editForm:{
					name:null,
					image:null,
					link:null,
					id:null,
					sort:null,
                    citycode:null,
                    province:null,
					cityName:null,
					provinceName:null,
                    firstMenuId:null,
                    secondMenuId:null,
					status:0,
					type:'image'
				},
				addForm:{
					name:null,
					image:null,
					link:null,
					sort:null,
                    firstMenuId:null,
                    secondMenuId:null,
					cityName:null,
					provinceName:null,
					province:null,
                    citycode:null,
					id:null,
					status:0,
					type:'image'
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
			getBanners() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listBanner(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.banners = body.list;
					}
				});
			},
			handleEdit(row){
				let token  = localStorage.getItem('token');
				console.log(this.userLevel);
				axios.post('admin/abcdef?token='+token)
			    .then(res => {
			       let data = res.data;
			       if (data.code == -403) {
			            if (data.body) {
			                localStorage.setItem('token', data.body);
			              	this.uploadUrl = "admin/banner/uploadImage?token="+token;
							this.editForm = Object.assign({},row);
							this.editVisible = true;
			            } else {
			            	this.$message({
								message: data.message,
								type: 'error'
							});
			                vm.$router.push('/login');
			            }
			        } else if (data.code == -406) {
			                this.uploadUrl = "admin/banner/uploadImage?token="+token;
			                this.editForm = Object.assign({},row);
			                if(this.editForm.province&&this.editForm.province!='1')this.initCitys(this.editForm.province);
			                if(this.editForm.province=='1'){this.showCity=false}else{this.showCity=true};
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
						this.editBannerId = row.id;
						this.editVisible = true;
						let para = {
							id:row.id
						};
						para = Object.assign(para,this.editForm);
                        editBanner(para).then((body) => {
							this.$message({
								message: '修改成功',
								type: 'success'
							});
							this.editLoading= false;
							this.editVisible = false;
							this.getBanners();
						});
					}
				});
			},
			handleAdd(){
				let token  = localStorage.getItem('token');
				let ftid = null;
				let seid=null;
                if(this.firsts&&this.firsts.length>0){
                    ftid=this.addForm.firstMenuId=this.firsts[0].id;
                    this.initSecondMenus(ftid);
                }
                if(this.seconds&&this.seconds.length>0){
                    seid=this.addForm.secondMenuId=this.seconds[0].id;
                }
				this.addForm={
					name:null,
					image:null,
					link:null,
					id:null,
					firstMenuId:ftid,
					secondMenuId:seid,
                    cityName:null,
					provinceName:null,
					province:'1',
                    citycode:null,
					sort:null,
					status:0,
					type:'image'
				};
				axios.post('admin/abcdef?token='+token)
			    .then(res => {
			       let data = res.data;
			       if (data.code == -403) {
			            if (data.body) {
			                localStorage.setItem('token', data.body);
			              	this.uploadUrl = "admin/banner/uploadImage?token="+token;
                            this.showCity = false;
							this.addVisible = true;
			            } else {
			            	this.$message({
								message: data.message,
								type: 'error'
							});
			                vm.$router.push('/login');
			            }
			        } else if (data.code == -406) {
			                this.uploadUrl = "admin/banner/uploadImage?token="+token;
			                this.showCity = false;
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
			addSubmit(row){
				
				this.$refs.addForm.validate((valid) => {
					if(valid){
						this.addLoading  = true;
						let para = {
							
						}
						para = Object.assign({},this.addForm);
                        for (let i = 0; i < this.citys.length; i++) {
                            console.log(this.citys[i].citycode);
                            console.log(this.addForm.city);
							if(this.citys[i].citycode==this.addForm.citycode){
                                para.cityName = this.citys[i].name;
							}
                        }
                        for (let i = 0; i < this.provinces.length; i++) {
                            console.log(this.provinces[i].adcode);
                            console.log(this.addForm.province);
                            if(this.provinces[i].adcode==this.addForm.province){
                                para.provinceName = this.provinces[i].name;
                            }
                        }
						console.log(JSON.stringify(para));
						addBanner(para).then((body) => {
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.addLoading = false;
							this.addVisible = false;
							this.getBanners();
						});
					}
				});
			},
			batchRemove(id){
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					let para={}
					if(id){
						para = {bannerIds:id};
					}else{
						var ids = this.sels.map(item => item.id).toString();
						para = {bannerIds:ids};
					}
					deleteBanner(para).then((body) => {
						if(body){
							this.$message({
								message: '删除成功',
								type: 'success'
							});
						}
						this.getBanners();
					});
				}).catch(() => {

				});
			},
			afterAddSuccess(data){
				if(data.code==200){
					this.addForm.image = data.body;
				}else if(data.code==-403){
				 	vm.$router.push('/login');
				}
			},
			afterEditSuccess(data){
				console.log(data.code);
				console.log(data.body);
				if(data.code==200){
					this.editForm.image= data.body;
				}else if(data.code==-403){
				 	vm.$router.push('/login');
				}
			},
		      //状态格式化 
		     statusFormat:function(row, column) { 
		        var status = row[column.property];
			     if (status == 0) { 
			       return "未发布"; 
			     }else if(status == 1) {
			       return "已发布"; 
			     }
		      } ,
			  //时间格式化 
		      dateFormat:function(row, column) { 
		        var date = row[column.property]; 
			     if (date == undefined) { 
			       return ""; 
			     } 
		     	return moment(date).format("YYYY-MM-DD HH:mm:ss"); 
		      } ,
            //省份
            initCitys:function(adcode) {
			    if(adcode=='1'){
                    this.addForm.citycode=null;
                    this.editForm.citycode=null;
			        this.showCity=false;
			        this.citys=[];
			        return;
				}
                this.showCity=true;
				let param ={adcode:adcode};
                getCitys(param).then((body) => {
                    if(body){
                    	this.citys=body;
                    	this.addForm.citycode=body[0].citycode;
                    	this.editForm.citycode=body[0].citycode;
                    }
                });
            },
            //获取区域
            initProvinces:function() {
                getProvinces().then((body) => {
                    if(body){
                    	this.provinces=body;
                    	this.provinces.unshift({name:"全国",adcode:"1",citycode:"1"});
                    }
                });
            },
            //省份
            initFirstMenus:function() {
                firstMenus().then((body) => {
                    if(body){
                        this.firsts=body.list;
                        this.firsts.unshift({name:"首页",id:"1"});
                        /*if(this.firsts&&this.firsts.length>0){
                        	this.initSecondMenus(this.firsts[1].id);
                        }*/
                    }
                });
            },
            //获取区域
            initSecondMenus:function(id) {
			    let param={parentId:id};
				if(id=='1'){
				    this.showMenu=false;
                    this.addForm.secondMenuId=null;
                    this.editForm.secondMenuId=null;
				    return;
				}else{
				    this.showMenu=true
				};
                secondMenus(param).then((body) => {
                    if(body){
                        this.seconds=body.list;
                        if(this.seconds&&this.seconds.length>0){
                            this.addForm.secondMenuId=this.seconds[0].id;
                            this.editForm.secondMenuId=this.seconds[0].id;
						}
                    }
                });
            }
		},
		mounted() {
			this.initProvinces();
			this.initFirstMenus();
			this.userLevel = JSON.parse(localStorage.getItem('user')).level;
			this.getBanners();
		},
		computed:{
			editOprt:function(){
				return !util.hasOprt(this,'admin.banner.edit');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.banner.delete');
			},
			addOprt:function(){
				return !util.hasOprt(this,'admin.banner.add');
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