
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusSection = document.getElementById('status-section');
const actionButton = document.getElementById('action-button'); 
const downloadButton = document.getElementById('download-button');
const dropZoneText = document.getElementById('drop-zone-text');


const modeCompress = document.getElementById('mode-compress');
const modeDecompress = document.getElementById('mode-decompress');

let selectedFile = null;
let currentMode = 'compress'; 


dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFile(e.dataTransfer.files[0]);
    }
});
actionButton.addEventListener('click', () => {
    if (selectedFile) {
        startProcess(selectedFile);
    }
});


modeCompress.addEventListener('change', () => setMode('compress'));
modeDecompress.addEventListener('change', () => setMode('decompress'));



function setMode(mode) {
    currentMode = mode;
    selectedFile = null;
    fileInput.value = ''; 
    statusSection.innerHTML = ''; 
    actionButton.disabled = true;

    if (mode === 'compress') {
        dropZoneText.textContent = 'Drag & drop your file to compress';
        actionButton.textContent = 'Compress File';
        actionButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        actionButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    } else {
        dropZoneText.textContent = 'Drag & drop your .huff file to decompress';
        actionButton.textContent = 'Decompress File';
        actionButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        actionButton.classList.add('bg-green-600', 'hover:bg-green-700');
    }
    resetButtons();
}

function handleFile(file) {
    selectedFile = file;
    actionButton.disabled = false;
    resetButtons();

 
    if (currentMode === 'decompress' && !file.name.endsWith('.huff')) {
        statusSection.innerHTML = `
            <div class="fade-in bg-red-800 p-4 rounded-lg">
                <h3 class="font-bold text-lg text-red-200">Invalid File Type</h3>
                <p class="mt-2 text-red-300">Please select a <strong>.huff</strong> file to decompress.</p>
            </div>
        `;
        actionButton.disabled = true;
        return;
    }

    const fileSize = formatFileSize(file.size);
    const fileType = file.type || 'Unknown';
    const title = currentMode === 'compress' ? 'File Ready for Compression' : 'File Ready for Decompression';
    
    statusSection.innerHTML = `
        <div class="fade-in bg-gray-700 p-4 rounded-lg">
            <h3 class="font-bold text-lg text-gray-200">${title}</h3>
            <div class="mt-2 text-gray-300 space-y-1">
                <p><span class="font-semibold">Name:</span> ${escapeHTML(file.name)}</p>
                <p><span class="font-semibold">Size:</span> ${fileSize}</p>
                <p><span class="font-semibold">Type:</span> ${fileType}</p>
            </div>
        </div>
    `;
}



async function startProcess(file) {
    actionButton.disabled = true;
    
    const endpoint = currentMode === 'compress' ? '/compress' : '/decompress';
    const actionText = currentMode === 'compress' ? 'Compressing' : 'Decompressing';
    
    actionButton.textContent = 'Uploading...';
    updateStatus('Uploading file to server...', 'text-blue-400');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            updateStatus(`${actionText} Complete!`, 'text-green-400');
            
            const blob = await response.blob();
            
            
            const contentDisposition = response.headers.get('content-disposition');
            let downloadFilename = "downloaded_file"; 
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch.length > 1) {
                    downloadFilename = filenameMatch[1];
                }
            }

            
            const url = window.URL.createObjectURL(blob);
            
       
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = downloadFilename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
       
            downloadButton.href = url;
            downloadButton.download = downloadFilename;
            actionButton.classList.add('hidden');
            downloadButton.classList.remove('hidden');

          
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);

        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    } catch (error) {
        console.error('Error during processing:', error);
        updateStatus(`Error: ${error.message}`, 'text-red-400', false);
    } finally {
      
        actionButton.disabled = false;
        actionButton.textContent = currentMode === 'compress' ? 'Compress File' : 'Decompress File';
    }
}

function resetButtons() {
    downloadButton.classList.add('hidden');
    actionButton.classList.remove('hidden');
    downloadButton.href = '#';
}

function updateStatus(message, colorClass, showSpinner = true) {
    const spinner = showSpinner 
        ? `<div class="w-16 h-16 mx-auto mt-4 border-4 border-dashed rounded-full animate-spin ${colorClass.replace('text', 'border')}"></div>` 
        : '';
    statusSection.innerHTML = `
        <div class="fade-in text-center p-4">
            <p class="text-xl font-semibold ${colorClass}">${escapeHTML(message)}</p>
            ${spinner}
        </div>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}