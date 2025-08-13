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

    var data = {"OkPercent": 87.16497486584936, "KoPercent": 12.835025134150634};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.14216506768494927, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.002612923944612284, 500, 1500, "updateBooking"], "isController": false}, {"data": [0.8201471841735961, 500, 1500, "auth"], "isController": false}, {"data": [0.0014817623006309405, 500, 1500, "deleteBooking"], "isController": false}, {"data": [0.011195901249513598, 500, 1500, "getBooking"], "isController": false}, {"data": [0.0018547635717508903, 500, 1500, "partialUpdateBooking"], "isController": false}, {"data": [0.014881692034067162, 500, 1500, "createBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5548427, 712142, 12.835025134150634, 3928.4046393693766, 0, 198745, 5744.0, 7564.0, 7679.0, 8012.990000000002, 513.5440997509484, 513.5515060947894, 146.4491660331739], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["updateBooking", 924826, 123332, 13.33569774206175, 5748.033799871518, 0, 102143, 6136.0, 7335.0, 7551.0, 7855.990000000002, 85.61758510577334, 88.27069910083117, 38.775430943172736], "isController": false}, {"data": ["auth", 925643, 103057, 11.133557969973305, 545.2146605116936, 0, 198745, 234.0, 702.0, 718.9500000000007, 2337.7900000000336, 85.7011465051185, 77.47410881495593, 18.338604630130533], "isController": false}, {"data": ["deleteBooking", 923225, 141574, 15.334723388123155, 5644.981005713465, 0, 117483, 6244.0, 7444.0, 7686.950000000001, 8170.0, 85.4811447978234, 75.97474759680487, 18.262199827742613], "isController": false}, {"data": ["getBooking", 925160, 105985, 11.455856284318388, 2887.6916327986937, 0, 96275, 3215.0, 3933.9000000000015, 4129.0, 6681.620000000061, 85.65107491099153, 93.46394170397669, 12.273948096087173], "isController": false}, {"data": ["partialUpdateBooking", 924107, 133365, 14.431770346940343, 5991.420781359648, 0, 108861, 6203.0, 7385.9000000000015, 7603.0, 8623.990000000002, 85.5565587433308, 88.04848961060674, 24.532435325857058], "isController": false}, {"data": ["createBooking", 925466, 104829, 11.32715842613343, 2761.833349901503, 0, 131232, 3202.0, 3861.0, 4032.0, 4223.0, 85.6816888402606, 90.46321612977009, 34.30672259009314], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 606543, 85.1716371173165, 10.931801031175143], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5, 7.021071640206588E-4, 9.011563097072378E-5], "isController": false}, {"data": ["503/Service Unavailable", 42087, 5.909916842427493, 0.7585393121329703], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (restful-booker.herokuapp.com)", 2, 2.808428656082635E-4, 3.604625238828951E-5], "isController": false}, {"data": ["403/Forbidden", 49091, 6.893428557787632, 0.8847732879967601], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1, 1.4042143280413176E-4, 1.8023126194144754E-5], "isController": false}, {"data": ["404/Not Found", 14413, 2.023894111005951, 0.2597673178362084], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5548427, 712142, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 606543, "403/Forbidden", 49091, "503/Service Unavailable", 42087, "404/Not Found", 14413, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["updateBooking", 924826, 123332, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 101112, "503/Service Unavailable", 11430, "403/Forbidden", 6482, "404/Not Found", 4305, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1], "isController": false}, {"data": ["auth", 925643, 103057, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 101147, "503/Service Unavailable", 1909, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", ""], "isController": false}, {"data": ["deleteBooking", 923225, 141574, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 101114, "403/Forbidden", 26215, "503/Service Unavailable", 9327, "404/Not Found", 4917, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (restful-booker.herokuapp.com)", 1], "isController": false}, {"data": ["getBooking", 925160, 105985, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 101088, "503/Service Unavailable", 4366, "404/Not Found", 530, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", ""], "isController": false}, {"data": ["partialUpdateBooking", 924107, 133365, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 101075, "403/Forbidden", 16394, "503/Service Unavailable", 11233, "404/Not Found", 4661, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2], "isController": false}, {"data": ["createBooking", 925466, 104829, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 101007, "503/Service Unavailable", 3822, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
