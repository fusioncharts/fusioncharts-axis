FusionCharts.register('module', ['private', 'modules.renderer.js-extension-axis',
    function () {
        var global = this,
            lib = global.hcLib,
            chartAPI = lib.chartAPI,
            pluckNumber = lib.pluckNumber,
            getAxisLimits = lib.getAxisLimits;

        chartAPI('axis', {
            standaloneInit: true,
            friendlyName: 'axis',
            _checkInvalidData: function () {

            }
        }, chartAPI.drawingpad);

        FusionCharts.register('component', ['extension', 'drawaxis', {
            type: 'drawingpad',

            init: function (chart) {
                var extension = this,
                    components = chart.components,
                    axisConfig = extension.axisConfig || (extension.axisConfig = {}),
                    chartInstance = chart.chartInstance;

                components.axis || (components.axis = new (FusionCharts.getComponent('main', 'axis'))());
                extension.chart = chart;

                chartInstance.setAxis = extension.setAxis = function (data, draw) {
                    if (!(data instanceof Array)) {
                        return;
                    }
                    if (axisConfig.axisType === 'y') {
                        axisConfig.min = data[0];
                        axisConfig.max = data[1];
                    }
                    else {
                        axisConfig.min = 0;
                        axisConfig.max = data.length - 1;
                        axisConfig.category = data;
                    }

                    return draw !== false && extension.draw();
                };

                chartInstance.getLimits = function () {
                    return [axisConfig.minLimit, axisConfig.maxLimit];
                };
            },

            configure: function () {
                var extension = this,
                    axisConfig = extension.axisConfig,
                    chart = extension.chart,
                    config = chart.config,
                    jsonData = chart.jsonData.chart,
                    axisType,
                    isAxisOpp,
                    canvasBorderThickness,
                    borderThickness,
                    isYaxis,
                    isHorizontal,
                    canvasPaddingLeft = pluckNumber(jsonData.canvasleftpadding, jsonData.canvaspadding, 0),
                    canvasPaddingRight = pluckNumber(jsonData.canvasrightpadding, jsonData.canvaspadding, 0);

                chart._manageSpace();
                canvasBorderThickness = pluckNumber(config.canvasborderthickness, 0);
                borderThickness = pluckNumber(config.borderthickness, 0);

                axisType = axisConfig.axisType = jsonData.axistype;

                if (!axisType) {
                    return;
                }
                isYaxis = axisConfig.isYaxis = axisType === 'y';
                isHorizontal = axisConfig.isHorizontal = typeof jsonData.ishorizontal === 'undefined' ?
                 !isYaxis : jsonData.ishorizontal;
                extension.setAxis(isYaxis ? [jsonData.datamin, jsonData.datamax] : chart.jsonData.categories, false);

                isAxisOpp = axisConfig.isAxisOpp = pluckNumber(jsonData.isaxisopposite, 0);

                if (!isHorizontal) {
                    axisConfig.top = config.marginTop + canvasBorderThickness + borderThickness;
                    axisConfig.left = isAxisOpp ? pluckNumber(jsonData.chartrightmargin, 0) : config.width - pluckNumber(jsonData.chartrightmargin, 0);
                } else {
                    axisConfig.top = (isAxisOpp ? config.height - pluckNumber(jsonData.chartbottommargin, 0) :
                        pluckNumber(jsonData.charttopmargin, 0));
                    axisConfig.left = config.marginLeft + canvasBorderThickness + borderThickness + canvasPaddingLeft;
                }
                axisConfig.height = config.height - config.marginTop - config.marginBottom -
                    2 * canvasBorderThickness - 2 * borderThickness;

                axisConfig.divline = pluckNumber(jsonData.numdivlines, 4);

                axisConfig.axisLen = config.width - config.marginRight - config.marginLeft -
                    2 * canvasBorderThickness - 2 * borderThickness - canvasPaddingLeft - canvasPaddingRight;
            },

            draw: function () {
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
                    scaleObj = axis.getScaleObj(),
                    axisIntervals = scaleObj.getIntervalObj().getConfig('intervals'),
                    minLimit,
                    isHorizontal = !!axisConfig.isHorizontal,
                    i;

                if (!axisConfig.axisType) {
                    return;
                }

                max = axisConfig.max || 1;
                min = axisConfig.min || 0;
                left = axisConfig.left;
                top = axisConfig.top;

                scaleObj.setConfig('graphics', {
                    paper: paper
                });
                axis.setRange(max, min);
                axis.setAxisPosition(left, top);
                if (axisConfig.isYaxis) {
                    axis.setAxisLength(!isHorizontal ? axisConfig.height : axisConfig.axisLen);
                    scaleObj.setConfig('vertical', !isHorizontal);

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
                else {
                    minLimit = min;
                    maxLimit = max;
                    axis.setAxisLength(isHorizontal ? axisConfig.axisLen : axisConfig.height);
                    scaleObj.setConfig('vertical', !isHorizontal);

                    if (axisConfig.category && axisConfig.category.length === 1) {
                        labels.push(0);
                        minLimit = -1
                    }
                    else {
                        for (i = 0; i <= max; i++) {
                            labels.push(i);
                        }
                    }
                    categoryValues = axisConfig.category || ['start', 'end'];

                    axisIntervals.major.formatter = function (value) {
                        return categoryValues[value];
                    };
                }

                axisConfig.isAxisOpp ? scaleObj.setConfig('opposite', true) :
                    scaleObj.setConfig('opposite', false);
                axisIntervals.major.drawTicks = true;
                axisConfig.maxLimit = maxLimit;
                axisConfig.minLimit = minLimit;

                scaleObj.getIntervalObj().manageIntervals = function () {
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