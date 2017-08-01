/**
 * Created by root on 16-5-10.
 */

/**
 * Created by root on 16-4-5.
 */
/**
 * Created by root on 16-4-1.
 */
define('search-operation-define',
    [
        'underscore'
    ],
    function(_){

        function get_search_operation_dic(opt) {
            var search_operation_dic = {};
            $.ajax({
                url: '/datasearch/datasearch/get_search_operation_dic',
                type: 'POST',
                async: false,
                data: {},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        search_operation_dic = rsp.data;

                    }
                    else {

                    }

                }
            });
            return search_operation_dic;
        }

        function get_search_relation_dic(opt) {
            var search_relation_dic = {};
            $.ajax({
                url: '/datasearch/datasearch/get_search_relation_dic',
                type: 'POST',
                async: false,
                data: {},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        search_relation_dic = rsp.data;

                    }
                    else {

                    }

                }
            });
            return search_relation_dic;
        }

        return {
            get_search_operation_dic: get_search_operation_dic,
            get_search_relation_dic: get_search_relation_dic
        }

    }
);