/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.46666666666667, "KoPercent": 7.533333333333333};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5986428571428571, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7051428571428572, 500, 1500, "updateBooking"], "isController": false}, {"data": [0.03728571428571428, 500, 1500, "auth"], "isController": false}, {"data": [0.7177142857142857, 500, 1500, "deleteBooking"], "isController": false}, {"data": [0.7238571428571429, 500, 1500, "getBooking"], "isController": false}, {"data": [0.7122857142857143, 500, 1500, "partialUpdateBooking"], "isController": false}, {"data": [0.6955714285714286, 500, 1500, "createBooking"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21000, 1582, 7.533333333333333, 5658.44152380955, 0, 74074, 471.0, 24845.40000000001, 35881.90000000003, 53598.79000000004, 269.8431055086543, 227.25009546904516, 86.19420481814502], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["updateBooking", 3500, 378, 10.8, 1631.9611428571404, 0, 59139, 454.0, 3829.8, 6159.099999999993, 27542.379999999986, 46.78643995294621, 41.08593520245161, 23.72650808987675], "isController": false}, {"data": ["auth", 3500, 7, 0.2, 25649.42342857143, 1169, 74074, 25826.0, 47549.4, 52925.34999999999, 61265.99, 46.10662486332679, 34.800853343059636, 11.066902153508714], "isController": false}, {"data": ["deleteBooking", 3500, 575, 16.428571428571427, 1257.7682857142843, 268, 49806, 441.0, 2746.3000000000006, 4209.749999999992, 17185.649999999972, 47.20098178042103, 34.53704002221818, 11.284893431140512], "isController": false}, {"data": ["getBooking", 3500, 135, 3.857142857142857, 1844.2645714285752, 1, 63138, 458.5, 4125.9000000000015, 7470.95, 31058.629999999794, 46.737083873035374, 41.73643758679744, 7.4772813956360915], "isController": false}, {"data": ["partialUpdateBooking", 3500, 484, 13.82857142857143, 1448.4219999999998, 24, 57103, 448.0, 3021.2000000000016, 4926.299999999979, 24033.329999999703, 46.91940586626629, 40.94726195942142, 15.061011460902728], "isController": false}, {"data": ["createBooking", 3500, 3, 0.08571428571428572, 2118.8097142857123, 0, 65307, 465.0, 4996.9000000000015, 8784.749999999993, 31503.079999999914, 46.709639535038896, 43.09278338154436, 20.987720160881345], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 13, 0.8217446270543616, 0.06190476190476191], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, 0.1264222503160556, 0.009523809523809525], "isController": false}, {"data": ["403/Forbidden", 1414, 89.38053097345133, 6.733333333333333], "isController": false}, {"data": ["404/Not Found", 142, 8.975979772439949, 0.6761904761904762], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 11, 0.695322376738306, 0.05238095238095238], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21000, 1582, "403/Forbidden", 1414, "404/Not Found", 142, "503/Service Unavailable", 13, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["updateBooking", 3500, 378, "403/Forbidden", 368, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 4, "503/Service Unavailable", 3, "404/Not Found", 3, "", ""], "isController": false}, {"data": ["auth", 3500, 7, "503/Service Unavailable", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1, "", "", "", ""], "isController": false}, {"data": ["deleteBooking", 3500, 575, "403/Forbidden", 570, "404/Not Found", 3, "503/Service Unavailable", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1, "", ""], "isController": false}, {"data": ["getBooking", 3500, 135, "404/Not Found", 133, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["partialUpdateBooking", 3500, 484, "403/Forbidden", 476, "503/Service Unavailable", 3, "404/Not Found", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2, "", ""], "isController": false}, {"data": ["createBooking", 3500, 3, "503/Service Unavailable", 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
