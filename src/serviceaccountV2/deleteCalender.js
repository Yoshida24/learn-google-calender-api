const readline = require('readline');
const { google } = require('googleapis');
const fs = require('fs');

async function deleteCalendar(calendar, calendarList) {
    console.log('サービスアカウントに紐づくカレンダーの一覧:');
    calendarList.data.items.forEach((calendar, index) => {
        console.log(`${index + 1}. ${calendar.summary} (ID: ${calendar.id})`);
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`削除するカレンダーの番号を選択してください。 (1-${calendarList.data.items.length}):`, async (answer) => {
        const index = parseInt(answer) - 1;
        if (index < 0 || index >= calendarList.data.items.length) {
            console.log('無効な選択です。');
            rl.close();
            return;
        }

        const selectedCalendarId = calendarList.data.items[index].id;

        rl.question('選択したカレンダーを削除しますか？ (y/n): ', async (answer) => {
            if (answer.toLowerCase() !== 'y') {
                console.log('削除がキャンセルされました。');
                rl.close();
                return;
            }

            try {
                console.log(`カレンダーを削除中...`);
                await calendar.calendars.delete({ calendarId: selectedCalendarId });
                console.log('カレンダーが削除されました。');
            } catch (error) {
                console.error('カレンダーの削除中にエラーが発生しました:', error);
            }

            rl.close();
        });
    });
}

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
        console.log('認証成功');

        const authClient = jwtClient;

        const calendar = google.calendar({ version: 'v3', auth: authClient });

        // カレンダーの一覧を取得
        const calendarList = await calendar.calendarList.list();

        await deleteCalendar(calendar, calendarList);

    } catch (err) {
        console.error('エラー:', err);
    }
})();
