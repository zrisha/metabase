
function getEnvVar(varName){
    const default_vars = {
        MB_SESSION_AGE: 20160,
        GOOGLE_CREDENTIALS: 'credentials/google_credentials.json',
        CREDENTIAL_PATH: 'credentials/credentials.json'
    }
    const payload = process.env[varName] ? process.env[varName] : default_vars[varName]
    if(payload){
        return payload
    }else{
        throw new Error(`Env var ${varName} is not set and has no default`);
    }
}

module.exports = {
    getEnvVar
};