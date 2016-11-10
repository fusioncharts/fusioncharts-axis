FusionCharts.register('module', ['private', 'modules.renderer.js-extension-axis',
    function () {

        var global = this,
            lib = global.hcLib,
            chartAPI = lib.chartAPI,
            pluckNumber = lib.pluckNumber,
            getAxisLimits = lib.getAxisLimits,
            math = Math,
            mathMax = math.max,
            mathMin = math.min,
            findLabels = function (json,axisType){
                var isMS = (json && json.categories) ? 1 : 0 ,
                    labels = [],
                    i = 0,
                    data,
                    labelArr,
                    ln,
                    axisBool = (axisType === 'x'),
                    labelsX = function (labelArr){
                        for(ln = labelArr.length; i < ln; i++){
                            labels.push(labelArr[i].label);
                        }
                    },
                    labelsY = function (data,bool){
                        var min,
                            max,
                            storeMin = -Infinity,
                            storeMax =  -Infinity,
                            ln,
                            len,
                            element,
                            elementFirst,
                            elementLast,
                            cnt,
                            labelArr,
                            limits = {},
                            getValue = function (lArr){
                                len = lArr.length;
                                for(cnt = 0; cnt < len; cnt++){
                                    element = lArr[cnt].value;
                                    elementFirst = mathMin(elementFirst, element);
                                    elementLast = mathMax(elementLast, element);
                                    storeMin == -Infinity ? (storeMin = elementFirst) : storeMin;
                                }
                            },
                            msGetValue = function (grp){
                                for(ln = grp.length; i < ln; i++){
                                    labelArr = grp[i].data;                                    
                                    elementFirst = elementLast = labelArr[0].value;
                                    getValue(labelArr);
                                    storeMax = mathMax(storeMax, elementLast);
                                    storeMin = mathMin(storeMin, elementFirst);
                                }
                            };
                        bool ?  msGetValue(data) : getValue(data);
                        limits = getAxisLimits(storeMax,storeMin);
                        labels = [limits.Max,limits.Min];
                    };
                    //console.log(getAxisLimits);
                if(isMS && axisBool){
                    data = json.categories[0];
                    labelArr = data.category;
                    labelsX(labelArr);
                }else if(!isMS && axisBool){
                    labelArr = json.data;
                    labelsX(labelArr);
                }else if(isMS && !axisBool){
                    data = json.dataset;
                    labelsY(data,isMS);
                }else if(!isMS && !axisBool){
                    data = json.data;
                    labelsY(data,isMS);
                }

                return labels;
            },
            setAxisRange = function (axistype,labels){
                var max,
                    min;

                if(axistype === 'x'){
                    max = labels.length - 1;
                    min = 0;
                }else if(axistype === 'y'){
                    min = labels[labels.length - 1];
                    max = labels[0];
                }

                return {
                    max : max,
                    min : min
                };
            };

        chartAPI ('axis', {
            standaloneInit : true,
            friendlyName : 'axis'
        }, chartAPI.drawingpad);

        FusionCharts.register('component', ['extension', 'drawaxis', {
            type : 'mscartesian',

            inhereitBaseExtension : true,

            init : function (chart) {
               var extension = this;
               extension.chart = chart;
            },

            spaceManager : function(){
                
            },

            draw : function(){       
                var extension = this,
                    config,
                    jsonData,
                    chartHeight,
                    chartwidth,
                    marginLeft,
                    marginRight,
                    marginTop,
                    marginBottom,
                    left,
                    right,
                    top,
                    bottom,
                    axisConfig = {},
                    chartInstance,
                    num = Number;

                chart = extension.chart;
                chartInstance = chart.chartInstance;
                config = chart && chart.config;
                jsonData = chart && chart.jsonData;
                chartHeight = config && config.height || 0;
                chartwidth = config && config.width || 0;
                marginLeft = num(config.canvasleftmargin) || 0;
                marginRight = num(config.canvasrightmargin) || 0;
                marginTop = num(config.canvastopmargin) || 0;
                marginBottom = num(config.canvasbottommargin) || 0;
                
                left = pluckNumber(config.canvasleftpadding , config.canvaspadding * 0.5, 0);
                right = pluckNumber(config.canvasrightpadding , config.canvaspadding * 0.5, 0);
                top = pluckNumber(config.canvastoppadding , config.canvaspadding * 0.5, 0);
                bottom = pluckNumber(config.canvasbottompadding , config.canvaspadding * 0.5, 0);

                axisConfig.top = marginTop + top;
                axisConfig.left = marginLeft + left;
                axisConfig.len = chartwidth - (marginLeft + marginRight + left + right);
                axisConfig.height = chartHeight - (marginTop + marginBottom + top + bottom);
                axisConfig.axistype = chartInstance && chartInstance.args.axisType || 0;

                if(axisConfig.axistype){
                    console.log('in')
                    axisConfig.labels = findLabels(jsonData,axisConfig.axistype);
                    extension._drawaxis(axisConfig);
                    console.log(axisConfig);
                }
            },

            _drawaxis : function (conf) { 
                var extension = this,
                    chart = extension.chart,
                    chartInstance = chart.chartInstance,
                    paper = chartInstance && chartInstance.apiInstance.components.paper,
                    axis = new (FusionCharts.getComponent('main', 'axis'))(),
                    axisConfig = conf,
                    labels = axisConfig.labels,
                    top = axisConfig.top,
                    left = axisConfig.left,
                    axisLen = axisConfig.len,
                    axistype = axisConfig.axistype,
                    range = setAxisRange(axistype,labels);
                            
                    axis.getScaleObj().setConfig('graphics', {
                       paper: paper
                    });
                    axis.setRange(range.max,range.min);
                    axis.setAxisPosition(left,top);
                    

                    if(axisConfig.axistype == 'x'){
                        axis.setAxisLength(axisLen);
                        axis.getScaleObj().getIntervalObj().manageIntervals = function () {
                            var intervals = this.getConfig('intervals'),
                                scale = this.getConfig('scale'),
                                majorIntervalObj = intervals.major,
                                intervalMin,
                                intervalMax,
                                intervalStep,
                                range,
                                len,
                                i;

                            majorIntervalObj.intervalPoints.length = 0;
                            majorIntervalObj.formatter = function(val) {
                                return labels[val];
                            }

                            for (i = 0, len = labels.length; i < len; i += 1) {
                                majorIntervalObj.intervalPoints.push(i);
                            }

                            return this;
                        };
                    }else{
                        axis.setAxisLength(axisConfig.height);
                        axis.getScaleObj().setConfig("vertical", true);
                    }

                    axis.draw();
            }
        }]);
    }
]);