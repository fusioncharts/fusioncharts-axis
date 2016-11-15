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

            init : function (chart) {
                var extension = this,
                    components = chart.components,
                    axisConfig = extension.axisConfig || (extension.axisConfig = {}),
                    chartInstance = chart.chartInstance;

                components.axis || (components.axis = new (FusionCharts.getComponent('main', 'axis'))());
                extension.chart = chart;

                chartInstance.setAxis = extension.setAxis = function (data, draw) {
                    if (axisConfig.axisType === 'y') {
                        axisConfig.min = data[0];
                        axisConfig.max = data[1];
                    }
                    else {
                        axisConfig.min = 0;
                        axisConfig.max = data.length - 1;
                        axisConfig.category = data;
                    }
                    

                    return draw !== false &&  extension.draw();
                };

                chartInstance.getLimits = function () {
                    return [axisConfig.minLimit, axisConfig.maxLimit];
                }
            },

            configure : function () {
                var extension = this,
                    axisConfig = extension.axisConfig,
                    chart = extension.chart,
                    config = chart.config,
                    jsonData = chart.jsonData.chart,
                    axisType,
                    isAxisOpp,
                    canvasBorderThickness,
                    borderThickness,
                    args = chart.chartInstance.args,
                    isYaxis,
                    canvasPaddingLeft = pluckNumber(jsonData.canvaspaddingleft, jsonData.canvaspadding),
                    canvasPaddingRight = pluckNumber(jsonData.canvaspaddingright, jsonData.canvaspadding);

                chart._manageSpace();
                canvasBorderThickness = pluckNumber(config.canvasborderthickness, 0);
                borderThickness = pluckNumber(config.borderthickness, 0);

                axisType = axisConfig.axisType = pluck(args.axisType, 'y');
                isYaxis = axisType === 'y';

                extension.setAxis(isYaxis ? [jsonData.datamin, jsonData.datamax] : chart.jsonData.categories, false);

                isAxisOpp = axisConfig.isAxisOpp = pluckNumber(jsonData.isaxisopposite, 0);

                axisConfig.top = isYaxis ? config.marginTop + canvasBorderThickness + borderThickness :
                    (isAxisOpp ? config.height - pluckNumber(jsonData.chartbottommargin, 0) :
                        pluckNumber(jsonData.charttopmargin, 0));
                
                axisConfig.left = isYaxis ? (isAxisOpp ? pluckNumber(jsonData.chartrightmargin, 0) :
                    config.width - pluckNumber(jsonData.chartrightmargin, 0)) :
                        (config.marginLeft + canvasBorderThickness + borderThickness + canvasPaddingLeft);

                axisConfig.height = config.height - config.marginTop - config.marginBottom -
                    2 * canvasBorderThickness - 2 * borderThickness;

                axisConfig.divline = pluckNumber(jsonData.numdivlines, 4);

                axisConfig.axisLen = config.width - config.marginRight - config.marginLeft -
                    2 * canvasBorderThickness - 2 * borderThickness - canvasPaddingLeft - canvasPaddingRight;
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
                    categoryValues = [],
                    top,
                    left,
                    min,
                    max,
                    numberFormatter = components.numberFormatter,
                    axisIntervals = axis.getScaleObj().getIntervalObj().getConfig('intervals'),
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

                if (axisConfig.axisType == 'x') {

                    minLimit = min;
                    maxLimit = max;
                    axis.setAxisLength(axisConfig.axisLen);

                    for (i = 0; i <= max; i++) {
                        labels.push(i);
                    }
                    categoryValues = axisConfig.category || ['start', 'end'];

                    axisIntervals.major.formatter = function (value) {
                        return categoryValues[value];
                    };
                }
                else {
                    axis.setAxisLength(axisConfig.height);
                    axis.getScaleObj().setConfig('vertical', true);

                    limits = getAxisLimits(max, min, null, null, true, true, axisConfig.divline, true);
                    divGap = limits.divGap;
                    maxLimit = limits.Max;
                    minLimit = incrementor = limits.Min;

                    while (incrementor <= maxLimit) {
                        labels.push(incrementor);
                        incrementor += divGap;
                    }

                    axisIntervals.major.formatter = function (value) {
                        return numberFormatter.yAxis(value);
                    };
                }

                axisConfig.isAxisOpp && axis.getScaleObj().setConfig('opposite', true);
                axisIntervals.major.drawTicks= true;
                axisConfig.maxLimit = maxLimit;
                axisConfig.minLimit = minLimit;

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
