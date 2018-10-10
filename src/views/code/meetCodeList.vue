<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters" :rules="searchRules">
				<el-form-item prop="number">
					<el-input v-model="filters.number" placeholder="授权码"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.code" placeholder="授权序号"></el-input>
				</el-form-item>
				<el-form-item  prop="startNumber">
					<el-input v-model="filters.startNumber" placeholder="授权码范围起"></el-input>
				</el-form-item>
				<el-form-item prop="endNumber">
					<el-input v-model="filters.endNumber" placeholder="授权码范围终" ></el-input>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.startTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="开始时间"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-date-picker v-model="filters.endTime" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="结束时间"></el-date-picker>
				</el-form-item>
				<el-form-item label="类型">
		          <el-select v-model="filters.status" placeholder="全部" v-on:change="handeChange">
		          <el-option
		            v-for="item in statuses"
		            :key="item.value"
		            :label="item.text"
		            :value="item.value">
		          </el-option>
		          </el-select>
		        </el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getMeetCodes">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="meetCodes" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange" @sort-change="sortMeetCode">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column prop="number" label="授权码">
			</el-table-column>
			<el-table-column prop="code" label="授权序号">
			</el-table-column>
			<el-table-column prop="description" label="描述">
			</el-table-column>
			<el-table-column prop="status" label="状态" :formatter="statusFormat">
			</el-table-column>
			<el-table-column prop="createDate" label="申请时间" :formatter="dateFormat" sortable="custom">
			</el-table-column>
			<el-table-column label="操作" width="200">
				<template scope="scope">
					<el-button  :disabled="unfreezeOprt" size="small" @click="unfreeze(scope.row)">解冻</el-button>
					<el-button  :disabled="freezeOprt" type="danger" size="small" @click="freeze(scope.row)">冻结</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="primary" @click="batchAuthc" :disabled="applyOprt">申请会议账号</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>


		<!--编辑界面-->
		<el-dialog title="申请会议账号" v-model="batchAuthcVisible" :close-on-click-modal="false" size="tiny">
			<el-form label-width="130px" :rules="batchAuthcRules">
				<el-form-item label="申请会议账号数量" prop="authcCount">
					<el-input v-model="authcCount"></el-input>
				</el-form-item>
				<el-form-item label="对应会员号码个数" prop="maxContain">
					<el-input v-model="maxContain"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="batchAuthcVisible = false">取消</el-button>
				<el-button type="primary" @click.native="authcSubmit" :loading="authcLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listMeetCode,unfreezeMeetCode,freezeMeetCode} from '../../api/api';
	import util from '../../common/js/util';

	export default {
		data() {
			return {
				batchAuthcVisible:false,
				filters: {
					number: null,
					code:null,
					startTime:null,
					endTime:null,
					startNumber:null,
					endNumber:null,
					status:''
				},
				searchRules: {
				   number: [
			            { validator:(rule,value,callback)=>{
			              try{
			                if(value&&/^\d+$/.test(parseInt(value)) == false){
			                    callback(new Error("请输入正整数"));
			                }else{
			                    callback();
			                }
			              }catch(e){
			                callback(new Error("请输入正整数"));
			              }
			              },trigger: 'blur' }
		          ],
		          startNumber: [
		            { validator:(rule,value,callback)=>{
		              try{
		                if(value&&/^\d+$/.test(parseInt(value)) == false){
		                    callback(new Error("请输入正整数"));
		                }else{
		                    callback();
		                }
		              }catch(e){
		                callback(new Error("请输入正整数"));
		              }
		              },trigger: 'blur' }
		          ],
		          endNumber: [
		            { validator:(rule,value,callback)=>{
		              try{
		                if(value&&/^\d+$/.test(parseInt(value)) == false){
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
        		batchAuthcRules:{
        			authcCount: [
			            { validator:(rule,value,callback)=>{
			              try{
			                if(value&&/^\d+$/.test(parseInt(value)) == false){
			                    callback(new Error("请输入正整数"));
			                }else{
			                    callback();
			                }
			              }catch(e){
			                callback(new Error("请输入正整数"));
			              }
			              },trigger: 'blur' }
		          ],
		          maxContain: [
			            { validator:(rule,value,callback)=>{
			              try{
			                if(value&&/^\d+$/.test(parseInt(value)) == false){
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
        		statuses:[
        			{
        				text:'全部',
        				value:'',
        				selected:true
        			},
        			{
        				text:'空闲',
        				value:'1'
        			},
        			{
        				text:'预选',
        				value:'2'
        			},
        			{
        				text:'占用',
        				value:'3'
        			},
        			{
        				text:'冻结',
        				value:'4'
        			}
        		],
				total:0,
				authcCount:1000,
				maxContain:4,
				authcLoading:false,
				listLoading : false,
				sels:[],
				meetCodes: [],
				pageIndex: 1,
				pageSize: 15,
				sort:'',
				dir:''
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getMeetCodes();
			},
			handeChange(value){
				this.filters.status=value;
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//获取用户列表
			getMeetCodes() {
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
				listMeetCode(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.meetCodes = body.list;
					}
				});
			},
			freeze(row){
				if(row.status>=4){
					this.$message({
						message: '此号码已冻结',
						type: 'warning'
					});
					return;
				}
				let para = {
					codeId:row.id
				}
				freezeMeetCode(para).then((body) => {
					this.$message({
						message: '冻结成功',
						type: 'success'
					});
					this.getMeetCodes();
				});
			},
			unfreeze(row){
				if(row.status<4){
					this.$message({
						message: '无需解冻',
						type: 'warning'
					});
					return;
				}
				let para = {
					codeId:row.id
				}
				unfreezeMeetCode(para).then((body) => {
					if(body){
						this.$message({
							message: '解冻成功',
							type: 'success'
						});
					 	this.getMeetCodes();
					}
				});
			},
			sortMeetCode:function(row){
				if(row.prop)this.sort='c_'+row.prop;
				if(row.order){
					if(row.order=='descending'){
						this.dir = 'desc';
					}else{
						this.dir = 'asc';
					}
				};
				this.getMeetCodes();
			},
			authcSubmit(){
				this.authcLoading = true;
				alert("申请数量"+this.authcCount+"对应会员个数"+this.maxContain);
				this.authcLoading = false;
				this.batchAuthcVisible = false;
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
		       return "空闲"; 
		     }else if(status == 2) {
		       return "预选"; 
		     }else if(status == 3) {
		       return "占用"; 
		     }else{
		       return "冻结"; 
		     }
	      },
	      batchAuthc(){
	      	this.authcCount = 1000;
	      	this.maxContain = 4;
	      	this.batchAuthcVisible= true;
	      }
		},
		mounted() {
			this.getMeetCodes();
		},
		computed:{
			freezeOprt:function(){
				return !util.hasOprt(this,'admin.meetcode.freeze');
			},
			unfreezeOprt:function(){
				return !util.hasOprt(this,'admin.meetcode.unfreeze');
			},
			applyOprt:function(){
				return !util.hasOprt(this,'admin.meetcode.apply');
			}
		}
	}

</script>

<style scoped>

</style>