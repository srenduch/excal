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
                        slideElement($('#assignment_' + assignment_id), 'left');
                    }, 100)
                    setTimeout(function () {
                        $('#assignment_' + assignment_id).remove();
                    }, 500)
                } else {
                    alert('Error');
                }
            },
            error: function (data) {
                console.error(data);
            }
        });
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
        }, 500);
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
        }
    }
})

$(document).on('click', '#newModalBox', function (e) {
    const newModal = document.getElementById("newModalBox");
    const isClickInside = newModal.contains(e.target);
    if (!isClickInside) {
        $('.items').toggleClass('base-inactive')
        $('#newModal').fadeToggle();
    }
});

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
            } else {
                alert('Error');
            }
        },
        error: function (data) {
            console.error(data);
        }
    });
}

$('.new-type-btn').click(function () {
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
