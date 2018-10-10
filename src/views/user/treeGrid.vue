<template>
<section>
  <el-table  
    :data="data"  
    stripe  
    style="width: 100%"  
    :row-style="showTr">
      <el-table-column v-for="(column, index) in columns" :key="column.dataIndex"
      :label="column.text" :width="index===0?'190px':''">
      <template scope="scope">  
        <span v-if="spaceIconShow(index)" v-for="(space, levelIndex) in scope.row._level" class="ms-tree-space"></span>  
        <button class="button is-outlined is-primary is-small" v-if="toggleIconShow(index,scope.row)" @click="toggle(scope.$index)">  
          <i v-if="!scope.row._expanded" class="el-icon-caret-right" aria-hidden="true"></i>  
          <i v-if="scope.row._expanded" class="el-icon-caret-bottom" aria-hidden="true"></i>
        </button>
        <i v-if="scope.row.icon&&index===0" :class="scope.row.icon" aria-hidden="true"></i>
        <span v-else-if="index===0" class="ms-tree-space"></span>  
        {{scope.row[column.dataIndex]|columnFilter(column.dataIndex)}}  
      </template>  
    </el-table-column>  
    <el-table-column label="操作" v-if="treeType === 'normal'" width="220">
      <template scope="scope">  
        <el-button  :disabled="editOprt" @click="showEdit(scope.$index, scope.row)" class="el-button el-button--default el-button--small">  
            编辑  
        </el-button >  
        <el-button  
          size="small"  
          type="danger"
          :disabled="deleteOprt"   
          @click="handleDel(scope.row.id,scope.row)">
          删除  
        </el-button>  
        <el-button  :disabled="addOprt" @click="handleAdd(scope.row.id,scope.row.type,scope.row)" class="el-button el-button--success el-button--small">
            添加下级
        </el-button>  
      </template>  
    </el-table-column>  
  </el-table>  
  </section>
</template>  
<script>
  import Vue from 'vue'; 
  import moment from '../../common/js/moment';
  import util from '../../common/js/util';
  export default {  
    name: 'tree-grid',  
    props: {  
// 该属性是确认父组件传过来的数据是否已经是树形结构了，如果是，则不需要进行树形格式化  
      treeStructure: {  
        type: Boolean,  
        default: function () {  
          return false  
        }  
      },
        //默认展开项
      expendNodes:{
          type: Array,
          default: function () {
              return []
          }
      },
      expendDeep:{
            type: String,
            default: function () {
                return ''
            }
        },
// 这是相应的字段展示  
      columns: {  
        type: Array,  
        default: function () {  
          return []  
        }  
      },
// 这是数据源  
      dataSource: {  
        type: Array,  
        default: function () {  
          return []  
        }  
      },  
// 这个作用是根据自己需求来的，比如在操作中涉及相关按钮编辑，删除等，需要向服务端发送请求，则可以把url传过来  
      requestUrl: {  
        type: String,  
        default: function () {  
          return ''  
        }  
      },  
      // 删除方法
      deleteUrl: {  
        type: String,  
        default: function () {  
          return ''  
        }  
      },  
// 这个是是否展示操作列  
      treeType: {  
        type: String,  
        default: function () {  
          return 'normal'  
        }  
      },  
// 是否默认展开所有树  
      defaultExpandAll: {  
        type: Boolean,  
        default: function () {  
          return false  
        }  
      }  
    },  
    data () {  
      return {
      	dialogVisible: true,
        isInit:true
      }  
    },  
    computed: {  
    // 格式化数据源  
      data: function () {  
        let me = this
        if (me.treeStructure) {
            console.log(me.isInit);
          let data = DataTransfer.treeToArray(me.dataSource, null, null, me.defaultExpandAll,me.expendNodes,me.isInit);
          return data
        }  
        return me.dataSource  
      },
      addOprt:function(){
        return !util.hasOprt(this,'admin.permission.add');
      },
      editOprt:function(){
        return !util.hasOprt(this,'admin.permission.edit');
      },
      deleteOprt:function(){
        return !util.hasOprt(this,'admin.permission.delete');
      } 
    },  
    methods: {
     showEdit:function(index,row){
         let expendNode = '';
         let expendDeep = '';
         if(row._parent){
             expendNode = row._parent.id;
             if(row._parent._parent){
                 expendDeep = row._parent._parent.id;
             }
         }
        this.isInit=true;
        this.$emit('showEdit',index,row,[expendNode,expendDeep]);
     },
     handleAdd:function(parentId,type,row){
         let expendNode = '';
         let expendDeep = '';
         if(row._parent){
             expendNode = row._parent.id;
             if(row._parent._parent){
                 expendDeep = row._parent._parent.id;
             }
         }
        this.isInit=true;
        this.$emit('handleAdd',parentId,type,[expendNode,expendDeep,parentId]);
     },
    // 显示行  
      showTr: function (row, index) {  
        let show = (row._parent ? (row._parent._expanded && row._parent._show) : true)  
        row._show = show  
        return show ? '' : 'display:none;'  
      },  
    // 展开下级  
      toggle: function (trIndex) {
        let me = this;
        this.isInit=false;
        let record = me.data[trIndex]
        record._expanded = !record._expanded
      },  
    // 显示层级关系的空格和图标  
      spaceIconShow (index) {  
        let me = this  
        if (me.treeStructure && index === 0) {  
          return true  
        }  
        return false  
      },  
    // 点击展开和关闭的时候，图标的切换  
      toggleIconShow (index, record) {  
        let me = this  
        if (me.treeStructure && index === 0 && record.children && record.children.length > 0) {  
          return true  
        }  
        return false  
      },  
      handleDel (id,row) {
          let expendNode = '';
          let expendDeep = '';
          if(row._parent){
              expendNode = row._parent.id;
              if(row._parent._parent){
                  expendDeep = row._parent._parent.id;
              }
          }
        this.isInit=true;
        this.$emit('handleDel',id,[expendNode,expendDeep]);
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      }
    },
    filters:{
      columnFilter:function(value,column){
        if(column=='createDate'){
          return dateFormat(value)
        }else if(column=='status'){
          return statusFormat(value);
        }else if(column=='type'){
          return typeFormat(value);
        }else{
          return value;
        }
      }
    }
  }  
  
  
  
function DataTransfer (data) {  
  if (!(this instanceof DataTransfer)) {  
    return new DataTransfer(data, null, null)  
  }  
}  
//时间格式化 
function dateFormat(time) { 
  return moment(time).format("YYYY-MM-DD HH:mm:ss"); 
}
//状态格式化 
function statusFormat(value) { 
   if (value == 0) { 
     return "屏蔽"; 
   }else if(value == 1) {
     return "激活"; 
   }
}
function typeFormat(value) { 
   if (value == 1) { 
     return "一级菜单"; 
   }else if(value == 2) {
     return "二级菜单"; 
   }else if(value == 3) {
     return "操作权限"; 
   }
}   
  
DataTransfer.treeToArray = function (data, parent, level, expandedAll,expendNodes,isInit) {
  let tmp = []  ;
  Array.from(data).forEach(function (record) {  
    if (record._expanded === undefined) {  
      Vue.set(record, '_expanded', expandedAll)  
    }
    if(isInit){
        if (expendNodes) {
            for (var i=0;i<expendNodes.length;i++){
                if(record.id==expendNodes[i]){
                    Vue.set(record, '_expanded', true);
                }
            }
        }
    }
      if (parent) {
      Vue.set(record, '_parent', parent)  
    }  
    let _level = 0  
    if (level !== undefined && level !== null) {  
      _level = level + 1  
    }  
    Vue.set(record, '_level', _level)  
    tmp.push(record)  
    if (record.children && record.children.length > 0) {  
      let children = DataTransfer.treeToArray(record.children, record, _level, expandedAll,expendNodes,isInit)
      tmp = tmp.concat(children)  
    }  
  })  
  return tmp  
}
  
</script>  
<style scoped>  
  .ms-tree-space{position: relative;  
    top: 1px;  
    display: inline-block;  
    font-family: 'Glyphicons Halflings';  
    font-style: normal;  
    font-weight: 400;  
    line-height: 1;  
    width: 18px;  
    height: 14px;}  
  .ms-tree-space::before{content: ""}  
  table td{  
    line-height: 26px;  
  }  
</style>  