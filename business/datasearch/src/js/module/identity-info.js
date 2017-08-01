define('../module/identity-info',
    [
        'jquery',
        'underscore'
    ],
    function ($, _) {
        function get_user(){
            var user;
            $.ajax({
                url: '/datasearch/datasearch/get_user_info',
                type: 'POST',
                async: false,
                data: {},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        user = rsp.data;
                    }
                    else {

                    }
                }
            });
            return user;
        }

        function get_user_role(user_id){

            var user_role=[];
            $.ajax({
                url: '/userrole/queryuserroles',
                type: 'GET',
                async: false,
                data: {userid: user_id},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        user_role = rsp.data;
                    }
                    else {

                    }
                }
            });
            return user_role;
        }
        
        return{
            get_user:get_user,
            get_user_role:get_user_role
        }
    })
    
