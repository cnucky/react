import React from 'react';
const Notify = require('nova-notify');
const Q = require('q');

function getKeyValueMap(key,valueMap) {
    let defer = Q.defer();

    var newValueMap = valueMap;
    var keys = key ;


    var allKeys = [];
    _.each(newValueMap , (item , key)=>{
        allKeys.push(item.name)
    })

    let diffKyes = [];
    let sameKyes = [];
    _.each(keys , (dir , key)=>{

        if(!_.contains(allKeys, dir)){

            diffKyes.push(dir)

        } else {
            sameKyes.push(dir)
        }

    })


    let sameValue = [];
    _.each(sameKyes , (item , key)=>{
        let obj = {
            name:item,
            values:[]
        }

        _.each(newValueMap , (dir , key)=>{
            if (dir.name == item){
                _.each(dir.values , (val)=>{
                    obj.values.push(val)
                })

            }
        })
        sameValue.push(obj)
    })


    let diffValue = [];
    let allValue = [];

    if(!_.isEmpty(diffKyes)){
        $.getJSON('/renlifang/personcore/getNewMap', {
            valueKey: diffKyes
        }, function(rsp){

            if(rsp.code == 0){

                _.each(diffKyes , (item , key)=>{

                    let obj = {
                        name:item,
                        values:[]
                    }
                    _.each(rsp.data[item] , (data , key)=>{


                        _.each(newValueMap , (map)=>{
                            if(map.name == data){
                                _.each(map.values , (val)=>{
                                    obj.values.push(val)
                                })
                                obj.caption = map.caption
                            }
                        })

                    })

                    diffValue.push(obj)
                })

                allValue = _.union(sameValue , diffValue)

                defer.resolve(allValue);

            }else{
                Notify.show({
                    title: '获取失败',
                    type: 'error'
                });
            }
        });

    } else {
        _.each(sameValue, (item)=> {
            _.find(newValueMap , (map)=>{
                if(map.name == item.name){
                    item.caption = map.caption
                    return true;
                }
            })
        })

        allValue = sameValue ;
        defer.resolve(allValue);
    }




    return defer.promise;
}

module.exports.getKeyValueMap = getKeyValueMap;
