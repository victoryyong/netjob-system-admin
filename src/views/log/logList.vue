<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.username" placeholder="账号"></el-input>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.startTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="开始时间"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.endTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="结束时间"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getLogs">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="logs" highlight-current-row v-loading="listLoading" style="width: 100%;" @sort-change="sortLog">
			</el-table-column>
			<el-table-column type="index" width="80" label="序号">
			</el-table-column>
			<el-table-column prop="username" label="账号">
			</el-table-column>
			<el-table-column prop="title" label="类型">
			</el-table-column>
			<el-table-column prop="ip" label="IP地址">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="createDate" label="创建时间" :formatter="dateFormat" sortable="custom">
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button  :disabled="detailOprt" type="info" size="small" @click="showDetail(scope.row)">详情</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--编辑界面-->
		<el-dialog title="详情" v-model="detailVisible" :close-on-click-modal="false">
			<el-form :model="detail" label-width="100px">
				<el-form-item label="管理员：">
					{{detail.username}}
				</el-form-item>
				<el-form-item label="用户ID：">
					{{detail.userId}}
				</el-form-item>
				<el-form-item label="操作类型：">
					{{detail.title}}
				</el-form-item>
				<el-form-item label="IP地址：">
					{{detail.ip}}
				</el-form-item>
				<el-form-item label="状态：">
					{{detail.status==0?'失败':'成功'}}
				</el-form-item>
				<el-form-item label="详细信息：">
					<el-input type="textarea" v-model="detail.content" disabled autosize></el-input>
				</el-form-item>
				<el-form-item v-if="detail.errorMsg" label="错误信息：" autosize>
					<el-input type="textarea" v-model="detail.errorMsg" disabled></el-input>
				</el-form-item>
			</el-form>
		</el-dialog>

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
	import { listLog} from '../../api/api';
	import util from '../../common/js/util';

	export default {
		data() {
			return {
				detail:{},
				detailVisible :false,
				filters: {
					username: null,
					startTime:null,
					endTime:null
				},
				total:0,
				listLoading : false,
				logs: [],
				pageIndex: 1,
				pageSize: 15,
				sort:'',
				dir:''
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getLogs();
			},
			//获取用户列表
			getLogs() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name,
					sort:this.sort,
					dir:this.dir
				};
				if(this.filters.startTime){
					this.filters.startTime = moment(new Date(this.filters.startTime).getTime()).format("YYYY-MM-DD HH:mm:ss");
				} 
				if(this.filters.endTime){
					this.filters.endTime = moment(new Date(this.filters.endTime).getTime()).format("YYYY-MM-DD HH:mm:ss");
				} 
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listLog(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.logs = body.list;
					}
				});
			},
			showDetail(row){
				this.detail = Object.assign({}, row);
				this.detailVisible = true;
			},
			sortLog:function(row){
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
				this.getLogs();
				//this.dir =
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
		       return "失败"; 
		     }else if(status == 1) {
		       return "成功"; 
		     }
	      }
		},
		mounted() {
			this.getLogs();
		},
		computed:{
			detailOprt:function(){
				return !util.hasOprt(this,'admin.log.detail');
			}
		}
	}

</script>

<style scoped>

</style>