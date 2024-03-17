const { google } = require('googleapis');
const fs = require('fs');

(async function main() {
    const key = JSON.parse(fs.readFileSync('keys/serviceaccount/service-account-key.json'));
    const SCOPES = ['https://www.googleapis.com/auth/calendar'];

    const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        SCOPES
    );

    console.log(1);

    try {
        await jwtClient.authorize();
        console.log('認証成功');

        const authClient = jwtClient;

        const calendar = google.calendar({ version: 'v3', auth: authClient });

        console.log(3);

        // カレンダーの作成
        const calendarConf = {
            summary: 'テスト_bot用カレンダー',
            description: 'テスト_カレンダーの詳細'
        };

        let calenderId = null;
        const calendarRes = await calendar.calendars.insert({
            resource: calendarConf
        });

        calenderId = calendarRes.data.id;
        console.log('カレンダーが作成されました:', calenderId);
    } catch (err) {
        console.error('エラー:', err);
    }
})();
