<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.receiver" placeholder="发送人"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.sender" placeholder="收件人"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getMessageList">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="showHandler">发送消息</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--发送消息-->
		<el-dialog title="发送消息" v-model="sendFormVisible" :close-on-click-modal="false" size="small">
			<el-form :model="sendForm" label-width="100px" ref="sendForm" :rules="sendFormRules">
			<el-form-item label="消息内容" prop="content">
          		<el-input type="textarea" v-model="sendForm.content"></el-input>
			</el-form-item>
			<el-form-item label="接收人" prop="memberIds">
			  <el-transfer
			    filterable
			    :filter-method="filterMethod"
			    @change="selectChange"
			    filter-placeholder="请输入名称"
			    v-model="receivers"
			    :data="members">
			  </el-transfer>
			  </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
					<el-button @click.native="sendFormVisible = false">取消</el-button>
					<el-button type="primary" @click.native="sendSubmit" :loading="sendLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--列表-->
		<el-table :data="messages" highlight-current-row v-loading="listLoading" style="width: 100%;" @sort-change="sortMessageList">
			<el-table-column prop="receiver" label="收件人">
			</el-table-column>
			<el-table-column prop="sender" label="发送人">
			</el-table-column>
			<el-table-column prop="content" label="消息内容">
			</el-table-column>
			<el-table-column prop="type" label="类型" :formatter="typeFormat">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat" sortable="custom">
			</el-table-column>
		</el-table>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
	</section>
</template>

<script>
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listMessage,sendMessage,listAllMember} from '../../api/api';
	import util from '../../common/js/util';

	export default {
		data() {
			return {
				filters: {
					reveiver: null,
					sender:null
				},
				total:0,
				listLoading : false,
				messages: [],
				members:[],
				receivers:[],
				pageIndex: 1,
				total:0,
				pageSize: 15,
				sort:'',
				dir:'',
				sendFormVisible:false,
				sendLoading:false,
				sendFormRules:{
					content: [
						{ required: true, message: '请输入消息内容', trigger: 'blur' }
						
					],
					memberIds:[
						{ validator:(rule,value,callback)=>{
			              try{
			                if(this.sendForm.memberIds.length<=0){
			                    callback(new Error("请选择消息收件人"));
			                }else{
			                    callback();
			                }
			              }catch(e){
			                callback(new Error("请选择消息收件人"));
			              }
			              },trigger: 'blur' }
					]
				},
				sendForm:{
					content:'',
					memberIds:''
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getMessageList();
			},
			//获取用户列表
			getMessageList() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name,
					sort:this.sort,
					dir:this.dir
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listMessage(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.messages = body.list;
					}
				});
			},
			sortMessageList:function(row){
				console.log(row.prop);
				console.log(row.order);
				if(row.prop)this.sort='c_'+row.prop;
				if(row.order){
					if(row.order=='descending'){
						this.dir = 'desc';
					}else{
						this.dir = 'asc';
					}
				};
				this.getMessageList();
				//this.dir =
			},
			showHandler(){
				this.sendFormVisible = true;
				this.sendLoading = false;
				this.sendForm = {
					content:'',
					memberIds:''
				}
			},
			filterMethod(query, item) {
				//console.log(JSON.stringify(query));
				//console.log(JSON.stringify(item));
          		return item.label.indexOf(query) > -1;
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
		     if (status == 1) { 
		       return "未读"; 
		     }else if(status == 2) {
		       return "已读"; 
		     }
	      },
	      selectChange(keys,direct){
	      	this.sendForm.memberIds = keys;
	      },
	      sendSubmit(){
	      	this.$refs.sendForm.validate((valid) => {
	      		if(valid){
	      			let para = {memberIds:this.sendForm.memberIds,content:this.sendForm.content};
	      			//console.log(JSON.stringify(para));
		      		this.sendLoading = true;
		      		sendMessage(para).then((body) => {
						this.sendLoading = false;
						this.sendFormVisible=false;
						NProgress.done();
						if(body){
						 this.getMessageList();
						}
					});
	      		}
	      	});
	      },
	      //状态格式化 
	      typeFormat:function(row, column) { 
	        var type = row[column.property]; 
		     if (type == 1) { 
		       return "系统消息"; 
		     }else if(type == 2) {
		       return "会员消息"; 
		     }
	      }
		},
		mounted() {
			this.getMessageList();
			let para = {status:1};
			listAllMember(para).then((body) => {
				if(body){
					 body.list.forEach((item)=>{
					 	this.members.push({label:item.name,key:item.id});
					 });
					 //console.log(JSON.stringify(this.members));
				}
			});
		}
	}

</script>

<style scoped>

</style>