<template>
  <section style="margin-top:20px;">
   <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-button type="primary" :disabled="addOprt" @click="handleAdd(null)">新增一级菜单</el-button>
    </el-col>
    <tree-grid :columns="columns" :tree-structure="true" :data-source="perms" :expend-nodes="expends"  v-on:showEdit="handleEdit" v-on:handleDel="handleDel" v-on:handleAdd="handleAdd"></tree-grid>
    
    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="权限名" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="权限码" prop="code" v-if="showCode">
          <el-input v-model="editForm.code"></el-input>
        </el-form-item>
        <el-form-item label="级别" prop="level" v-if="showLevel">
          <el-select v-model="editForm.level" placeholder="请选择">
          <el-option
            v-for="item in levels"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="showIcon">
          <i :class="editForm.icon"></i>
          <el-select v-model="editForm.icon"  placeholder="请选择">
            <el-option
                    v-for="item in icons"
                    :key="item.index"
                    :label="item.value"
                    :value="item.value">
              <span style="float: left"><i :class="item.value"></i>  {{ item.value }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="status">
          <el-select v-model="editForm.type" :disabled="editForm.selectDisabled" placeholder="请选择" >
          <el-option
            v-for="item in types"
            :key="item.value"
            :label="item.text"
            :disabled="item.disabled"
            :value="item.value">
          </el-option>
          </el-select>
        </el-form-item>
         <el-form-item label="路由" prop="url" v-if="showUrl">
          <el-input v-model="editForm.url"></el-input>
        </el-form-item>
          <el-form-item label="排序号" prop="sort">
          <el-input v-model="editForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio class="radio" :label="0" >屏蔽</el-radio>
            <el-radio class="radio" :label="1">激活</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description" >
          <el-input type="textarea" v-model="editForm.description"></el-input>
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
        <el-form-item label="权限名" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="权限码" prop="code" v-if="showCode">
          <el-input v-model="addForm.code"></el-input>
        </el-form-item>
        <el-form-item label="级别" prop="level" v-if="showLevel">
          <el-select v-model="addForm.level" placeholder="请选择">
          <el-option
            v-for="item in levels"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="showIcon">
          <i :class="addForm.icon"></i>
          <el-select v-model="addForm.icon"  placeholder="请选择">
            <el-option
                    v-for="item in icons"
                    :key="item.index"
                    :label="item.value"
                    :value="item.value">
              <span style="float: left"><i :class="item.value"></i>  {{ item.value }}</span>
            </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="status">
          <el-select v-model="addForm.type" :disabled="addForm.selectDisabled" placeholder="请选择" v-on:change="handeChange">
          <el-option
            v-for="item in types"
            :key="item.value"
            :label="item.text"
            :disabled="item.disabled"
            :value="item.value">
          </el-option>
          </el-select>
        </el-form-item>
          <el-form-item label="路由" prop="url" v-if="showUrl">
          <el-input v-model="addForm.url"></el-input>
        </el-form-item>
          <el-form-item label="排序号" prop="sort">
          <el-input v-model="addForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio class="radio" :label="0" >屏蔽</el-radio>
            <el-radio class="radio" :label="1">激活</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description" >
          <el-input type="textarea" v-model="addForm.description"></el-input>
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
  import treeGrid from './treeGrid';
  import NProgress from 'nprogress';
  import icon from '../../assets/iconfont/icons';
  import { listPerm,addPerm,deletePerm,editPerm} from '../../api/api';


  export default {
    data() {
      return {
        filters: {
          name: ''
        },
        icons:[],
        showCode:true,
        showUrl:true,
        showLevel:true,
        showIcon:true,
        perms: [],
        types:[
          {
             text:'一级菜单',
             value:1 ,
             disabled:false
          },{
             text:'二级菜单',
             value:2 ,
             disabled:false
          },{
             text:'操作权限',
             value:3 ,
             disabled:false
          }
        ],
        levels:[
	         {
	             text:'系统级别',
	             value:1 
	          },{
	             text:'代理级别',
	             value:2 
	          }
        ],
        total: 0,
        currentPage: 1,
        pageSize: 20,
        listLoading: false,
          expends:[],
        sels: [],//列表选中列

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' }
            
          ],
          code: [
            { required: true, message: '请输入权限码', trigger: 'blur' }
            
          ],
          url: [
            { required: true, message: '请输入路由', trigger: 'blur' }
            
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
          code:'',
          icon:'',
          type:1,
          status:0,
          sort:'10',
          selectDisabled:true
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' }
            
          ],
          code: [
            { required: true, message: '请输入权限码', trigger: 'blur' }
            
          ],
          url: [
            { required: true, message: '请输入路由', trigger: 'blur' }
            
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
          code:'',
          type:1,
          level:1,
          status:0,
          icon:'',
          parentId:null,
          sort:'10',
          url:'',
          selectDisabled:true
        },
        columns: [  
          {  
            text: '权限名',  
            dataIndex: 'name',
            with:''
          },  
          {  
            text: '权限码',  
            dataIndex: 'code'  
          },  
          {  
            text: '类型',  
            dataIndex: 'type'  
          },  
          {  
            text: '路由',  
            dataIndex: 'url'  
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
        this.getPerms();
      },
      //显示编辑界面
      handleEdit: function (index,row,expendIds) {
        this.editForm={
          name:'',
          code:'',
          type:1,
          status:0,
          sort:'10',
          selectDisabled:true
        }
          this.expends=expendIds;
        this.editFormRules.url[0].required = true;
        this.editFormRules.code[0].required = true;
        this.showLevel=false;
        if(row.type==1){
          this.editFormRules.code[0].required = false;
          this.showCode = false;
          this.showUrl = false;
          this.showLevel=true;
          this.showIcon = true;
           this.editFormRules.url[0].required = false;
        }else if(row.type==2){
          this.editFormRules.code[0].required = false;
          this.showCode = false;
          this.showUrl = true;
          this.showIcon = true;
        }else if(row.type==3){
          this.showCode = true;
          this.showUrl = false;
          this.showIcon = false;
          this.editFormRules.url[0].required = false;
        }
        this.editForm = Object.assign({}, row);
        this.editForm.sort=this.editForm.sort+'';
        this.editForm.selectDisabled=true;
        this.editFormVisible = true;
      },
      //显示新增界面
      handleAdd: function (parentId,type,expendIds) {
       this.addFormRules.url[0].required = true;
       this.addFormRules.code[0].required = true;
         //新增界面数据
       this.addForm = {
          name:'',
          code:'',
          type:1,
          level:1,
          status:0,
          sort:'10',
          url:'',
          parentId:parentId,
          selectDisabled:true
        };
          this.expends=expendIds;
          this.showLevel = false;
        if(type==1){
          this.types[0].disabled=true;
          this.addForm.type=2;
          this.addForm.selectDisabled = false;
          this.addFormRules.code[0].required = false;
          this.showCode = false;
          this.showUrl = true;
          this.showIcon = true;
        }else if(type==2){
          this.types[0].disabled=true;
          this.types[1].disabled=true;
          this.addForm.type=3;
          this.addForm.selectDisabled = false;
          this.addFormRules.url[0].required = false;
          this.showCode = true;
          this.showUrl = false;
          this.showIcon = false;
        }else if(type==3){
          this.$message({
            message: '操作权限不能添加下级元素',
            type: 'warning'
          }); 
          return;
        }else{
          this.addFormRules.code[0].required = false;
          this.addFormRules.url[0].required = false;
          this.types[0].disabled=false;
          this.types[1].disabled=false;
          this.showCode = false;
          this.showLevel=true;
          this.showUrl = false;
          this.showIcon = true;
        }
        this.addFormVisible = true;
      },
      //删除
      handleDel: function (id,expendIds) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          NProgress.start();
          let para = { permissionId: id };
          deletePerm(para).then((body) => {
            this.listLoading = false;
            NProgress.done();
            if(body){
              this.$message({
                message: '删除成功',
                type: 'success'
              });
                this.expends=expendIds;
              this.getPerms();
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
            this.$refs[addForm].url.hidden = true;
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
              para.createDate=null;
              para.children=null;
              editPerm(para).then((body) => {
                this.editLoading = false;
                NProgress.done();
                if(body){
                  this.$message({
                    message: '提交成功',
                    type: 'success'
                  });
                  this.$refs['editForm'].resetFields();
                  this.editFormVisible = false;
                  this.getPerms();
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
              para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
              addPerm(para).then((body) => {
                this.addLoading = false;
                NProgress.done();
                if(body){
                  this.$message({
                    message: '提交成功',
                    type: 'success'
                  });
                  this.$refs['addForm'].resetFields();
                  this.addFormVisible = false;
                  this.getPerms();
                }
              });
            });
          }
        });
      },
      //获取权限列表
      getPerms() {
        this.listLoading = true;
        NProgress.start();
        let para = {
           currentPage: this.currentPage,
           pageSize:this.pageSize
        };
        listPerm(para).then((body) => {
          this.listLoading = false;
          NProgress.done();
          if(body){
           this.perms = body.list;
           this.total = body.page.totalRows;
          }
        });
      }
    },
    mounted() {
      this.getPerms();
      this.icons = icon;
    },
    computed:{
      addOprt:function(){
        return !util.hasOprt(this,'admin.permission.add');
      }
    },
    components: {  
      treeGrid
    } 
  }

</script>

<style scoped>

</style>