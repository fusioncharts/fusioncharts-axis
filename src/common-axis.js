FusionCharts.register('module', ['private', 'modules.renderer.js-extension-axis',
    function () {

        var global = this,
            lib = global.hcLib,
            chartAPI = lib.chartAPI,
            pluckNumber = lib.pluckNumber,
            pluck = lib.pluck,
            getAxisLimits = lib.getAxisLimits;

        chartAPI ('axis', {
            standaloneInit : true,
            friendlyName : 'axis'
        }, chartAPI.drawingpad);

        FusionCharts.register('component', ['extension', 'drawaxis', {
            type : 'drawingpad',

            inhereitBaseExtension : true,

            init : function (chart) {
                var extension = this,
                    components = chart.components,
                    axisConfig = extension.axisConfig || (extension.axisConfig = {}),
                    chartInstance = chart.chartInstance;

                components.axis || (components.axis = new (FusionCharts.getComponent('main', 'axis'))());
                extension.chart = chart;

                chartInstance.setAxis = function (dataObj) {
                    var i,
                        j,
                        k,
                        len = dataObj.length,
                        datasetLen,
                        dataset,
                        dataLen,
                        mathMin = Math.min,
                        mathMax = Math.max,
                        min = Infinity,
                        max = -Infinity,
                        datum,
                        data;

                    for (i = 0; i < len; i++) {
                        datum = dataObj[i];
                        if (dataset = datum.dataset) {
                            datasetLen = dataset.length;
                            for (j = 0; j < datasetLen; j++) {
                                data = dataset[j].data;
                                dataLen = data && data.length;
                                for (k = 0; k < dataLen; k++) {
                                    min = mathMin(min, data[k].value);
                                    max = mathMax(max, data[k].value);
                                }
                            }
                        }
                        else {
                            data = datum.data;
                            dataLen = data.length;
                            for (k = 0; k < dataLen; k++) {
                                min = mathMin(min, data[k].value);
                                max = mathMax(max, data[k].value);
                            }
                        }
                    }
                    axisConfig.min = min;
                    axisConfig.max = max;

                    return extension.draw();
                };
            },

            configure : function () {
                var extension = this,
                    axisConfig = extension.axisConfig,
                    chart = extension.chart,
                    config = chart.config,
                    jsonData = chart.jsonData;

                chart._manageSpace();
                axisConfig.top = config.marginTop + config.borderWidth;
                axisConfig.left = config.width - config.marginRight;
                axisConfig.height = config.height - config.marginTop - config.marginBottom - 2 * config.borderWidth;
                axisConfig.divline = pluckNumber(jsonData.numdivlines, 4);
                axisConfig.axistype = pluck(jsonData.axistype, 'y');
            },

            draw : function(){
                var extension = this,
                    chart = extension.chart,
                    components = chart.components,
                    paper = components.paper,
                    axis = components.axis,
                    axisConfig = extension.axisConfig,
                    incrementor,
                    maxLimit,
                    limits,
                    divGap,
                    labels = [],
                    top,
                    left,
                    min,
                    max,
                    minLimit;

                max = axisConfig.max || 1;
                min = axisConfig.min || 0;
                left = axisConfig.left;
                top = axisConfig.top;

                axis.getScaleObj().setConfig('graphics', {
                    paper: paper
                });
                axis.setRange(max,min);
                axis.setAxisPosition(left,top);

                if (axisConfig.axistype == 'x') {
                    axis.setAxisLength(axisConfig.axisLen);

                }
                else {
                    axis.setAxisLength(axisConfig.height);
                    axis.getScaleObj().setConfig('vertical', true);
                }

                limits = getAxisLimits(max, min, null, null, true, true, axisConfig.divline, true);
                divGap = limits.divGap;
                maxLimit = limits.Max;
                minLimit = incrementor = limits.Min;

                while (incrementor <= maxLimit) {
                    labels.push(incrementor);
                    incrementor += divGap;
                }

                axis.getScaleObj().getIntervalObj().manageIntervals = function () {
                    var intervals = this.getConfig('intervals'),
                        scale = this.getConfig('scale'),
                        intervalPoints = intervals.major.intervalPoints = [],
                        i,
                        len;

                    scale.setRange(maxLimit, minLimit);

                    for (i = 0, len = labels.length; i < len; i += 1) {
                        intervalPoints.push(labels[i]);
                    }

                    return this;
                };
                axis.draw();

                return [minLimit, maxLimit];
            }
        }]);
    }
]);
