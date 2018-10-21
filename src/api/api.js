import axios from 'axios';

 let base = process.env.NODE_ENV === 'production' ? "admin" : "admin";

const sendpost = (url, arg) => {
    arg = arg || {};
    let token = localStorage.getItem('token');
    if (token) {
        arg.token = token;
    }

    var poststr = "1=1";
    for(var k in arg) {
        if(null!=arg[k])
        poststr += "&" + k + "=" + arg[k];
    }
    let promise = axios.post(`${base}/${url}`, poststr);
    return new Promise((resolve, reject) => {

        promise.then(res => {
            let data = res.data;
            if (data.code == 200) {
                data.body ? resolve(data.body) : resolve(data.message);
            } else if (data.code == -403) {
                if (data.body) {
                    localStorage.setItem('token', data.body);
                    //util.setCookie('token', data.body);
                    sendpost(url, arg).then(res => {
                        if (res) {
                           resolve(res); 
                        } else {
                           resolve(null);
                        }                       
                    });
                } else {
                    notifyError(data.message);
                    resolve(null);
                    vm.$router.push('/login');
                }
            } else if (data.code == -402 || data.code == -404) {
                notifyError(data.message);
                resolve(null);
                vm.$router.push('/login');
            } else {
                notifyError(data.message);
                resolve(null);
            }
        }).catch(err => {
            console.log(err);
            notifyError('系统错误，请联系管理员')
        });
    });
}

const exportpost = (url, arg) => {
    arg = arg || {};
    let token = localStorage.getItem('token');
    if (token) {
        arg.token = token;
    }

    var poststr = "1=1";
    for(var k in arg) {
        if(null!=arg[k])
        poststr += "&" + k + "=" + arg[k];
    }
    let promise = axios.post(`${base}/abcdef`, poststr);
    return new Promise((resolve, reject) => {

        promise.then(res => {
            let data = res.data;
           if (data.code == -403) {
                if (data.body) {
                    localStorage.setItem('token', data.body);
                    exportpost(url, arg).then(res => {
                        if (res) {
                           resolve(res); 
                        } else {
                           resolve(null);
                        }                       
                    });
                } else {
                    notifyError(data.message);
                    resolve(null);
                    vm.$router.push('/login');
                }
            } else if (data.code == -406) {
                    resolve(null);
                    window.location.href=`${base}`+"/"+url+"?"+poststr;
            } else {
                notifyError(data.message);
                resolve(null);
            }
        }).catch(err => {
            console.log(err);
            notifyError('系统错误，请联系管理员')
        });
    });
}

const freshpost = (url,arg) => {
    arg = {};
    let token = localStorage.getItem('token');
    if (token) {
        arg.token = token;
    }

    var poststr = "1=1";
    for(var k in arg) {
        if(null!=arg[k])
        poststr += "&" + k + "=" + arg[k];
    }
    axios.post(`${base}/abcdef`, poststr)
    .then(res => {
       let data = res.data;
       if (data.code == -403) {
            if (data.body) {
                localStorage.setItem('token', data.body);
                freshpost(url);
            } else {
                notifyError(data.message);
                resolve(null);
                vm.$router.push('/login');
            }
        } else if (data.code == -406) {
                console.log('123'+`${base}`+"/"+url+"?"+poststr);
                return `${base}`+"/"+url+"?"+poststr;
        } else {
            notifyError(data.message);
            return null;
        }
    }).catch(err => {
        console.log(err);
        notifyError('系统错误，请联系管理员')
    });
}
export const freshUrl = params => { return freshpost('user/uploadImage', params); };

export const userLogin = params => { return sendpost('login', params); };
export const listUser = params => { return sendpost('user/list', params); };
export const deleteUser = params => { return sendpost('user/delete', params); };
export const editUser = params => { return sendpost('user/edit', params); };
export const addUser = params => { return sendpost('user/add', params); };
export const authcUser = params => { return sendpost('user/authc', params); };
export const userRole = params => { return sendpost('user/userRole', params); };
export const userMenus = params => { return sendpost('user/menus', params); };
export const getUser = params => { return sendpost('user/getUser', params); };
export const changeUserPwd = params => { return sendpost('user/changePwd', params); };



export const listRole = params => { return sendpost('role/list', params); };
export const listAllRole = params => { return sendpost('role/listAll', params); };
export const deleteRole = params => { return sendpost('role/delete', params); };
export const editRole = params => { return sendpost('role/edit', params); };
export const addRole = params => { return sendpost('role/add', params); };
export const rolePerm = params => { return sendpost('role/rolePermission', params); };
export const authcRole = params => { return sendpost('role/authc', params); };




export const listAllPerm = params => { return sendpost('permission/listAll', params); };
export const listPerm = params => { return sendpost('permission/list', params); };
export const deletePerm = params => { return sendpost('permission/delete', params); };
export const editPerm = params => { return sendpost('permission/edit', params); };
export const addPerm = params => { return sendpost('permission/add', params); };

export const listBanner = params => { return sendpost('banner/list', params); };
export const editBanner = params => { return sendpost('banner/edit', params); };
export const addBanner = params => { return sendpost('banner/add', params); };
export const deleteBanner = params => { return sendpost('banner/delete', params); };

export const listSetting = params => { return sendpost('setting/list', params); };
export const editSetting = params => { return sendpost('setting/edit', params); };
export const addSetting = params => { return sendpost('setting/add', params); };
export const deleteSetting = params => { return sendpost('setting/delete', params); };

export const listMenu = params => { return sendpost('menu/list', params); };
export const addMenu = params => { return sendpost('menu/add', params); };
export const editMenu = params => { return sendpost('menu/edit', params); };
export const deleteMenu = params => { return sendpost('menu/delete', params); };
export const firstMenus = params => { return sendpost('menu/firstMenus', params); };
export const secondMenus = params => { return sendpost('menu/secondMenus', params); };

export const listLog = params => { return sendpost('log/list', params); };

export const listDict = params => { return sendpost('dict/list', params); };
export const editDict = params => { return sendpost('dict/edit', params); };
export const addDict = params => { return sendpost('dict/add', params); };
export const deleteDict = params => { return sendpost('dict/delete', params); };

export const getProvinces = params => { return sendpost('amap/getProvinces', params); };
export const getCitys = params => { return sendpost('amap/getCitys', params); };

export const listServeAuth = params => { return sendpost('serve/authList', params); };
export const authServe = params => { return sendpost('serve/auth', params); };
export const listAuth = params => { return sendpost('auth/list', params); };

export const listBrandAuth = params => { return sendpost('brand/authList', params); };
export const authBrand = params => { return sendpost('brand/auth', params); };

const notifyError = (msg) =>{
    vm.$notify.error({
      title: '错误',
      message: msg,
      duration: 2000
    });
}