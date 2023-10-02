const axios = require('axios');
const fs = require('fs');
const path = require('path')

const downloadAndSaveFile = async(url,directoryPath, fileName,timeout ) => {
    return new Promise(async(resolve,reject) => {
        try{
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'stream',
               
            })
            const writer = fs.createWriteStream(path.join(directoryPath, fileName));

            const downloadTimeout = setTimeout(() => {
                writer.end() // Close the writer to cancel the download
                reject(new Error('Download time out'))
            }, timeout)
            writer.on('finish', () => {
                clearTimeout(downloadTimeout) // Clear the timeout since the download succeeded
                resolve(fileName)
            })
            writer.on('error', (error) => {
                clearTimeout(downloadTimeout); // Clear the timeout on error
                reject(error);
              });
               // Check if the request was canceled before writing the response data
                
              response.data.pipe(writer);
        }catch(err){
            console.log("Error -> ",err)
            if (axios.isCancel(err)) {
                reject(new Error('Download canceled.'));
              } else {
                reject(err);
              }
        }
    })
    
}

module.exports= {
    downloadAndSaveFile
}