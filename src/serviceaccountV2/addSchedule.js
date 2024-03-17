const { google } = require('googleapis');
const fs = require('fs');

async function main() {
    try {
        // サービスアカウントキーの読み込み
        const key = JSON.parse(fs.readFileSync('keys/serviceaccount/service-account-key.json'));

        // 必要なスコープの指定
        const SCOPES = ['https://www.googleapis.com/auth/calendar'];

        // JWT クライアントの作成
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES
        );

        // 認証
        await jwtClient.authorize();

        console.log('認証成功');

        // 認証済みのクライアントを使用してカレンダー API へのアクセスを初期化
        const calendar = google.calendar({ version: 'v3', auth: jwtClient });

        // スケジュールの情報
        const event = {
            'summary': 'スケジュールのタイトル',
            'description': 'スケジュールの詳細',
            'start': {
                'dateTime': '2024-03-20T09:00:00',
                'timeZone': 'Asia/Tokyo',
            },
            'end': {
                'dateTime': '2024-03-20T10:00:00',
                'timeZone': 'Asia/Tokyo',
            },
        };

        // カレンダーにスケジュールを追加
        console.log('スケジュールを追加中...');
        const result = await calendar.events.insert({
            calendarId: 'カレンダーのサービスアカウント@group.calendar.google.com',
        });

        console.log('スケジュールが追加されました:', result.data.htmlLink);
    } catch (error) {
        console.error('エラー:', error);
    }
}

main();
