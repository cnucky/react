/**
 * Created by root on 9/18/16.
 */

define([], function () {
    //获取数据类型树节点的类型，返回值：1：根目录节点，2：系统区目录节点，3：个人区目录节点，
    // 4：系统区数据类型节点，5：个人区数据类型节点，6:共享目录下数据类型节点，0：其他。
    function getTreeNodeType(node) {
        //根目录节点
        if (node.parent.title == "root") {
            return 1;
        }
        //目录节点
        else if (node.extraClasses == "nv-dir") {
            //系统区目录节点
            if (node.data.source == 1) {
                return 2;
            }
            //个人区目录节点
            else if (node.data.source == 2) {
                return 3;
            }
            //其他
            else {
                return 0;
            }
        }
        //数据类型节点
        else {
            //系统区数据类型节点
            if (node.data.source == 1) {
                return 4;
            }
            //个人区数据类型节点
            else if (node.data.source == 2) {
                return 5;
            }
            //共享目录下数据类型节点
            else if (node.data.source == 3) {
                return 6;
            }
            //其他
            else {
                return 0;
            }
        }
    }

    function setNoPower() {
        $("#data-treeview").contextmenu("showEntry", "addChild", false);
        $("#data-treeview").contextmenu("showEntry", "delChild", false);
        $("#data-treeview").contextmenu("showEntry", "moveObject", false);
        $("#data-treeview").contextmenu("showEntry", "modifydir", false);
        $("#data-treeview").contextmenu("showEntry", "createsysdatatype", false);
        $("#data-treeview").contextmenu("showEntry", "createuserdatatype", false);
        $("#data-treeview").contextmenu("showEntry", "downtoUdd", false);
        $("#data-treeview").contextmenu("showEntry", "uptoSys", false);
        $("#data-treeview").contextmenu("showEntry", "deldatatype", false);
        $("#data-treeview").contextmenu("showEntry", "queryAttribute", false);
        $("#data-treeview").contextmenu("showEntry", "edit", false);
        $("#data-treeview").contextmenu("showEntry", "copydatatype", false);
        $("#data-treeview").contextmenu("showEntry", "checktasks", false);
        $("#data-treeview").contextmenu("showEntry", "dataimport", false);
        $("#data-treeview").contextmenu("showEntry", "checkStructure", false);
        $("#data-treeview").contextmenu("showEntry", "viewdata", false);
        $("#data-treeview").contextmenu("showEntry", "checkDetails", false);
        $("#data-treeview").contextmenu("showEntry", "updateManager", false);
    }

    function setPowerForRoot(node, hasSysMGRFunction) {
        if (node.data.source == 1 && hasSysMGRFunction) {
            $("#data-treeview").contextmenu("showEntry", "addChild", true);
        }
        else if (node.data.source == 2) {
            $("#data-treeview").contextmenu("showEntry", "addChild", true);
        }
    }

    function setPowerForSysDir(node, hasSysMGRFunction) {
        if (hasSysMGRFunction) {
            $("#data-treeview").contextmenu("showEntry", "addChild", true);
            $("#data-treeview").contextmenu("showEntry", "delChild", true);
            $("#data-treeview").contextmenu("showEntry", "moveObject", true);
            $("#data-treeview").contextmenu("showEntry", "modifydir", true);
            $("#data-treeview").contextmenu("showEntry", "createsysdatatype", true);
        }
    }

    function setPowerForUserDir(node, hasSysMGRFunction) {
        $("#data-treeview").contextmenu("showEntry", "addChild", true);
        $("#data-treeview").contextmenu("showEntry", "delChild", true);
        $("#data-treeview").contextmenu("showEntry", "moveObject", true);
        $("#data-treeview").contextmenu("showEntry", "modifydir", true);
        $("#data-treeview").contextmenu("showEntry", "createuserdatatype", true);
    }

    function setPowerForSysDataType(node, hasSysMGRFunction) {
        if (hasSysMGRFunction) {
            $("#data-treeview").contextmenu("showEntry", "checktasks", true);
            $("#data-treeview").contextmenu("showEntry", "dataimport", true);
            $("#data-treeview").contextmenu("showEntry", "edit", true);
            $("#data-treeview").contextmenu("showEntry", "copydatatype", true);
            $("#data-treeview").contextmenu("showEntry", "moveObject", true);
            $("#data-treeview").contextmenu("showEntry", "deldatatype", true);
            //$("#data-treeview").contextmenu("showEntry", "downtoUdd", true);
        }

        if (node.data.category == 2)
            $("#data-treeview").contextmenu("showEntry", "viewdata", false);
        else
            $("#data-treeview").contextmenu("showEntry", "viewdata", true);

        $("#data-treeview").contextmenu("showEntry", "checkStructure", true);
        $("#data-treeview").contextmenu("showEntry", "checkDetails", true);
    }

    function setPowerForUserDataType(node, hasSysMGRFunction) {
        if (hasSysMGRFunction) {
            $("#data-treeview").contextmenu("showEntry", "uptoSys", true);
        }
        if (node.data.category == 2)
            $("#data-treeview").contextmenu("showEntry", "viewdata", false);
        else
            $("#data-treeview").contextmenu("showEntry", "viewdata", true);

        $("#data-treeview").contextmenu("showEntry", "moveObject", true);
        $("#data-treeview").contextmenu("showEntry", "deldatatype", true);
        $("#data-treeview").contextmenu("showEntry", "checkStructure", true);
        $("#data-treeview").contextmenu("showEntry", "checktasks", true);
        $("#data-treeview").contextmenu("showEntry", "dataimport", true);
        $("#data-treeview").contextmenu("showEntry", "edit", true);
        $("#data-treeview").contextmenu("showEntry", "copydatatype", true);
        $("#data-treeview").contextmenu("showEntry", "checkDetails", true);
        $("#data-treeview").contextmenu("showEntry", "updateManager", true);
    }

    function setPowerForShareDataType(node, hasSysMGRFunction) {
        if (node.data.category == 2)
            $("#data-treeview").contextmenu("showEntry", "viewdata", false);
        else
            $("#data-treeview").contextmenu("showEntry", "viewdata", true);

        $("#data-treeview").contextmenu("showEntry", "moveObject", false);
        $("#data-treeview").contextmenu("showEntry", "deldatatype", false);
        $("#data-treeview").contextmenu("showEntry", "checkStructure", true);
        $("#data-treeview").contextmenu("showEntry", "checktasks", false);
        $("#data-treeview").contextmenu("showEntry", "dataimport", false);
        $("#data-treeview").contextmenu("showEntry", "edit", false);
        $("#data-treeview").contextmenu("showEntry", "checkDetails", true);
    }

    return {
        setPowerForRoot: setPowerForRoot,
        getTreeNodeType: getTreeNodeType,
        setNoPower: setNoPower,
        setPowerForSysDir: setPowerForSysDir,
        setPowerForUserDir: setPowerForUserDir,
        setPowerForSysDataType: setPowerForSysDataType,
        setPowerForUserDataType: setPowerForUserDataType,
        setPowerForShareDataType: setPowerForShareDataType,
    }

});