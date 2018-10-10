<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item prop="name">
					<el-input v-model="filters.name" placeholder="套餐名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getMeals()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :disabled="addOprt" v-on:click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="meals" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column prop="name" width="200" label="名称">
			</el-table-column>
			<el-table-column prop="meetCodes.size" label="会议号码数量">
			</el-table-column>
			<el-table-column prop="castDay" label="直播互动消息天数">
			</el-table-column>
			<el-table-column prop="vodTime" label="点播时长(分钟)">
			</el-table-column>
			<el-table-column prop="salePoint" label="商品打折">
			</el-table-column>
			<el-table-column prop="visibleDay" label="有效期">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button  :disabled="editOprt" size="small" @click="handleEdit(scope.row)">修改</el-button>
					<el-button  :disabled="deleteOprt" type="danger" size="small" @click="batchRemove(scope.row.id)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove()" :disabled="this.sels.length===0||deleteOprt">删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>


		<!--编辑界面-->
		<el-dialog title="修改" v-model="editVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="editForm" label-width="150px" :rules="editRules" ref="editForm">
				<el-form-item label="名称" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="互动天数（天）" prop="castDay">
					<el-input v-model="editForm.castDay"></el-input>
				</el-form-item>
				<el-form-item label="点播时长（分钟）" prop="vodTime">
					<el-input v-model="editForm.vodTime"></el-input>
				</el-form-item>
				<el-form-item label="打折率" prop="salePoint">
					<el-input v-model="editForm.salePoint"></el-input>
				</el-form-item>
				<el-form-item label="有效期（天）" prop="visibleDay">
					<el-input v-model="editForm.visibleDay"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="addForm" label-width="150px" :rules="editRules" ref="addForm">
				<el-form-item label="名称" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="互动天数（天）" prop="castDay">
					<el-input v-model="addForm.castDay"></el-input>
				</el-form-item>
				<el-form-item label="点播时长（分钟）" prop="vodTime">
					<el-input v-model="addForm.vodTime"></el-input>
				</el-form-item>
				<el-form-item label="打折率" prop="salePoint">
					<el-input v-model="addForm.salePoint"></el-input>
				</el-form-item>
				<el-form-item label="有效期（天）" prop="visibleDay">
					<el-input v-model="addForm.visibleDay"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import moment from '../../common/js/moment';
	import NProgress from 'nprogress';
	import { listMeal,editMeal,addMeal,deleteMeal} from '../../api/api';
	import util from '../../common/js/util';

	export default {
		data() {
			return {
				editVisible:false,
				addVisible:false,
				filters: {
					name:''
				},
        		editRules:{
        		  name: [
						{ required: true, message: '请输名称', trigger: 'blur' }
		          ],
		          castDay: [
						{ required: true, message: '请输入直播互动天数', trigger: 'blur' },
						{ validator:(rule,value,callback)=>{
			                if(/^[0-9]*[1-9][0-9]*$/.test(value) == false){
			                    callback(new Error("请输入正整数"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
		          ],
		          vodTime: [
						{ required: true, message: '请输入点播时长', trigger: 'blur' },
						{ validator:(rule,value,callback)=>{
			                if(/^[0-9]*[1-9][0-9]*$/.test(value) == false){
			                    callback(new Error("请输入正整数"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
		          ],
		          salePoint: [
						{ required: true, message: '请输入打折率', trigger: 'blur' },
						{ validator:(rule,value,callback)=>{
			                if(/^\d+(\.\d+)?$/.test(value) == false||parseFloat(value)>1||parseFloat(value)==0){
			                    callback(new Error("请输入大于0小于等于1的正数"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
		          ],
		          visibleDay: [
						{ required: true, message: '请输入有效期', trigger: 'blur' },
						{ validator:(rule,value,callback)=>{
			                if(/^[0-9]*[1-9][0-9]*$/.test(value) == false){
			                    callback(new Error("请输入正整数"));
			                }else{
			                    callback();
			                }},trigger: 'blur' }
		          ]
        		},
				total:0,
				listLoading : false,
				addLoading:false,
				editLoading:false,
				sels:[],
				meals: [],
				pageIndex: 1,
				pageSize: 15,
				editMealId:'',
				editForm:{
					name:'',
					castDay:'',
					vodTime:'',
					salePoint:'',
					visibleDay:''
				},
				addForm:{
					name:'',
					castDay:'',
					vodTime:'',
					salePoint:'',
					visibleDay:''
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getMeals();
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//获取用户列表
			getMeals() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
					name: this.filters.name
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listMeal(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.meals = body.list;
					}
				});
			},
			handleEdit(row){
				this.editForm = Object.assign({},row);
				this.editForm.castDay=this.editForm.castDay+'';
				this.editForm.vodTime=this.editForm.vodTime+'';
				this.editForm.salePoint=this.editForm.salePoint+'';
				this.editForm.visibleDay=this.editForm.visibleDay+'';
				this.editVisible = true;
			},
			editSubmit(row){
				
				this.$refs.editForm.validate((valid) => {
					if(valid){
						this.editLoading= true;
						this.editMealId = row.id;
						this.editVisible = true;
						let para = {
							mealId:row.id
						};
						para = Object.assign(para,this.editForm);
						para.createDate = null;
						editMeal(para).then((body) => {
							this.$message({
								message: '修改成功',
								type: 'success'
							});
							this.editLoading= false;
							this.editVisible = false;
							this.getMeals();
						});
					}
				});
			},
			handleAdd(){
				this.addVisible = true;
				this.addForm = 
				{
					name:'',
					castDay:null,
					vodTime:null,
					salePoint:null,
					visibleDay:null
				}
			},
			addSubmit(row){
				
				this.$refs.addForm.validate((valid) => {
					if(valid){
						this.addLoading  = true;
						let para = {
							
						}
						para = Object.assign({},this.addForm);
						addMeal(para).then((body) => {
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.addLoading = false;
							this.addVisible = false;
							this.getMeals();
						});
					}
				});
			},
			batchRemove(id){
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					let para={}
					if(id){
						para = {mealIds:id};
					}else{
						var ids = this.sels.map(item => item.id).toString();
						para = {mealIds:ids};
					}
					deleteMeal(para).then((body) => {
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getMeals();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getMeals();
		},
		computed:{
			editOprt:function(){
				return !util.hasOprt(this,'admin.meal.edit');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.meal.delete');
			},
			addOprt:function(){
				return !util.hasOprt(this,'admin.meal.add');
			}
		}
	}

</script>

<style scoped>

</style>