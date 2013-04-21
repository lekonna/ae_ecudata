// script for adding ecu log data to after effects
// the log data will be added as compositions
function parseList(selWin,logData)
{
   delete selWin.myDrop;
   var new_headers = new Array();

   for( var i = 0; i < selWin.headers.length ; i++)
   {
       var nonzero = 0;
       var nonchange = 0;
       var old_val = logData[0][i];
       for( var ii = 0; ii < logData.length-1; ii ++) 
       {
            if (logData[ii][i]!=0) nonzero = 1;
            if (logData[ii][i]!=old_val) nonchange=1;
            old_val = logData[ii][i];
      }
      if (selWin.parseZero.value || selWin.parseStat.value) { 
        if (nonzero && nonchange && selWin.parseZero.value && selWin.parseStat.value)
        {
           new_headers.push(selWin.headers[i]);
        }
        else if (nonzero && selWin.parseZero.value && !selWin.parseStat.value) 
        { 
           new_headers.push(selWin.headers[i]);
        }
        else if (nonchange && selWin.parseStat.value && !selWin.parseZero.value) new_headers.push(selWin.headers[i]);
      } 
      else 
      {
        new_headers.push(selWin.headers[i]);
      }                  
   }
   selWin.myDrop = selWin.add("dropdownlist",[10,10,290,30],new_headers);
}
function addShadow(layer)
{        
        var valueLayer = layer.duplicate();
        valueLayer.name = layer.name;
        layer.name = layer.name + " shadow";
        layer.Effects.addProperty("Fill");
        layer.property("Effects").property("Fill").property("Color").setValue([0,0,0]);
        layer.Effects.addProperty("Fast Blur");
        layer.property("Effects").property("Fast Blur").property("Blurriness").setValue(5);
}
	
    
function add_data()
{
    var logFile = File.openDialog("please select .cvs dyno data","csv:*.csv");
	if (!logFile) {
		alert("No file selected, aborting");
		return;
        
	}

	logFile.open("r");
	logFile.readln();
	logFile.readln();
    
    var selWin   = new Window("dialog","Data select",[0,0,300,200]);

	selWin.headers = logFile.readln().split(",");			

    var logUnits = logFile.readln().split(",");

    logFile.readln();
    var curOffset = 0;    
    var logData = new Array();
    while (!logFile.eof)
    {
        var line =logFile.readln();
        var clean_line = line.replace(/\"/g,"");
        var logarr = clean_line.split(",",500);
        logData.push(logarr);
    }
    for(var i = 0; i < selWin.headers.length; i++ ) 
        selWin.headers[i]=selWin.headers[i].substring (1, selWin.headers[i].length-1);

    selWin.myDrop = selWin.add("dropdownlist",[10,10,290,30],selWin.headers);

    selWin.parseZero = selWin.add("checkbox",[10,40,300,50],"parse out zero fields");
    selWin.parseStat = selWin.add("checkbox",[10,50,300,60],"parse out non-changing fields");

    selWin.parseStat.onClick = function() {
        parseList(selWin,logData);
    }

    selWin.parseZero.onClick = function() {
        parseList(selWin,logData);
    }

    selWin.nappi     = selWin.add("button",[10,70,100,90],"Add");
    selWin.nappi.onClick = function() {

    var i;

    for( i=0; i < selWin.headers.length ; i++ ) if (selWin.headers[i] == selWin.myDrop.selection.text) break;


    var dashComp;
    for (var j = 1 ; j < app.project.numItems ; j++ )
        if ( typeof app.project.item(j) != "undefined" && app.project.item(j).name=="dash")
        {
            dashComp = app.project.item(j);
            break;
        }
    var dataFolder;
    for (var j = 1 ; j < app.project.numItems ; j++ )
        if ( typeof app.project.item(j) != "undefined" && app.project.item(j).name=="ecu data folder")
        {
            dataFolder = app.project.item(j);
            break;
        }
    if (!dataFolder) dataFolder = app.project.items.addFolder("ecu data folder");

    if(!dashComp)
            dashComp = app.project.items.addComp("dash",1280,720,1,10,29.97);

    var curComp = app.project.items.addComp(selWin.myDrop.selection.text,1280,720,1,10,29.97);

    var myTextDoc  = new TextDocument(selWin.myDrop.selection.text);
    myTextDoc.text = selWin.myDrop.selection.text;
    var myLayer    = curComp.layers.addText(myTextDoc);
    myLayer.name   = selWin.myDrop.selection.text;
    var textProp   = myLayer.property("Source Text");
    var textPos    = myLayer.property("position");
    var textDoc    = textProp.value;

    textDoc.justification = ParagraphJustification.RIGHT_JUSTIFY;
    textDoc.fontSize = 56;
    textProp.setValue(textDoc);
    textPos.setValue([curComp.width-20,100+curOffset]);
    for( var ii = 0 ; ii < logData.length; ii++) 
    {
        textProp.setValueAtTime(logData[ii][0], new TextDocument(logData[ii][i]));
    }
    addShadow(myLayer);

    var myTextDoc2    = new TextDocument(selWin.myDrop.selection.text);
    myTextDoc2.text   = selWin.myDrop.selection.text;
    var myTextLayer2  = curComp.layers.addText(myTextDoc2);
    myTextLayer2.name = selWin.myDrop.selection.text+" title";
    var textProp2     = myTextLayer2.property("Source Text");
    var textPos2      = myTextLayer2.property("position");
    var textDoc2      = textProp2.value;
    textDoc2.justification = ParagraphJustification.RIGHT_JUSTIFY;
    textDoc2.fontSize = 28;
    textProp2.setValue(textDoc2);
    textPos2.setValue([curComp.width-20,100+curOffset+36]);
    addShadow(myTextLayer2);

    curOffset += 90;
    curComp.parentFolder = dataFolder;
    dashComp.layers.add( curComp );

}           
   selWin.center();
   selWin.show();
}

add_data();
