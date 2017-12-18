
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

//Global var to allocate clean info.
var lines = [];

//Function to process all data.
function processData(csv) {
  lines = [];
  var allTextLines = csv.split(/\r\n|\n/);
  for (var i=0; i<allTextLines.length; i++) {
      var data = allTextLines[i].split(';');
      var tarr = [];
      for (var j=0; j<data.length; j++) {
        var cleanRow = [];
        cleanRow[j] = data[j].substr(1).slice(0,-1);
        tarr.push(cleanRow[j]);
      }
      lines.push(tarr);
  }
  DrawGeneralTicketInfo(lines);
  document.getElementById("General").checked = true;
}

//Manage the chart that is going to be drew.
function DrawChart(chartType) {
  if(chartType=="General") DrawGeneralTicketInfo(lines);
  else if (chartType=="CreatedBy") DrawCreatedByChart(lines);
  else if(chartType=="Domain") DrawDomainChart(lines);
  else if(chartType=="Priority") DrawPriorityChart(lines);
}

//Draw general chart for tickets. Created, rejected and ticket step.
function DrawGeneralTicketInfo(info) {
  var tCreated = info.length-1;
  var tRejected=0, tProc=0, tRepro=0, tVeri=0;

  for (var i = 0; i < info.length; i++) {
    if(info[i][4]=="Y") tRejected++;
    if(info[i][5]=="Processing") tProc++;
    if(info[i][5]=="Reproduction") tRepro++;
    if(info[i][6]=="Verified") tVeri++;
  }

  var data = google.visualization.arrayToDataTable([
    ["Type", "Number", { role: "style" }, {role: "annotation"} ],
    ["Created", tCreated, "#2196f3", tCreated],
    ["Rejected", tRejected, "#f44336", tRejected],
    ["Processing", tProc, "#9c27b0", tProc],
    ["Reproduction", tRepro, "#4caf50", tRepro],
    ["Verified", tVeri, "#3f51b5", tVeri]
  ]);

  var options = {
    title : 'General Ticket Information',
    'width': 1200,
    'height': 850,
    vAxis: {title: 'Number of tickets'},
    hAxis: {title: 'Type'},
    bar: {groupWidth: "95%"},
    legend: { position: "none" },
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}

//Draw chart for Created by;
function DrawCreatedByChart(info){
  var orderInfo = info.sort();
  var completeInfo = [];
  completeInfo.push(['Ticket Type', 'Categorizing', 'Reproduction', 'Processing', 'Rejected', { role: 'annotation' } ]);
  
  var tester="None", catCount=0, reproCount=0, proCount=0, rejCount=0; 
  for (var i = 0; i < orderInfo.length; i++) {
    var testerInfo = [tester, catCount, reproCount, proCount, rejCount];
    if(tester == orderInfo[i][0]){

      switch(orderInfo[i][5]) {
        case "Categorizing":
          catCount++;
          break;
        case "Reproduction":
          reproCount++;
          break;
        case "Processing":
          proCount++;
          break;
        default:
          break;
      };

      if(orderInfo[i][4] == "Y") rejCount++;
      if(i == orderInfo.length-1){
        var totalTickets = catCount+reproCount+proCount+rejCount;
        testerInfo.push(totalTickets);
        completeInfo.push(testerInfo);
      } 
    } else{
      var totalTickets = catCount+reproCount+proCount+rejCount;
      testerInfo.push(totalTickets);
      if((tester!="None" && tester!="Reported by")) {completeInfo.push(testerInfo)};
      catCount=reproCount=proCount=rejCount=0;
      tester = orderInfo[i][0];
    }
  }

  var data = google.visualization.arrayToDataTable(completeInfo);

  var options = {
    width: 1200,
    height: 850,
    legend: { position: 'top', maxLines: 3 },
    bar: { groupWidth: '75%' },
    isStacked: true,
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}

//Draw chart for Domain
function DrawDomainChart(info) {
  var dataToDraw = [['Domain', 'Tickets']];
  var domains = [];
  for (var i = 0; i < info.length; i++) {domains.push(info[i][2])};
  domains = domains.sort();
  var domain = "None", count=0;
  for (var i = 0; i < domains.length; i++) {
    if(domain == domains[i]){
      count++;
    } else{
      var line = [];
      line.push(domain);
      line.push(count);
      dataToDraw.push(line);
      count=0;
      domain = domains[i];
    }
  }

  var data = google.visualization.arrayToDataTable(dataToDraw);

  var options = {
    title: 'Tickets by Domain',
    is3D: true,
  };

  var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}

//Draw chart for Priority
function DrawPriorityChart(info) {
  var dataToDraw = [["Priority", "Tickets"]];
  var priorityCount = [];
  for (var i = 1; i < info.length; i++) {priorityCount.push(info[i][3])};
  priorityCount = priorityCount.sort();
  var priority="None", count=0;
  for (var i = 0; i < priorityCount.length; i++) {
    if(priority == priorityCount[i]){
      count++;
    } else{
      var line = [];
      line.push(priority);
      line.push(count);
      if(priority!="None") dataToDraw.push(line);
      count = 0;
      priority = priorityCount[i]; 
    }
  }

  var data = google.visualization.arrayToDataTable(dataToDraw);

  var options = {
    title: 'Tickets by Priority',
    chartArea: {width: '50%'},
    hAxis: {
      title: 'Number of tickets',
      minValue: 0
    },
    vAxis: {
      title: 'Priority'
    }
  };

  var chart = new google.visualization.BarChart(document.getElementById('chart_div'));

  chart.draw(data, options);
}



//////Functions to read the csv
function handleFiles(files) {
  if (window.FileReader) {
    getAsText(files[0]);
  } else {
    alert('FileReader are not supported in this browser.');
  }
}

function getAsText(fileToRead) {
  var reader = new FileReader();
  // Read file into memory as UTF-8      
  reader.readAsText(fileToRead);
  // Handle errors load
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event) {
  var csv = event.target.result;
  processData(csv);
}

function errorHandler(evt) {
  if(evt.target.error.name == "NotReadableError") {
      alert("Canno't read file !");
  }
}