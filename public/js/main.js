$(document).ready(function () {
    $('#add').click(function (e) {
        e.preventDefault();
        $('#add-card').slideToggle();
    })

    $('#avatar').change(function (e) {
        let path = $(this).val();
        let r = path.substring(path.lastIndexOf("\\")+1);
        $('.custom-file label').text(r);
    });

    $('.remove-user').click(function(e) {
        var parent = $(this).parent().parent();
        var id = $(this).attr('data-user');
        $.ajax({
            type: "delete",
            url: "/users/" + id,
            success: function (response) {
                parent.slideUp(500, function() {
                    parent.remove();   
                 });
            }
        });
    })
});