const jwt = require('jsonwebtoken');
var request = require('then-request');

var ZOOM_API_KEY = 'gr7aSwMgT4-3KOVHFwDd0w';
var ZOOM_API_SECRET = 'V8SvHMce3jd56EEVk2nNW1yRU9V5J29Bgwi4';

ZOOM_BASE_URL = "https://api.zoom.us/v2"


generateToken = function() {
    const payload = {
        iss: ZOOM_API_KEY,
        exp: ((new Date()).getTime() + 5000)
    };
    var token = jwt.sign(payload, ZOOM_API_SECRET);
    return token;
}

getZoomAdminUser = async function(jwtToken) {
    var res = await request('GET', ZOOM_BASE_URL + '/users?status=active', {
        headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/json',
            'User-Agent': 'Zoom-api-Jwt-Request'
        }
    });
    var body = await res.getBody('utf8');
    var result = JSON.parse(body);

    console.log('Result: ', result, result.users[0].id);

    var meeting = await this.createMeeting(token, result.users[0].id);
    console.log('Meeting: ', meeting);

    return result;
}

createCustUser = async function(jwtToken, email) {
    var res = await request('POST', ZOOM_BASE_URL + '/users', {
        headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/json',
            'User-Agent': 'Zoom-api-Jwt-Request'
        },
        json: {
            "action": "custCreate",
            "user_info": {
              "email": email,
              "type": 1,
              "first_name": "Terry",
              "last_name": "Jones"
            }
        }
    });
    var body = await res.getBody('utf8');
    var result = JSON.parse(body);

    return result;
}

createMeeting = async function(jwtToken, userId) {
    var res = await request('POST', ZOOM_BASE_URL + '/users/' + userId + '/meetings', {
        headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/json',
            'User-Agent': 'Zoom-api-Jwt-Request'
        },
        json: {
            "topic": "Presentation meeting",
            "type": 2,
            "start_time": "2019-10-02T12:30:00",
            "duration": 10,
            "timezone": "Asia/Calcutta",
            // "password": "",
            "agenda": "Discuss the presentation template",
            "settings": {
              "host_video": false,
              "participant_video": false,
              "mute_upon_entry": true,
              "join_before_host": true,
              "watermark": true,
              "approval_type": 2,
              "audio": "both",
              "auto_recording": "none",
              "enforce_login": false,
            //   "enforce_login_domains": "string",
            //   "alternative_hosts": "ajit@pipra.solutions",
            //   "global_dial_in_countries": [
            //     "India"
            //   ]
            }
          }
    });

    var body = await res.getBody('utf8');
    var result = JSON.parse(body);

    return result;
}

var token = generateToken();
console.log('Token: ', token);

// var user = createCustUser(token, 'm1@maas.com');
// console.log('Cust User created: ', user);

var adminUser = getZoomAdminUser(token);
// console.log('Admin User: ', adminUser);