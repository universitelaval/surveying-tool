/*
 * Surveying tool generator - Université Laval
 * ------------------------------------
 * Copyright (C) 2022 Université Laval - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the MIT license, which unfortunately won't be
 * written for another century.
 *
 * Last update: 5 mai 2022 | 15:06
 */

var pdfURL;
var pdfFileName = 'dc81a165fb79.pdf';

var docCoverURL;
var docCoverURLBlob = {
    blob: "empty"
};

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
var numerization;
var colorPicker;

var splitChar = "_";

var rootFolderName = splitChar + "Package";
var activitieDirName;
var activityArr = [];

// Swith to hide console logging
// (Debug mode)
var msgSwitch = false;
// Display init...
DisplayMessage('✅ External libraries loaded correctly.');

// Main container zip
var mainZip = new JSZip();

// PDFLIB required imports
const { degrees, PDFDocument, PDFPage, PDFRef, rgb, StandardFonts } = PDFLib;

// PDF.js required imports
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

// ****************************************

// Form UI References
// Generate button
var generateBtn = document.querySelector("body > main > section > section > form > button");

// Language dropdown
var dropDown = document.querySelector("body > main > section > section > form > div:nth-child(2) > div > div:nth-child(3) > select");

// File input
// var fileInput = document.querySelector("body > main > section > section > form > div:nth-child(3) > div > div > input");
var fileInput = document.querySelector("body > main > section.portfolio-block.photography > section > form > div:nth-child(3) > div > div:nth-child(3) > input");

// ****************************************

// Listen for change on the file input...
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
       // DisplayMessage(content);

       // Assign the data URL to global variable
       pdfURL = content;

    }
    // Activate the button when a file is read
    generateBtn.removeAttribute('disabled');
    generateBtn.setAttribute('class', "btn btn-primary");

});

// ****************************************

// Create the naming scheme for the subfolder
async function CreateFolderName() {

    // We must put this first to display the modal...
   // Get a count of all textfield (to define the number of exercise)
   totalEx = await TextFieldsCount(pdfURL);

   // Disable the generate button on loading
   generateBtn.setAttribute('disabled', true);

   // Define the activity info from the form inputs values
   suffix = document.querySelector("body > main > section > section > form > div:nth-child(1) > div > div:nth-child(1) > input").value;
   uniqueID = document.querySelector("body > main > section > section > form > div:nth-child(1) > div > div:nth-child(2) > input").value;
   exName = document.querySelector("body > main > section > section > form > div:nth-child(1) > div > div:nth-child(3) > input").value;
   docName = document.querySelector("body > main > section > section > form > div:nth-child(2) > div > div:nth-child(1) > input").value;
   charLimit = document.querySelector("body > main > section > section > form > div:nth-child(2) > div > div:nth-child(2) > input").value;

   // Hidden values
   // Language
   language = GetSelectedLanguage();

    // Numerate dropdown
    var numDropDown = document.querySelector("body > main > section.portfolio-block.photography > section > form > div:nth-child(3) > div > div:nth-child(1) > select").value;

    // Check the choice value
    if (numDropDown == 1) {
        numerization = true;
    } else {
        numerization = false;
    }

    // Color picker
    colorPicker = document.querySelector("#color-picker1").value;

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
        charLimit = 1000;
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
    DisplayMessage(activityArr);

    // Create the list, to display in the modal (for validation feedback)
    document.querySelector("#exampleModalCenter > div > div > div.modal-body").innerHTML = AssembleModalList(activityArr);

    // Load the imported PDF in memory
    CreateNewFileFromUrl("Retrieving the PDF file...", pdfURL, "function", ReadZipTemplate);
}

// ****************************************

// Helper functions

// 1) Format file size
function returnFileSize(number) {
  if(number < 1024) {
    return number + 'bytes';
  } else if(number >= 1024 && number < 1048576) {
    return (number/1024).toFixed(1) + 'KB';
  } else if(number >= 1048576) {
    return (number/1048576).toFixed(1) + 'MB';
  }
}

// 2) Assemble the file list (for the modal)
function AssembleModalList(myFiles) {
    var listStr = `Cela peut prendre quelques minutes... Vous avec le temps \nd\'aller chercher un bon café! ☕️😉<br><br>📁 ${uniqueID + rootFolderName }.zip:<br>`;
    for (var i = 0; i < myFiles.length; i++) {
        listStr += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + (i+1) + ' - ' + myFiles[i] + '.zip<br>';
    }
    return listStr;
}

// 3) Retrieve and define the selected language
function GetSelectedLanguage() {
    var selectedLang;
    if (dropDown.value == '12') {
        selectedLang = 'french';
    } else {
        selectedLang = 'english';
    }
    return selectedLang;
}

// 4) Custom logging function
function DisplayMessage(content) {

    // console.log when true...
    if (msgSwitch == true) {
        console.log(content);
    } else {
        return;
    }
}

// 5) Parametric XMLHttpRequest
function CreateNewFileFromUrl(msg, url, nextActionType, actionObj) {

  // See what is happening
  DisplayMessage(msg);

  // XMLHttpRequest
  var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var a = document.createElement('a'); // create html element anchor
      a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob

      // Branching...
      // A) Executing a function
      if (nextActionType == 'function') {
        actionObj(xhr.response);
      }
      // B) Defining a variable
      else if (nextActionType == 'define') {
        // Need to use an object property
        // to pass/use it as a reference...
        actionObj.blob = xhr.response;
      }

    };
    xhr.open('GET', url);
    xhr.send();
}

// ****************************************

// Read the zip template, when PDF is loaded in memory
function ReadZipTemplate(pdffile) {

    // Get the .zip template, according to the selected language...
    // French:
    if (language == 'french') {
        selectedLanguageFilePath = zipTemplateFR;

    // English:
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

            // Assemblage of the package.zip...
                // 1) SetSubFolderName
                // 2) AddFilesToZipTemplate
                // 3) AddToMainZip

            // Set the subfolders names
            await SetSubFolderName(pdffile, request.response);

            // Generate the download of the main package.zip
            DownloadMyZipPackage();
        };
    };
    request.send();
}

function DownloadMyZipPackage() {

    // Save the main container
    mainZip.generateAsync({type:"blob"})
    .then(function(content) {

        // Use filesaver.js to trigger the download of the package.zip
        saveAs(content, uniqueID + rootFolderName + ".zip");

        // Move to end point and reset the mainZip
        setTimeout(MoveToEndpoint, 2000);

    });

}

// Define the subfolers names, inside the main package.zip
async function SetSubFolderName(mypdf, myzip) {

    for (var i = 0; i < activityArr.length; i++) {
        // (V1)
        // var sfn = activityArr[i] + ' - Storyline output';

        var sfn = activityArr[i];

        // Process the content of this subfolder,
        // before going forward with the loop...
            // 1) Add the PDF
            // 2) Pass the .zip template as reference
            // 3) Pass the generated subfolder name
        await AddFilesToZipTemplate(mypdf, myzip, sfn);
        }
    // ...
    // Execution go back to: [ReadZipTemplate]
}

// Promised return function
function AddFilesToZipTemplate(mypdf, myzip, subFolderName) {

    return new Promise(function(resolve, reject) {

        // ****************************************

        var jsZip = new JSZip();

        // Here we load the .zip used as a template, and read it...
        // creating the root folder with the subFolderName (loadAsync)....
        jsZip.folder(subFolderName).loadAsync(myzip, {createFolders: true}).then(function (zip) {

            // We define the path where to put the uploaded PDF file...
            var destination = zip.folder("assets/external_files");
            var destination_b = zip.folder("assets/js")

            // ****************************************
            // Path for the cover image...
            var docCoverDestination = zip.folder("assets/img");

            // Add the PDF blob here...
            destination.file(pdfFileName, mypdf);

            // Define the js config here...
            var taxonomyContent = `
             // See where this is executed...
             // console.log('*-----------------------*');
             // console.log('✅ External <config.js> have run...');

             var configurations = {
                 'document_title' : 'Document',
                 'exercise_name' : '${exName}',
                 'file_name' : '${docName}',
                 'file_size' : '${docSize}',
                 'max_characters' : ${charLimit},
                 'numerization' : ${numerization},
                 'color_theme' : '${colorPicker}'
             }`;
             // Add the js taxonomy here...
            destination_b.file("config.js", taxonomyContent);

            // Add the image blob here...
            docCoverDestination.file(docCoverName, docCoverURLBlob.blob);

            // Push the activity to the main Zip
            jsZip.generateAsync({type:"blob"}).then(async function(content) {

                // Send the subfolder name/content to the main .zip package
                await AddToMainZip(subFolderName, content);

                // Resolve the promise...
                resolve();
                // ...
                // Execution go back to: [SetSubFolderName]
            });
        });
    });
    // (End of promised code block)
    // ****************************************
}

// ****************************************

// zip the content of the received subfolder
// and add it to the main .zip...
function AddToMainZip(subfolder, ctn) {

    return new Promise(function(resolve, reject) {
        // (V1)
        // mainZip.file(subfolder + ' - Storyline output.zip', ctn);

        mainZip.file(subfolder + '.zip', ctn);

        // Resolve the promise...
        resolve();
        // Execution go back to: [AddFilesToZipTemplate]
    });
}

// ****************************************

// Reset the main .zip, clear the activity
// array and reload the page
function MoveToEndpoint() {

    DisplayMessage('Endpoint reached...');

    // Reset the main zip...
    mainZip = new JSZip();
    activityArr = [];
    console.clear();
    location.reload()
}

// ****************************************

// Count the text fields with the PDFLIB API
async function TextFieldsCount(doc) {
   // Fetch the PDF with form fields
   const formUrl = doc;
   const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());

   // Load a PDF with form fields
   const pdfDoc = await PDFDocument.load(formPdfBytes);

   // Get the form containing all the fields
   const form = pdfDoc.getForm();

   // Retrieve existing text fields and count them
   var count = 0;
   for (var field of form.getFields()) { // Get all acroform fields.

      // Reference:
      // For inspecting the constructor.name of different field type:
      // DisplayMessage(field.constructor.name);

      if (field.constructor.name == "PDFTextField") {
         count += 1;
      }
   }
   // Preview the number of fields
   DisplayMessage("🔎 " + count + " Text fields found...");
   return count;
}

// ****************************************

// Retrieve the png image for the top
// Asynchronous download PDF as an ArrayBuffer
 var pdf = fileInput;

 pdf.onchange = function (ev) {
   if (file = pdf.files[0]) {
     fileReader = new FileReader();
     fileReader.onload = function (ev) {

       DisplayMessage(ev);
       var loadingTask = pdfjsLib.getDocument(fileReader.result);

       loadingTask.promise
         .then(function (pdf) {
           DisplayMessage('PDF loaded');

           // Fetch the first page
           var pageNumber = 1;
           pdf.getPage(pageNumber).then(function (page) {
             DisplayMessage('Page loaded');

             var scale = 0.8;
             DisplayMessage(page);
             var viewport = page.getViewport({ scale: scale });
             var canvas = document.createElement('canvas');

             var context = canvas.getContext('2d');
             canvas.height = viewport.height;
             canvas.width = viewport.width;

             var renderContext = {
               canvasContext: context,
               viewport: viewport
             };

             var renderTask = page.render(renderContext);

             renderTask.promise.then(function () {

               // DisplayMessage(canvas.toDataURL('image/png'));
               docCoverURL = canvas.toDataURL('image/png');
               canvas.style.visibility = 'hidden';

              image = document.createElement('img');
              image.src = docCoverURL;

              // Retrieve the PDF cover as image, and load it in memory
              CreateNewFileFromUrl("Retrieving the cover image...", docCoverURL, "define", docCoverURLBlob);

             });
           });
         }, function (error) {
           DisplayMessage(error);
         });
     };
     fileReader.readAsArrayBuffer(file);
   }
 }

