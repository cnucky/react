define('menu/menu', [
    '../tpl/leftmenu',
    '../tpl/leftmenu-item',
    '../tpl/leftmenu-dropdown-stash',
    './left-menu',
    'module/home/homeService',
    'nova-utils',
    'jquery',
    'underscore',
], function(tpl, tplItem, tplDrop, data, homeService, Util, $, _
    ) {
    var Config = window.__CONF__.framework; 
    var DEBUG = false;
    tpl = _.template(tpl);
    tplItem = _.template(tplItem);
    tplDrop = _.template(tplDrop);
    var items = data.menu;
    // var menu = menuData.menu;
    var wikiSearchIp = Config['wikiSearchIp'];
    // create menu map
    var pageMap = {};
    var allMenu;

    function mapChildren(items, parent) {
        _.each(items, function(item) {
            pageMap[item.url] = item;
            if (item.children && item.children.length > 0) {
                mapChildren(item.children, item);
            }
            item.parent = parent;
        });
    }

    // console.log(pageMap);


    function filteFavorites(filter, favorites) {

        favorites = favorites || ''
        var indexArr = _.map(
            _.pluck(favorites, 'id'),
            function(item) {
                return parseInt(item)
            });
        var idArr = _.pluck(filter, 'id');

        var minusAuthArr = _.difference(indexArr, idArr);
        var modFlag = false;
        _.each(minusAuthArr, function(id) {
            var app = _.findWhere(favorites, {
                index: id.toString()
            })
            if (app) {
                favorites.splice(_.indexOf(favorites, app), 1);
                modFlag = true;
            }

        })
        if (modFlag) {
            postFavoriteData(favorites);
        }
        return favorites;
    }

    function postFavoriteData(favorites) {
        var detail = favorites.length == 0 ? '' : _.pluck(favorites, 'id');
        $.post('/workspacedir/recordPreference', {
            name: 'favorites',
            detail: detail
        }).done(function(rsp) {

        });
    }

    function makeup(filter, items, depth, favorites_data) { //添加参数favorites_data

        depth = depth || 0;
        favorites_data = filteFavorites(filter, favorites_data);
        var ul = $('<ul>').addClass(depth == 0 ? 'nav sidebar-menu' : 'nav sub-nav');

        //如果传入favorites_data不为空则有左边栏偏好应用,push
        if (favorites_data.length != 0 && depth == 0) {
            _.each(favorites_data, function(e) {
                items.push(e);
            });
        }

        //edit by zhangu  判断用户是否有工作区权限
        var functionPermission = window.localStorage.getItem('userPermissions');
        functionPermission = $.parseJSON(functionPermission);
        var tgt = Util.getCookiekey('tgt');
        var functionMenuIds = _.pluck(functionPermission[tgt], 'id');
        // var flag = _.contains(functionMenuIds,"WORK_AREA");
        //the end

        _.each(items, function(item) {
            /*if (checkItem(item, filter) || DEBUG)*/
            {
                var li = $('<li>');
                if (item.type == 'label') {
                    li.html(item.title).addClass('sidebar-label pt20');
                } else {
                    item.key = item.key || '';
                    item.children = item.children || null;
                    item.badge = item.badge || null;
                    item.link = item.link || item.url || 'javascript:;';
                    item.depth = depth;
                    item.icon = item.icon || '';
                    item.favorites_icon = item.favorites_icon || '';
                    // item.isOutsideLink = item.isOutsideLink || false;
                    item.openmode = item.openmode || 1;
                    item.id = item.id;
                    // item.link = 'index.html';
                    if (item.id == 110) {
                        var username = Util.getCookiekey('username');
                        var areaName = Config["areaName"];
                        var address = Config['faultPlatformIp'] + '?tgt=' + Util.enCodeString(decodeURIComponent(username) + areaName)+'&guid='+new Date().getTime();
                        item.link = address;
                    }

                    if (item.id == 104) {
                        var tgt = Util.getCookiekey('tgt');
                        var address = Config['wikiSearchIp'] + '/ada/main.html?tgt=' + tgt;
                        item.link = address;
                    }


                    var a = $(tplItem(item));
                    if (item.id == 3) {
                        li.append(a);
                    } else if (_.contains(functionMenuIds, item.id)) {
                        li.append(a);
                    }
                    // if (item.children && item.children.length > 0) {
                    //     li.append(makeup(filter, item.children, depth + 1));
                    // }
                }
                ul.append(li);
            }
        });
        return ul;



    }

    function checkItem(item, filter) {
        if (_.isEmpty(filter)) {
            return true;
        }
        var match;
        if (!_.isEmpty(item.ids)) {
            match = _.find(filter, function(filterItem) {
                return _.contains(item.ids, filterItem.id);
            })
        } else {
            match = _.find(filter, function(filterItem) {
                return item.key == filterItem.name;
            })
        }
        return match != undefined;
    }

    function bindEvents(menu) {
        // menu.on('click', 'a', function() {
        //     var link = $(this).attr('data-link');
        //     if (!link) return;
        //     if (link.indexOf('http') === 0) {
        //         loadPage(link);
        //     } else {
        //         loadPage(root + link);
        //     }
        //     // console.log(root + link);
        // })

    }

    function loadPage(page) {
        // $('#body-wrapper').load(page, function () {
        //  History.pushState({}, page, '?page=' + page);
        // });
        window.location.href = page;
    }

    function collapse(done) {
        // var activeMenu = $('#left-menu-wrapper').find('a.menu-open').next().get(0);

        // if (activeMenu) {
        //     $(activeMenu).slideUp('fast', 'swing', function() {
        // $(this).attr('style', '').prev().removeClass('menu-open');
        $('#left-menu-wrapper').find('a.menu-open').removeClass('menu-open');
        $('#left-menu-wrapper').find('li.active').removeClass('active');
        (_.isFunction(done) && done());
        //     });
        // } else {
        //     done();
        // }
    }

    function expand(page) {
        collapse(function() {
            var a = $('#left-menu-wrapper').find('[data-id="' + page + '"]');
            while (true) {
                var li = a.parent('li').addClass('active');
                var ul = li.parent();
                if (ul.hasClass('sub-nav')) {
                    a = ul.prev('a').addClass('menu-open');
                } else {
                    break;
                }
            }
        });

    }

    function _setTitle(dom, title) {
        dom = $(dom);
        if (title.indexOf('{i18n@') == 0) {
            dom.attr('data-i18n', title.substring(6, title.length - 1));
            if (typeof dom.localize === 'function') {
                dom.localize();
            }
        } else {
            dom.html(title);
        }
        return dom;
    }

    function pageConfig() {
        var config = window._pageConfig || {};
        var page = config.page || window.location.pathname;

        // create top bar
        var item = pageMap[page];
        if (!item) { // 不在菜单配置中，子页面
            item = {
                title: config.title,
                link: config.link,
                parent: config.parent
            };
            (config.parent && expand(config.parent));
        } else {
            item.link = item.url;
            expand(page);
        }

        _setTitle($('title'), item.title);
        if (config.hideNavBar) {
            $('header#topbar').hide();
        }

        var breadcrumb = $('#topbar .breadcrumb');
        var crumbIcon = breadcrumb.find('.crumb-icon');
        if (item.link) {
            _setTitle(breadcrumb.find('.crumb-active a').attr('href', item.link), item.title);
            $('<li>').addClass('crumb-link').append(_setTitle($('<a>').attr('href', item.link), item.title)).insertAfter(crumbIcon);
        } else {
            _setTitle($('<li>').addClass('.crumb-trail'), item.title).insertAfter(crumbIcon);
        }

        var parent = config.parent ? config.parent : item.parent;
        while (parent) {
            var li = $('<li>');
            if (parent.link) {
                var a = _setTitle($('<a>').attr('href', parent.link), parent.title);
                li.addClass('crumb-link').append(a);
                li.insertAfter(crumbIcon);
            } else {
                _setTitle(li.addClass('crumb-trail'), parent.title).insertAfter(crumbIcon);
            }
            parent = parent.parent;
        }

        var stash = Util.stash.getPageStash(window.location.pathname);
        var hasStash = !_.isEmpty(stash);
        if (hasStash) {
            var i = 0;
            if (stash.length > 3) {
                var items = [];
                for (; i < stash.length - 3; i++) {
                    items.push(stash[i]);
                }
                breadcrumb.append(tplDrop({
                    title: '更多记录...',
                    items: items
                }));
            }
            for (; i < stash.length; i++) {
                var stashItem = stash[i];
                if (stashItem.key === window.location.href || _.isEmpty(stashItem.title)) {
                    break;
                }
                if (stashItem.link) {
                    var li = $('<li>');
                    var a = $('<a>').attr('href', stashItem.link).html(stashItem.title);
                    li.addClass('crumb-link crumb-stash').append(a);
                    breadcrumb.append(li);
                }
            }
        }
    }

    function render(filter) {

        //获取所有应用的详情，即原menu-data.js
        homeService.getAllApps().then((rsp1) => {
            allMenu = _.union(items, rsp1);
            mapChildren(allMenu, null);

            //调用queryPreference借口获取用户左边栏偏好应用，并传入makeup
            homeService.queryPreference('favorites').then((rsp2) => {
                var favorites_data = [];
                if (rsp2.length != 0) {
                    rsp2.forEach((val) => {
                        const appDetail = _.find(allMenu, (v) => {
                            return v.id == val;
                        })
                        if (appDetail) {
                            favorites_data.push(appDetail)
                        } else {
                            console.log('所有应用的详情中找不到对应侧边栏应用ID:' + val.id + ' 的项')
                        }
                    });
                }
                var menu = makeup(filter, items, 0, favorites_data);

                bindEvents(menu);
                $('#left-menu-wrapper').html('').append(menu);
                $("[data-toggle='tooltip']").tooltip({
                    container: "body",
                });

                pageConfig();
                // //favorites icon toggle logic
                // $('#left-menu-wrapper').on('click', function() {
                //     var active = $('#left-menu-wrapper').find('li.active');
                //     if (active != undefined) {
                //         var src = $('img', active).attr('src');
                //         if (src != '' && src != undefined) {
                //             src.splice(src.length - 7, src.length);
                //             $('img', active).attr('src', src + 'gray');
                //         }
                //         active.removeClass('active');
                //     }
                //     var src = $('img', this).attr('src');
                //     console.log(src);
                //     if (src != '' && src != undefined) {
                //         src.splice(src.length - 7, src.length);
                //         $('img', this).attr('src', src + 'blue');
                //     }
                //     $(this).addClass('active');


                // });
            });
        });
    }

    History.Adapter.bind(window, 'statechange', function() {
        var State = History.getState();
        loadPage(State.title);
    });

    return {
        render: render,
        expand: expand
    }
});
