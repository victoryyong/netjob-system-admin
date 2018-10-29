<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getAuths">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="auths" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="userName" label="审核人" >
			</el-table-column>
			<el-table-column prop="name" label="审核名称" >
			</el-table-column>
			<el-table-column prop="type" label="类型" :formatter="typeFormat">
			</el-table-column>
			<el-table-column prop="status" label="结果" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="createDate" label="审核时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button type="info" size="small" @click="showDetail(scope.$index, scope.row)">详情</el-button>
				</template>
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
	import { listAuth} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				auths: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				listLoading: false,
				
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.currentPage = val;
				this.getCompanys();
			},
			getAuths() {
				let para = {
					currentPage: this.currentPage,
					pageSize:this.pageSize
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listAuth(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.auths = body.list;
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
	      //类型格式化 
	      typeFormat:function(row, column) { 
	        var type = row[column.property]; 
		     if (type == 1) { 
		       return "需求"; 
		     } else if (type == 2){
		     	return "服务"; 
		     } else if (type == 3){
		     	return "品牌秀";
		     }else if (type == 4){
		     	return "个人审核";
		     }else if (type == 5){
		     	return "企业审核";
		     }
	      },
	      //结果格式化 
	      statusFormat:function(row, column) { 
	        var type = row[column.property]; 
		     if (type == 2) { 
		       return "通过"; 
		     } else if (type == 3){
		     	return "未通过"; 
		     } 
	      }
		},
		mounted() {
			this.getAuths();
		}
	}

</script>

<style scoped>

</style>