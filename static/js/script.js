$(document).on("click", ".item-btn", function () {
    var assignment_id = $(this).data("id");
    var assignment_name = $(this).data("name");
    $('.items').toggleClass('base-inactive');
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
    $('.items').toggleClass('base-inactive');
}

$(document).bind('keypress', 'show-new-form', async function (e) {
    if (e.key == 'N') {
        if (!$('#new-title').is(':focus')) {
            $('.items').toggleClass('base-inactive')
            $('#newModal').fadeToggle();
            if (!$('#new-title').is('visible')) {
                setTimeout(function () {
                    $('#new-title').focus();
                }, 500);
            }
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
})

$(document).on("click", "#new-submit-btn", function () {
    if ($('#c-btn').hasClass('active')) {
        newClass();
    }
})

function newClass() {
    let title = $('#new-title').val();
    let item_type = "\"Class\"";
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
            } else {
                alert('Error');
            }
        },
        error: function (data) {
            console.error(data);
        }
    });

    $('#newModal').find('input:text').val('');
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
