<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.deviceId" placeholder="硬件ID"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.address" placeholder="地址"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getMembers">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="members" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="deviceId" label="硬件ID" >
			</el-table-column>
			<el-table-column prop="lastTime" label="上次访问时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column prop="costTime" label="访问总时长" >
			</el-table-column>
			<el-table-column prop="address" label="最新访问位置">
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
	import util from '../../common/js/util';
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listVisitor} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					deviceId:'',
					address: ''
				},
				members: [],
				total: 0,
				pageIndex: 1,
				pageSize: 20,		
				listLoading: false
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getMembers();
			},
			//获取用户列表
			getMembers() {
				let para = {
					currentPage: this.page,
					pageSize:this.pageSize,
				};
				para = Object.assign({}, this.filters);
				this.listLoading = true;
				NProgress.start();
				listVisitor(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.members = body.list;
					}
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
		       return "冻结"; 
		     }else if(status == 1) {
		       return "激活"; 
		     }
	      }
		},
		mounted() {
			this.getMembers();
		}
	}

</script>

<style scoped>

</style>