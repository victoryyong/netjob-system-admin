<template>
  <section style="margin-top:20px;">
   <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-button type="primary" :disabled="addOprt" @click="handleAdd(null)">新增类型</el-button>
    </el-col>
    <menu-tree :columns="columns" :tree-structure="true" :data-source="menus" :expend-nodes="expends"  v-on:showEdit="handleEdit" v-on:handleDel="handleDel" v-on:handleAdd="handleAdd"></menu-tree>
    
    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="图片">
          <div style="width:80px;height:80px">
            <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-error="afterError"
                    :on-success="afterSuccess"
                    :before-upload="beforeUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="类型名" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="是否热门" prop="hot">
          <el-radio-group v-model="editForm.hot">
            <el-radio class="radio" :label=true >是</el-radio>
            <el-radio class="radio" :label=false>否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input v-model="editForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="hot">
          <el-radio-group v-model="editForm.status">
            <el-radio class="radio" :label=1 >激活</el-radio>
            <el-radio class="radio" :label=0>屏蔽</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="图片">
          <div style="width:80px;height:80px">
            <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-error="afterError"
                    :on-success="afterSuccess"
                    :before-upload="beforeUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i  v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="是否热门" prop="hot">
          <el-radio-group v-model="addForm.hot">
            <el-radio class="radio" :label=true >是</el-radio>
            <el-radio class="radio" :label=false>否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序号码" prop="sort">
          <el-input v-model="addForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="hot">
          <el-radio-group v-model="addForm.status">
            <el-radio class="radio" :label=1 >激活</el-radio>
            <el-radio class="radio" :label=0>屏蔽</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
      </el-pagination>
    </el-col>
  </section>
</template>

<script>
  import util from '../../common/js/util';
  import menuTree from './menuTree';
  import NProgress from 'nprogress';
  import axios from 'axios';
  import { listMenu,addMenu,editMenu,deleteMenu} from '../../api/api';


  export default {
    data() {
      return {
        filters: {
          name: ''
        },
          imageUrl:'',
          uploadUrl:'',
          menus: [],

        total: 0,
        currentPage: 1,
        pageSize: 10,
        listLoading: false,
          expends:[],
        editFormVisible: false,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' }
            
          ],
            icon: [
            { required: true, message: '请输入权限码', trigger: 'blur' }
            
          ],
          sort: [
            { required: true,message: '请输入排序号', trigger: 'blur' },
            { validator:(rule,value,callback)=>{
              try{
                if(/^[0-9]*[1-9][0-9]*$/.test(value) == false){
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
        //编辑界面数据
        editForm: {
            name:'',
            icon:'',
            sort:'0',
            hot:false,
            status:0
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' }
            
          ],
            icon: [
            { required: true, message: '请输入权限码', trigger: 'blur' }
            
          ],
          sort: [
            { required: true,message: '请输入排序号', trigger: 'blur' },
            { validator:(rule,value,callback)=>{
                if(/^[0-9]*[1-9][0-9]*$/.test(value) == false){
                    callback(new Error("请输入正整数"));
                }else{
                    callback();
                }},trigger: 'blur' }
          ]
        },
        //新增界面数据
        addForm: {
          name:'',
            icon:'',
            sort:'0',
            hot:false,
            status:0
        },
        columns: [
          {  
            text: '类型名',
            dataIndex: 'name'
          },  
          {  
            text: '点击数',
            dataIndex: 'clicks'
          },  
          {  
            text: '排序号',
            dataIndex: 'sort'
          },
          {  
            text: '状态',  
            dataIndex: 'status'  
          }
        ],  
        dataSource: [  
           
        ]
      }
    },
    methods: {
     handleCurrentChange(val) {
        this.currentPage = val;
        this.getMenus();
      },
      //显示编辑界面
      handleEdit: function (index,row,expendIds) {
          this.expends=expendIds;
          this.imageUrl = row.icon;
          let token  = localStorage.getItem('token');
          axios.post('admin/abcdef?token='+token)
              .then(res => {
                  let data = res.data;
                  if (data.code == -403) {
                      if (data.body) {
                          localStorage.setItem('token', data.body);
                          this.uploadUrl = "admin/menu/uploadImage?token="+token;
                      } else {
                          this.$message({
                              message: data.message,
                              type: 'error'
                          });
                          vm.$router.push('/login');
                      }
                  } else if (data.code == -406) {
                      this.uploadUrl = "admin/menu/uploadImage?token="+token;
                  } else {
                      this.$message({
                          message: data.message,
                          type: 'error'
                      });
                      return null;
                  }
              }).catch(err => {
              console.log(err);
              this.$message({
                  message: '系统错误，请联系管理员',
                  type: 'error'
              });
          });
        this.editForm = Object.assign({}, row);
        this.editForm.sort=this.editForm.sort+'';
        this.editForm.children = null;
        this.editFormVisible = true;
      },
      //显示新增界面
      handleAdd: function (parentId,type,expendIds) {
         //新增界面数据
       this.addForm = {
           name:'',
           icon:'',
           sort:'0',
           hot:false,
           parentId:parentId,
           status:0
        };
          this.expends=expendIds;
          this.imageUrl = null;
          let token  = localStorage.getItem('token');
          axios.post('admin/abcdef?token='+token)
              .then(res => {
                  let data = res.data;
                  if (data.code == -403) {
                      if (data.body) {
                          localStorage.setItem('token', data.body);
                          this.uploadUrl = "admin/menu/uploadImage?token="+token;
                      } else {
                          this.$message({
                              message: data.message,
                              type: 'error'
                          });
                          vm.$router.push('/login');
                      }
                  } else if (data.code == -406) {
                      this.uploadUrl = "admin/menu/uploadImage?token="+token;
                  } else {
                      this.$message({
                          message: data.message,
                          type: 'error'
                      });
                      return null;
                  }
              }).catch(err => {
              console.log(err);
              this.$message({
                  message: '系统错误，请联系管理员',
                  type: 'error'
              });
          });
        this.addFormVisible = true;
      },
      //删除
      handleDel: function (id,expendIds) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          NProgress.start();
          let para = { permissionId: id,currentPage:this.pageIndex,pageSize:this.pageSize };
          deleteMenu(para).then((body) => {
            this.listLoading = false;
            NProgress.done();
            if(body){
              this.$message({
                message: '删除成功',
                type: 'success'
              });
                this.expends=expendIds;
              this.getMenus();
            }
          });
        }).catch(() => {

        });
      },
      handeChange:function(type){
       this.addFormRules.url[0].required = true;
       this.addFormRules.code[0].required = true;
        if(type==2){
          this.addFormRules.code[0].required = false;
        }else if(type==3){
          this.addFormRules.url[0].required = false;
        }
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              NProgress.start();
              let para = Object.assign({}, this.editForm);
              editMenu(para).then((body) => {
                this.editLoading = false;
                NProgress.done();
                if(body){
                  this.$message({
                    message: '提交成功',
                    type: 'success'
                  });
                  this.$refs['editForm'].resetFields();
                  this.editFormVisible = false;
                  this.getMenus();
                }
              });
            });
          }
        });
      },
      //新增
      addSubmit: function () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.addLoading = true;
              NProgress.start();
              let para = Object.assign({}, this.addForm);
              addMenu(para).then((body) => {
                this.addLoading = false;
                NProgress.done();
                if(body){
                  this.$message({
                    message: '提交成功',
                    type: 'success'
                  });
                  this.$refs['addForm'].resetFields();
                  this.addFormVisible = false;
                  this.getMenus();
                }
              });
            });
          }
        });
      },
      //获取权限列表
      getMenus() {
        this.listLoading = true;
        NProgress.start();
        let para = {
           currentPage: this.currentPage,
           pageSize:this.pageSize
        };
        listMenu(para).then((body) => {
          this.listLoading = false;
          NProgress.done();
          if(body){
           this.menus = body.list;
           this.total = body.page.totalRows;
          }
        });
      },
        beforeUpload(){

        },
        afterSuccess(data){
            if(data.code==200){
                this.editForm.icon = data.body;
                this.addForm.icon = data.body;
                this.imageUrl = data.body;
            }else if(data.code==-403){
                vm.$router.push('/login');
            }else{
                this.$message({
                    message: data.message,
                    type: 'success'
                });
            }
        },
        afterError(error){
            alert(error);
        }
    },
    mounted() {
      this.getMenus();
    },
    computed:{
      addOprt:function(){
        return !util.hasOprt(this,'admin.menu.add');
      }
    },
    components: {  
      menuTree
    } 
  }

</script>

<style scoped>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
  }
  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>