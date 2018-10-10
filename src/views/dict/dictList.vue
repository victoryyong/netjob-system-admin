<template>
  <section style="margin-top:20px;">
   <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-button type="primary" :disabled="addOprt" @click="handleAdd(null)">新增字典</el-button>
    </el-col>
    <dict-tree :columns="columns" :tree-structure="true" :data-source="dicts" :expend-nodes="expends"  v-on:showEdit="handleEdit" v-on:handleDel="handleDel" v-on:handleAdd="handleAdd"></dict-tree>
    
    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="字典类型" prop="type" v-if="showType">
          <el-input v-model="editForm.type"></el-input>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input v-model="editForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="值" prop="sort" v-if="showValue">
          <el-input v-model="editForm.value"></el-input>
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
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="字典类型" prop="type" v-if="showType">
          <el-input v-model="addForm.type"></el-input>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input v-model="addForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="值" prop="value" v-if="showValue">
          <el-input v-model="addForm.value"></el-input>
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
  import dictTree from './dictTree';
  import NProgress from 'nprogress';
  import axios from 'axios';
  import { listDict,addDict,editDict,deleteDict} from '../../api/api';


  export default {
    data() {
      return {
          dicts: [],
          showType:true,
          showValue:true,
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
            type: [
            { required: true, message: '请输入类型', trigger: 'blur' }
            
          ],
            value: [
                { required: true, message: '请输入值', trigger: 'blur' }

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
            value:'',
            sort:'0',
            parentId:''
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' }
            
          ],
            type: [
            { required: true, message: '请输入类型', trigger: 'blur' }
            
          ],
            value: [
                { required: true, message: '请输入值', trigger: 'blur' }

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
            type:'',
            sort:'0',
            parentId:''
        },
        columns: [
          {  
            text: '名称',
            dataIndex: 'name'
          },  
          {  
            text: '类型',
            dataIndex: 'type'
          },  
          {  
            text: '排序号',
            dataIndex: 'sort'
          },
          {  
            text: '值',
            dataIndex: 'value'
          }
        ],  
        dataSource: [  
           
        ]
      }
    },
    methods: {
     handleCurrentChange(val) {
        this.currentPage = val;
        this.getDicts();
      },
      //显示编辑界面
      handleEdit: function (level,row,expendIds) {
          this.expends=expendIds;
          this.editFormRules.type[0].required = true;
          this.editFormRules.value[0].required = true;
          if(level==0){
              this.editFormRules.type[0].required = true;
              this.editFormRules.value[0].required = false;
              this.showType = true;
              this.showValue = false;
          }else if(level==1){
              this.editFormRules.type[0].required = false;
              this.editFormRules.value[0].required = true;
              this.showType = false;
              this.showValue = true;
          }
        this.expends=expendIds;
        this.editForm = Object.assign({}, row);
        this.editForm.sort=this.editForm.sort+'';
        this.editForm.children = null;
        this.editFormVisible = true;
      },
      //显示新增界面
      handleAdd: function (parentId,level,expendIds) {
         //新增界面数据
       this.addForm = {
           name:'',
           value:'',
           sort:'0'
       };
          this.expends=expendIds;
          this.addFormRules.type[0].required = true;
          this.addFormRules.value[0].required = true;
          this.addForm.parentId=parentId;
          if(level==0){
              this.showType=false;
              this.showValue=true;
              this.addFormRules.type[0].required = false;
              this.addFormRules.value[0].required = true;
          }else if(level==1){
              this.$message({
                  message: '不能添加下级元素',
                  type: 'warning'
              });
              return;
          }else{
              this.showType=true;
              this.showValue=false;
              this.addFormRules.type[0].required = true;
              this.addFormRules.value[0].required = false;
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
          let para = { id: id,currentPage:this.pageIndex,pageSize:this.pageSize };
          deleteDict(para).then((body) => {
            this.listLoading = false;
            NProgress.done();
            if(body){
              this.$message({
                message: '删除成功',
                type: 'success'
              });
                this.expends=expendIds;
              this.getDicts();
            }
          });
        }).catch(() => {

        });
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              NProgress.start();
              let para = Object.assign({}, this.editForm);
              editDict(para).then((body) => {
                this.editLoading = false;
                NProgress.done();
                if(body){
                  this.$message({
                    message: '提交成功',
                    type: 'success'
                  });
                  this.$refs['editForm'].resetFields();
                  this.editFormVisible = false;
                  this.getDicts();
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
              addDict(para).then((body) => {
                this.addLoading = false;
                NProgress.done();
                if(body){
                  this.$message({
                    message: '提交成功',
                    type: 'success'
                  });
                  this.$refs['addForm'].resetFields();
                  this.addFormVisible = false;
                  this.getDicts();
                }
              });
            });
          }
        });
      },
      //获取权限列表
      getDicts() {
        this.listLoading = true;
        NProgress.start();
        let para = {
           currentPage: this.currentPage,
           pageSize:this.pageSize
        };
        listDict(para).then((body) => {
          this.listLoading = false;
          NProgress.done();
          if(body){
           this.dicts = body.list;
           this.total = body.page.totalRows;
          }
        });
      }
    },
    mounted() {
      this.getDicts();
    },
    computed:{
      addOprt:function(){
        return !util.hasOprt(this,'admin.dict.add');
      }
    },
    components: {  
      dictTree
    } 
  }

</script>