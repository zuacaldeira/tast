var CHART1 = null;
var CHART2 = null;

$(document).ready(function () {
    activate($('#toggle_charts'));
    loadSectionImage('#charts .frontpage', 'charts.jpg');

    handleEvents();
    loadVariables();

    // Basic Charting Tool
    initOptions();

    // Improvement 1
});

function initOptions() {
    $('#select-charts-function option.active')
        .prop('selected', 'selected')
        .click();
    $('#select-charts-groupby option.active')
        .prop('selected', 'selected')
        .click();
    $('#select-charts-type option.active')
        .prop('selected', 'selected')
        .click();
}

function initOptions1() {
    $('#charts-function option.active')
        .prop('selected', 'selected')
        .click();
    $('#function-argument  option.active')
        .prop('selected', 'selected')
        .click();
    $('#function-groupby-variable  option.active')
        .prop('selected', 'selected')
        .click();
    $('#charts-type option.active')
        .prop('selected', 'selected')
        .click();
    $('#orderby option.active')
        .prop('selected', 'selected')
        .click();
}

function handleEvents() {
    $(window).on('resize', function () {
        debounce('#charts .frontpage', 'charts.jpg');
    });

    $(document).on('_variables_loaded', function (event, data) {
        initChartsDashboard1(data);
        initOptions1();
    });

    $('select').on('click', 'option', function (event) {
        event.preventDefault();
        $(this).parent().find('.active').toggleClass('active');
        $(this).toggleClass('active');
    });
    $('#charts-dashboard select').on('click', 'option', function (event) {
        event.preventDefault();
        updateFormula(getSelectVariable(), getGroupByVariable());
        loadChartData(getSelectVariable(), getGroupByVariable(), getChartTypeValue());

    });
    $('#charts-dashboard-improved select').on('click', 'option', function (event) {
        event.preventDefault();
        updateFormula1();
        loadChartData1();
    });
}

function loadVariables() {
    $.ajax({
        url: getDomain() + 'ClientApi/data/variables.json',
        success: function (result) {
            $(document).trigger('_variables_loaded', [result]);
        },
        error: function () {
            alert('Error fetching variables.json');
        }
    });
}


function getSelectFunction() {
    return $('#select-charts-function .active').text();
}

function getSelectVariable() {
    return $('#select-charts-function .active').val();
}

function getSelectGroupBy() {
    return $('#select-charts-groupby .active').text();
}

function getGroupByVariable() {
    return $('#select-charts-groupby .active').val();
}

function getSelectChartType() {
    return $('#select-charts-type .active').text();
}

function getChartTypeValue() {
    return $('#select-charts-type .active').val();
}

function updateFormula(cFunction, cGroupBy) {
    $('#charts-dashboard .formula-function').text(cFunction);
    $('#charts-dashboard .formula-domain-variable').text(cGroupBy);
}

function updateFormula1() {
    var cFunction = $('#charts-function .active').val();
    var fArgument = $('#function-argument .active').val();
    var groupBy = $('#function-groupby-variable .active').val();
    var orderBy = getOrderBy();

    $('#charts-dashboard-improved .formula-function')
        .text(cFunction + '(' + fArgument + ')');
    $('#charts-dashboard-improved .formula-domain-variable')
        .text(groupBy);

    if (orderBy) {
        $('#charts-dashboard-improved .formula-orderBy')
            .text('ORDER BY ' + orderBy.variable + ' ' + orderBy.direction);
    }

}

function getOrderBy() {
    var orderBy = $('#orderby .active').val();
    switch (orderBy) {
        case 'xASC':
            return {
                variable: $('#function-groupby-variable .active').val(),
                direction: 'ASC'
            };
        case 'xDESC':
            return {
                variable: $('#function-groupby-variable .active').val(),
                direction: 'DESC'
            };
        case 'fxASC':
            return {
                variable: 'value',
                direction: 'ASC'
            };
        case 'fxDESC':
            return {
                variable: 'value',
                direction: 'DESC'
            };
    }
    return {
        variable: '',
        direction: ''
    };
}

function loadChartData(selectVariable, groupByVariable, chartType) {
    //updateFormula(selectVariable, groupByVariable);
    $.ajax({
        url: getDomain() + 'ClientApi/getChartData',
        type: 'POST',
        data: {
            select: selectVariable,
            groupBy: groupByVariable
        },
        success: function (response) {
            createChart('#chart', response, chartType);
            var code = 
                '<b class="clearfix">Figure 1: ' + getSelectChartType() +
                ' chart of <span class="float-right">' + getSelectFunction() + ' | ' + getSelectGroupBy() + '</span></b>'
            $('#chart-wrapper .chart-caption').html(code);
        },
        error: function () {
            alert('Error while loading chart data...');
        }
    });
}

/* TODO. REVIEW THIS METHOD: CHARTS BROKEN...*/
function createChart(selector, data, chartType, label) {
    var $chart = $(selector).empty();
    if (selector === '#chart-1') {
        if (CHART2) {
            CHART2.destroy();
        }
        CHART2 = new Chart($chart, {
            type: chartType,
            data: getChartData(data, label),
            options: getChartOptions(data, chartType)
        });
    } else if (selector === '#chart') {
        if (CHART1) {
            CHART1.destroy();
        }
        CHART1 = new Chart($chart, {
            type: chartType,
            data: getChartData(data, label),
            options: getChartOptions(data, chartType)
        });
    }
}

function getChartData(data, label) {
    return {
        labels: data.map(function (obj) {
            return obj[0];
        }),
        datasets: [{
            label: label,
            data: data.map(function (obj) {
                return obj[1];
            }),
            backgroundColor: data.map(function (obj) {
                return getRandomColor();
            })
        }]
    };
}

function getChartOptions(data, cType) {
    return {
        legend: {
            position: 'right'
        }
    }
}


function loadChartData1() {
    var chartFunction = $('#charts-function .active').val();
    var functionArgument = $('#function-argument .active').val();
    var groupBy = $('#function-groupby-variable .active').val();
    var orderBy = $('#orderby .active').val();
    var chartType = $('#charts-type').val();

    $.ajax({
        url: getDomain() + 'ClientApi/getChartData',
        type: 'POST',
        data: {
            select: chartFunction + '(' + functionArgument + ')',
            groupBy: groupBy,
            orderBy: getOrderBy()
        },
        success: function (response) {
            createChart('#chart-1', response, chartType);
            var code = 
                '<b class="clearfix">Figure 2: ' + $('#charts-type .active').text() + 
                ' chart of <span class="float-right">' + 
                chartFunction + '(' + $('#function-argument .active').text() + ')' + 
                ' | ' + 
                $('#function-groupby-variable .active').text() + '</span></b>';
            
            $('#chart-wrapper-1 .chart-caption').html(code);
        },
        error: function () {
            alert('Error while loading chart data...');
        }
    });
}

function initChartsDashboard1(variables) {
    $.each(variables, function (key, variable) {
        $('#function-argument').append(createOption(variable, 'slaximp'));
        $('#function-groupby-variable').append(createOption(variable, 'yeardep'));
    });
}

function createOption(variable, activeVar) {
    var $option = $('<option/>');
    $option.attr('value', variable.name).text(variable.name + ' - ' + variable.description);

    if (variable.name === activeVar) {
        $option.addClass('active');
    }
    return $option;
}
