# 角色-授权接口文档

## 角色列表

`/userrole/list`

**request**
 `{}`

**response**

```
[{
	id: 1,
	name: '角色名称',
	description: '角色描述',
	reserve: true/false,	// 是否保留角色
	内置: true/false 	// 是否内置
}, ...]
```

## 新增角色

`/userrole/add`

**request**

```
{
	name: '角色名称',
	description: '角色描述',
	isadmin: 0,	// 0: false, 1: true
	templateid: 0	// 模板角色id，可以以一个角色快速创建
}
```

**response**
`角色id`

## 删除角色

`/userrole/delete`

**request**

```
{
	id: 1
}
```

**response**
`{code:0}`

## 新增权限到角色

可以将一个权限目录的权限或单个权限新增到角色上。

`/userrole/addprivate`

**request**

```
{
	roleid: 1,
	privateid: 1	// 权限目录和权限都抽象成一个privateid
}
```

**response**
`{code: 0}`

## 将权限从角色上删除

`/userrole/deleteprivate`

**request**

```
{
	roleid: 1,
	privateid: 1
}
```

**response**
`{code: 0}`

## 角色权限详情

`/userrole/rolelist`

`flags`表示可选的状态位。  
当操作权限是，*叶节点*仅两种状态`1`(拥有), `2`(不拥有)，*目录节点*则有三种状态`0`(半选状态，即子节点中的状态不一致), `1`(拥有), `2`(不拥有)  

数据权限则包含更多`flags`。`0`(半选), `1`(低), `2`(中), `3`(高), `4`(无)。


**request**

```
{
	roleid: 1, // 角色id
	type: ENUM(0, 1, 2),	// 操作权限，数据权限，部门权限
	folderid: 0,	// 权限目录ID，用于lazy load
	keyword: '南京',	// 用于搜索权限的关键词，可选
	flag: ENUM(0, 1, 2)	// 状态过滤，0：全部，1：(部分)拥有，2：无
}
```

**response**

```

// 操作类型
[{
	key: 1,
	title: '操作权限目录1',
	folder: true,
	flags: [{
		key: 0,
		selected: true
	}, {
		key: 1,
	}, {
		key: 2,
	}],
	children: [{
		key: 2,
		title: '权限1',
		flags: [{
			key: 1,	
			selected: true
		}, {
			key: 2,
		}],
	}, {
		key: 3,
		title: '权限2',
		flags: [{
			key: 1,
		}, {
			key: 2,
			selected: true
		}],
	}, {
		key: 4,
		title: '权限3',
		flags: [{
			key: 1,
		}, {
			key: 2,
			selected: true
		}],
	}]
}, {
	key: 2,
	title: '操作权限目录2',
	folder: true,
	flags: [{
		key: 0,
		selected: true
	}, {
		key: 1,
	}, {
		key: 2,
	}],
	lazy: true
}]

// 数据类型
[{
	key: 1,
	title: '数据权限目录1',
	folder: true,
	flags: [{
		key: 0,
		title: '--'
		selected: true
	}, {
		key: 1,
		title: '低'
	}, {
		key: 2,
		title: '中'
	}, {
		key: 3,
		title: '高'
	}, {
		key: 4,
		title: '无'
	}],
	children: [{
		key: 2,
		title: '数据库1',
		folder: true,
		flags: [{
			key: 0,
			title: '--'
			selected: true
		}, {
			key: 1,
			title: '低'
		}, {
			key: 2,
			title: '中'
		}, {
			key: 3,
			title: '高'
		}, {
			key: 4,
			title: '无'
		}],
		children: [{
			key: 1001,
			title: '数据库1',
			flags: [{
				key: 1,
				title: '低',
				selected: true
			}, {
				key: 2,
				title: '中'
			}, {
				key: 3,
				title: '高'
			}, {
				key: 4,
				title: '无'
			}],
		}, {
			key: 1002,
			title: '数据库2',
			flags: [{
				key: 1,
				title: '低',
				selected: true
			}, {
				key: 2,
				title: '中'
			}, {
				key: 3,
				title: '高'
			}, {
				key: 4,
				title: '无'
			}],
		}, {
			key: 1003,
			title: '数据库3',
			flags: [{
				key: 1,
				title: '低'
			}, {
				key: 2,
				title: '中',
				selected: true
			}, {
				key: 3,
				title: '高'
			}, {
				key: 4,
				title: '无'
			}],
		}]
	}]
}]

```
