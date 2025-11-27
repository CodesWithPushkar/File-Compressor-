const { exec } = require('child_process');
const path = require('path');


function runCompression(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
  
    const executablePath = path.resolve(__dirname, '..', 'bin', 'my_compressor');
    const command = `${executablePath} "${inputPath}" "${outputPath}"`;

    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(new Error(`C program execution failed: ${stderr || stdout}`));
      }
      if (stderr) {
        console.warn(`C program stderr: ${stderr}`);
      }
      console.log(`C program stdout: ${stdout}`);
      resolve();
    });
  });
}


function runDecompression(inputPath, outputPath) {
  return new Promise((resolve, reject) => {

    const executablePath = path.resolve(__dirname, '..', 'bin', 'my_decompressor');
    const command = `${executablePath} "${inputPath}" "${outputPath}"`;

    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(new Error(`C program execution failed: ${stderr || stdout}`));
      }
      if (stderr) {
        console.warn(`C program stderr: ${stderr}`);
      }
      console.log(`C program stdout: ${stdout}`);
      resolve();
    });
  });
}


module.exports = { runCompression, runDecompression };