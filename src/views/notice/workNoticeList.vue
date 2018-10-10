<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="账号"></el-input>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.startTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="开始时间"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.endTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="结束时间"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getWorkNoticeList">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="workNotices" highlight-current-row v-loading="listLoading" style="width: 100%;" @sort-change="sortWorkNotice">
			<el-table-column prop="name" label="姓名">
			</el-table-column>
			<el-table-column prop="title" label="标题">
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
	import { listWorkNotice} from '../../api/api';
	import util from '../../common/js/util';

	export default {
		data() {
			return {
				filters: {
					name: null,
					startTime:null,
					endTime:null
				},
				total:0,
				listLoading : false,
				workNotices: [],
				pageIndex: 1,
				pageSize: 15,
				sort:'',
				dir:''
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getWorkNoticeList();
			},
			//获取用户列表
			getWorkNoticeList() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name,
					sort:this.sort,
					dir:this.dir
				};
				if(this.filters.startTime){
					this.filters.startTime = moment(new Date(this.filters.startTime).getTime()).format("YYYY-MM-DD");
				} 
				if(this.filters.endTime){
					this.filters.endTime = moment(new Date(this.filters.endTime).getTime()).format("YYYY-MM-DD");
				} 
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listWorkNotice(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.workNotices = body.list;
					}
				});
			},
			sortWorkNotice:function(row){
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
				this.getWorkNoticeList();
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
		       return "未处理"; 
		     }else if(status == 1) {
		       return "已处理"; 
		     }
	      },
	      //状态格式化 
	      typeFormat:function(row, column) { 
	        var type = row[column.property]; 
		     if (type == 1) { 
		       return "注册"; 
		     }else if(type == 2) {
		       return "直播"; 
		     }else{
				return "费率更改"; 
		     }
	      }
		},
		mounted() {
			this.getWorkNoticeList();
		}
	}

</script>

<style scoped>

</style>