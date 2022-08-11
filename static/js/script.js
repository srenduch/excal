$(window).on('load', function () {
    fetchAssignments(-1, null);
})

function fetchAssignments(num_refresh, cls_name) {
    $.ajax({
        url: '/get-assignments',
        type: 'GET',
        data: {
            num_refresh: num_refresh,
            cls_name: cls_name
        },
        success: function (data) {
            if (cls_name) {
                $('.choose-assignment').html(data);
            }
            else if (num_refresh == -1) {
                $('.items').html(data);
            }
            else {
                $('.items').append(data);
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
    $('.items').toggleClass('base-inactive'); // see above, causes bug when modal is closed
}

function deleteClass(class_name) {
    $.ajax({
        url: '/delete-class',
        type: 'POST',
        data: {
            class_name: class_name
        },
        success: function (data) {
            if (data == 'success') {
                fetchAssignments(-1, null);
                fetchClasses()
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

function fetchClasses() {
    $.ajax('/get-classes').done(function (data) {
        $('.choose-class').html(data);
        fetchAssignments(null, $('.choose-class').val());
    })
}

function displayDeleteModal() {
    $('#deleteModal').modal({
        backdrop: true,
        keyboard: true,
        focus: true,
        show: true
    });

    // $('.items').toggleClass('base-inactive')
    // $('#deleteModal').fadeToggle();
    // $('.type-btn').addClass('inactive').removeClass('active')
    // $('.assignment').show()
    // $('.a-btn').removeClass('inactive').addClass('active')
}

function displayNewModal() {
    $('#newModal').modal({
        backdrop: true,
        keyboard: true,
        focus: true,
        show: true
    });

    // $('.items').toggleClass('base-inactive')
    // $('#newModal').fadeToggle();
    // $('.type-btn').addClass('inactive').removeClass('active')
    // $('.assignment').show()
    // $('.a-btn').removeClass('inactive').addClass('active')

    // if (!$('#new-title').is('visible')) {
    //     setTimeout(function () {
    //         $('#new-title').focus();
    //     }, 300);
    // }


    if (!classes_cached) {
        $.ajax('/get-classes').done(function (data) {
            localStorage['classes'] = data;
        })
        classes_cached = true;
    }
    $('.edit-sub').html(localStorage['classes']);

    // $.ajax('/get-classes').done(function (data) {
    //     $('.choose-class').html(data);
    // })
}

$(document).on('keydown', document, async function (e) {
    if (e.key == 'N' && e.altKey) {
        displayNewModal();
    }
    else if (e.key == 'D' && e.altKey) {
        displayDeleteModal();
    }
    else if (e.key == 'Escape') {
        if ($('.items').hasClass('base-inactive')) {
            $('.items').removeClass('base-inactive')
            if ($('#newModal').is(':visible')) {
                $('#newModal').fadeToggle();
            }
            else if ($('#deleteModal').is(':visible')) {
                $('#deleteModal').fadeToggle();
            }
        }
    }
    else if (e.key == 'Enter') {
        if ($('.disableEnter').is(':focus')) {
            return;
        }
        else if ($('.a-btn').hasClass('active') && $('#newModal').is(':visible')) {
            newAssignment();
        }
        else if ($('.c-btn').hasClass('active') && $('#newModal').is(':visible')) {
            newClass();
        }
        else if ($('.a-btn').hasClass('active') && $('#deleteModal').is(':visible')) {
            deleteAssignment();
        }
        else if ($('.c-btn').hasClass('active') && $('#deleteModal').is(':visible')) {
            deleteClass($('#delete-choose-class').val());
        }
    }
})

// const assignmentCreationModalBox = document.getElementById("assignmentCreationBox");
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

$(document).on("click", ".submit-btn", function () {
    if ($('.a-btn').hasClass('active') && $('#newModal').is(':visible')) {
        newAssignment();
    }
    else if ($('.c-btn').hasClass('active') && $('#newModal').is(':visible')) {
        newClass();
    }
    else if ($('.a-btn').hasClass('active') && $('#deleteModal').is(':visible')) {
        deleteAssignment();
    }
    else if ($('.c-btn').hasClass('active') && $('#deleteModal').is(':visible')) {
        deleteClass($('#delete-choose-class').val());
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
            }
            else if (data == 'title_error') {
                alert('Error, please enter a name for the class');
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
    let sub = $('#new-choose-class').val();
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
                fetchAssignments(1, null);
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

$(document).on('click', '.type-btn', function () {
    $('.type-btn').removeClass('active').addClass('inactive');
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
            $.ajax('/get-classes').done(function (data) {
                localStorage['classes'] = data;
            })
            classes_cached = true;
        }
        // $('.choose-class').html(localStorage['classes']);
        $('#new-choose-class').html(localStorage['classes']);

        // $.ajax('/get-classes').done(function (data) {
        //     $('.choose-class').html(data);
        // })
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
})

let color_picker = $('#new-color');
color_picker.on('input', function (e) {
    let color = color_picker.val();
    color_picker.css('background-color', color);
});

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

let open = false;
let previous_modal_id = null;
$('#deleteModal').on('show.bs.modal', function () {
    if (open) {
        return
    }
    open = true;

    $('.items').addClass('base-inactive')
    if (previous_modal_id != $(this)[0].id) {
        $('.type-btn').addClass('inactive').removeClass('active')
        $('.a-btn').addClass('active').removeClass('inactive')
        $('.assignment').show()
    }
    else {
        $('type-btn').toggleClass('active');
    }

    setTimeout(function () {
        $('#delete-title').focus();
    }, 300);

    fetchClasses()
});

$('#deleteModal').on('hidden.bs.modal', function () {
    $('.items').removeClass('base-inactive')
    previous_modal_id = $(this)[0].id
    open = false
});

$('#newModal').on('show.bs.modal', function () {
    if (open) {
        return
    }
    open = true

    $('.items').addClass('base-inactive')
    if (previous_modal_id != $(this)[0].id) {
        $('.type-btn').addClass('inactive').removeClass('active')
        $('.a-btn').addClass('active').removeClass('inactive')
        $('.assignment').show()
    }
    else {
        $('type-btn').toggleClass('active');
    }

    setTimeout(function () {
        $('#new-title').focus();
    }, 300);
});

$('#newModal').on('hidden.bs.modal', function () {
    $('.items').removeClass('base-inactive')
    previous_modal_id = $(this)[0].id
    open = false
});

var classes_cached = false;
$(document).on("click", "#new-submit-btn", function () {
    if ($('#c-btn').hasClass('active')) {
        newClass();
        classes_cached = false;

    }
    else if ($('#a-btn').hasClass('active')) {
        newAssignment();
    }
})