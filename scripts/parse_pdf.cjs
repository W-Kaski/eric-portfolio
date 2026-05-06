const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('/home/EK/projects/eric-portfolio/public/resume/eric_wang_resume_ml.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('/home/EK/projects/eric-portfolio/resume.txt', data.text);
    console.log("PDF parsed successfully.");
}).catch(err => {
    console.error(err);
});
