<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item prop="title">
					<el-input v-model="filters.title" placeholder="标题"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getSettings()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :disabled="addOprt" v-on:click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="settings" highlight-current-row v-loading="listLoading" style="width: 100%;" @selection-change="selsChange">
			<el-table-column prop="key" width="200" label="key">
			</el-table-column>
			<el-table-column prop="value" label="值">
			</el-table-column>
			<el-table-column prop="description" label="描述">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button  :disabled="editOprt" size="small" @click="handleEdit(scope.row)">修改</el-button>
					<el-button  :disabled="deleteOprt" type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>


		<!--编辑界面-->
		<el-dialog title="修改" v-model="editVisible" :close-on-click-modal="false" size="small">
			<el-form :model="editForm" label-width="80px" :rules="editRules" ref="editForm">
				<el-form-item label="key" prop="key">
					<el-input v-model="editForm.key" disabled></el-input>
				</el-form-item>
				<el-form-item label="值" prop="value">
					<el-input v-model="editForm.value"></el-input>
				</el-form-item>
				<el-form-item label="是否公开">
					<el-radio-group v-model="editForm.open">
						<el-radio class="radio" :label=false >否</el-radio>
						<el-radio class="radio" :label=true>是</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="描述" prop="description" >
					<el-input type="textarea" v-model="editForm.description"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addVisible" :close-on-click-modal="false" size="small">
			<el-form :model="addForm" label-width="80px" :rules="addRules" ref="addForm">
				<el-form-item label="key" prop="key">
					<el-input v-model="addForm.key"></el-input>
				</el-form-item>
				<el-form-item label="值" prop="value">
					<el-input v-model="addForm.value"></el-input>
				</el-form-item>
				<el-form-item label="是否公开">
					<el-radio-group v-model="addForm.open">
						<el-radio class="radio" :label=false >否</el-radio>
						<el-radio class="radio" :label=true>是</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="描述" prop="description" >
					<el-input type="textarea" v-model="addForm.description"></el-input>
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
	import NProgress from 'nprogress';
	import { listSetting,editSetting,addSetting,deleteSetting} from '../../api/api';
	import util from '../../common/js/util';

	export default {
		data() {
			return {
				editVisible:false,
				addVisible:false,
				filters: {
					key:''
				},
        		editRules:{
        		  key: [
						{ required: true, message: '请输key', trigger: 'blur' }
		          ],
		          value: [
						{ required: true, message: '请输入值', trigger: 'blur' }
		          ]
        		},
        		addRules:{
                    key: [
                        { required: true, message: '请输key', trigger: 'blur' }
                    ],
                    value: [
                        { required: true, message: '请输入值', trigger: 'blur' }
                    ]
        		},
				total:0,
				listLoading : false,
				addLoading:false,
				editLoading:false,
				settings: [],
				pageIndex: 1,
				pageSize: 15,
				editSettingId:'',
				editForm:{
					key:null,
					value:null,
                    description:null,
					open:null
				},
				addForm:{
                    key:null,
                    value:null,
					description:null,
                    open:true
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.pageIndex = val;
				this.getSettings();
			},
			selsChange: function (sels) {
			},
			//获取用户列表
			getSettings() {
				let para = {
					currentPage: this.pageIndex,
					pageSize:this.pageSize,
                    key: this.filters.key
				};
				para = Object.assign(para, this.filters);
				this.listLoading = true;
				NProgress.start();
				listSetting(para).then((body) => {
					this.listLoading = false;
					NProgress.done();
					if(body){
					 this.total = body.page.totalRows;
					 this.settings = body.list;
					}
				});
			},
			handleEdit(row){
				this.editForm = Object.assign({},row);
				this.editVisible = true;
			},
			editSubmit(row){
				this.$refs.editForm.validate((valid) => {
					if(valid){
						this.editLoading= true;
						this.editSettingId = row.id;
						this.editVisible = true;
						let para = {
							id:row.id
						};
						para = Object.assign(para,this.editForm);
                        editSetting(para).then((body) => {
                            if(body){
                                this.$message({
                                    message: '修改成功',
                                    type: 'success'
                                });
							}
							this.editLoading= false;
							this.editVisible = false;
							this.getSettings();
						});
					}
				});
			},
			handleAdd(){
				this.addForm={
                    key:null,
                    value:null,
                    description:null,
                    open:true
                };
                this.addVisible = true;
			},
			addSubmit(row){
				this.$refs.addForm.validate((valid) => {
					if(valid){
						this.addLoading  = true;
						let para = Object.assign({},this.addForm);
						addSetting(para).then((body) => {
                            if(body){
                                this.$message({
                                    message: '修改成功',
                                    type: 'success'
                                });
                            }
							this.addLoading = false;
							this.addVisible = false;
							this.getSettings();
						});
					}
				});
			},
            handleDelete(id){
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    deleteSetting({id: id}).then((body) => {
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.addLoading = false;
                        this.addVisible = false;
                        this.getSettings();
                    });
                })
			}
		},
		mounted() {
			this.getSettings();
		},
		computed:{
			editOprt:function(){
				return !util.hasOprt(this,'admin.setting.edit');
			},
			deleteOprt:function(){
				return !util.hasOprt(this,'admin.setting.delete');
			},
			addOprt:function(){
				return !util.hasOprt(this,'admin.setting.add');
			}
		}
	}

</script>

<style scoped>
</style>