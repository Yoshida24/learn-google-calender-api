const { google } = require('googleapis');
const fs = require('fs');

const key = JSON.parse(fs.readFileSync('keys/serviceaccount/service-account-key.json'));
const calendar = google.calendar('v3');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES
);

jwtClient.authorize((err, tokens) => {
    if (err) {
        console.error('認証エラー:', err);
        return;
    }

    console.log('認証成功');

    // 予定の情報
    const event = {
        'summary': 'テスト予定',
        'description': 'これはテストです。',
        'start': {
            'dateTime': '2024-03-18T13:00:00',
            'timeZone': 'Asia/Tokyo',
        },
        'end': {
            'dateTime': '2024-03-18T15:00:00',
            'timeZone': 'Asia/Tokyo',
        },
        attendees: [
            {
                email: 'inviteしたいユーザー@gmail.com'
            }
        ]
    };

    calendar.events.insert({
        auth: jwtClient,
        calendarId: 'primary', // カレンダーID。primary はデフォルトのカレンダーを表します。
        resource: event,
    }, (err, res) => {
        if (err) {
            console.error('予定の作成中にエラーが発生しました:', err);
            return;
        }
        console.log('予定が作成されました:', res.data.htmlLink);
    });
});
