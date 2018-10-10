import { userMenus} from '../api/api';
//test
export const increment = ({commit}) => {
    commit('INCREMENT')
}
export const decrement = ({commit}) => {
    commit('DECREMENT')
}

export const currentUrl = ({commit}, tourl) => {
        commit('currentUrl', tourl);
}

export const setPermission = ({commit},path) => {
    let params = {
    };
    userMenus(params).then( (body) => {
        if(body&&body.length>0) {
            let pm = {
                active: false, //请求状态
                menus: body
            }
            commit('setPermission', pm);
            if(path){
            	commit('currentUrl', path);
            	vm.$router.push({ path: path})
            }else{
            	commit('currentUrl', getFirstUrl(body));
            	vm.$router.push({ path: getFirstUrl(body) });
            }
        }else{
        	vm.$message({
                    message: '没有足够的权限',
                    type: 'error'
            });
        }
    }).catch(function (response) {
    	alert(response);
  });
}

//获取路由对应的接口权限
//function getMenuOpr(menu, pmobj) {
//  if(menu)
//}
function getFirstUrl(body){
	if(body&&body.length>0){
		for(let i=0;i<body.length;i++){
			if(body[i].url){
				return body[i].url;
			}else{
				if(body[i].children&&body[i].children.length>0){
					for(let j=0;j<body[i].children.length;j++){
						if(body[i].children[j].url){
							return body[i].children[j].url;
						}
					}
				}
			}
		}
	}
}