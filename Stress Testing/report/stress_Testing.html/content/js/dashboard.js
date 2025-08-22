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

    var data = {"OkPercent": 98.67389650908301, "KoPercent": 1.326103490916993};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.36741810806475816, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3023501945525292, 500, 1500, "updateBooking"], "isController": false}, {"data": [0.44635845658784284, 500, 1500, "auth"], "isController": false}, {"data": [0.3128211973570046, 500, 1500, "deleteBooking"], "isController": false}, {"data": [0.41004960891134307, 500, 1500, "getBooking"], "isController": false}, {"data": [0.3081193280556092, 500, 1500, "partialUpdateBooking"], "isController": false}, {"data": [0.4121876685241776, 500, 1500, "createBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 193273, 2563, 1.326103490916993, 2572.485701572387, 228, 50279, 9285.0, 13271.0, 14126.95, 14618.0, 471.031075821495, 402.2272105285765, 150.9293778895201], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["updateBooking", 32125, 540, 1.6809338521400778, 3647.206319066153, 228, 25030, 3566.0, 12116.0, 13624.0, 14579.970000000005, 78.91123376639327, 70.60462700778427, 40.11048944846267], "isController": false}, {"data": ["auth", 33873, 12, 0.03542644584182092, 1319.263897499482, 910, 50279, 937.0, 1377.0, 2112.0, 7155.860000000022, 82.55284303188495, 62.18256881383753, 19.832030650237986], "isController": false}, {"data": ["deleteBooking", 29966, 936, 3.1235400120136156, 3292.6362544216654, 228, 20434, 3236.0, 10293.0, 11363.95, 12435.980000000003, 73.58115756621837, 54.050248073362624, 17.639900669366067], "isController": false}, {"data": ["getBooking", 32857, 148, 0.4504367410293088, 1943.0636089722227, 228, 47634, 2069.5, 5462.800000000003, 6918.800000000003, 7669.0, 80.7678315077383, 74.07927570791995, 12.974911632914052], "isController": false}, {"data": ["partialUpdateBooking", 31074, 748, 2.40715710883697, 3599.420608869144, 229, 40565, 3430.0, 11498.0, 12201.95, 14350.980000000003, 76.30033958733877, 68.17526976076648, 24.55117388059564], "isController": false}, {"data": ["createBooking", 33378, 179, 0.5362813829468512, 1826.9316615734879, 228, 27374, 1935.5, 5173.0, 6190.0, 7266.760000000038, 82.08646893905858, 75.91945825878584, 36.89385734454159], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 963, 37.57315645727663, 0.498258939427649], "isController": false}, {"data": ["403/Forbidden", 1175, 45.844713226687475, 0.6079483424999871], "isController": false}, {"data": ["404/Not Found", 425, 16.582130316035894, 0.21989620898935702], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 193273, 2563, "403/Forbidden", 1175, "503/Service Unavailable", 963, "404/Not Found", 425, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["updateBooking", 32125, 540, "503/Service Unavailable", 220, "403/Forbidden", 177, "404/Not Found", 143, "", "", "", ""], "isController": false}, {"data": ["auth", 33873, 12, "503/Service Unavailable", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["deleteBooking", 29966, 936, "403/Forbidden", 600, "503/Service Unavailable", 215, "404/Not Found", 121, "", "", "", ""], "isController": false}, {"data": ["getBooking", 32857, 148, "503/Service Unavailable", 124, "404/Not Found", 24, "", "", "", "", "", ""], "isController": false}, {"data": ["partialUpdateBooking", 31074, 748, "403/Forbidden", 398, "503/Service Unavailable", 213, "404/Not Found", 137, "", "", "", ""], "isController": false}, {"data": ["createBooking", 33378, 179, "503/Service Unavailable", 179, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
