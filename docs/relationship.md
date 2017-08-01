# 交互式关系网络拓展

# 数据

## 节点类型枚举

```
ENUM(NodeType) {
	QQ, Tel, Email, Cert, Hotel, Car, Train, Plane, ...
}
```


## 操作类型枚举

```
ENUM(OperateType) {
	Belong, Expand, Together, ... 
}
```

## 拓展节点，帅选条件枚举

```
ENUM(OperateFilter) {
	Time, 	// 时间段
	Count,	// 频次
	...
}
```

## 节点定义

```
Node:
{
	id: 'xxx-yyy',
	name: 'QQ:120102',	// 节点名称
	type: NodeType.QQ,
	key: '...',		// 主属性
	operates: [{
		type: OpetateType.Expand,
		name: '拓展',
		children: [{
			type: OpetateType.Together,
			name: '同行',
			filter: [OperateFilter.Time, OperateFilter.Count]
		}]
	}, {
		type: OpetateType.Belong,
		name: '从属',
		children: [{
			type: OpetateType.BelongTel,
			name: '电登',
			filter: [OperateFilter.Time]
		}]
	}]
}
```

## 边的定义

```
Edge:
{
	id: 'zzz-xxx',
	name: '11次',
	fromNodeId: 'xxx-yyy',
	toNodeId: 'ccc-bbb'
}
```

# 接口

## 查询节点

`/query`

**request**

```
{
	type: ENUM('QQ', 'Tel', 'Cert' ...),
	key: '123432'
}
```

**response**

```
{
	code: 0,
	data: [Node, Node, ...]
}
```

## 拓展节点

**request**

```
{
	nodeId: 'xxx-yyy',
	opetateType: OperateType.Together,
	filter: {
		fromTime: '2015-01-01',
		toTime: '2015-10-10',
		count: 10
	}
}
```

**response**

```
{
	code: 0,
	data: {
		nodes: [Node, Node, ...],
		edges: [Edge, Edge, ...]
	}
}
```

