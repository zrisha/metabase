process.chdir(__dirname);
const RoleDoc = require('./WorkDoc');
const PlanDoc = require('./PlanDoc');
const axios = require('axios');
const md5 = require('md5');
require('dotenv').config()
const fs = require('fs/promises');



async function updateCredentials(){
    try{
        const res = await axios.post(
            `${process.env.SITE_URL}/api/session`, {
                username: process.env.API_USERNAME,
                password: process.env.API_PASSWORD
            });
        if(res.status == 200 || res.data.id){
            const payload = {
                'id': res.data.id,
                'created_at': Date.now()
            }
            await fs.writeFile('credentials/credentials.json', JSON.stringify(payload), 'utf8');
            return res.data
        }else{
            return {error: "unknown error", res}
        }
    }catch(e){
        console.log(e)
    }
}

async function getCredentials(){
    try{
        //read in prior credentials from file
        const file = await fs.readFile(process.env.CREDENTIAL_PATH)
        let creds = JSON.parse(file);

        const totalDuration = process.env.MB_SESSION_AGE * 60 * 1000,
              age = Date.now() - creds.created_at,
              timeLeft = (totalDuration - age);
        
        if(timeLeft < 86400000){
            creds = await updateCredentials();
        }

        const status = await testCredentials(creds)
        if(status == 401){
            creds = await updateCredentials();
        }
        return creds;
    }catch(e){
        if(e.code === 'ENOENT'){
            const creds = await updateCredentials()
            return creds
        }else{
            console.log(e);
            return e
        }
    }
}

async function testCredentials(creds){
    const headers = { "X-Metabase-Session": creds.id}
    try{
        const currentUser = await axios.get(`${process.env.SITE_URL}/api/user/current`, { headers });
        return currentUser.status
    }catch(e){
        return e.response.status
    }
}

async function fetchData(groupId){
    const creds = await getCredentials();

    const headers = { "X-Metabase-Session": creds.id}

    try{
        const art = await axios.get(`${process.env.SITE_URL}/api/art/blob/${groupId}`, { headers });
        const story = await axios.get(`${process.env.SITE_URL}/api/story-element/${groupId}`, { headers });
        const note = await axios.get(`${process.env.SITE_URL}/api/note/${groupId}`, { headers });

        const viz = await axios.get(`${process.env.SITE_URL}/api/card-favorite-grp/blob/${groupId}`, { headers });

        return {
            artData: art.data,
            storyData: story.data,
            noteData: note.data,
            vizData: viz.data
        }
    }catch(e){
        console.log(e);
    }
}


async function planDoc(groupId){
    const doc = new PlanDoc({
        groupId,
        filename: `Team Planning (GID ${groupId})`
    });

    const id =  await doc.requestFileId()
    console.log(JSON.stringify(id));
}

async function workDoc(groupId){
    const allData = await fetchData(groupId);

    const {artData, storyData, noteData, vizData} = allData;

    const doc = new RoleDoc({
        artData, storyData, noteData, vizData, groupId,
        hash: md5(JSON.stringify(allData)),
        filename: `${process.env.DOC_PATH}/Role Work (GID${groupId})`
    });

    const id = await doc.createAndUpload();
    console.log(JSON.stringify({id}));
}

const argFunctions = {
    'work_doc': workDoc,
    'plan_doc': planDoc
}

async function main(){
    const args = process.argv.slice(2);

    if(!args[0] || (Object.keys(argFunctions).includes(args[0]) == false)){
        console.log({error: 'Invalid argument for google doc function'})
        return
    }

    if(!args[1] || isNaN(parseInt(args[1]))){
        console.log({error: 'group id not provided or is invalid'})
        return
    }
    
    argFunctions[args[0]](parseInt(args[1]));

}

main();
