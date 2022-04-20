// Display init
console.log('✅ External libraries loaded correctly.');

// Command reference (for creating the zip):
// zip -r -X myzip-FR.zip *

var pdfURL;
var pdfFileName = 'dc81a165fb79.pdf';

var docCoverURL;
var docCoverURLBlob;
var docCoverName = 'cover.png'

var zipTemplateFR = "template/myzip-FR.zip";
var zipTemplateEN = "template/myzip-EN.zip";
var selectedLanguageFilePath;

var totalEx;
var suffix;
var uniqueID;
var docName;
var docSize;
var charLimit;
var language = "french";

var rootFolderName = "Package";
var activitieDirName;
var activityArr = [];

// Main container zip
var mainZip = new JSZip();

// Format file size
function returnFileSize(number) {
  if(number < 1024) {
    return number + 'bytes';
  } else if(number >= 1024 && number < 1048576) {
    return (number/1024).toFixed(1) + 'KB';
  } else if(number >= 1048576) {
    return (number/1048576).toFixed(1) + 'MB';
  }
}

// References
// Generate button
var generateBtn = document.querySelector("body > main > section > section > form > button");

// File input
var fileInput = document.querySelector("body > main > section > section > form > div:nth-child(3) > div > div > input");

// Disable the generate button on loading
// generateBtn.setAttribute('disabled', true);
// generateBtn.setAttribute('className', 'btn btn-secondary btn-lg');

fileInput.addEventListener('change', function (e) {

    // Getting a hold of the file reference
    var file = fileInput.files[0];

   // Getting the file name
   var name = file.name;

   // Getting the file size
   docSize = returnFileSize(file.size);

    // setting up the reader
    var reader = new FileReader();
    reader.readAsDataURL(file);

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
       var content = readerEvent.target.result; // this is the content!

       // Preview the dataurl
       // console.log(content);

       // Assign the data URL to global variable
       pdfURL = content;

    }
    // Activate the button when a file is read
    generateBtn.removeAttribute('disabled');
    generateBtn.setAttribute('class', "btn btn-primary");

});

async function CreateFolderName() {

   // Disable the generate button on loading
   generateBtn.setAttribute('disabled', true);

   // Get a count of all textfield (to define the number of exercise)
   totalEx = await TextFieldsCount(pdfURL);

   suffix = document.querySelector("body > main > section > section > form > div:nth-child(1) > div > div:nth-child(1) > input").value;
   uniqueID = document.querySelector("body > main > section > section > form > div:nth-child(1) > div > div:nth-child(2) > input").value;
   exName = document.querySelector("body > main > section > section > form > div:nth-child(1) > div > div:nth-child(3) > input").value;
   docName = document.querySelector("body > main > section > section > form > div:nth-child(2) > div > div:nth-child(1) > input").value;
   charLimit = document.querySelector("body > main > section > section > form > div:nth-child(2) > div > div:nth-child(2) > input").value;
   language = GetSelectedLanguage();


    // Get a default answer if nothing is entered
    if (suffix.length == 0) {
        suffix = 'suffix';
    }

    if (uniqueID.length == 0) {
        uniqueID = 'XX000';
    }

    if (exName.length == 0) {
        exName = 'Exercice';
    }

    if (docName.length == 0) {
        docName = "doc";
    }

    if (totalEx.length == 0) {
        totalEx = 1;
    }

    if (charLimit == 0) {
        charLimit = 100;
    }

   var iterator = parseInt(totalEx);

    // Iterate over the total number of activity required
    for (var idx = 1; idx < iterator + 1; idx++) {
        var activityDirName = suffix + '_' + uniqueID + '_' + idx + '_' + totalEx;
        activityArr.push(activityDirName);
    }

    // Create the endpoint
    var endPoint = 'Endpoint_' + uniqueID + '_' + totalEx + '_' + totalEx;
    activityArr.push(endPoint);

    // preview the name assemblage...
    console.log(activityArr);



    //
    document.querySelector("#exampleModalCenter > div > div > div.modal-body").innerHTML = AssembleModalList(activityArr);

    // Download the files
    DownloadFiles();
}

function AssembleModalList(myFiles) {
    var listStr = 'Cela peut prendre quelques minutes... Vous avec le temps \nd\'aller chercher un bon café! ☕️😉<br><br>📁 Package.zip:<br>';
    for (var i = 0; i < myFiles.length; i++) {
        listStr += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + (i+1) + ' - ' + myFiles[i] + '.zip<br>';
    }
    return listStr;
}

function GetSelectedLanguage() {

    var selectedLang;
    var dropDown = document.querySelector("body > main > section > section > form > div:nth-child(2) > div > div:nth-child(3) > select");

    if (dropDown.value == '12') {
        selectedLang = 'french';
    } else {
        selectedLang = 'english';
    }
    return selectedLang;
}


// ****************************************

function StartHeavyLifting(url) {
    // ...

    console.log('Retrieving the blob of PDF cover...');

    var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function () {
        var a = document.createElement('a'); // create html element anchor
        a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob

        // Get the blob
        docCoverURLBlob = xhr.response;

      };

      xhr.open('GET', url);
      xhr.send();

}

// ****************************************

function DownloadFiles() {
    // ...

    console.log('Download Files...');

    // Go to end Screen... (waiting room)
    // player.SetVar('goToEndPoint', true);

    var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function () {
        var a = document.createElement('a'); // create html element anchor
        a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob

        // Send the blob to the zipping process
        // ZipFiles(xhr.response);

        // Retrieve the zip template...
        ReadTemplate(xhr.response);

        // Uncomment this to trigger download
        // a.download = pdfFileName; // Set the file name.
        // a.style.display = 'none'; // set anchor as hidden
        // document.body.appendChild(a);
        // a.click();
        // a.remove()
      };

      xhr.open('GET', pdfURL);
      xhr.send();

}


function ReadTemplate(pdffile) {

   // Get the selected language version
   if (language == 'french') {
      selectedLanguageFilePath = zipTemplateFR;
   } else {
      selectedLanguageFilePath = zipTemplateEN;
   }

    var request = new XMLHttpRequest();
    request.open('GET', selectedLanguageFilePath, true);
    request.responseType = 'blob';
    request.onload = function() {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload = async function(e){

            // console.log('DataURL:', e.target.result);
            await SetSubFolderName(pdffile, request.response);

            // Save the files to the main zip
            SaveToMain();

        };
    };
    request.send();

}

function SaveToMain() {

    // Save the main container
    mainZip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        // saveAs(content, rootFolderName + ".zip");
        // saveAs(content, "myCourse_XX98_1_4 - Storyline output" + ".zip");
        saveAs(content, rootFolderName + ".zip");

        // Move to end point and reset the mainZip
        setTimeout(MoveToEndpoint, 2000);

    });

}


async function SetSubFolderName(mypdf, myzip) {

    for (var i = 0; i < activityArr.length; i++) {
        var sfn = activityArr[i] + ' - Storyline output';

        await AddFilesToTemplate(mypdf, myzip, sfn);

        }

}

// Promised return function
function AddFilesToTemplate(mypdf, myzip, subFolderName) {

    return new Promise(function(resolve, reject) {
        // ....

        // ****************************************

        var jsZip = new JSZip();
        //var destinationJszIP = new JSZip();

        // Here we load the .zip used as a template, and read it
        jsZip.folder(subFolderName).loadAsync(myzip, {createFolders: true}).then(function (zip) {

            // We define the path where to put the uploaded PDF file...
            var destination = zip.folder("story_content/external_files");
            var destination_b = zip.folder("assets/js")

            // ****************************************
            // Path for the cover image...
            var docCoverDestination = zip.folder("assets/img");

            // Add the PDF blob here...
            destination.file(pdfFileName, mypdf);

            // Define the js taxonomy here...
            var taxonomyContent = `
             // See where this is executed...
             console.log('✅ External <taxonomy.js> have run...');

             var myWords = {
                 'document_title' : 'Bilan réflexif',
                 'exercise_name' : '${exName}',
                 'file_name' : '${docName}',
                 'file_size' : '${docSize}',
                 'max_characters' : ${charLimit}
             }`;
             // Add the js taxonomy here...
            destination_b.file("taxonomy.js", taxonomyContent);

            // Add the image blob here...
            docCoverDestination.file(docCoverName, docCoverURLBlob);

            // Push the activity to the main Zip
            jsZip.generateAsync({type:"blob"}).then(async function(content) {
                // see FileSaver.js
                // saveAs(content, rootFolderName + ".zip");
                // saveAs(content, "myCourse_XX98_1_4 - Storyline output" + ".zip");
                await AddToMain(subFolderName, content);
                resolve();
            });
        });
        // Resolve the promise...
        // ****************************************

    });
}

function AddToMain(subfolder, ctn) {

    return new Promise(function(resolve, reject) {
        mainZip.file(subfolder + ' - Storyline output.zip', ctn);
        // Resolve the promise
        resolve();
    });
}


function MoveToEndpoint() {

    console.log('Endpoint reached...');

    mainZip = new JSZip();
    activityArr = [];
    console.clear();
    location.reload()
}



// PDFLIB
const { degrees, PDFDocument, PDFPage, PDFRef, rgb, StandardFonts } = PDFLib

async function TextFieldsCount(doc) {
   // Fetch the PDF with form fields
   const formUrl = doc;
   const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());

   // Load a PDF with form fields
   const pdfDoc = await PDFDocument.load(formPdfBytes);

   // Get the form containing all the fields
   const form = pdfDoc.getForm();

   // ****************************************

   // Retrieve existing text fields and count them
   var count = 0;
   for (var field of form.getFields()) { // Get all acroform fields.

      // Inspect the constructor.name of different field type
      // console.log(field.constructor.name);

      if (field.constructor.name == "PDFTextField") {
         count += 1;
      }
   }

   // Preview the number of fields
   console.log(count);

   // ****************************************

   return count;

}


// Retrieve the png image for the top
var pdfjsLib = window['pdfjs-dist/build/pdf'];
 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

 //
 // Asynchronous download PDF as an ArrayBuffer
 var pdf = fileInput;

 pdf.onchange = function (ev) {
   if (file = pdf.files[0]) {
     fileReader = new FileReader();
     fileReader.onload = function (ev) {
       console.log(ev);

       var loadingTask = pdfjsLib.getDocument(fileReader.result);

       loadingTask.promise
         .then(function (pdf) {
           console.log('PDF loaded');

           // Fetch the first page
           var pageNumber = 1;
           pdf.getPage(pageNumber).then(function (page) {
             console.log('Page loaded');

             var scale = 0.8;
             console.log(page);
             var viewport = page.getViewport({ scale: scale });
             var canvas = document.createElement('canvas');
             // var canvas = document.getElementById('the-canvas');
             var context = canvas.getContext('2d');
             canvas.height = viewport.height;
             canvas.width = viewport.width;

             var renderContext = {
               canvasContext: context,
               viewport: viewport
             };

             var renderTask = page.render(renderContext);

             renderTask.promise.then(function () {
               // console.log(canvas.toDataURL('image/png'));
               docCoverURL = canvas.toDataURL('image/png');
               canvas.style.visibility = 'hidden';

              image = document.createElement('img');
              image.src = docCoverURL;

              StartHeavyLifting(docCoverURL);

             });
           });
         }, function (error) {
           console.log(error);
         });
     };
     fileReader.readAsArrayBuffer(file);
   }
 }
