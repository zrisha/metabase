require("dotenv").config();
const { GoogleAuth } = require("google-auth-library");
const { google } = require("googleapis");

class PlanDoc {
    constructor({filename, groupId}){   
        this.template = process.env.PLAN_TEMPLATE_ID
        this.folderId = process.env.PLAN_FOLDER_ID;
        this.filename = filename;
        this.groupId = groupId;
        this.service = google.drive({ 
          version: "v3", 
          auth: new GoogleAuth({
            keyFilename: process.env.GOOGLE_CREDENTIALS,
            scopes: "https://www.googleapis.com/auth/drive",
          }) 
        });
    }


  /**
   * Uploads the file to drive
   * @return{obj} file Id
   * */
  async copyTemplate() {
    const fileMetadata = {
      name: `${this.filename}`,
      parents: [this.folderId],
      properties: {groupId: this.groupId}
    };

    try {
      const file = await this.service.files.copy({
        // Modified
        fileId: this.template,
        requestBody: fileMetadata
      });
      
      return {id: file.data.id};
    } catch (err) {
      throw err;
    }
  }

  async getFile(){
    try {
      const res = await this.service.files.list({
        q: `'${this.folderId}' in parents and trashed = false and properties has { key='groupId' and value='${this.groupId}' }`,
        fields: 'files(id, name, properties)'
      });

      if(res.data && res.data.files.length > 0){
        return res.data.files[0]
      }else{
        return false
      }
    } catch (err) {
      throw err;
    }
  }

  async requestFileId(){
    try{
      const file = await this.getFile();
      if(file){
        return {id: file.id}
      }else{
        return await this.copyTemplate()
      }
    }catch(error){
      return {error}
    }
  }
}

module.exports = PlanDoc;
