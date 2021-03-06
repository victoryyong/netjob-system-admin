import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import UserList from './views/user/userList.vue'
import RoleList from './views/user/roleList.vue'
import PermList from './views/user/permList.vue'
import LogList from './views/log/logList.vue'
import BannerList from './views/banner/bannerList.vue'
import MenuList from './views/menu/menuList.vue'
import SettingList from './views/setting/settingList.vue'
import DictList from './views/dict/dictList.vue'
import DemandAuthList from './views/authc/demandAuthList.vue'
import ServeAuthList from './views/authc/serveAuthList.vue'
import BrandAuthList from './views/authc/brandAuthList.vue'
import PersonAuthList from './views/authc/personAuthList.vue'
import CompanyAuthList from './views/authc/companyAuthList.vue'
import AuthList from './views/authc/authList.vue'
import DemandList from './views/serve/demandList.vue'
import ServeList from './views/serve/serveList.vue'
import MemberList from './views/member/memberList.vue'
import JobTaskList from './views/jobTask/jobTaskList.vue'



let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/userList', component: UserList, name: '用户管理' },
            { path: '/roleList', component: RoleList, name: '角色管理' },
            { path: '/permList', component: PermList, name: '权限管理' },
            { path: '/logList', component: LogList, name: '日志管理' },
            { path: '/dictList', component: DictList, name: '字典管理' },
            { path: '/jobTaskList', component: JobTaskList, name: '定时管理' },
            { path: '/settingList', component: SettingList, name: '系统设置' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '审核管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/demandAuthList', component: DemandAuthList, name: '需求审核' },
            { path: '/serveAuthList', component: ServeAuthList, name: '服务审核' },
            { path: '/brandAuthList', component: BrandAuthList, name: '品牌秀审核' },
            { path: '/personAuthList', component: PersonAuthList, name: '个人审核' },
            { path: '/companyAuthList', component: CompanyAuthList, name: '个人审核' },
            { path: '/authList', component: AuthList, name: '审核记录' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '菜单管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/menuList', component: MenuList, name: '菜单管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '广告管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/bannerList', component: BannerList, name: '广告管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '需求管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/demandList', component: DemandList, name: '需求管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '服务管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/serveList', component: ServeList, name: '服务管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '会员管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/memberList', component: MemberList, name: '服务管理' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;