# Session

## Login

`/user/login`

**request**

```
message LoginInfo {
	require string username = 1;
	require string password = 2;
}
```

**response**

```
message LoginResponse {
	require string ticket = 1;
}
```

## Valid

`/user/valid`

**request**

```
message Ticket {
	require string ticket = 1;
}
```

**response**

```
message SuccessMessage {}
```

## Logout

注销登录后，设置Cookie[ticket]失效。

`/user/logout`

**response**

```
message SuccessMessage {}
```


# UMS

## Add

`/user/add`

**request**

```
message UserRegisterInfo {
	require string username = 1;
	require string password = 2;
	require string name = 3;	// 中文名
	require int birthday = 4;	// timestamp
	require int sex = 5;	// 0/1 
	optional int departmentID = 6;
	optional int characterID = 7;	// 角色ID
}
```

**response**

```
message UserInfo {
	require int userID = 1;	// 
}
```

## Update

`/user/update`

**request**

```
message UserRegisterInfo {}
```

## Delete
可支持单个/批量删除

`/user/delete`

**request**

```
message 

