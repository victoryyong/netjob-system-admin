<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.number" placeholder="号码"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.memberName" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.mealName" placeholder="套餐名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.startTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="开始时间"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.endTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="结束时间"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getRecharges">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="exportRecharges" :disabled="exportOprt">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="recharges" highlight-current-row v-loading="listLoading" style="width: 100%;" @sort-change="sortRecharge">
			</el-table-column>
			<el-table-column prop="number" label="号码">
			</el-table-column>
			<el-table-column prop="memberName" label="姓名">
			</el-table-column>
			<el-table-column prop="mealName" label="套餐">
			</el-table-column>
			<el-table-column prop="money" label="充值金额（元）">
			</el-table-column>
			<el-table-column prop="createDate" label="充值时间" :formatter="dateFormat" sortable="custom">
			</el-table-column>
			<el-table-column prop="address" label="充值地址">
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
	import { listRecharge,exportRecharge} from '../../api/api';
	import util from '../../common/js/util';

	export default {
		data() {
			return {
				detail:{},
				detailVisible :false,
				filters: {
					memberName: null,
					number:null,
					mealName:null,
					startTime:null,
					endTime:null
				},
				total:0,
				listLoading : false,
				recharges: [],
				pageIndex: 1,
				pageSize: 15,
				sort:'',
				dir:''
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getRecharges();
			},
			//获取用户列表
			getRecharges() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
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
				listRecharge(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.recharges = body.list;
					}
				});
			},
			showDetail(row){
				this.detail = Object.assign({}, row);
				this.detailVisible = true;
			},
			exportRecharges:function(){
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
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
				exportRecharge(para).then((body) => {
					
				});
			},
			sortRecharge:function(row){
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
				this.getRecharges();
				//this.dir =
			},
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
			this.getRecharges();
		},
		computed:{
			exportOprt:function(){
				return !util.hasOprt(this,'admin.recharge.export');
			}
		}
	}

</script>

<style scoped>

</style>