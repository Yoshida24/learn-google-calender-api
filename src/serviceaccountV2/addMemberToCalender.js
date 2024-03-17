const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

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

        // カレンダーの一覧を取得
        const calendarList = await calendar.calendarList.list();

        console.log('サービスアカウントに紐づくカレンダーの一覧:');
        calendarList.data.items.forEach((calendar, index) => {
            console.log(`${index + 1}. ${calendar.summary} (ID: ${calendar.id})`);
        });

        // カレンダーIDの入力
        const calendarIndex = parseInt(await askQuestion('操作するカレンダーの番号を選択してください: ')) - 1;
        if (isNaN(calendarIndex) || calendarIndex < 0 || calendarIndex >= calendarList.data.items.length) {
            console.log('無効な選択です。');
            return;
        }
        const selectedCalendarId = calendarList.data.items[calendarIndex].id;

        // アクセスを許可するメンバーのメールアドレスの入力
        const memberEmail = await askQuestion('アクセスを許可するメンバーのメールアドレスを入力してください: ');

        // アクセスを許可するメンバーに対する ACL ルールの作成
        const aclRule = {
            role: 'writer',
            scope: {
                type: 'user',
                value: memberEmail
            }
        };

        // カレンダーへの ACL の追加
        console.log('ACL を追加中...');
        const result = await calendar.acl.insert({
            auth: jwtClient,
            calendarId: selectedCalendarId,
            resource: aclRule
        });

        console.log('ACL が追加されました:', result.data);
    } catch (error) {
        console.error('エラー:', error);
    }
}

function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(question, answer => {
        rl.close();
        resolve(answer);
    }));
}

main();
