import { DBInterface } from './db.js';
let db = new DBInterface();

function getToday() {
    let date = new Date();
    return date.getDay() == 0 ? 7 : date.getDay();
}

class BigCalendar {
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

            </div>

            `);

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

            $('#big-calendar-body').append(html);



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
        let dates = [];
        for (let i = 0; i < 7; i++) {
            if (this.startDay + i > getDaysInMonth(this.startMonth + 1, this.startYear)) {
                if (this.startMonth + 1 > 11) {
                    dates.push(formatDate(this.startYear + 1, this.startMonth + 1 - 12, this.startDay + i - getDaysInMonth(this.startMonth + 1, this.startYear)));
                }
                else
                    dates.push(formatDate(this.startYear, this.startMonth + 1, this.startDay + i - getDaysInMonth(this.startMonth + 1, this.startYear)));
            }
            else 
                dates.push(formatDate(this.year, this.month, this.startDay + i));
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
            Calendar.getStartDate,
            Calendar.getEndDate
        ).then((data) => {
            //console.log(data);
            Calendar.addAssignmentsToCalendar(data, this.mode);
        });
    }

    clearAssignments() {
        $('.big-calendar-body-day-assignments').empty();
    }
}

// kinda cursed should make a class for the small calendar 
var month = new Date().getMonth() + 1;
var year = new Date().getFullYear();

var Calendar = new BigCalendar(month, year, 'm');

function formatDate(year, month, day, hour, minute) {
    if (hour == undefined) {
        return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
    }
    return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}T${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}


$(window).on('load', function () {
    if (localStorage['user_id'] != undefined && localStorage['user_id'] != null) {
        fetchAssignments('all', null).then((data) => {
            $('.items').html(data);
            setTimeout(function () {
                slideElement($('.item'), 'right');
            }, 100)
        });
    }
    $('#new-color').on('input', function () {
        let color = $('#new-color').val();
        $('#new-color').css('background-color', color);
    });
    if (window.location.pathname == '/') {
        let now = new Date();
        let month = (now.getMonth() + 1);
        let year = now.getFullYear();

        Calendar.setMonth = month;
        Calendar.setYear = year;
        Calendar.setMode = 'm';
        Calendar.setBigCalendar();
    }
    $('#big-calendar-header-left-arrow').on('click', function () {
        if (Calendar.mode == 'm') {
            Calendar.decrementMonth();
            Calendar.setBigCalendar();
        }
        else if (Calendar.mode == 'w') {
            Calendar.decreaseWeekOffset();
            Calendar.setBigCalendar();
        }
    });
    $('#big-calendar-header-right-arrow').on('click', function () {
        if (Calendar.mode == 'm') {
            Calendar.incrementMonth();
            Calendar.setBigCalendar();
        }
        else if (Calendar.mode == 'w') {
            Calendar.increaseWeekOffset();
            Calendar.setBigCalendar();
        }
    });
    $('#big-calendar-header-mode-selector-btn-week').on('click', function () {
        Calendar.setMode = 'w';

        $('#big-calendar-header-mode-selector-btn-week').prop("disabled", true);
        $('#big-calendar-header-mode-selector-btn-month').prop("disabled", false);
        $('#big-calendar-header-mode-selector-btn-day').prop("disabled", false);

        Calendar.setBigCalendar();
    });
    $('#big-calendar-header-mode-selector-btn-month').on('click', function () {
        Calendar.setMode = 'm';

        $('#big-calendar-header-mode-selector-btn-week').prop("disabled", false);
        $('#big-calendar-header-mode-selector-btn-month').prop("disabled", true);
        $('#big-calendar-header-mode-selector-btn-day').prop("disabled", false);

        Calendar.setBigCalendar();
    });
    $('#big-calendar-header-mode-selector-btn-day').on('click', function () {
        Calendar.setMode = 'd';

        $('#big-calendar-header-mode-selector-btn-week').prop("disabled", false);
        $('#big-calendar-header-mode-selector-btn-month').prop("disabled", false);
        $('#big-calendar-header-mode-selector-btn-day').prop("disabled", true);

        Calendar.setBigCalendar();
    });
});

function fetchAssignments(num_refresh, assignment_id) {
    return eval(`db.getAssignment${num_refresh && num_refresh[0].toUpperCase() + num_refresh.slice(1).toLowerCase()}(${assignment_id ? assignment_id : ''})`)
}

function deleteAssignments(num_delete, assignment_id) {
    return eval(`db.deleteAssignment${num_delete && num_delete[0].toUpperCase() + num_delete.slice(1).toLowerCase()}(${assignment_id ? assignment_id : ''})`)

}

$(document).on("click", ".item-btn", function () {
    var assignment_id = $(this).data("id");
    var assignment_name = $(this).data("name");

    $('#deleteButton').attr('onclick', function () {
        deleteAssignments('one', assignment_id).then((data) => {
            Calendar.clearAssignments();
            Calendar.getAssignments();
            $('#deleteConfirmationModal').modal('hide');
            setTimeout(function () {
                $('#assignment_' + assignment_id).remove();
            }, 100);
        });
    })
})

// function deleteAssignment(assignment_id, assignment_name) {
//     $('.items').toggleClass('base-inactive'); // see above, causes bug when modal is closed
// }

function displayDeleteModal() {
    $('.items').toggleClass('base-inactive');
}

// changes the text of #new-submit-btn depending on the type of item being created
$(document).ready(function () {
    $("#a-btn").click(function () {
        $("#new-submit-btn").text("Add Assignment");
    });
    $("#c-btn").click(function () {
        $("#new-submit-btn").text("Add Class");
    });
    $("#t-btn").click(function () {
        $("#new-submit-btn").text("Add Test");
    });
});

$('#newModal').on('show.bs.modal', function () {
    $('.items').addClass('base-inactive');
    $('.index-container').addClass('base-inactive');
    if (!classes_cached) {
        db.getClassAll().then((data) => {
            localStorage['classes'] = data
            $('#class-select').html(localStorage['classes'])
        })
        classes_cached = true;
    }
    else
        $('#class-select').html(localStorage['classes']);
});

$('#newModal').on('hidden.bs.modal', function () {
    $('.items').removeClass('base-inactive');
    $('.index-container').removeClass('base-inactive');
});

var classes_cached = false;

function displayNewModal(dateOverride) {
    // $('.items').toggleClass('base-inactive')
    // $('#newModal').fadeToggle();
    // if (!$('#new-title').is('visible')) {
    //     setTimeout(function () {
    //         $('#new-title').focus();
    //     }, 300);
    // }

    $('#newModal').modal({
        backdrop: true,
        keyboard: true,
        focus: true,
        show: true
    });

    if (dateOverride == undefined) {
        var now = new Date();
        let month = (now.getMonth() + 1);
        let day = now.getDate();
        if (month < 10)
            month = "0" + month;
        if (day < 10)
            day = "0" + day;
        // var today = now.getFullYear() + '-' + month + '-' + day + ' 23:59';
        let today = now.getFullYear() + '-' + month + '-' + day + 'T23:59';
        $('#new-date-input').val(today);
    }
    else {
        $('#new-date-input').val(dateOverride);
    }

    if (!classes_cached) {
        db.getClassAll().then((data) => {
            localStorage['classes'] = data;
            $('#class-select').html(localStorage['classes'])
        })
        classes_cached = true;
    }
    else
        $('#class-select').html(localStorage['classes']);
}




$(document).on('keydown', document, async function (e) {
    if (e.key == 'n' && e.altKey) {
        displayNewModal();
    }

    else if (e.key == 'd' && e.altKey) {
        displayDeleteModal();
    }

    else if (e.key == 'Enter') {
        if ($('#a-btn').hasClass('active')) {
            newAssignment();
        }
    }
});

// const assignmentCreationModalBox = document.getElementById("assignmentCreationBox");


$(document).on('click', "#addButton", function () {
    displayNewModal();
});

$(document).on("click", "#new-submit-btn", function () {
    if ($('#c-btn').hasClass('active')) {
        newClass();
        classes_cached = false;

    }
    else if ($('#a-btn').hasClass('active')) {
        newAssignment();
    }
});

function newClass() {
    db.addClass({
        title: $('#new-title').val(),
        color: $('#new-color').val(),
        notes: $('#notes').val()
    }).then((data) => {
        $('#newModal').modal('hide');
        $('#newModal').find('input:text').val('');
        $('#newModal').find('textarea').val('');
    })
}

function slideElement(element, direction) {
    if (element.hasClass('slide')) {
        if (direction == 'right') {
            element.css('left', 0);
        }
        else if (direction == 'left') {
            element.css('left', '-6rem');
        }
    }
}

function newAssignment() {
    db.addAssignment({
        a_name: $('#new-title').val(),
        class_id: $('.edit-sub').find(':selected').data('class-id'),
        date: `${$('.date-input').val()}:00`,
        content: $('#assignment-content').val(),
        notes: $('#notes').val(),
    }).then((data) => {
        fetchAssignments('newest')
        Calendar.clearAssignments();
        Calendar.getAssignments();
        $('#newModal').find('input:text').val('');
        $('#newModal').find('textarea').val('');
    })
}

$(document).on('click', '.new-type-btn', function () {
    $('.new-type-btn').removeClass('active').addClass('inactive');
    $(this).removeClass('inactive').addClass('active');

    if ($(this).text() == 'Class') {
        $('.cls').show();
        $('.assignment').hide();
        $('.test').hide();
    }
    else if ($(this).text() == 'Assignment') {
        $('.cls').hide();
        $('.test').hide();
        $('.assignment').show();

        if (!classes_cached) {
            db.getClassAll().then((data) => {
                localStorage['classes'] = data
            });
            classes_cached = true;
        }
        $('#class-select').html(localStorage['classes']);
    }
    else {
        $('.cls').hide();
        $('.assignment').hide();
        $('.test').show();
    }
});



$(document).on('click', '#btnCalendar', function (e) {
    // toggles calendar
    let calendar = $('#calendar');
    calendar.toggleClass('calendar-hidden');

    let now = new Date();
    day = now.getDate();
    year = now.getFullYear();

    $('#calendar-header-month').html(`${month}/${year}`);

    setCalendar(month, year);
});

function setCalendar(month, year) {
    var selectedDate = $('.date-input').val();
    let selectedDateArr = selectedDate.split('-');
    let selectedYear = selectedDateArr[0];
    let selectedMonth = selectedDateArr[1];
    let selectedDay = selectedDateArr[2].split('T')[0];

    let monthstring = '';
    switch (month) {
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
    $('#calendar-header-month').html(monthstring + ' ' + year);
    let days = getDaysInMonth(month, year);

    let firstDay = getFirstDayOfMonth(month, year);
    firstDay = firstDay == 0 ? 7 : firstDay;
    let lastMonthDaysNum = getDaysInMonth(month - 1, year);
    $('.calendar-body-day').remove();
    for (let i = 0; i < firstDay - 1; i++) {
        $('#calendar-body').append(`<div class="calendar-body-day calendar-body-day-disabled before">${lastMonthDaysNum - firstDay + i + 2}</div>`);
    }

    for (let i = 0; i < days; i++) {
        if (i + 1 == selectedDay && month == selectedMonth && year == selectedYear) {
            $('#calendar-body').append(`<div class="calendar-body-day calendar-body-day-selected">${i + 1}</div>`);
        }
        else {
            $('#calendar-body').append(`<div class="calendar-body-day">${i + 1}</div>`);
        }
    }

    let lastDay = getLastDayOfMonth(month, year);
    lastDay = lastDay == 0 ? 7 : lastDay;
    let i;
    for (i = 0; i < 7 - lastDay; i++) {
        $('#calendar-body').append(`<div class="calendar-body-day calendar-body-day-disabled after">${i + 1}</div>`);
    }

    // fill last row with days of the next month if necessary
    if (firstDay - 1 + days <= 35) {
        for (let d = i; i < d + 7; i++) {
            $('#calendar-body').append(`<div class="calendar-body-day calendar-body-day-disabled after">${i + 1}</div>`);
        }
    }
}






$(document).on('click', ".calendar-body-day", function (e) {
    if (!$(this).hasClass('calendar-body-day-disabled')) {
        let day = $(this).text();
        let hour = $('#new-date-input').val().split('T')[1].split(':')[0];
        let minute = $('#new-date-input').val().split('T')[1].split(':')[1];
        let monthformated = month < 10 ? '0' + month : month;
        let dayformated = day < 10 ? '0' + day : day;
        $('#new-date-input').val(`${year}-${monthformated}-${dayformated}T${hour}:${minute}`);
        $('#calendar').addClass('calendar-hidden');
    }
});

$(document).on('click', ".before", function (e) {
    if (month == 1) {
        month = 12;
        year--;
    }
    else {
        month--;
    }
    setCalendar(month, year);
});

$(document).on('click', ".after", function (e) {
    if (month == 12) {
        month = 1;
        year++;
    }
    else {
        month++;
    }
    setCalendar(month, year);
});

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
    if (month == 1) {
        return new Date(year - 1, 12, 1).getDay();
    }
    return new Date(year, month - 1, 1).getDay();
}

function getLastDayOfMonth(month, year) {
    return new Date(year, month, 0).getDay();
}

$(document).on('click', '#calendar-header-left-arrow', function () {
    if (month == 1) {
        month = 12;
        year = year - 1;
    }
    else {
        month = month - 1;
    }
    setCalendar(month, year);
});

$(document).on('click', '#calendar-header-right-arrow', function () {
    if (month == 12) {
        month = 1;
        year = year + 1;
    }
    else {
        month = month + 1;
    }
    setCalendar(month, year);
});

$(document).on('click', '#register-btn', () => {
    let username = $('#username').val();
    let password = $('#password').val();

    db.userRegister(username, password).then(function (data) {
        localStorage['user_id'] = data
        window.location.replace('/');
    })
})

$(document).on('click', '#login-btn', () => {
    let username = $('#username').val();
    let password = $('#password').val();
    db.userLogin(username, password).then(function (data) {
        localStorage['user_id'] = data
        window.location.replace('/');
    })
})

$("#register").submit(function (e) {
    return false;
});

$("#login").submit(function (e) {
    return false;
});