# 人立方接口文档

## 搜索
`/search`

**request**

```
{
	keyword: '文西',
	starttime: '', 	// 可以枚举，也可以直接使用时间戳，后台返回
	page: 1,	// 分页参数
	requestid: 'xxx' // 后台返回的结果集id
}
```

**response**

```
{
	totalpage: 2102,	// 共多少页
	totalnum: 23456,	// 共多少记录
	starttimes: [{
		time: 12000000,	// timestamp
		text: '一个月内'
	}, {
		time: 11100000,
		text: '三个月内'
	}, ...],
	list: [{
		time: 1200000,
		title: '文西',
		icon: '/images/xxx.jpg',
		content: '内容摘要'
	}, ...]
}
```
