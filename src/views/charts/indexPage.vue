<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="6"><div style="font-size:14px;font-weight:bold">{{month}}月会员注册数统计</div></el-col>
            <el-col :span="6" :offset="4">
                <el-button type="info" @click="registerDetail">详情</el-button>
            </el-col>
            <el-col :span="12">
                <div id="chartLine" style="width:100%; height:500px;"></div>
            </el-col>
            <el-col :span="6"><div style="font-size:14px;font-weight:bold">工单列表</div></el-col>
            <el-col :span="12">
                <div id="chartBar" style="width:100%; height:500px;">
                    <!--列表-->
                    <el-table :data="notices" highlight-current-row style="width: 100%;">
                        <el-table-column prop="name" label="姓名">
                        </el-table-column>
                        <el-table-column prop="title" label="标题">
                        </el-table-column>
                        <el-table-column prop="type" label="类型" :formatter="typeFormat">
                        </el-table-column>
                        <el-table-column prop="status" label="状态" :formatter="ntStatusFormat">
                        </el-table-column>
                        <el-table-column prop="createDate" label="创建时间" :formatter="dateFormat">
                        </el-table-column>
                        <el-table-column label="操作" width="250">
                            <template scope="scope">
                                <el-button  size="small" :disabled="authcOprt" type="success" @click="successHandle(scope.row)">通过</el-button>
                                <el-button  size="small" :disabled="authcOprt" type="danger" @click="failHandle(scope.row)">不通过</el-button>
                                 <el-button  v-if="scope.row.type==1" size="small" type="info" @click="detailHandle(scope.row)">详情</el-button>
                            </template>
                    </el-table-column>
                    </el-table>
                    <!--工具条-->
                    <el-col :span="24" class="toolbar">
                        <el-pagination layout="prev, pager, next" @current-change="ntPageChange" :page-size="ntPageSize" :total="ntTotal" style="float:right;">
                        </el-pagination>
                    </el-col>
                </div>
            </el-col>
            <el-col :span="6"><div style="font-size:14px;font-weight:bold">{{month}}月会员充值记录统计</div></el-col>
            <el-col :span="6" :offset="4">
                <el-button type="info" @click="rechargeDetail">详情</el-button>
            </el-col>
            <el-col :span="12">
                <div id="chartColumn" style="width:100%; height:500px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="chartPie" style="width:100%; height:500px;"></div>
            </el-col>
        </el-row>

        <!--注册详情-->
        <el-dialog title="注册详情" v-model="registerVisible" :close-on-click-modal="false">
            <!--列表-->
            <el-table :data="members" highlight-current-row style="width: 100%;">
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
                <el-table-column prop="lastTime" label="最近访问时间" :formatter="dateFormat">
                </el-table-column>
                <el-table-column prop="address" label="最近访问地址" >
                </el-table-column>
                 -->
            </el-table>
            <!--工具条-->
            <el-col :span="24" class="toolbar">
                <el-pagination layout="prev, pager, next" @current-change="rgPageChange" :page-size="rgPageSize" :total="rgTotal" style="float:right;">
                </el-pagination>
            </el-col>
        </el-dialog>

        <!--充值记录-->
        <el-dialog title="充值记录" v-model="rechargeVisible" :close-on-click-modal="false">
            <!--列表-->
            <el-table :data="recharges" highlight-current-row style="width: 100%;">
               </el-table-column>
                <el-table-column prop="number" label="号码">
                </el-table-column>
                <el-table-column prop="memberName" label="姓名">
                </el-table-column>
                <el-table-column prop="mealName" label="套餐">
                </el-table-column>
                <el-table-column prop="money" label="充值金额（元）">
                </el-table-column>
                <el-table-column prop="createDate" label="充值时间" :formatter="dateFormat">
                </el-table-column>
                <el-table-column prop="address" label="充值地址">
                </el-table-column>
            </el-table>
            <!--工具条-->
            <el-col :span="24" class="toolbar">
                <el-pagination layout="prev, pager, next" @current-change="rcPageChange" :page-size="rcPageSize" :total="rcTotal" style="float:right;">
                </el-pagination>
            </el-col>
        </el-dialog>


        <!--详情界面-->
        <el-dialog title="详情" v-model="detailFormVisible" :close-on-click-modal="false" size="small">
            <el-form :model="detailForm" label-width="120px" ref="detailForm">
                <el-form-item label="面部图：" prop="face">
                    <img :src="detailForm.face" style="width:200px;height:200px"/>
                </el-form-item>
                <el-form-item label="名称：" prop="name">
                    {{detailForm.name}}
                </el-form-item>
                <el-form-item label="类型：" prop="phone">
                    {{detailForm.kind==2?'企业':'个人'}}
                </el-form-item>
                <el-form-item label="营业执照：" prop="phone" v-if="detailForm.kind==2">
                    {{detailForm.licence}}
                </el-form-item>
                <el-form-item label="身份证：" prop="idCard">
                    {{detailForm.idCard}}
                </el-form-item>
                <el-form-item label="身份证正面：" prop="face">
                    <img :src="detailForm.cardImage" style="width:300px;height:200px"/>
                </el-form-item>
                <el-form-item label="身份证反面：" prop="face">
                    <img :src="detailForm.cardReImage" style="width:300px;height:200px"/>
                </el-form-item>
                <el-form-item label="手机：" prop="phone">
                    {{detailForm.phone}}
                </el-form-item>
                <el-form-item label="邮箱：" prop="email">
                    {{detailForm.email}}
                </el-form-item>
                <el-form-item label="ip：" prop="ip">
                    {{detailForm.ip}}
                </el-form-item>
                <el-form-item label="地址：" prop="address">
                    {{detailForm.address}}
                </el-form-item>
            </el-form>
            </el-dialog>


        <!--失败原因-->
        <el-dialog title="失败原因" v-model="failFormVisible" :close-on-click-modal="false" size="tiny">
            <el-form :model="failForm" label-width="100px" ref="failForm" :rules="failFormRules">
            <el-form-item label="失败原因：" prop="reason">
                <el-input type="textarea" v-model="failForm.reason"></el-input>
            </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                    <el-button @click.native="failFormVisible = false">取消</el-button>
                    <el-button type="primary" @click.native="failSubmit" :loading="submitLoading">提交</el-button>
            </div>
        </el-dialog>


        <el-dialog title="审核意见" v-model="successFormVisible" :close-on-click-modal="false" size="tiny">
            <el-form :model="successForm" label-width="100px" ref="successForm" :rules="successFormRules">
            <el-form-item label="审核意见：" prop="reason">
                <el-input type="textarea" v-model="successForm.reason"></el-input>
            </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                    <el-button @click.native="successFormVisible = false">取消</el-button>
                    <el-button type="primary" @click.native="successSubmit" :loading="submitLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import echarts from 'echarts'
    import moment from '../../common/js/moment';
    import util from '../../common/js/util';
    import { registerData,listMember,rechargeData,listRecharge,listWorkNotice,authcLive,getMember,authcMember} from '../../api/api';


    export default {
        data() {
            return {
                month:null,
                startTime:null,
                endTime:null,
                chartColumn: null,
                chartBar: null,
                chartLine: null,
                chartPie: null,
                lineData:null,
                columnData:null,
                ratioData:null,
                notices:null,
                registerVisible:false,
                rechargeVisible:false,
                detailFormVisible:false,
                members:null,
                recharges:null,
                rgTotal:0,
                rcTotal:0,
                ntTotal:0,
                rgPageIndex:1,
                rcPageIndex:1,
                ntPageIndex:1,
                rgPageSize:10,
                rcPageSize:10,
                ntPageSize:10,
                failFormVisible:false,
                successFormVisible:false,
                memberId:null,
                detailForm:{

                },
                failForm:{

                },
                successForm:{

                },
                failFormRules:{
                    reason: [
                        { required: true, message: '请输入失败原因', trigger: 'blur' }
                        
                    ]
                },
                successFormRules:{
                    reason: [
                        { required: true, message: '请输入审核意见', trigger: 'blur' }
                        
                    ]
                },
                submitLoading:false
            }
        },

        methods: {
            rgPageChange(val) {
                this.rgPageIndex = val;
                this.getMembers();
            },
            rcPageChange(val) {
                this.rgPageIndex = val;
                this.getRecharges();
            },
            ntPageChange(val) {
                this.ntPageIndex = val;
                this.getNotices();
            },
            drawColumnChart() {
                this.chartColumn = echarts.init(document.getElementById('chartColumn'));
                 let dayList = [];
                let dataList = [];
                if(this.columnData.dayNum){
                    for(var i=1;i<=this.columnData.dayNum;i++){
                        dayList.push(i);
                    }
                }
                if(this.columnData.datas){
                    let dateStr = '';
                    let regDateStr='';
                    for(var i=1;i<=this.columnData.dayNum;i++){
                        let userNum = 0;
                        if(i<10){
                           dateStr = '0'+i;
                        }else{
                           dateStr = i+'';
                        }
                        this.columnData.datas.forEach((item)=>{
                            regDateStr = item.rechargeDate.substring(item.rechargeDate.lastIndexOf('-')+1);
                            if(regDateStr==dateStr){
                                userNum = item.userNum;
                                return;
                            }
                        });
                        dataList.push(userNum)
                    }
                }
                this.chartColumn.setOption({
                  //title: { text: 'Column Chart' },
                  tooltip: {},
                  xAxis: {
                      //data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
                      data:dayList
                  },
                  yAxis: {},
                  series: [{
                      name: '销量',
                      type: 'bar',
                      //data: [5, 20, 36, 10, 10, 20]
                      data:dataList
                    }]
                });
            },
            drawLineChart() {
                this.chartLine = echarts.init(document.getElementById('chartLine'));
                let dayList = [];
                let dataList = [];
                if(this.lineData.dayNum){
                    for(var i=1;i<=this.lineData.dayNum;i++){
                        dayList.push(i);
                    }
                }
                if(this.lineData.datas){
                    let dateStr = '';
                    let regDateStr='';
                    for(var i=1;i<=this.lineData.dayNum;i++){
                        let userNum = 0;
                        if(i<10){
                           dateStr = '0'+i;
                        }else{
                           dateStr = i+'';
                        }
                        this.lineData.datas.forEach((item)=>{
                            regDateStr = item.registerDate.substring(item.registerDate.lastIndexOf('-')+1);
                            if(regDateStr==dateStr){
                                userNum = item.userNum;
                                return;
                            }
                        });
                        dataList.push(userNum)
                    }
                }
                this.chartLine.setOption({
                    title: {
                        //text: this.month+'月会员注册数统计'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['注册会员数']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data:dayList
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            name: '数目',
                            type: 'line',
                            stack: '总量',
                           data:dataList
                        }
                    ]
                });
            },
            drawPieChart() {
                this.chartPie = echarts.init(document.getElementById('chartPie'));
                this.chartPie.setOption({
                    title: {
                        text: 'Pie Chart',
                        subtext: '纯属虚构',
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
                    },
                    series: [
                        {
                            name: '访问来源',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: [
                                { value: 335, name: '直接访问' },
                                { value: 310, name: '邮件营销' },
                                { value: 234, name: '联盟广告' },
                                { value: 135, name: '视频广告' },
                                { value: 1548, name: '搜索引擎' }
                            ],
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                });
            },
            registerDetail(){
                this.registerVisible = true;
                this.getMembers();
            },
            rechargeDetail(){
                this.rechargeVisible = true;
                this.getRecharges();
            },
            getMembers(){
                 listMember({currentPage:this.rgPageIndex,startTime:this.startTime,endTime:this.endTime}).then((body) => {
                    if(body){
                        this.rgTotal = body.page.totalRows;
                        this.members =  body.list;
                    }
                });
            },
            getRecharges(){
                 listRecharge({currentPage:this.rgPageIndex,startTime:this.startTime,endTime:this.endTime}).then((body) => {
                    if(body){
                        this.rcTotal = body.page.totalRows;
                        this.recharges =  body.list;
                    }
                });
            },
            getNotices(){
                listWorkNotice({currentPage:this.ntPageIndex,status:0}).then((body) => {
                    if(body){
                        this.ntTotal = body.page.totalRows;
                        this.notices = body.list;
                    }
                });
            },
            initDatas(){
                var m = moment();
                this.month = m.subtract(1, "months").format("YYYY-MM");
                this.startTime = m.startOf('month').format("YYYY-MM-DD");
                this.endTime = m.endOf('month').format("YYYY-MM-DD");
                registerData({startTime:this.startTime,endTime:this.endTime}).then((body) => {
                    if(body){
                        this.lineData = body;
                        this.drawLineChart();
                    }
                });
                rechargeData({startTime:this.startTime,endTime:this.endTime}).then((body) => {
                    if(body){
                        this.columnData = body;
                        this.drawColumnChart();
                    }
                });
                this.getNotices();
            } ,
            failHandle(row){
                //注册申请
                if(row.type==1){
                     this.failFormVisible = true;
                     this.memberId = row.objectId
                //申请直播
                }else if(row.type==2){
                   this.$confirm('确认审核不通过?确认后数据不可更改！', '提示', {
                                type: 'error'
                        }).then(() => {
                            let para = { liveIds: row.objectId,status:6 };
                            authcLive(para).then((body) => {
                                if(body){
                                    this.$message({
                                        message: '成功',
                                        type: 'success'
                                    });
                                    this.getNotices();
                                }
                            });
                        }).catch(() => {

                    });
                }
            },
            successHandle(row){
                //注册申请
                if(row.type==1){
                  this.submitLoading = false;
                  this.successFormVisible = true;
                  this.memberId = row.objectId
                //申请直播
                }else if(row.type==2){
                   this.$confirm('确认审核通过?确认后数据不可更改！', '提示', {
                                type: 'warning'
                        }).then(() => {
                            let para = { liveIds: row.objectId,status:1 };
                            authcLive(para).then((body) => {
                                if(body){
                                    this.$message({
                                        message: '成功',
                                        type: 'success'
                                    });
                                    this.getNotices();
                                }
                            });
                        }).catch(() => {

                    });
                }
            },
            failSubmit(){
                this.$refs.failForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('请确认审核不通过，确认后，数据不可更改。', '提示', {
                        type: 'warning'
                        }).then(() => { 
                                var ids = this.memberId;
                                let para = { memberIds: ids,status:5,reason:this.failForm.reason };
                                authcMember(para).then((body) => {
                                    this.failFormVisible = false;
                                    this.submitLoading = false;
                                    if(body){
                                        this.$message({
                                            message: '成功',
                                            type: 'success'
                                        });
                                        this.getNotices();
                                    }
                                });
                        }).catch(() => {

                        });
                    }
                });
            },
            successSubmit(){
                this.$refs.successForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('请确认审核通过，确认后，数据不可更改。', '提示', {
                        type: 'warning'
                        }).then(() => { 
                                var ids = this.memberId;
                                let para = { memberIds: ids,status:1,reason:this.successForm.reason };
                                authcMember(para).then((body) => {
                                    this.successFormVisible = false;
                                    this.submitLoading = false;
                                    if(body){
                                        this.$message({
                                            message: '成功',
                                            type: 'success'
                                        });
                                        this.getNotices();
                                    }
                                });
                        }).catch(() => {

                        });
                    }
                });
            },
             //时间格式化 
            detailHandle(row){
                this.memberId = row.objectId;
                getMember({id:memberId}).then((body) => {
                    if(body){
                        this.detailForm = body;
                        this.detailFormVisible = true;
                    }
                });
                
            },
            dateFormat:function(row, column) { 
                var date = row[column.property]; 
                if (date == undefined) { 
                    return ""; 
                } 
                return moment(date).format("YYYY-MM-DD"); 
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
            },
            typeFormat:function(row, column) { 
                var type = row[column.property]; 
                    if (type == 1) { 
                        return "注册"; 
                    }else if(type == 2) {
                        return "直播"; 
                    }else{
                        return "费率"; 
                }
          },
          ntStatusFormat:function(row, column) { 
                var status = row[column.property]; 
                if (status == 0) { 
                    return "未处理"; 
                }else if(status == 1) {
                    return "已处理"; 
                }
          }
        },

        mounted: function () {
            this.initDatas();
        },
        computed: {  
          authcOprt:function(){
            return !util.hasOprt(this,'admin.index.authc');
          }
        }
    }
</script>

<style scoped>
    .chart-container {
        width: 100%;
        float: left;
    }
    /*.chart div {
        height: 400px;
        float: left;
    }*/

    .el-col {
        padding: 10px 5px;
    }
</style>
