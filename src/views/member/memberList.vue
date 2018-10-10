<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.idCard" placeholder="身份证"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.phone" placeholder="电话"></el-input>
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
			<el-table-column prop="sysCode.number" label="预选号" >
			</el-table-column>
			<el-table-column prop="name" label="姓名" >
			</el-table-column>
			<el-table-column prop="idCard" label="身份证">
			</el-table-column>
			<el-table-column prop="phone" label="电话" >
			</el-table-column>
			<el-table-column prop="sysCode.status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="registerDate" label="注册日期" :formatter="dateFormat">
			</el-table-column>
			<!--<el-table-column prop="ip" label="ip" >
			</el-table-column>
			-->
			<el-table-column prop="lastTime" label="最近访问时间" :formatter="dateFormat">
			</el-table-column>
			<el-table-column prop="address" label="最近访问地址" >
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
	import { listMember} from '../../api/api';

	export default {
		data() {
			return {
				filters: {
					name: '',
					idCard: '',
					phone: '',
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
				listMember(para).then((body) => {
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
	        var status = row.sysCode.status; 
	        if(status){
		        if (status >= 4) { 
			       return "冻结"; 
			     }else{
			       return "激活"; 
			     }
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