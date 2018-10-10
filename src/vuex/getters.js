//test
export const getCount = state => {
    return state.count
}

export const getPermission = state => {
    return state.permission;
}

export const getCurrentOpr = state => {
		let currentUrl = state.permission.currentUrl;
		let oprts = [];
		if(currentUrl){
			currentUrl = currentUrl.replace('/','');
			let menus = state.permission.menus;
			for(let i=0;i<menus.length;i++){
				//一级菜单
				if(menus[i].url.replace('/','') == currentUrl){
					//二级菜单
					if(menus[i].children&&menus[i].children.length>0){
						for(let j = 0;j<menus[i].children.length;j++){
							if(menus[i].children[j].code){
								oprts.push(menus[i].children[j].code);
							}
							//操作权限
							if(menus[i].children[j].children&&menus[i].children[j].children.length>0){
								for(let k=0;k<menus[i].children[j].children.length;k++){
									if(menus[i].children[j].children[k].code){
										oprts.push(menus[i].children[j].children[k].code);
									}
								}
							}
						}
					}
					break;
				}else{
					//二级菜单
					if(menus[i].children&&menus[i].children.length>0){
						if(menus[i].children&&menus[i].children.length>0){
							for(let j = 0;j<menus[i].children.length;j++){
								if(menus[i].children[j].url==currentUrl){
									if(menus[i].children[j].code){
										oprts.push(menus[i].children[j].code);
									}
									//操作权限
									if(menus[i].children[j].children&&menus[i].children[j].children.length>0){
										for(let k=0;k<menus[i].children[j].children.length;k++){
											if(menus[i].children[j].children[k].code){
												oprts.push(menus[i].children[j].children[k].code);
											}
										}
									}
									break;
								}
							}
						}
					}
				}
			}
		}
		//console.log(JSON.stringify(oprts));
		return oprts;
}