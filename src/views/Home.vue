<template>
	<el-row class="container">
		<el-col :span="24" class="header">
			<el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
				{{collapsed?'':sysName}}
			</el-col>
			<!--<el-col :span="10">
				<div class="tools" @click.prevent="collapse">
					<i class="fa fa-align-justify"></i>
				</div>
			</el-col>-->
			<el-col :span="4" class="userinfo">
			<el-dropdown trigger="hover" >
				<span class="el-dropdown-link userinfo-inner"><img :src="this.sysUserAvatar" /> {{sysUserName}}</span>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item divided @click.native="">我的消息</el-dropdown-item>
					<el-dropdown-item divided @click.native="editUserHandle">设置</el-dropdown-item>
					<el-dropdown-item divided @click.native="changePWDHandle">修改密码</el-dropdown-item>
					<el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</el-col>
		</el-col>
		<el-col :span="24" class="main">
			<aside :class="collapsed?'menu-collapsed':'menu-expanded'">
				<!--导航菜单-->
				<el-menu :default-active="$route.path" class="el-menu-vertical-demo el-menu--dark" @open="handleopen" @close="handleclose" @select="handleselect"
					 unique-opened router v-show="!collapsed">
					<!--<template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
						<el-submenu :index="index+''" v-if="!item.leaf">
							<template slot="title"><i :class="item.iconCls"></i>{{item.name}}</template>
							<el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">{{child.name}}</el-menu-item>
						</el-submenu>
						<el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item>
					</template>-->

					<template v-for="(item,index) in $store.state.permission.menus" v-if="!item.hidden">
						<el-submenu :index="index+''" v-if="item.children && item.children.length > 0 && item.url==''">
							<template slot="title"><i :class="item.icon"></i>{{item.name}}</template>
							<el-menu-item v-for="child in item.children" :key="child.url" :index="child.url" v-if="child.url"><i :class="child.icon"></i>{{child.name}}</el-menu-item>
						</el-submenu>
						<el-menu-item v-if="item.url" :index="item.url"><i :class="item.icon"></i>{{item.name}}</el-menu-item>
					</template>
				</el-menu>
				<!--导航菜单-折叠后-->
				<!--<ul class="el-menu el-menu-vertical-demo collapsed" v-show="collapsed" ref="menuCollapsed">
					<li v-for="(item,index) in $router.options.routes" v-if="!item.hidden" class="el-submenu item">
						<template v-if="!item.leaf">
							<div class="el-submenu__title" style="padding-left: 20px;" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"><i :class="item.iconCls"></i></div>
							<ul class="el-menu submenu" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"> 
								<li v-for="child in item.children" v-if="!child.hidden" :key="child.path" class="el-menu-item" style="padding-left: 40px;" :class="$route.path==child.path?'is-active':''" @click="$router.push(child.path)">{{child.name}}</li>
							</ul>
						</template>
						<template v-else>
							<li class="el-submenu">
								<div class="el-submenu__title el-menu-item" style="padding-left: 20px;height: 56px;line-height: 56px;padding: 0 20px;" :class="$route.path==item.children[0].path?'is-active':''" @click="$router.push(item.children[0].path)"><i :class="item.iconCls"></i></div>
							</li>
						</template>
					</li>
				</ul>-->
			</aside>
			<section class="content-container">
			<!--设置界面-->
			<el-dialog title="设置" v-model="editUserVisible" :close-on-click-modal="false" size="tiny">
				<el-form :model="editUser" label-width="80px" :rules="editUserRules" ref="editUser">
				<el-form-item label="图片">
					<div style="width:80px;height:80px">
						<el-upload
						  class="avatar-uploader"
						  :action="uploadUrl"
						  :show-file-list="false"
						  :on-error="afterError"
						  :on-success="afterSuccess"
						  :before-upload="beforeUpload">
						  <img v-if="imageUrl" :src="imageUrl" class="avatar">
						  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
						</el-upload>
					</div>
				</el-form-item>
				<el-form-item label="账号" prop="name">
					<el-input v-model="editUser.name" :disabled="true"></el-input>
				</el-form-item>
				<el-form-item label="姓名" prop="realName">
					<el-input v-model="editUser.realName"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="phone">
					<el-input v-model="editUser.phone"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editUser.email"></el-input>
				</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="editUserVisible = false">取消</el-button>
					<el-button type="primary" @click.native="editUserSubmit" :loading="editLoading">提交</el-button>
				</div>
		    </el-dialog>

		    <el-dialog title="修改密码" v-model="pwdUserVisible" :close-on-click-modal="false" size="tiny">
				<el-form :model="pwdUser" label-width="80px" :rules="pwdUserRules" ref="pwdUser">
				
				<el-form-item label="原密码" prop="password">
					<el-input type="password" v-model="pwdUser.password"></el-input>
				</el-form-item>
				<el-form-item label="新密码" prop="newPassword">
					<el-input type="password" v-model="pwdUser.newPassword"></el-input>
				</el-form-item>
				<el-form-item label="密码确认" prop="rePassword">
					<el-input type="password" v-model="pwdUser.rePassword"></el-input>
				</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="pwdUserVisible = false">取消</el-button>
					<el-button type="primary" @click.native="pwdUserSubmit" :loading="pwdLoading">提交</el-button>
				</div>
		    </el-dialog>
				<div class="grid-content bg-purple-light" style="width:100%;height:100%">
					<el-col :span="24" class="breadcrumb-container">
						<strong class="title" style="padding-left:20px">{{$route.name}}</strong>
						<el-breadcrumb separator="/" class="breadcrumb-inner">
							<el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
								{{ item.name }}
							</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="24" class="content-wrapper">
						<transition name="fade" mode="out-in">
							<router-view></router-view>
						</transition>
					</el-col>
				</div>
			</section>
		</el-col>
	</el-row>
</template>

<script>
	import {editUser,getUser,changeUserPwd} from '../api/api';
	import axios from 'axios';

	export default {
		data() {
			return {
				sysName:'NETJOB-SYSTEM',
				collapsed:false,
				sysUserName: '',
				sysUserAvatar: '',
				editUserVisible:false,
				pwdUserVisible:false,
				pwdLoading:false,
				editLoading:false,
				editUser:{
					email:'',
					phone:'',
					realName:'',
					image:''
				},
				pwdUser:{
					password:'',
					newPassword:'',
					rePassword:''
				},
				editUserRules: {
					realName: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
						
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
				pwdUserRules: {
					password: [
						{ required: true, message: '请输入原密码', trigger: 'blur' }
						
					],
					newPassword: [
						{ required: true, message: '请输入新密码', trigger: 'blur' }
					],
					rePassword: [
						{ required: true, message: '请输入确认密码', trigger: 'blur' },
			            { validator:(rule,value,callback)=>{
			                if(value != this.pwdUser.newPassword){
			                    callback(new Error("密码不一致"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
					]
				},
				uploadUrl:'',
				imageUrl:''
			}
		},
		methods: {
			onSubmit() {
				//console.log('submit!');
			},
			handleopen() {
				//console.log('handleopen');
			},
			handleclose() {
				//console.log('handleclose');
			},
			handleselect: function (a, b) {
				this.$store.dispatch('currentUrl',a);
			},
			editUserHandle(){
				let token  = localStorage.getItem('token');
				axios.post('admin/abcdef?token='+token)
			    .then(res => {
			       let data = res.data;
			       if (data.code == -403) {
			            if (data.body) {
			                localStorage.setItem('token', data.body);
			              	this.uploadUrl = "admin/user/uploadImage?token="+token;
			                let user = localStorage.getItem('user');
							this.editUserVisible = true;
							user = JSON.parse(user);
							this.imageUrl = user.image;
							this.editUser = Object.assign(this.editUser,user);
			            } else {
			            	this.$message({
								message: data.message,
								type: 'error'
							});
			                vm.$router.push('/login');
			            }
			        } else if (data.code == -406) {
			                this.uploadUrl = "admin/user/uploadImage?token="+token;
			                let user = localStorage.getItem('user');
							this.editUserVisible = true;
							user = JSON.parse(user);
							this.imageUrl = user.image;
							this.editUser = Object.assign(this.editUser,user);
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
			changePWDHandle(){
				this.pwdUserVisible = true;
			},
			editUserSubmit(){
				this.$refs.editUser.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editUser);
							para.createDate=null;
							editUser(para).then((body) => {
								this.editLoading = false;
								//NProgress.done();
								if(body){
									this.$message({
										message: '设置成功',
										type: 'success'
									});
									para = {};
									getUser(para).then((body) => {
										if(body){
											localStorage.removeItem('user');
											this.sysUserName = body.name || '';
											this.sysUserAvatar = body.image || 'static/image/manager.jpg';
											localStorage.setItem('user',JSON.stringify(body));
										}
									});
									this.$refs['editUser'].resetFields();
									this.editUserVisible = false;
								}
							});
						});
					}
				});
			},
			pwdUserSubmit(){
				this.$refs.pwdUser.validate((valid) => {
					if (valid) {
						this.pwdLoading = true;
						//NProgress.start();
						let para = Object.assign({}, this.pwdUser);
						para.createDate=null;
						changeUserPwd(para).then((body) => {
							this.pwdLoading = false;
							this.pwdUserVisible = false;
							this.$refs['pwdUser'].resetFields();
							//NProgress.done();
							if(body){
								this.$message({
									message: '设置成功',
									type: 'success'
								});
								vm.$router.push('/login');
							}
						});

					}
				});
			},
			//退出登录
			logout: function () {
				var _this = this;
				this.$confirm('确认退出吗?', '提示', {
					//type: 'warning'
				}).then(() => {
					localStorage.removeItem('user');
					localStorage.removeItem('token');
					_this.$router.push('/login');
				}).catch(() => {

				});


			},
			getUploadUrl(){
				
			},
			beforeUpload(){

			},
			afterSuccess(data){
				if(data.code==200){
					this.editUser.image = data.body;
					this.imageUrl = data.body;
				}else if(data.code==-403){
				 	vm.$router.push('/login');
				}else{
					this.$message({
						message: data.message,
						type: 'success'
					});
				}
			},
			afterError(error){
				alert(error);
			},
			//折叠导航栏
			collapse:function(){
				this.collapsed=!this.collapsed;
			},
			showMenu(i,status){
				this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-'+i)[0].style.display=status?'block':'none';
			}
		},
		mounted() {
			var user = localStorage.getItem('user');

			if (user) {
				user = JSON.parse(user);
				this.sysUserName = user.name || '';
				this.sysUserAvatar = user.image || 'static/image/manager.jpg';
			}

		},
		beforeRouteEnter (to, from, next) {
			next(vm => {
				if(from.path == "/") {
					//刷新处理
					vm.$store.dispatch('setPermission', to.path);
					vm.$store.dispatch('currentUrl',to.path);
				}
			})
		}
	}

</script>

<style scoped lang="scss">
	@import '~scss_vars';
	.avatar-uploader .el-upload {
	    border: 1px dashed #d9d9d9;
	    border-radius: 6px;
	    cursor: pointer;
	    position: relative;
	    overflow: hidden;
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
	.container {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 100%;
		.header {
			height: 60px;
			line-height: 60px;
			background: $color-primary;
			background: #1f2d3d;
			color:#fff;
			.userinfo {
				text-align: right;
				padding-right: 35px;
				float: right;
				.userinfo-inner {
					cursor: pointer;
					color:#fff;
					img {
						width: 40px;
						height: 40px;
						border-radius: 20px;
						margin: 10px 0px 10px 10px;
						float: right;
					}
				}
			}
			.logo {
				//width:230px;
				height:60px;
				font-size: 22px;
				padding-left:20px;
				padding-right:20px;
				border-color: rgba(238,241,146,0.3);
				border-right-width: 1px;
				border-right-style: solid;
				img {
					width: 40px;
					float: left;
					margin: 10px 10px 10px 18px;
				}
				.txt {
					color:#fff;
				}
			}
			.logo-width{
				width:230px;
				//border-color:#1f2d3d;
			}
			.logo-collapse-width{
				width:60px
			}
			.tools{
				padding: 0px 23px;
				width:14px;
				height: 60px;
				line-height: 60px;
				cursor: pointer;
			}
		}
		.main {
			display: flex;
			background: #324057;
			//color: #c0ccda;
			position: absolute;
			top: 60px;
			bottom: 0px;
			overflow: hidden;
			aside {
				flex:0 0 230px;
				width: 230px;
				//width: 20%;
				// position: absolute;
				// top: 0px;
				// bottom: 0px;
				.el-menu{
					height: 100%;
					background: #1f2d3d;
					color: #c0ccda;
				}
				.el-menu--dark{
					background-color: #324157;
					overflow: auto ;
				}
				.collapsed{
					width:60px;
					//background-color: #324157;
					.item{
						position: relative;
					}
					.submenu{
						position:absolute;
						top:0px;
						left:60px;
						z-index:99999;
						height:auto;
						display:none;
					}

				}
			}
			.menu-collapsed{
				flex:0 0 60px;
				width: 60px;
			}
			.menu-expanded{
				flex:0 0 230px;
				width: 230px;
			}
			.content-container {
				background: #f1f2f7;
				flex:1;
				//float:left;
				//height:100%;
				//width:88%;
				// position: absolute
				// right: 0px;
				// top: 0px;
				// bottom: 0px;
				// left: 230px;
				overflow-y: scroll;
				//padding: 20px;
				.breadcrumb-container {
					margin-top:10px;
					margin-bottom: 15px;
					background:#f2f2f2;
					.title {
						width: 200px;
						float: left;
						color: #475669;
					}
					.breadcrumb-inner {
						float: right;
					}
				}
				.content-wrapper {
					background-color: #fff;
					box-sizing: border-box;
					//width:100%;
					//height:95%;
				}
			}
		}
	}
</style>