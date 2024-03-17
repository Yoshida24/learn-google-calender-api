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

    try {
        await jwtClient.authorize();
        const authClient = jwtClient;
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        // カレンダーの一覧を取得
        const calendarList = await calendar.calendarList.list();
        console.log(`サービスアカウント ${key.client_email} に紐づくカレンダーの一覧`);
        calendarList.data.items.forEach(calendar => {
            console.log(`- ${calendar.summary} (ID: ${calendar.id})`);
        });
    } catch (err) {
        console.error('エラー:', err);
    }
})();
