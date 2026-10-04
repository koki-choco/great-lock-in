const today = new Date();

const dateKey =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

const displayDate =
    `${today.getMonth() + 1}月${today.getDate()}日`;

document.getElementById("today").textContent = displayDate;


// ------------------------
// DAILY TASKS
// ------------------------

const checkboxes =
    document.querySelectorAll("[data-task]");

let dailyData =
    JSON.parse(localStorage.getItem(dateKey)) || {};


checkboxes.forEach(box => {

    const taskName = box.dataset.task;

    box.checked =
        dailyData[taskName] || false;


    box.addEventListener("change", () => {

        dailyData[taskName] =
            box.checked;

        localStorage.setItem(
            dateKey,
            JSON.stringify(dailyData)
        );

        updateProgress();
        renderCalendar();
        updateGymStatus();
        updateFEStatus();
        updateStreak();

    });

});


function updateProgress() {

    // 毎日必須
    const requiredTasks = [
        "wake",
        "fe",
        "sleep"
    ];

    // 制作・成長タスク
    // MIXかギターのどちらか1つできれば達成
    const creativeTasks = [
        "mix",
        "guitar"
    ];


    // ------------------------
    // 必須タスク
    // ------------------------

    let total = requiredTasks.length;

    let completed = 0;


    requiredTasks.forEach(taskName => {

        if (dailyData[taskName]) {
            completed++;
        }

    });


    // ------------------------
    // MIX / GUITAR
    // ------------------------

    total++;

    const creativeDone =
        creativeTasks.some(taskName =>
            dailyData[taskName]
        );

    if (creativeDone) {
        completed++;
    }


    // ------------------------
    // GYM
    // ジムに行った日は加点
    // 休養日は未達成にしない
    // ------------------------

    if (dailyData.gym) {

        total++;
        completed++;

    }


    // ------------------------
    // READING
    // 読書した日は加点
    // しなくても未達成にしない
    // ------------------------

    if (dailyData.reading) {

        total++;
        completed++;

    }


    // ------------------------
    // 表示
    // ------------------------

    document.getElementById(
        "progressText"
    ).textContent =
        `${completed} / ${total}`;


    const percentage =
        total === 0
            ? 0
            : (completed / total) * 100;


    document.getElementById(
        "progressFill"
    ).style.width =
        percentage + "%";

}

updateProgress();


// ------------------------
// GAMBLING
// ------------------------

const monthKey =
    "gambling-" +
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1)
    .padStart(2, "0");


let gamblingTotal =
    Number(
        localStorage.getItem(monthKey)
    ) || 0;


const gamblingInput =
    document.getElementById(
        "gamblingInput"
    );


document.getElementById(
    "addGambling"
).addEventListener(
    "click",
    () => {

        const amount =
            Number(gamblingInput.value);

        if (
            !amount ||
            amount < 0
        ) {
            return;
        }

        gamblingTotal += amount;

        localStorage.setItem(
            monthKey,
            gamblingTotal
        );

        gamblingInput.value = "";

        updateGambling();

    }
);


function updateGambling() {

    document.getElementById(
        "gamblingTotal"
    ).textContent =
        `¥${gamblingTotal.toLocaleString()} / ¥5,000`;


    const percentage =
        Math.min(
            (gamblingTotal / 5000) * 100,
            100
        );


    document.getElementById(
        "gamblingFill"
    ).style.width =
        percentage + "%";

}

updateGambling();
// ------------------------
// CALENDAR
// ------------------------

let calendarYear = today.getFullYear();
let calendarMonth = today.getMonth();


function renderCalendar() {

    const calendar =
        document.getElementById("calendar");

    calendar.innerHTML = "";


    document.getElementById(
        "calendarTitle"
    ).textContent =
        `${calendarYear}年 ${calendarMonth + 1}月`;


    const firstDay =
        new Date(
            calendarYear,
            calendarMonth,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            calendarYear,
            calendarMonth + 1,
            0
        ).getDate();


    // 月初までの空白

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day empty";

        calendar.appendChild(empty);

    }


    // 日付を作る

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            calendarYear +
            "-" +
            String(
                calendarMonth + 1
            ).padStart(2, "0") +
            "-" +
            String(day)
            .padStart(2, "0");


        const saved =
            JSON.parse(
                localStorage.getItem(date)
            ) || {};


        // ------------------------
// その日の達成判定
// ------------------------

const requiredDone =
    saved.wake &&
    saved.fe &&
    saved.sleep;

const creativeDone =
    saved.mix ||
    saved.guitar;

const lockInComplete =
    requiredDone &&
    creativeDone;

const hasActivity =
    saved.wake ||
    saved.fe ||
    saved.mix ||
    saved.guitar ||
    saved.gym ||
    saved.reading ||
    saved.sleep;


        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        // 今日

        if (date === dateKey) {

            dayElement.classList.add(
                "today"
            );

        }


        // 達成度

        if (lockInComplete) {

    dayElement.classList.add(
        "complete"
    );

}

else if (hasActivity) {

    dayElement.classList.add(
        "partial"
    );

}


        let mark = "○";

if (lockInComplete) {

    mark = "●";

}

else if (hasActivity) {

    mark = "◐";

}


        dayElement.innerHTML =
            `
            <span>${day}</span>
            <span class="calendar-mark">
                ${mark}
            </span>
            `;


        calendar.appendChild(
            dayElement
        );

    }

}


// 前月

document.getElementById(
    "prevMonth"
).addEventListener(
    "click",
    () => {

        calendarMonth--;

        if (calendarMonth < 0) {

            calendarMonth = 11;
            calendarYear--;

        }

        renderCalendar();

    }
);


// 翌月

document.getElementById(
    "nextMonth"
).addEventListener(
    "click",
    () => {

        calendarMonth++;

        if (calendarMonth > 11) {

            calendarMonth = 0;
            calendarYear++;

        }

        renderCalendar();

    }
);


renderCalendar();
// ------------------------
// GYM TRACKER
// ------------------------

function updateGymStatus() {

    let lastGymDate = null;

    // 過去90日をチェック
    for (let i = 0; i <= 90; i++) {

        const checkDate = new Date(today);

        checkDate.setDate(
            today.getDate() - i
        );

        const key =
            checkDate.getFullYear() +
            "-" +
            String(checkDate.getMonth() + 1)
                .padStart(2, "0") +
            "-" +
            String(checkDate.getDate())
                .padStart(2, "0");


        const saved =
            JSON.parse(
                localStorage.getItem(key)
            ) || {};


        if (saved.gym) {

            lastGymDate = checkDate;

            break;

        }

    }


    const lastGym =
        document.getElementById("lastGym");

    const nextGym =
        document.getElementById("nextGym");

    const gymStatus =
        document.getElementById("gymStatus");


    // まだ一度も記録なし
    if (!lastGymDate) {

        lastGym.textContent =
            "前回：記録なし";

        nextGym.textContent =
            "ジムに行った日にチェック";

        gymStatus.textContent =
            "未記録";

        return;

    }


    const diffTime =
        today - lastGymDate;

    const diffDays =
        Math.floor(
            diffTime /
            (1000 * 60 * 60 * 24)
        );


    const display =
        `${lastGymDate.getMonth() + 1}/${lastGymDate.getDate()}`;


    lastGym.textContent =
        `前回：${display}`;


    // 今日ジムに行った
    if (diffDays === 0) {

        gymStatus.textContent =
            "✅ DONE";

        const nextDate =
            new Date(lastGymDate);

        nextDate.setDate(
            nextDate.getDate() + 2
        );

        nextGym.textContent =
            `次回目安：${nextDate.getMonth() + 1}/${nextDate.getDate()}`;

    }

    // 1日経過
    else if (diffDays === 1) {

        gymStatus.textContent =
            "REST";

        nextGym.textContent =
            "次回：明日";

    }

    // 2日以上
    else {

        gymStatus.textContent =
            "🔥 GYM DAY";

        nextGym.textContent =
            `${diffDays}日経過しています`;

    }

}


updateGymStatus();
// ------------------------
// FE STUDY TRACKER
// ------------------------

function updateFEStatus() {

    const examDate =
        new Date(2026, 11, 20);

    const todayOnly =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

    const diffTime =
        examDate - todayOnly;

    const daysLeft =
        Math.ceil(
            diffTime /
            (1000 * 60 * 60 * 24)
        );


    // 試験までの日数
    const countdown =
        document.getElementById(
            "feCountdown"
        );

    if (daysLeft > 0) {

        countdown.textContent =
            `あと${daysLeft}日`;

    } else if (daysLeft === 0) {

        countdown.textContent =
            "🔥 TODAY";

    } else {

        countdown.textContent =
            "試験終了";

    }


    // 10/4から12/20までのFE履歴を集計

    let studyDays = 0;

    const startDate =
        new Date(2026, 9, 4);

    const endDate =
        new Date(2026, 11, 20);


    const current =
        new Date(startDate);


    while (current <= endDate) {

        const key =
            current.getFullYear() +
            "-" +
            String(current.getMonth() + 1)
                .padStart(2, "0") +
            "-" +
            String(current.getDate())
                .padStart(2, "0");


        const saved =
            JSON.parse(
                localStorage.getItem(key)
            ) || {};


        if (saved.fe) {

            studyDays++;

        }


        current.setDate(
            current.getDate() + 1
        );

    }


    document.getElementById(
        "feDays"
    ).textContent =
        studyDays;


    // 1日40分として累計時間を計算

    const totalMinutes =
        studyDays * 40;

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;


    document.getElementById(
        "feHours"
    ).textContent =
        `${hours}h ${minutes}m`;

}


updateFEStatus();
// ------------------------
// LOCK IN STREAK
// ------------------------

function isLockInComplete(saved) {

    if (!saved) {
        return false;
    }

    const requiredDone =
        saved.wake &&
        saved.fe &&
        saved.sleep;

    const creativeDone =
        saved.mix ||
        saved.guitar;

    return requiredDone && creativeDone;
}


function getDateKey(date) {

    return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1)
            .padStart(2, "0") +
        "-" +
        String(date.getDate())
            .padStart(2, "0")
    );

}


function getSavedDay(date) {

    const key = getDateKey(date);

    return JSON.parse(
        localStorage.getItem(key)
    ) || {};

}


function updateStreak() {

    const lockInStart =
        new Date(2026, 9, 4);

    const todayOnly =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    // ------------------------
    // 全期間を集計
    // ------------------------

    let bestStreak = 0;
    let runningStreak = 0;
    let totalComplete = 0;

    const current =
        new Date(lockInStart);


    while (current <= todayOnly) {

        const saved =
            getSavedDay(current);

        if (isLockInComplete(saved)) {

            runningStreak++;
            totalComplete++;

            if (runningStreak > bestStreak) {
                bestStreak = runningStreak;
            }

        } else {

            runningStreak = 0;

        }

        current.setDate(
            current.getDate() + 1
        );

    }


    // ------------------------
    // 現在のストリーク
    // 今日がまだ未達成の場合は
    // 昨日までの連続記録を維持
    // ------------------------

    let currentStreak = 0;

    let streakDate =
        new Date(todayOnly);


    const todaySaved =
        getSavedDay(streakDate);


    if (!isLockInComplete(todaySaved)) {

        streakDate.setDate(
            streakDate.getDate() - 1
        );

    }


    while (streakDate >= lockInStart) {

        const saved =
            getSavedDay(streakDate);

        if (!isLockInComplete(saved)) {
            break;
        }

        currentStreak++;

        streakDate.setDate(
            streakDate.getDate() - 1
        );

    }


    // ------------------------
    // 今週の達成率
    // 月曜日スタート
    // ------------------------

    const monday =
        new Date(todayOnly);

    const day =
        monday.getDay();

    const diffToMonday =
        day === 0
            ? -6
            : 1 - day;

    monday.setDate(
        monday.getDate() + diffToMonday
    );


    let weeklyComplete = 0;
    let weeklyDays = 0;

    const weekDate =
        new Date(monday);


    while (weekDate <= todayOnly) {

        // Lock In開始前は除外
        if (weekDate >= lockInStart) {

            weeklyDays++;

            const saved =
                getSavedDay(weekDate);

            if (isLockInComplete(saved)) {
                weeklyComplete++;
            }

        }

        weekDate.setDate(
            weekDate.getDate() + 1
        );

    }


    const weeklyRate =
        weeklyDays === 0
            ? 0
            : Math.round(
                (weeklyComplete / weeklyDays) * 100
            );


    // ------------------------
    // 画面表示
    // ------------------------

    document.getElementById(
        "currentStreak"
    ).textContent =
        currentStreak;


    document.getElementById(
        "bestStreak"
    ).textContent =
        bestStreak;


    document.getElementById(
        "weeklyRate"
    ).textContent =
        `${weeklyRate}%`;


    document.getElementById(
        "totalComplete"
    ).textContent =
        totalComplete;


    const status =
        document.getElementById(
            "streakStatus"
        );


    if (currentStreak >= 7) {

        status.textContent =
            "🔥 ON FIRE";

    } else if (currentStreak >= 3) {

        status.textContent =
            "🔥 KEEP GOING";

    } else {

        status.textContent =
            "BUILD THE STREAK";

    }

}


updateStreak();