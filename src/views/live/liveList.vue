<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item prop="name">
					<el-input v-model="filters.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item label="类型">
		        <el-select v-model="filters.status" placeholder="全部" v-on:change="handeChange">
		          <el-option
		            v-for="item in types"
		            :key="item.value"
		            :label="item.label"
		            :value="item.value">
		          </el-option>
		          </el-select>
		        </el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getLives()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getLives()">刷新</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="lives" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange">
			<el-table-column prop="sort" width="100" label="排序号">
			</el-table-column>
			<el-table-column prop="title" max-width="200" label="名称">
			</el-table-column>
			<el-table-column prop="number" label="直播号">
			</el-table-column>
			<el-table-column prop="member.name" label="主播">
			</el-table-column>
			<el-table-column prop="type.name" label="类型">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat" min-width="150">
			</el-table-column>
			<el-table-column label="操作" min-width="450">
				<template scope="scope">
					<el-button  :disabled="authcOprt" size="small" type="success" @click="authcHandle(scope.row.id,1,scope.row.status)">通过</el-button>
					<el-button  :disabled="authcOprt" size="small" type="danger" @click="authcHandle(scope.row.id,6,scope.row.status)">不通过</el-button>
					<el-button  :disabled="editOprt" type="primary" size="small" @click="handleEdit(scope.row)">修改</el-button>
					<el-button  :disabled="deleteOprt" type="danger" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
					<el-button  v-if="scope.row.status==5" :disabled="freezeOprt" type="success" size="small" @click="unfreezeHandle(scope.row.id)">解禁</el-button>
					<el-button  v-if="scope.row.status!=5" :disabled="freezeOprt" type="danger" size="small" @click="freezeHandle(scope.row.id)">禁播</el-button>
					<el-button  :disabled="freezeOprt" type="info" size="small" @click="detailHandle(scope.row)">详情</el-button>
					<el-button  :disabled="freezeOprt" type="success" size="small" @click="playHandle(scope.row)">观看</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<!--<el-button type="success" @click="batchAuthc(1)" :disabled="this.sels.length===0||authcOprt">通过</el-button>
			<el-button type="danger" @click="batchAuthc(6)" :disabled="this.sels.length===0||authcOprt">失败</el-button>-->
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>


		<!--编辑界面-->
		<el-dialog title="修改" v-model="editVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="editForm" label-width="120px" :rules="editRules" ref="editForm">
				<el-form-item label="排序号" prop="sort">
					<el-input v-model="editForm.sort" ></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--播放界面-->
		<el-dialog title="直播" v-model="playVisible" :close-on-click-modal="false" @close="pauseHandle" custom-class="playDialog">
			<div id="playercontainer"></div>
		</el-dialog>

		<!--编辑界面-->
		<el-dialog title="详情" v-model="detailVisible" :close-on-click-modal="false">
			<el-form  label-width="120px">
				<el-form-item label="直播号：">
					{{detailForm.number}}
				</el-form-item>
				<el-form-item label="主持人：">
					{{detailForm.memberName}}
				</el-form-item>
				<el-form-item label="标题：">
					{{detailForm.title}}
				</el-form-item>
				<el-form-item label="流名称：">
					{{detailForm.stream}}
				</el-form-item>
				<el-form-item label="推流地址：">
					{{detailForm.pushUrl}}
				</el-form-item>
				<el-form-item label="缩略图：">
					{{detailForm.image}}
				</el-form-item>
				<el-form-item label="类型：">
					{{detailForm.typeName}}
				</el-form-item>
				<el-form-item label="状态：">
					{{detailForm.status| statusFilter}}
				</el-form-item>
				<el-form-item label="创建时间：">
					{{detailForm.createDate| dateFilter}}
				</el-form-item>
				<el-form-item label="flv播放地址：">
					{{detailForm.flvUrl}}
				</el-form-item>
				<el-form-item label="app播放地址：">
					{{detailForm.hlsUrl}}
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="detailVisible = false">取消</el-button>
			</div>
		</el-dialog>
	</section>
</template>
<script>
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import cyberplayer from '../../../static/libs/player/cyberplayer';
	import { listLive,editLive,authcLive,deleteLive,freezeLive} from '../../api/api';
	import util from '../../common/js/util';
	import axios from 'axios';
	export default {
		data() {
			return {
				editVisible:false,
				addVisible:false,
				detailVisible:false,
				playVisible:false,
				player:null,
				filters: {
					name:'',
					status:''
				},
        		editRules:{
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
				lives: [],
				types:[
					{label:'全部',value:''},
					{label:'审核中',value:0},
					{label:'未在线',value:1},
					{label:'连接中',value:2},
					{label:'直播中',value:3},
					{label:'无信号',value:4},
					{label:'已禁播',value:5},
					{label:'审核失败',value:6}
				],
				pageIndex: 1,
				pageSize: 15,
				editForm:{
					liveId:null,
					sort:null
				},
				detailForm:{
					number:null,
					memberName:null,
					title:null,
					stream:null,
					pushUrl:null,
					name:null,
					image:null,
					typeName:null,
					status:null,
					createDate:null,
					flvUrl:null,
					hlsUrl:null
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getLives();
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			handeChange(value){
				this.filters.typeId=value;
			},
			//获取用户列表
			getLives() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					title: this.filters.name
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listLive(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.lives = body.list;
					}
				});
			},
			handleEdit(row){
				this.editVisible = true;
				this.editForm.sort = row.sort;
				this.editForm.liveId = row.id;
			},
			editSubmit(){
				this.$refs.editForm.validate((valid) => {
					if(valid){
						this.editLoading= true;
						let para = {
							
						};
						para = Object.assign(para,this.editForm);
						editLive(para).then((body) => {
							if(body){
								this.$message({
									message: '修改成功',
									type: 'success'
								});
							}
							this.editLoading= false;
							this.editVisible = false;
							this.getLives();
						});
					}
				});
			},
			deleteHandle(id){
				 this.$confirm('确认删除该记录吗?', '提示', {
			          type: 'warning'
			        }).then(() => {
			          this.listLoading = true;
			          NProgress.start();
			          let para = { liveId: id };
			          deleteLive(para).then((body) => {
			            this.listLoading = false;
			            NProgress.done();
			            if(body){
			              this.$message({
			                message: '删除成功',
			                type: 'success'
			              });
			              this.getLives();
			            }
			          });
			        }).catch(() => {

			        });
			},
			authcHandle(id,status,oldStatus){
				if(oldStatus!=0){
					this.$message({
						message: '该直播已审核',
						type: 'warning'
					});
					return;
				}
				var type=' "成功" ';
				if(status==1){
					type=' "通过" ';
				}else{
					type=' "不通过" ';
				}
				this.$confirm('您已选择1条记录，审核结果为'+type+'。确认后，数据不可更改。', '提示', {
					type: 'warning'
				}).then(() => {	
						let para = { liveIds: id,status:status };
						authcLive(para).then((body) => {
							this.listLoading = false;
							NProgress.done();
							if(body){
								this.$message({
									message: '成功',
									type: 'success'
								});
								this.getLives();
							}
						});
				}).catch(() => {

				});
			},
			freezeHandle(id){
				this.$confirm('请确认是否禁播？', '提示', {
					type: 'warning'
				}).then(() => {	
						let para = { liveId: id,status:5 };
						freezeLive(para).then((body) => {
							this.listLoading = false;
							NProgress.done();
							if(body){
								this.$message({
									message: '成功',
									type: 'success'
								});
								this.getLives();
							}
						});
				}).catch(() => {

				});
			},
			unfreezeHandle(id){
				this.$confirm('请确实是否解禁？', '提示', {
					type: 'warning'
				}).then(() => {	
						let para = { liveId: id,status:1 };
						freezeLive(para).then((body) => {
							this.listLoading = false;
							NProgress.done();
							if(body){
								this.$message({
									message: '成功',
									type: 'success'
								});
								this.getLives();
							}
						});
				}).catch(() => {

				});
			},
			detailHandle(row){
						this.detailVisible = true;
						this.detailForm = Object.assign({}, row);
						this.detailForm.memberName = row.member.name;
						this.detailForm.typeName = row.type.name;
			},
			playHandle(row){
					let self = this;
						if(row.status==0){
							this.$message({
									message: '直播审核中',
									type: 'warning'
								});
								return;
						}else if(row.status==1){
							this.$message({
									message: '主播未在线',
									type: 'warning'
								});
								return;
						}else if(row.status==5){
							this.$message({
									message: '已禁播',
									type: 'warning'
								});
								return;
						}else if(row.status==6){
							this.$message({
									message: '审核未通过',
									type: 'warning'
								});
								return;
						}
						let playUrl = row.flvUrls.L0;
						this.playVisible = true;
						var initplayer = cyberplayer("playercontainer").setup({
							flashplayer:"../../../static/libs/player/cyberplayer.flash.swf",
					        width : 560,
					        type:'flv',
					        height : 433,
					        backcolor : "#FFFFFF",
					        stretching : "uniform",
					        file : playUrl,
					        ak : "a7e5b57f36b84ef1bb062c1d198fb1bf",
					        autoStart : true,
					        repeat : false,
					        volume : 100,
					        controls : "over"
				        });
						setTimeout(function(){
							console.log(22);
 							self.player = initplayer;
						},3000);

			},
			pauseHandle(){
				if(null!=this.player){
					this.player.remove();
				}
			},
			//批量审核
			batchAuthc: function (status) {
				var ids = this.sels.map(item => item.id).toString();
				var length = this.sels.length;
				var type=' "成功" ';
				if(status==1){
					type=' "通过" ';
				}else{
					type=' "不通过" ';
				}
				this.$confirm('您已选择'+length+'条记录，审核结果为'+type+'。确认后，数据不可更改。', '提示', {
					type: 'warning'
				}).then(() => {	
						let para = { liveIds: ids,status:status };
						authcLive(para).then((body) => {
							this.listLoading = false;
							NProgress.done();
							if(body){
								this.$message({
									message: '成功',
									type: 'success'
								});
								this.getLives();
							}
						});
				}).catch(() => {

				});
			},
		      //状态格式化 
		     statusFormat:function(row, column) { 
		        var status = row[column.property]; 
			     if (status == 0) { 
			       return "审核中"; 
			     }else if(status == 1) {
			       return "未在线"; 
			     }else if(status == 2) {
			       return "连接中"; 
			     }else if(status == 3) {
			       return "直播中"; 
			     }else if(status == 4) {
			       return "无信号"; 
			     }else if(status == 5) {
			       return "已禁播"; 
			     }else if(status == 6) {
			       return "审核失败"; 
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
			this.getLives();
		},
		computed:{
			authcOprt:function(){
				return !util.hasOprt(this,'admin.live.authc');
			},
			editOprt:function(){
				return !util.hasOprt(this,'admin.live.edit');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.live.delete');
			},
			freezeOprt:function(){
				return !util.hasOprt(this,'admin.live.freeze');
			}
		},
		filters:{
			statusFilter(status){
				if (status == 0) { 
			       return "审核中"; 
			     }else if(status == 1) {
			       return "未在线"; 
			     }else if(status == 2) {
			       return "连接中"; 
			     }else if(status == 3) {
			       return "直播中"; 
			     }else if(status == 4) {
			       return "无信号"; 
			     }else if(status == 5) {
			       return "已禁播"; 
			     }else if(status == 6) {
			       return "审核失败"; 
			     }
			},
			dateFilter(date){
				return moment(date).format("YYYY-MM-DD HH:mm:ss"); 
			}
		}
	}

</script>

<style>
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
	  .playDialog{
	  	width:600px;
	  }
</style>