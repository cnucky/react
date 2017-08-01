define('./relationship-circle-menu', ['jquery', 'underscore'], function() {
    var DEFAULT_COLOR = {
        normal: '#4A89DC',
        hover: '#3078D7',
        inactive: 'darkgray'
    };

    var INNER_RADUIS = 60;
    var GAP = 5;

    function _getPoint(radius, angle) {
        return {
            x: radius * Math.cos(angle * Math.PI / 180),
            y: radius * Math.sin(angle * Math.PI / 180)
        }
    }

    // create arc button path
    function arcPath(innerRadius, outerRadius, startAngle, endAngle, gap) {
        gap = gap || 0;
        var innerGapAngle = Math.asin(gap / 2 / innerRadius) * 180 / Math.PI;
        var innerStart = _getPoint(innerRadius, startAngle + innerGapAngle / 2);
        var innerEnd = _getPoint(innerRadius, endAngle - innerGapAngle / 2);

        var outerGapAngle = Math.asin(gap / 2 / outerRadius) * 180 / Math.PI;
        var outerStart = _getPoint(outerRadius, startAngle + outerGapAngle / 2);
        var outerEnd = _getPoint(outerRadius, endAngle - outerGapAngle / 2);

        var path = [
            ['M', innerStart.x, innerStart.y]
        ];
        path.push(['A', innerRadius, innerRadius, 0, 0, 1, innerEnd.x, innerEnd.y]);
        path.push(['L', outerEnd.x, outerEnd.y]);
        path.push(['A', outerRadius, outerRadius, 0, 0, 0, outerStart.x, outerStart.y]);
        path.push(['Z']);

        return path;
    }

    ////////////////////////////////////
    // ArcButton
    function ArcButton(positions, config) {
        this.positions = positions;
        this.config = config;
        this.draw = config.draw;
        this.rotateAngle = 0;
        this.subs = [];
        this.subShown = false;

        this.render();
        this.bindEvents();
    }

    _.extend(ArcButton.prototype, {
        render: function() {
            var dom = this.draw.group()
                .attr({
                    fill: this.config.fill || DEFAULT_COLOR.normal
                })
                .style('cursor: pointer');

            var angle = this.config.startAngle - 90;

            // draw arc button
            var path = arcPath(this.config.innerRadius, this.config.outerRadius,
                0, this.config.endAngle - this.config.startAngle, this.config.gap);
            this.button = dom.path(path);

            // draw icon label
            // this.button.rotate(-angle / 2, 0, 0);
            var r = (this.config.outerRadius + this.config.innerRadius) / 2;
            var theta = (this.config.endAngle - this.config.startAngle) / 180 * Math.PI / 2;
            var cx = r * Math.cos(theta),
                cy = r * Math.sin(theta);
            var title = dom.text(this.config.title)
                .font({
                    size: 12
                })
                .center(cx, cy)
                .rotate(-angle)
                .attr({
                    fill: 'white'
                });
            title.dmove(0, title.bbox().height / 2);

            if (this.config.icon) {
                var icon = dom.text(this.config.icon)
                    .font({
                        family: this.config.family,
                        size: 20
                    })
                    .center(cx, cy)
                    .attr({
                        fill: 'white'
                    })
                    .rotate(-angle)

                icon.dmove(0, -icon.bbox().height / 2);
            }

            //set group position
            if(_.isEmpty(this.positions)) {
                dom.dmove(this.config.center.x, this.config.center.y)
                    .rotate(angle, 0, 0);
            } else {
                dom.dmove(this.positions.x, this.positions.y)
                    .rotate(angle, 0, 0);
            }
            // dom.dmove(this.positions.x, this.positions.y)     //(this.config.center.x, this.config.center.y)       //maybe
            //     .rotate(angle, 0, 0);

            this.dom = dom;
            this.dom.hide();
        },

        show: function() {
            var dom = this.dom;
            var angle = this.config.startAngle;
            // dom.show();

            $(dom.node).fadeIn(200);
            /*
            dom
            // .rotate(startAngle, 0, 0)
                .scale(0.001, 0.001, 0, 0)
                .animate(200)
                .scale(1, 1, 0, 0)
                */
        },

        hide: function() {
            var dom = this.dom;
            var angle = this.config.startAngle;

            $(dom.node).fadeOut(200);
            /*
            dom
                .animate(200)
                .scale(0.001, 0.001, 0, 0)
                */

            this.hideSubs();
        },

        showSubs: function() {
            this.hideSiblings();
            this.inactiveSiblings();
            this.subShown = true;
            _.each(this.subs, function(btn) {
                btn.show();
            })
        },

        hideSubs: function() {
            this.activeSiblings();
            this.subShown = false;
            _.each(this.subs, function(btn) {
                btn.hide();
            })
        },

        inactiveSiblings: function() {
            var siblings = this.parent.subs;
            var self = this;
            _.each(siblings, function(btn) {
                if (btn != self) {
                    btn.dom.addClass('svg-inactive');
                    btn.button.attr({
                        fill: DEFAULT_COLOR.inactive
                    })
                }
            })
        },

        activeSiblings: function() {
            var siblings = this.parent.subs;
            var self = this;
            _.each(siblings, function(btn) {
                if (btn != self) {
                    btn.dom.removeClass('svg-inactive');
                    btn.button.attr({
                        fill: null
                    })
                }
            })
        },

        hideSiblings: function() {
            var siblings = this.parent.subs;
            var self = this;
            _.each(siblings, function(btn) {
                if (btn != self) {
                    btn.hideSubs();
                    btn.subShown = false;
                }
            })
        },

        bindEvents: function() {
            var self = this;
            this.dom.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                self.subShown ? self.hideSubs() : self.showSubs();
                if (_.isFunction(self.config.click)) {
                    self.config.click(self);
                }
            })

            var fill = this.dom.attr('fill');
            this.dom.on('mouseenter', function() {
                    self.button.attr({
                        fill: self.config.hover || DEFAULT_COLOR.hover
                    })
                })
                .on('mouseleave', function() {
                    self.button.attr({
                        fill: self.dom.hasClass('svg-inactive') ? DEFAULT_COLOR.inactive : fill
                    })
                })
        }
    });

    function renderButtons(positions, configs, index, startAngle, parent, menu) {
            index = index || 0;
            startAngle = startAngle || 0;
            var innerRadius = INNER_RADUIS;
            var length = 60;
            var arcLength = 80;
            var gap = GAP;

            var radius = (length * (index + 1)) + innerRadius;
            var angle = (arcLength / radius / Math.PI) * 180;

            var btns = [];
            _.each(configs, function(config, i) {
                var btnCfg = _.extend(config, {
                    draw: menu.draw,
                    animationStartAngle: startAngle,
                    startAngle: angle * i + startAngle,
                    endAngle: angle * (i + 1) + startAngle,
                    innerRadius: innerRadius + length * index + 2,
                    outerRadius: innerRadius + length * (index + 1),
                    gap: gap,
                    center: {
                        x: menu.draw.cx(),
                        y: menu.draw.cy()
                    }
                })
                var btn = new ArcButton(positions, btnCfg);      //

                btn.subs = renderButtons(positions, config.children, index + 1, angle * i + startAngle, btn, menu);
                btn.dom.front();
                btn.menu = menu;

                btn.dom.addClass('svg-pointer')
                btn.parent = parent;
                btns.push(btn);
            });
            return btns;
        }
        // end ArcButton.prototype


    /* exports methods */

    // 以dom容器大小，构建arc button
    function CircleMenu(positions, dom, configs) {      //
        this.positions = positions;     //
        this.dom = $(dom);
        this.configs = configs;
        this.subs = [];
    }

    _.extend(CircleMenu.prototype, {
        show: function() {
            // create container
            this._createSVG();

            this._createCenterMenu(this.positions);
            //
            this.subs = renderButtons(this.positions, this.configs, 0, 0, this, this);      //

            this._bindEvents();

            _.each(this.subs, function(btn) {
                btn.show();
            });

            this.centerMenu.animate(200)
                .rotate(45)
        },

        close: function() {
            _.each(this.subs, function(btn) {
                btn.hide();
            })

            var self = this;
            this.centerMenu.animate(200).rotate(45)
                .after(function() {
                    self.container.remove();
                })
        },

        resize: function() {

        },

        _createSVG: function() {
            this.container = $('<div>').css({
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0
            });

            this.dom.append(this.container);

            // create svg
            this.draw = SVG(this.container.get(0)).size(this.dom.width(), this.dom.height());
            this.draw.on('click', _.bind(function () {
                this.close();
            }, this))
        },

        _createCenterMenu: function(positions) {
            var radius = INNER_RADUIS * 0.8;
            var group = this.centerMenu = this.draw.group();
            group.circle(radius * 2)
                .attr({
                    fill: 'rgba(0, 0, 0, 0.1)'
                });

            var lineAttr = {
                // stroke: '#F5B025',
                stroke: 'rgba(0, 0, 0, 0.1)',
                'stroke-width': 2
            };
            group.line(0, radius, radius * 2, radius)
                .attr(lineAttr);
            group.line(radius, 0, radius, radius * 2)
                .attr(lineAttr);

            if(_.isEmpty(positions)) {
                group
                    .center(this.draw.cx(), this.draw.cy())
                    .style('cursor: pointer;')
            } else {
                group
                    .center(positions.x, positions.y)
                    .style('cursor: pointer;')
            }

            // group
            //     .center(positions.x, positions.y)
            //     .center(this.draw.cx(), this.draw.cy())
            //     .style('cursor: pointer;')
        },

        _bindEvents: function() {
            this.centerMenu.on('click', _.bind(this.close, this));
        },

        __: null
    });



    return CircleMenu;
});
