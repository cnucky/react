//function Test(key) {
//    this.data = key || 'no parameter';
//    console.log('init: ',this.data);
//}
//
//Test.prototype.first = function(key,callback){
//    console.log(this.data);
//    key += 1;
//    callback(key);
//}
//
//var test = new Test('MyWay');
//
//test.first(1,function(key){
//    console.log(key);
//})
//
//
//
//var test2 = new Test();
//
//test2.first(2,function(key){
//    console.log(key);
//})