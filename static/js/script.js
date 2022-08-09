$(window).on('load', function () {
    fetchAssignments(-1);
})

function fetchAssignments(num_refresh) {
    $.ajax({
        url: '/get-assignments',
        type: 'GET',
        data: {
            num_refresh: num_refresh,
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
            }, 100)
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
                if (data == 'success') {
                    $('#deleteConfirmationModal').modal('hide');
                    setTimeout(function () {
                        $('#assignment_' + assignment_id).remove();
                    }, 300)
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
        }, 100)
    });
})

function deleteAssignment(assignment_id, assignment_name) {
    //$('.items').toggleClass('base-inactive'); // see above, causes bug when modal is closed
}

function displayDeleteModal() {
    $('.items').toggleClass('base-inactive');
}

function displayNewModal() {
    $('.items').toggleClass('base-inactive')
    $('#newModal').fadeToggle();
    if (!$('#new-title').is('visible')) {
        setTimeout(function () {
            $('#new-title').focus();
        }, 300);
    }

    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day + ' 23:59';
    $('#new-date-input').val(today)

    $.ajax('/get-classes').done(function (data) {
        $('.edit-sub').html(data);
    })
}

$(document).on('keydown', document, async function (e) {
    if (e.key == 'n' && e.altKey) {
        displayNewModal();
    }
    else if (e.key == 'd' && e.altKey) {
        displayDeleteModal();
    }
    else if (e.key == 'Escape') {
        if ($('.items').hasClass('base-inactive')) {
            $('.items').removeClass('base-inactive')
            $('#newModal').fadeToggle();
            AssignmentModalVisible = false;
        }
    }
    else if (e.key == 'Enter') {
        if ($('#a-btn').hasClass('active')) {
            newAssignment();
        }
    }
})

const assignmentCreationModalBox = document.getElementById("assignmentCreationBox");

/* bugged and too lazy to fix
for some reason closes the window when you click on the greyed out days of the calendar
$(document).on('click', '#newModal', function(e) {
    const isClickInside = assignmentCreationModalBox.contains(e.target);
    console.log(isClickInside);
    console.log(e.target);
    if (!isClickInside) {
        $('.items').toggleClass('base-inactive')
        $('#newModal').fadeToggle();
    }
});
*/

$(document).on('click', "#addButton", function () {
    displayNewModal();
});

$(document).on("click", "#new-submit-btn", function () {
    if ($('#c-btn').hasClass('active')) {
        newClass();
    }
    else if ($('#a-btn').hasClass('active')) {
        newAssignment();
    }
})

function newClass() {
    let title = $('#new-title').val();
    let item_type = "Class";
    let color = $('#new-color').val();
    let notes = $('#notes').val();

    $.ajax({
        url: '/new-class',
        type: 'POST',
        data: {
            title: title,
            item_type: item_type,
            color: color,
            notes: notes
        },
        success: function (data) {
            if (data == 'success') {
                $('#newModal').modal('hide');
                $('#newModal').find('input:text').val('');
                $('#newModal').find('textarea').val('');
            } else {
                alert('Error');
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
    let sub = $('.edit-sub').val();
    let date = $('.date-input').val();
    let content = $('#assignment-content').val();
    let notes = $('#notes').val();

    $.ajax({
        url: '/new-assignment',
        type: 'POST',
        data: {
            a_name: a_name,
            item_type: item_type,
            sub: sub,
            date: date,
            content: content,
            notes: notes,
        },
        success: function (data) {
            if (data == 'success') {
                fetchAssignments(1);
                $('#newModal').find('input:text').val('');
                $('#newModal').find('textarea').val('');
            }
            else if (data == 'error sub') {
                alert('Error, please create a class first');
                console.error(data);
            }
            else if (data == 'error a_name') {
                alert('Error, please enter a name for the assignment');
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

        $.ajax('/get-classes').done(function (data) {
            $('.edit-sub').html(data);
        })
    }
    else {
        $('.cls').hide();
        $('.assignment').hide();
        $('.test').show();
    }
});


var month = new Date().getMonth() + 1;
var year = new Date().getFullYear();
var day = new Date().getDate();
$(document).on('click', '#btnCalendar', function (e) {
    // toggles calendar
    let calendar = $('#calendar');
    calendar.toggleClass('calendar-hidden')

    let now = new Date();
    day = now.getDate();
    year = now.getFullYear();

    $('#calendar-header-month').html(`${month}/${year}`);

    setCalendar(month, year);
});

function setCalendar(month, year) {
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
        $('#calendar-body').append(`<div class="calendar-body-day">${i + 1}</div>`);
    }

    let lastDay = getLastDayOfMonth(month, year);
    lastDay = lastDay == 0 ? 7 : lastDay;
    var i
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
    console.log(month, year);
    setCalendar(month, year);
});