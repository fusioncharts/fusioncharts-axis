/* global document */
/* global chai */
/* global describe */
/* global it */
var data2 =
    {
        chart: {
            'axisType': 'x',
            'borderthickness': 1,
            'canvasPadding': 13,
            'chartLeftMargin': 0,
            'chartRightMargin': 100,
            'isaxisopposite': 1,
            'datamin': 500,
            'datamax': 900
        },
        categories: ['jan']
    },
    data3 =
    {
        chart: {
            'axisType': 'y',
            'borderthickness': 1,
            'canvasPadding': 13,
            'chartLeftMargin': 0,
            'chartRightMargin': 100,
            'isaxisopposite': 1,
            'datamin': 500,
            'datamax': 900
        }
    },commonAxis;

commonAxis = new FusionCharts({
    type: 'axis',
    renderAt: document.body,
    width: '400',
    height: '300',
    dataFormat: 'json',
    dataSource: data2
});

commonAxisY = new FusionCharts({
    type: 'axis',
    renderAt: document.body,
    width: '400',
    height: '300',
    dataFormat: 'json',
    dataSource: data3
});

commonAxis.render();

expect = chai.expect;

describe('chart type Axis', function () {
    it('Normally if axis type is X then default value of isHorizontal will be 1 '+
        'or this test will fail', function () {

        var isHorizontal = commonAxis.apiInstance.config.ishorizontal,
            axisType = commonAxis.apiInstance.config.axistype === 'x',
            isMatch = (!!isHorizontal === !axisType);

        expect(isMatch).to.equal(true);
    });
    it('draw a single lable changes min to -1 or this test will fail', function () {

        var axisRange = commonAxis.apiInstance.components.axis.getRange(),
            min = axisRange.min,
            isMatch = (min == -1);

        expect(isMatch).to.equal(true);
    });
    it('if chartmargin changes axis position will change or this test will fail', function () {

        var axisConf = commonAxis.apiInstance.components.axis.getScaleObj(),
            axisLeftMargin = axisConf.config.posX.value,
            originalLeftMargin = commonAxis.apiInstance.config.marginLeft,
            isMatch = (originalLeftMargin === (axisLeftMargin - 14));

        expect(isMatch).to.equal(true);
    });

    commonAxisY.render();
    
    it('y axis max value will be 1000 or this test will fail', function () {

        var axisRange = commonAxisY.apiInstance.components.axis.getRange(),
            max = axisRange.max,
            isMatch = (max === 1000);

        expect(isMatch).to.equal(true);
    });
});
