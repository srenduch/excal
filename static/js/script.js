$(window).on('load', function () {
    $.ajax('/get-assignments').done(function (data) {
        $('.items').html(data);
    })
})

$(document).on("click", ".item-btn", function () {
    var assignment_id = $(this).data("id");
    var assignment_name = $(this).data("name");
    //$('.items').toggleClass('base-inactive');  // causes bug when modal is closed cause it doesn't toggle back so the items are still blurred
    $('#deleteButton').attr('onclick', 'deleteAssignment(' + assignment_id + ', "' + assignment_name + '")');
})

function deleteAssignment(assignment_id, assignment_name) {
    $.ajax({
        url: '/delete',
        type: 'POST',
        data: {
            type: 'assignment',
            id: assignment_id
        },
        success: function (data) {
            if (data == 'success') {
                $('#deleteModal').modal('hide');
                $('#assignment_' + assignment_id).remove();
                //let deleteAlert = $('#deleteAlert');
                //deleteAlert.html('<strong>Success!</strong> The assignment ' + assignment_name + ' has been deleted.');
                //deleteAlert.show();
                //$('#deleteAlert').delay(2000).fadeOut(400);
            } else {
                alert('Error');
            }
        },
        error: function (data) {
            console.error(data);
        }
    });
    //$('.items').toggleClass('base-inactive'); // see above, causes bug when modal is closed
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
    else if (e.key == 'Escape') {
        if ($('.items').hasClass('base-inactive')) {
            $('.items').removeClass('base-inactive')
            $('#newModal').fadeToggle();
        }
    }
})

const newModal = document.getElementById("newModalBox");

$(document).on('click', '#newModalBox', function (e) {
    const isClickInside = newModal.contains(e.target);
    if (!isClickInside) {
        $('.items').toggleClass('base-inactive')
        $('#newModal').fadeToggle();
    }
});

$(document).on('click', "#addButton", function () {
    DisplayAssignmentModal();
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
            notes: notes
        },
        success: function (data) {
            if (data == 'success') {
                $.ajax('/get-assignments').done(function (data) {
                    $('.items').html(data);
                })
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
