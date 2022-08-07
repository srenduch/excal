$(document).on("click", ".item-btn", function () {
    var assignment_id = $(this).data("id");
    var assignment_name = $(this).data("name");
    $('#deleteButton').attr('onclick', 'deleteAssignment(' + assignment_id + ', "' + assignment_name + '")');
}
)

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
                $('#assignement_' + assignment_id).remove();
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


}