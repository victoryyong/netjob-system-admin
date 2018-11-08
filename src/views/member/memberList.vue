<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getMembers">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="members" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="name" label="昵称" >
			</el-table-column>
			<el-table-column prop="phone" label="电话" >
			</el-table-column>
			<el-table-column prop="gender" label="性别" :formatter="genderFormat">
			</el-table-column>
			<el-table-column prop="age" label="年龄" :formatter="ageFormat">
			</el-table-column>
			<el-table-column prop="type" label="用户类型" :formatter="typeFormat">
			</el-table-column>
			<el-table-column prop="cityName" label="城市" >
			</el-table-column>
			<el-table-column prop="createDate" label="注册时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button type="info" v-if="scope.row.status=='2'" size="small" @click="activeMember(scope.row.id)">激活</el-button>
					<el-button type="danger" v-if="scope.row.status=='1'" size="small" @click="freezeMember(scope.row.id)">冻结</el-button>
					<el-button type="info" size="small" @click="showDetail(scope.row)">详情</el-button>
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
	import { listMember,editMember} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				members: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				listLoading: false,
				
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.currentPage = val;
				this.getMembers();
			},
			getMembers() {
				let para = {
					currentPage: this.currentPage,
					pageSize:this.pageSize
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listMember(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.members = body.list;
					}
				});
			},
			activeMember(id){
				let para={id:id,status:1};
				editMember(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.getMembers();
					}
				});
			},
			freezeMember(id){
				let para={id:id,status:2};
				editMember(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.getMembers();
					}
				});
			},
		  //时间格式化 
	      dateFormat:function(row, column) { 
	        var date = row[column.property]; 
		     if (date == undefined) { 
		       return ""; 
		     } 
	     	return moment(date).format("YYYY-MM-DD"); 
	      },
	      //类型格式化 
	      typeFormat:function(row, column) { 
	        var type = row[column.property]; 
		     if (type == 'phone') { 
		       return "手机"; 
		     } else if (type == 'wx'){
		     	return "微信"; 
		     } else if (type == 'qq'){
		     	return "QQ";
		     }else {
		     	return "未知";
		     }
	      },
	      //结果格式化 
	      genderFormat:function(row, column) { 
	        var type = row[column.property]; 
		     if (type == 1) { 
		       return "男"; 
		     } else if (type == 2){
		     	return "女"; 
		     }else{
		     	return "未知"; 
		     } 
	      },
	      //结果格式化 
	      ageFormat:function(row, column) { 
	        var age = row[column.property]; 
		     if (age) { 
		       return age; 
		     } else{
		     	return "未知"; 
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