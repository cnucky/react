define([
  "../lib/vue/vue",
  "../lib/echarts/echarts.min"
], function (Vue, echarts) {
  Vue.component('wx-line', {
    // 选项
    template: '<div class="lrect"></div>',
    props: {
      dataConfig: {
        type: Object
      },
      styleConfig: {
        type: Object
      }
    },
    data: function () {
      return {
        chart: new Object(),
        dom: new Object()
      };
    },
    mounted: function () {

      console.log('mounted');
      var vm = this;
      // console.log(myConfig);
      var myChart = echarts.init(vm.$el);


      // 指定图表的配置项和数据
      var option = {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          show: false
        },
        grid: {
          containLabel: true,
          left: '2%',
          right: '2%',
          top: '10%',
          bottom: '5%'
        },
        xAxis: {
          boundaryGap: true,
          nameTextStyle: {
            color: '#30a4ff'
          },
          axisLine: {
            lineStyle: {
              color: '#30a4ff'
            }
          },
          axisTick: {
            alignWithLabel: true
          },
          data: vm.dataConfig.columnTitle
        },
        yAxis: {
          min: 0,
          max: 100,
          nameTextStyle: {
            color: '#30a4ff'
          },
          axisLine: {
            lineStyle: {
              color: '#30a4ff'
            }
          },
          name: vm.dataConfig.rowTitle[0].name,
          splitNumber: 5,
          minInterval: 1,
          axisLabel: {
            formatter: function (value) {
              if (value == 20) {
                return '弱   20'
              }
              if (value == 80) {
                return '中   80'
              }
              if (value == 100) {
                return '强 100'
              }
              return value
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgb(37,80,86)', 'rgb(153,131,136)', 'rgb(153,131,136)', 'rgb(153,131,136)', 'rgb(132,12,19)']
            }
          }
        },
        series: [{
          name: '威胁',
          type: 'line',
          symbolSize: 0,
          smooth: true,
          data: vm.dataConfig.content[0]
        }]
      };
      // console.log(option);

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
      console.log(vm.styleConfig);
      myChart.resize({
        'width': vm.styleConfig.width,
        'height': vm.styleConfig.height
      });
      vm.chart = myChart;
      vm.$watch('dataConfig', function (val, oldVal) {
        vm.chart.setOption({
          xAxis: {
            data: vm.dataConfig.columnTitle
          },
          yAxis: {
            name: vm.dataConfig.rowTitle[0].name
          },
          series: [{
            data: vm.dataConfig.content[0]
          }]
        });
      }, {
        deep: true
      });
      vm.$watch('styleConfig', function (val, oldVal) {
        console.log('change styleData to', vm.styleConfig);
        myChart.resize({
          'width': vm.styleConfig.width,
          'height': vm.styleConfig.height
        });
      }, {
        deep: true
      });
    }
  });
});