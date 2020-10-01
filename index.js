const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const express = require("express");
const router = express.Router()


// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content));
});
//const oAuth;

function authorize(credentials, callback) {
    console.log(credentials)
  const { client_secret, client_id, redirect_uris } = credentials;
   const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris
  );
  //oAuth=oAuth2Client

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      //callback(oAuth2Client);
    });
  });
}

async function sendmail(auth)
{
  const gmail= google.gmail({version:'v1',auth})
  let msg = "6afd0412d8736799d1a393e3cc8baee233ef20f2ac6735e6ab052c139a6c9989";

  //send mail
  let email = await gmail.users.messages.send({
    userId:'me',
    resource:{
      raw: msg
    }
  })
  return email
}

router.get('/', function(req,res,next){
  res.rendor('index',{title:'Express'})
})
router.get('/sendmail', async(req,res)=>
{
  let email = await sendmail(oAuth2Client)
  res.json({email})
})


