import { DBInterface } from './db.js';
let db = new DBInterface();
import { BigCalendar } from './Big Calendar.js';


// kinda cursed should make a class for the small calendar 
var month = new Date().getMonth() + 1;
var year = new Date().getFullYear();

var Calendar = new BigCalendar(month, year, 'm');


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