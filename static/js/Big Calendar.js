function getToday() {
    let date = new Date();
    return date.getDay() == 0 ? 7 : date.getDay();
}

function getFirstDayOfMonth(month, year) {
    if (month == 1) {
        return new Date(year - 1, 12, 1).getDay();
    }
    return new Date(year, month - 1, 1).getDay();
}

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function formatDate(year, month, day, hour, minute) {
    if (hour == undefined) {
        return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
    }
    return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}T${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}

function getLastDayOfMonth(month, year) {
    return new Date(year, month, 0).getDay();
}

import { DBInterface } from './db.js';
let db = new DBInterface();

export class BigCalendar {
    constructor(month, year, mode) {
        this.month = month;
        this.year = year;
        this.mode = mode;
        let date = new Date();
        let weekoffset = date.getDate() / 7 - 2 + (getToday() >= getFirstDayOfMonth(month, year) ? 1 : 0);
        this.weekoffset = Math.ceil(weekoffset);
    }

    get getMonth() {
        return this.month;
    }
    get getYear() {
        return this.year;
    }
    get getMode() {
        return this.mode;
    }
    set setMonth(month) {
        this.month = month;
    }
    set setYear(year) {
        this.year = year;
    }
    set setMode(mode) {
        this.mode = mode;
    }

    get getWeeksInMonth() {
        let firstDay = new Date(this.year, this.month, 1);
        let lastDay = new Date(this.year, this.month + 1, 0);
        let weeksInMonth = Math.ceil((lastDay.getDate() - firstDay.getDay()) / 7) + 1;
        return weeksInMonth;
    }


    increaseWeekOffset() {
        this.weekoffset++;
        // check if the weekoffset is greater than the number of weeks in the month
        if (this.weekoffset > this.getWeeksInMonth - 1) {
            this.weekoffset = 0;
            this.month++;
            if (this.month > 11) {
                this.month = 0;
                this.year++;
            }
        }
    }

    incrementMonth() {
        this.month++;
        if (this.month > 11) {
            this.month = 0;
            this.year++;
        }
    }

    decrementMonth() {
        this.month--;
        if (this.month < 0) {
            this.month = 11;
            this.year--;
        }
    }


    decreaseWeekOffset() {
        this.weekoffset--;
        // check if the weekoffset is less than 0
        if (this.weekoffset < 0) {
            this.weekoffset = this.getWeeksInMonth - 1;
            this.month--;
            if (this.month < 0) {
                this.month = 11;
                this.year--;
            }
        }
    }

    get getFirstDayOfWeek() {
        let firstDayOfWeek = this.weekoffset * 7 + 1;
        return firstDayOfWeek;
    }

    get getLastDayOfWeek() {
        let lastDayOfWeek = this.getFirstDayOfWeek + 6;
        return lastDayOfWeek;
    }

    setBigCalendar() {
        let monthstring = '';
        switch (this.month) {
            case 1:
                monthstring = 'Jan';
                break;
            case 2:
                monthstring = 'Feb';
                break;
            case 3:
                monthstring = 'Mar';
                break;
            case 4:
                monthstring = 'Apr';
                break;
            case 5:
                monthstring = 'May';
                break;
            case 6:
                monthstring = 'Jun';
                break;
            case 7:
                monthstring = 'Jul';
                break;
            case 8:
                monthstring = 'Aug';
                break;
            case 9:
                monthstring = 'Sep';
                break;
            case 10:
                monthstring = 'Oct';
                break;
            case 11:
                monthstring = 'Nov';
                break;
            case 12:
                monthstring = 'Dec';
                break;
        }


        if (this.mode == 'm') {
            $('#big-calendar-header-month').html(monthstring + ' ' + this.year);
            let days = getDaysInMonth(this.month, this.year);

            let firstDay = getFirstDayOfMonth(this.month, this.year);
            firstDay = firstDay == 0 ? 7 : firstDay;
            let lastMonthDaysNum = getDaysInMonth(this.month - 1, this.year);

            $('#big-calendar-body').remove();

            $('.big-calendar').append(`
            <div class="big-calendar-body" id="big-calendar-body">
                <div class="big-calendar-body-top-day" id="big-calendar-monday">M</div>
                <div class="big-calendar-body-top-day" id="big-calendar-tuesday">T</div>
                <div class="big-calendar-body-top-day" id="big-calendar-wednesday">W</div>
                <div class="big-calendar-body-top-day" id="big-calendar-thursday">T</div>
                <div class="big-calendar-body-top-day" id="big-calendar-friday">F</div>
                <div class="big-calendar-body-top-day" id="big-calendar-saturday">S</div>
                <div class="big-calendar-body-top-day" id="big-calendar-sunday">S</div>
            </div>
            `);


            let lastMonth = this.month - 1;
            let lastYear = this.year;
            if (lastMonth < 0) {
                lastMonth = 11;
                lastYear--;
            }
            for (let i = 0; i < firstDay - 1; i++) {
                $('#big-calendar-body').append(`
                <div class="big-calendar-body-day big-calendar-body-day-disabled before" id="${formatDate(lastYear, lastMonth, lastMonthDaysNum - firstDay + i + 2)}">
                    <div class="big-calendar-body-day-day">
                        ${lastMonthDaysNum - firstDay + i + 2}
                    </div>
                    <div class="big-calendar-body-day-assignments">
                    </div>
                </div>`);
            }

            // sets this.startYear, this.startMonth, this.startDay
            // these are the first day on the calendar that is visible on the screen
            if (firstDay == 1) {
                this.startYear = this.year;
                this.startMonth = this.month;
                this.startDay = 1;
            }
            else {
                this.startDay = lastMonthDaysNum - firstDay + 2;
                this.startMonth = this.month - 1;
                if (this.startMonth < 0) {
                    this.startMonth = 11;
                    this.startYear = this.year - 1;
                }
                else {
                    this.startYear = this.year;
                }
            }




            for (let i = 0; i < days; i++) {
                $('#big-calendar-body').append(`
                <div class="big-calendar-body-day" id="${formatDate(this.year, this.month, i + 1)}">
                    <div class="big-calendar-body-day-day">
                        ${i + 1}
                    </div>
                    <div class="big-calendar-body-day-assignments">
                    </div>    
                </div>`);
            }

            let lastDay = getLastDayOfMonth(this.month, this.year);
            lastDay = lastDay == 0 ? 7 : lastDay;
            let i;

            let nextMonth = this.month + 1;
            let nextYear;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear = this.year + 1;
            }
            else {
                nextYear = this.year;
            }

            for (i = 0; i < 7 - lastDay; i++) {
                $('#big-calendar-body').append(`
                <div class="big-calendar-body-day big-calendar-body-day-disabled after" id="${formatDate(nextYear, nextMonth, i + 1)}">
                    <div class="big-calendar-body-day-day">
                        ${i + 1}
                    </div>
                    <div class="big-calendar-body-day-assignments">
                    </div>   
                </div>`);
            }

            // fill last row with days of the next month if necessary
            if (firstDay - 1 + days <= 35) {
                for (let d = i; i < d + 7; i++) {
                    $('#big-calendar-body').append(`
                    <div class="big-calendar-body-day big-calendar-body-day-disabled after" id="${formatDate(nextYear, nextMonth, i + 1)}">
                        <div class="big-calendar-body-day-day">
                            ${i + 1}
                        </div>
                        <div class="big-calendar-body-day-assignments">
                        </div>
                    </div>`);
                }
            }
            // sets this.endYear, this.endMonth, this.endDay
            // these are the last day on the calendar that is visible on the screen
            this.endMonth = this.month + 1;
            if (this.endMonth > 11) {
                this.endMonth = 0;
                this.endYear = this.year + 1;
            }
            else {
                this.endYear = this.year;
            }
            this.endDay = i;

            $('.big-calendar-body-day').on('click', function () {
                // open create assignment modal on day
                let date = $(this).attr('id');
                let year = date.substring(0, 4);
                let month = date.substring(5, 7);
                let day = date.substring(8, 10);

                displayNewModal(formatDate(year, month, day, 23, 59))
            });


            if ((localStorage['user_id'] != undefined) && (localStorage['user_id'] != "null")) {
                this.getAssignments();
            }
        }

        else if (this.mode == 'w') {
            $('#big-calendar-header-month').html(`W${this.weekoffset+1} ${monthstring} ${this.year}`);
            $('#big-calendar-body').remove();

            

            let firstDay = this.getFirstDayOfWeek;


            // this could probably done in css but it would also be more work
            let html = '';
            //html += "<div class='big-calendar-body-day-hour-wrapper'>";

            for (let i = 0; i < 24; i++) {
                html += "<div class='big-calendar-body-day-hour'>" + i + "</div>";
                let style1 = "";
                if (i == 0) {
                    
                    style1 += "border-top: 1px solid #6c757d; "; 
                }
                else if (i == 23) {
                    style1 += "border-bottom: 1px solid #6c757d; ";
                }
                for (let j = 0; j < 7; j++) {
                    let style2 = style1;
                    if (j == 0) {
                        style2 += "border-left: 1px solid #6c757d; ";
                        if (i == 0)
                            style2 += "border-top-left-radius: 5px; ";
                        else if (i == 23)
                            style2 += "border-bottom-left-radius: 5px; ";
                    }
                    else if (j == 6) {
                        style2 += "border-right: 1px solid #6c757d; ";
                        if (i == 0)
                            style2 += "border-top-right-radius: 5px; ";
                        else if (i == 23)
                            style2 += "border-bottom-right-radius: 5px; ";
                    }
                    
                    
                    
                    html += `<div class='big-calendar-body-day-hour-assignments' style="${style2}" id="${i}-${j}"></div>`;
                }
            }
            //html += "</div>";

            this.startDay = firstDay;
            this.startMonth = this.month;
            this.startYear = this.year;

            this.endDay = firstDay + 6;
            if (this.endDay > getDaysInMonth(this.month + 1, this.year)) {
                this.endMonth = this.month + 1;
                this.endDay = this.endDay - getDaysInMonth(this.month + 1, this.year);
                if (this.endMonth > 11) {
                    this.endMonth = 0;
                    this.endYear = this.year + 1;
                }
                else {
                    this.endYear = this.year;
                }
            }
            else {
                this.endMonth = this.month;
                this.endYear = this.year;
            }

            let dates = this.getWeekDates;

            $('.big-calendar').append(`
            <div class="big-calendar-body big-calendar-body-week" id="big-calendar-body">
                <div></div>
                <div class="big-calendar-body-top-day" id="big-calendar-monday">M <div class="big-calendar-body-top-date">   ${dates[0].split('-')[2]}/${dates[0].split('-')[1]}</div></div>
                <div class="big-calendar-body-top-day" id="big-calendar-tuesday">T <div class="big-calendar-body-top-date">  ${dates[1].split('-')[2]}/${dates[1].split('-')[1]}</div></div>
                <div class="big-calendar-body-top-day" id="big-calendar-wednesday">W <div class="big-calendar-body-top-date">${dates[2].split('-')[2]}/${dates[2].split('-')[1]}</div></div>
                <div class="big-calendar-body-top-day" id="big-calendar-thursday">T <div class="big-calendar-body-top-date"> ${dates[3].split('-')[2]}/${dates[3].split('-')[1]}</div></div>
                <div class="big-calendar-body-top-day" id="big-calendar-friday">F <div class="big-calendar-body-top-date">   ${dates[4].split('-')[2]}/${dates[4].split('-')[1]}</div></div>
                <div class="big-calendar-body-top-day" id="big-calendar-saturday">S <div class="big-calendar-body-top-date"> ${dates[5].split('-')[2]}/${dates[5].split('-')[1]}</div></div>
                <div class="big-calendar-body-top-day" id="big-calendar-sunday">S <div class="big-calendar-body-top-date">   ${dates[6].split('-')[2]}/${dates[6].split('-')[1]}</div></div>

                <div></div>
                <div id="big-calendar-body-assignments-monday" class="big-calendar-body-assignments-day"></div>
                <div id="big-calendar-body-assignments-tuesday" class="big-calendar-body-assignments-day"></div>
                <div id="big-calendar-body-assignments-wednesday" class="big-calendar-body-assignments-day"></div>
                <div id="big-calendar-body-assignments-thursday" class="big-calendar-body-assignments-day"></div>
                <div id="big-calendar-body-assignments-friday" class="big-calendar-body-assignments-day"></div>
                <div id="big-calendar-body-assignments-saturday" class="big-calendar-body-assignments-day"></div>
                <div id="big-calendar-body-assignments-sunday" class="big-calendar-body-assignments-day"></div>
                ${html}
            </div>
            `);



            if ((localStorage['user_id'] != undefined) && (localStorage['user_id'] != "null")) {
                this.getAssignments();
            }
        }
    }

    get getStartDate() {
        return formatDate(this.startYear, this.startMonth, this.startDay);
    }

    get getEndDate() {
        return formatDate(this.endYear, this.endMonth, this.endDay);
    }

    get getStartDay() {
        return this.startDay;
    }
    get getStartMonth() {
        return this.startMonth;
    }
    get getStartYear() {
        return this.startYear;
    }
    get getEndDay() {
        return this.endDay;
    }
    get getEndMonth() {
        return this.endMonth;
    }
    get getEndYear() {
        return this.endYear;
    }

    get getWeekDates() {
        console.log(this.startDay);
        console.log(this.startMonth);
        console.log(this.startYear);
        let dates = [];
        for (let i = 0; i < 7; i++) {
            if (this.startDay + i > getDaysInMonth(this.startMonth, this.startYear)) {
                if (this.startMonth + 1 > 11) {
                    dates.push(formatDate(
                        this.startYear + 1, 
                        this.startMonth + 1 - 12, 
                        this.startDay + i - getDaysInMonth(this.startMonth, this.startYear)));
                }
                else
                    dates.push(formatDate(
                        this.startYear, 
                        this.startMonth + 1, 
                        this.startDay + i - getDaysInMonth(this.startMonth, this.startYear)));
            }
            else 
                dates.push(formatDate(
                    this.year,
                    this.month,
                    this.startDay + i));
        }
        return dates;  
    }

    addAssignmentsToCalendar(assignments) {
        if (this.mode == 'm') {
            $("body").append(`
                <div class="big-calendar-body-day-assignment"></div>
            `);
            let style = $('.big-calendar-body-day-assignment');
            let assignment_name_max_length = style.css("width").replace('px', '') / style.css("fontSize").replace('px', '');

            assignments = eval(assignments) // wtf copilot
            assignments.forEach(element => {
                let assignmentDate = new Date(element['date']);
                let day = assignmentDate.getDate();
                let month = assignmentDate.getMonth() + 1;
                let year = assignmentDate.getFullYear();
                let id = formatDate(year, month, day);
                let color = element['color']
                
                let assignment_name = element['a_name'].length > assignment_name_max_length ? element['a_name'].substring(0, assignment_name_max_length) + '...' : element['a_name'];

                $('#' + id).children('.big-calendar-body-day-assignments').append(`<div class="big-calendar-body-day-assignment" style="background-color: ${color}">${assignment_name}</div>`);

                let r = parseInt(color.substring(1, 3), 16);
                let g = parseInt(color.substring(3, 5), 16);
                let b = parseInt(color.substring(5, 7), 16);
                let brightness = (r * 299 + g * 587 + b * 114) / 1000; 
                if (brightness < 125) {
                    $('#' + id).children('.big-calendar-body-day-assignments').children('.big-calendar-body-day-assignment').css('color', 'white');
                }
                else {
                    $('#' + id).children('.big-calendar-body-day-assignments').children('.big-calendar-body-day-assignment').css('color', 'black');
                }
            });
        }
        else if (this.mode == 'w') {
            $("body").append(`
                <div class="big-calendar-body-day-assignment big-calendar-body-day-week-assignment"></div>
            `);

            let style = $('.big-calendar-body-day-week-assignment');
            let assignment_name_max_length = style.css("width").replace('px', '') / style.css("fontSize").replace('px', '');


            assignments = eval(assignments) // wtf copilot
            assignments.forEach(element => {
                let assignmentDate = new Date(element['date']);
                let day = assignmentDate.getDate();
                let month = assignmentDate.getMonth() + 1;
                let year = assignmentDate.getFullYear();
                let color = element['color']
                let time = element['time'];
                let assignment_name = element['a_name'].length > assignment_name_max_length ? element['a_name'].substring(0, assignment_name_max_length) + '...' : element['a_name'];
                



                let dayOfWeek = assignmentDate.getDay();
                //console.log(time);

                let r = parseInt(color.substring(1, 3), 16);
                let g = parseInt(color.substring(3, 5), 16);
                let b = parseInt(color.substring(5, 7), 16);
                let brightness = (r * 299 + g * 587 + b * 114) / 1000; 

                //console.log(`#${hourOfDay}-${dayOfWeek}`);
                let sel;
                switch (dayOfWeek) {
                    case 1:
                        sel = $('#big-calendar-body-assignments-monday');
                        break;
                    case 2:
                        sel = $('#big-calendar-body-assignments-tuesday');
                        break;
                    case 3:
                        sel = $('#big-calendar-body-assignments-wednesday');
                        break;
                    case 4:
                        sel = $('#big-calendar-body-assignments-thursday');
                        break;
                    case 5:
                        sel = $('#big-calendar-body-assignments-friday');
                        break;
                    case 6:
                        sel = $('#big-calendar-body-assignments-saturday');
                        break;
                    case 0:
                        sel = $('#big-calendar-body-assignments-sunday');
                        break;
                }
                sel.append(`<div class="big-calendar-body-day-assignment big-calendar-body-day-week-assignment" style="background-color: ${color}; color: ${brightness < 125 ? 'white' : 'black'} ">${assignment_name}</div>`);
                
            });
        }
    }

    getAssignments() {
        console.log(this.getStartDate);
        console.log(this.getEndDate);
        db.getAssignmentDateRange(
            this.getStartDate,
            this.getEndDate
        ).then((data) => {
            //console.log(data);
            this.addAssignmentsToCalendar(data, this.mode);
        });
    }

    clearAssignments() {
        $('.big-calendar-body-day-assignments').empty();
    }
}