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
        let firstDayOfWeek = this.weekoffset * 7;
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
            $('.big-calendar-body-day').remove();

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
                console.log($(this).attr('id'));
                // open create assignment modal on day
                let date = $(this).attr('id');
                let year = date.substring(0, 4);
                let month = date.substring(5, 7);
                let day = date.substring(8, 10);
        
                // console.log(day);
                // console.log(month);
                // console.log(year);
        
                // console.log(formatDate(year, month, day, 23, 59))
        
                displayNewModal(formatDate(year, month, day, 23, 59))
            });

            
            this.getAssignments();
        }

        else if (this.mode == 'w') {
            $('#big-calendar-header-month').html(`W${this.weekoffset+1} ${monthstring} ${this.year}`);
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
            let firstDay = this.getFirstDayOfWeek;

            
            $('#big-calendar-monday').html(`M <div class="big-calendar-body-top-date">${firstDay}/${this.month + 1}</div>`);
            $('#big-calendar-tuesday').html(`T <div class="big-calendar-body-top-date">${firstDay + 1}/${this.month + 1}</div>`);
            $('#big-calendar-wednesday').html(`W <div class="big-calendar-body-top-date">${firstDay + 2}/${this.month + 1}</div>`);
            $('#big-calendar-thursday').html(`T <div class="big-calendar-body-top-date">${firstDay + 3}/${this.month + 1}</div>`);
            $('#big-calendar-friday').html(`F <div class="big-calendar-body-top-date">${firstDay + 4}/${this.month + 1}</div>`);
            $('#big-calendar-saturday').html(`S <div class="big-calendar-body-top-date">${firstDay + 5}/${this.month + 1}</div>`);
            $('#big-calendar-sunday').html(`S <div class="big-calendar-body-top-date">${firstDay + 6}/${this.month + 1}</div>`);

            $('#big-calendar-body').css('grid-template-columns', 'auto repeat(7, 1fr)');
            $('#big-calendar-body').css('grid-template-rows', 'auto repeat(24, 1fr)');
            $('#big-calendar-body').css('grid-column-gap', '0px');
            $('#big-calendar-body').css('grid-row-gap', '0');


            $('#big-calendar-body').prepend(
                "<div></div>"                
            );
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
                    
                    
                    
                    html += `<div class='big-calendar-body-day-hour-assignments' style="${style2}" id="${i} ${j}"></div>`;
                }
            }
            //html += "</div>";

            this.startDay = firstDay;
            this.startMonth = this.month;
            this.startYear = this.year;
            this.endDay = firstDay + 6;
            if (this.endDay > getDaysInMonth(this.month + 1, this.year)) {
                this.endDay = getDaysInMonth(this.month + 1, this.year) ;
            }
            this.endMonth = this.month + 1;
            if (this.endMonth > 11) {
                this.endMonth = 0;
                this.endYear = this.year + 1;
            }

            $('#big-calendar-body').append(html);
            this.getAssignments();
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

    addAssignmentsTocalendar(assignments) {
        let start = new Date(this.getStartDate);
        let end = new Date(this.getEndDate);
        //console.log(start);
        //console.log(end);
        for (let assignment of assignments) {
            let assignmentDate = new Date(assignment.date);
            //console.log(assignmentDate);
            let day = assignmentDate.getDate();
            let month = assignmentDate.getMonth() + 1;
            let year = assignmentDate.getFullYear();
            let id = formatDate(year, month, day);
            let color = assignment.color;
            //console.log(id);
            $('#' + id).children('.big-calendar-body-day-assignments').append(`<div class="big-calendar-body-day-assignment" style="background-color: ${color}">${assignment.a_name}</div>`);
            // check if colour is dark or light and adjust the text colour accordingly

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
                
            
        }
    }

    getAssignments() {
        $.ajax({
            url: '/get-assignments-between-dates',
            type: 'GET',
            data: {
                start: Calendar.getStartDate,
                end: Calendar.getEndDate,
                user_id: localStorage['user_id']
            },
            success: function (data) {
                //data = JSON.parse(data)
                //console.log(data);
                Calendar.addAssignmentsTocalendar(data, this.mode);
            }
        });
    
    }

    clearAssignments() {
        $('.big-calendar-body-day-assignments').empty();
    }
}

var month = new Date().getMonth() + 1;
var year = new Date().getFullYear();
var day = new Date().getDate();

var Calendar = new BigCalendar(month, year, 'm');

function formatDate(year, month, day, hour, minute) {
    if (hour == undefined) {
        return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
    }
    return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}T${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}


$(window).on('load', function () {
    fetchAssignments(-1);
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
            Calendar.setMonth = Calendar.getMonth - 1;
            if (Calendar.getMonth == 0) {
                Calendar.setMonth = 12;
                Calendar.setYear = Calendar.getYear - 1;
            }
            Calendar.setMode = 'm';
            Calendar.setBigCalendar();
        }
        else if (Calendar.mode == 'w') {
            Calendar.decreaseWeekOffset();
            Calendar.setMode = 'w';
            Calendar.setBigCalendar();
        }
    });
    $('#big-calendar-header-right-arrow').on('click', function () {
        if (Calendar.mode == 'm') {
            Calendar.setMonth = Calendar.getMonth + 1;
            if (Calendar.getMonth == 13) {
                Calendar.setMonth = 1;
                Calendar.setYear = Calendar.getYear + 1;
            }
            Calendar.setMode = 'm';
            Calendar.setBigCalendar();
        }
        else if (Calendar.mode == 'w') {
            Calendar.increaseWeekOffset();
            Calendar.setMode = 'w';
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



function fetchAssignments(num_refresh) {
    $.ajax({
        url: '/get-assignments',
        type: 'GET',
        data: {
            num_refresh: num_refresh,
            user_id: localStorage['user_id']
        },
        success: function (data) {
            if (num_refresh == 1) {
                $('.items').append(data);
            }
            else {
                $('.items').html(data);
            }

            setTimeout(function () {
                slideElement($('.item'), 'right');
            }, 100);
        },
        error: function (data) {
            console.error(data);
        }
    });
}

$(document).on("click", ".item-btn", function () {
    var assignment_id = $(this).data("id");
    var assignment_name = $(this).data("name");
    $('#deleteButton').attr('onclick', function () {
        $.ajax({
            url: '/delete',
            type: 'POST',
            data: {
                type: 'assignment',
                id: assignment_id
            },
            success: function (data) {
                Calendar.clearAssignments();
                Calendar.getAssignments();
                if (data == 'success') {
                    $('#deleteConfirmationModal').modal('hide');
                    setTimeout(function () {
                        $('#assignment_' + assignment_id).remove();
                    }, 300);
                } else {
                    alert('Error');
                }
            },
            error: function (data) {
                console.error(data);
            }
        });
        setTimeout(function () {
            slideElement($('#assignment_' + assignment_id), 'left');
        }, 100);
    });
});

function deleteAssignment(assignment_id, assignment_name) {
    //$('.items').toggleClass('base-inactive'); // see above, causes bug when modal is closed
}

function displayDeleteModal() {
    $('.items').toggleClass('base-inactive');
}

// changes the text of #new-submit-btn depending on the type of item being created
$(document).ready(function() {
    $("#a-btn").click(function() {
        $("#new-submit-btn").text("Add Assignment");
    });
    $("#c-btn").click(function() {
        $("#new-submit-btn").text("Add Class");
    });
    $("#t-btn").click(function() {
        $("#new-submit-btn").text("Add Test");
    });
});

$('#newModal').on('show.bs.modal' , function () {
    $('.items').addClass('base-inactive');
    if (!classes_cached) {
        $.ajax({
            url: '/get-classes',
            type: 'GET',
            data: {
                user_id: localStorage['user_id']
            },
            success: function (data) {
                localStorage['classes'] = data;
                $('#class-select').html(localStorage['classes']);
            }
        });
        classes_cached = true;
    }
    else
        $('#class-select').html(localStorage['classes']);
});

$('#newModal').on('hidden.bs.modal', function () {
    $('.items').removeClass('base-inactive');
});

var classes_cached = false;

function displayNewModal(dateOverride) {
    

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
        let today = now.getFullYear() + '-' + month + '-' + day + 'T23:59';
        $('#new-date-input').val(today);
    }
    else {
        $('#new-date-input').val(dateOverride);
    }

    if (!classes_cached) {
        $.ajax({
            url: '/get-classes',
            type: 'GET',
            data: {
                user_id: localStorage['user_id']
            },
            success: function (data) {
                localStorage['classes'] = data;
                $('#class-select').html(localStorage['classes']);
            }
        });
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

const assignmentCreationModalBox = document.getElementById("assignmentCreationBox");


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
    let title = $('#new-title').val();
    let item_type = "Class";
    let color = $('#new-color').val();
    let notes = $('#notes').val();

    if (!localStorage['user_id'] || localStorage['user_id'] === 'null') {
        alert('Please log in to create a class');
        return;
    }

    $.ajax({
        url: '/new-class',
        type: 'POST',
        data: {
            title: title,
            item_type: item_type,
            color: color,
            notes: notes,
            user_id: localStorage['user_id']
        },
        success: function (data) {
            if (data == 'success') {
                $('#newModal').modal('hide');
                $('#newModal').find('input:text').val('');
                $('#newModal').find('textarea').val('');
            } else if (data == 'duplicate') {
                alert('Class already exists'); // TODO: make this look good
            }
            else if (data == 'user_id_error') {
                alert('You need to be logged in in order to create a class'); // TODO: make this look good
            }
            else if (data == 'title_error') {
                alert('Class title cannot be empty'); // TODO: make this look good
            }
            else {
                alert('Unknown Error');
            }
        },
        error: function (data) {
            console.error(data);
        }
    });
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
    let a_name = $('#new-title').val();
    let item_type = "Assignment";
    let C = $('#class-select').val();
    let date = $('.date-input').val();
    let content = $('#assignment-content').val();
    let notes = $('#notes').val();
    let user_id = localStorage['user_id'];

    $.ajax({
        url: '/new-assignment',
        type: 'POST',
        data: {
            a_name: a_name,
            item_type: item_type,
            class: C,
            date: date,
            content: content,
            notes: notes,
            user_id: user_id
        },
        success: function (data) {
            if (data == 'success') {
                fetchAssignments(1);
                Calendar.clearAssignments();
                Calendar.getAssignments();
                $('#newModal').find('input:text').val('');
                $('#newModal').find('textarea').val('');
            }
            else if (data == 'error class') {
                alert('Error, please create a class first');
                console.error(data);
            }
            else if (data == 'error a_name') {
                alert('Error, please enter a name for the assignment');
                console.error(data);
            }
            else if (data == "error user_id") {
                alert('Error, please log in to create an assignment');
                console.error(data);
            }
            else {
                alert('Unknown error');
                console.error(data);
            }
        },
        error: function (data) {
            console.error(data);
        }
    });
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
            $.ajax({
                url: '/get-classes',
                type: 'GET',
                data: {
                    user_id: localStorage['user_id']
                },
                success: function (data) {
                    localStorage['classes'] = data;
                }
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



$("#big-calendar-header-right-arrow").click(function () {
    if (month == 12) {
        month = 1;
        year = year + 1;
    }
    else {
        month = month + 1;
    }
    //console.log(month, year);
    setCalendar(month, year);
});



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
    //console.log(month, year);
    setCalendar(month, year);
});

function login() {
    let username = $('#username').val();
    let password = $('#password').val();
    $.ajax({
        url: '/login',
        type: 'POST',
        data: {
            username: username,
            password: password
        }
    }).done(function (data) {
        //console.log(data);
        if (data.slice(0, 7) == 'success') {
            localStorage['user_id'] = data.slice(7);
            window.location.replace('/');
        }
    });
}

$("#register").submit(function(e) {
    return false;
});

$("#login").submit(function(e) {
    return false;
});

function register() {
    let username = $('#username').val();
    let password = $('#password').val();


    $.ajax({
        url: '/register',
        type: 'POST',
        data: {
            username: username,
            password: password
        }
    }).done(function (data) {
        //console.log(data);
        if (data == 'success') {
            window.location.replace('/login');
        }
    });
}