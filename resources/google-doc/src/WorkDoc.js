const docx = require("docx");
const fs = require("fs");
const {
  Document,
  SectionType,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  ImageRun
} = docx;
const storyElements = require("./story-elements.json");
const styles = fs.readFileSync("./styles.xml", "utf-8");
const { GoogleAuth } = require("google-auth-library");
const { google } = require("googleapis");
const sizeOf = require('image-size')
require("dotenv").config();

class RoleDoc {
  constructor({ artData, noteData, storyData, vizData, groupId, filename, hash }) {
    this.artData = artData;
    this.noteData = noteData
    this.storyData = storyData;
    this.vizData = vizData
    this.filename = filename;
    this.groupId = groupId;
    this.hash = hash;

    this.auth = new GoogleAuth({
      keyFilename: process.env.GOOGLE_CREDENTIALS,
      scopes: "https://www.googleapis.com/auth/drive",
    });
  }

  createHeading(text) {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_4,
    });
  }

  createSubHeading(text) {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_5,
    });
  }

  //Sorts user data and provides labels for story elements
  formatstoryData() {
    //Get order for story elements to appear
    const elementOrder = {};
    Object.keys(storyElements).forEach((type, index) => {
      elementOrder[type] = index;
    });

    //Sort the data based on order
    const sortedUserData = Object.values(this.storyData).sort((a, b) => {
      return elementOrder[a.type] - elementOrder[b.type];
    });

    //Add user values to element fields
    return sortedUserData.map((eleData) => {
      const elementInfo = storyElements[eleData.type];
      elementInfo.user_title = eleData.data.user_title;
      elementInfo.fields = elementInfo.fields.map((field) => {
        field.value = eleData.data[field.name];
        return field;
      });
      return elementInfo;
    });
  }

  //Produces document children from journalist data
  createStoryChildren() {
    //helps format the data
    const storyElements = this.formatstoryData(this.storyData);
    const children = [
      //Heading for journalist
      new Paragraph({
        text: "Story Map (Journalist)",
        heading: HeadingLevel.HEADING_3,
      }),
      //Map each story element
      ...Object.values(storyElements)
        .map((ele) => {
          const payload = [];

          payload.push(this.createHeading(`${ele.name}: ${ele.user_title}`));

          ele.fields.forEach((field) => {
            if(!field['value'] || !field['title']){
              return
            }
            payload.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${field["title"]}: `, bold: true }),
                  new TextRun(field["value"]),
                ],
              })
            );
          });
          return payload;
          //Flatten the array
        })
        .reduce((prev, curr) => prev.concat(curr), []),
    ];
    return children;
  }

  createNoteChildren(){
    const children = [
      //Heading for journalist
      new Paragraph({
        text: "Notes (Detective)",
        heading: HeadingLevel.HEADING_3,
      }),
      ...this.noteData.filter(note => note.data && note.data.text).map((note, i) => {
        const payload = [];
        payload.push(this.createHeading(`Note ${i+1}`));
        payload.push(new Paragraph({
          children:[
            new TextRun(note.data.text)
          ]
        }))
        return payload
      })
      .reduce((prev, curr) => prev.concat(curr), []),
    ]

    return children
  }

  createArtChildren(){
    const children = []
    children.push(
      new Paragraph({
        text: "Artwork (Artist)",
        heading: HeadingLevel.HEADING_3,
      })
    )
    this.artData.forEach((art, i) => {
      if(!art.blob || art.blob.length < 22){
        return
      }

      let ar = 1.5

      try{
        var img = Buffer.from(art.blob.substr(22), 'base64');
        var dimensions = sizeOf(img);
        ar = dimensions.width / dimensions.height;
      }catch(e){

      }
      
      children.push(
        this.createHeading(`Art ${i+1}`)
      );
      children.push(
        new Paragraph({
          children: [
              new ImageRun({
                  data: art.blob,
                  transformation: {
                    width: 350 * ar,
                    height: 350,
                  },
              }),
          ],
        })
      )
    });
    return children
  }

  createVizChildren(){
    const children = []
    children.push(
      new Paragraph({
        text: "Visualizations (Detective)",
        heading: HeadingLevel.HEADING_3,
      })
    )
    this.vizData.forEach((viz, i) => {
      if(!viz.blob || viz.blob.length < 22){
        return
      }
      var img = Buffer.from(viz.blob.substr(22), 'base64');
      var dimensions = sizeOf(img);
      const ar = dimensions.width / dimensions.height;

      children.push(
        this.createHeading(`Viz ${i+1}`)
      );
      children.push(
        new Paragraph({
          children: [
              new ImageRun({
                  data: viz.blob,
                  transformation: {
                    width: 350 * ar,
                    height: 350,
                  },
              }),
          ],
        })
      )
    });
    return children
  }

  createSection(children){
    children.push(new Paragraph({
      children: [
        new TextRun({
          break: 1,
        })
      ]
    }));

    return {
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children
    }
  }

  createDoc() {
    const storyChildren = this.createStoryChildren();
    const vizChildren = this.createVizChildren();
    const noteChildren = this.createNoteChildren();
    const artChildren = this.createArtChildren();

    const doc = new Document({
      sections: [
        this.createSection(storyChildren), 
        this.createSection(vizChildren), 
        this.createSection(noteChildren), 
        this.createSection(artChildren), 
      ],
      externalStyles: styles,
    });
    return doc;
  }

  async createDocFile(){
    const doc = this.createDoc();
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(`${this.filename}.docx`, buffer);
    return true
  }

  /**
   * Uploads the file to drive
   * @return{obj} file Id
   * */
  async uploadToDrive() {
    const service = google.drive({ version: "v3", auth: this.auth });
    const fileMetadata = {
      name: `${this.filename}`,
      mimeType: "application/vnd.google-apps.document",
      parents: [process.env.FOLDER_ID],
      includePermissionsForView: true,
      properties: {groupId: this.groupId, hash: this.hash}
    };

    const media = {
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      body: fs.createReadStream(`${this.filename}.docx`),
    };

    try {
      const file = await service.files.create({
        resource: fileMetadata,
        fields: "id",
        media,
      });
      
      return file.data.id;
    } catch (err) {
      throw err;
    }
  }

  async getFile(){
    const service = google.drive({ version: "v3", auth: this.auth });

    try {
      const res = await service.files.list({
        q: `'${process.env.FOLDER_ID}' in parents and trashed = false and properties has { key='groupId' and value='${this.groupId}' }`,
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

  async updateInDrive(fileId) {
    const service = google.drive({ version: "v3", auth: this.auth });

    const media = {
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      body: fs.createReadStream(`${this.filename}.docx`),
    };

    try {
      const file = await service.files.update({
        fileId,
        resource: {
          properties: {groupId: this.groupId, hash: this.hash}
        },
        fields: "id",
        media,
      });
      return file.data.id;
    } catch (err) {
      throw err;
    }
  }

  async createAndUpload(){
    const doc = await this.createDocFile()
    if(doc){
      const file = await this.getFile();
      if(file && (file.properties.hash == this.hash)){
        return file.id
      }else if(file){
        return await this.updateInDrive(file.id)
      }else{
        return await this.uploadToDrive()
      }
    }else{
      throw new Error("could not create file")
    }
  }


}

module.exports = RoleDoc;
