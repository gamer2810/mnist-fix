$(document).ready(function() {
    let run = false;

    const load = `
    <div id="load" class="d-flex align-items-center justify-content-center" style="position:absolute; top: 0; left: 0; width:250px; height:250px; margin:20px auto 20px auto; background-color:rgba(255, 255, 255, 0.4)">
        <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
    `;

    function upload(image) {
        $("#paint").append(load);
        $.ajax({
            type: "POST",
            url: "/upload-base64",
            data: { image: image },
            success: function(data) {
                run = false;
                $("#load").remove();
                $(".result").empty();
                data.result.forEach((r, index) => {
                    $(".result").append(`
					<div class="d-flex justify-content-center align-items-center">
						<h5 class="m-0 mr-3">${index}</h5>
						<div class="progress w-100">
							<div class="progress-bar${
                                index == data.prediction ? " bg-success" : ""
                            }" role="progressbar" style="width: ${r}%;" aria-valuenow="${r}" aria-valuemin="0"
								aria-valuemax="100"></div>
						</div>
					</div>
					`);
                });
            }
        });
    }

    $.fn.wPaint.defaults = {
        path: "/", // set absolute path for images and cursors
        theme: "standard classic", // set theme
        autoScaleImage: true, // auto scale images to size of canvas (fg and bg)
        autoCenterImage: true, // auto center images (fg and bg, default is left/top corner)
        menuHandle: false, // setting to false will means menus cannot be dragged around
        menuOrientation: "horizontal", // menu alignment (horizontal,vertical)
        menuOffsetLeft: 5, // left offset of primary menu
        menuOffsetTop: 5, // top offset of primary menu
        bg: "#000000", // set bg on init
        image: null, // set image on init
        imageStretch: false, // stretch smaller images to full canvans dimensions
        onShapeDown: null, // callback for draw down event
        onShapeMove: null, // callback for draw move event
        onShapeUp: null // callback for draw up event
    };

    $.extend($.fn.wPaint.defaults, {
        mode: "pencil", // set mode
        lineWidth: "15", // starting line width
        fillStyle: "#FFFFFF", // starting fill style
        strokeStyle: "#FFFFFF" // start stroke style
    });

    $("#wPaint").wPaint({
        menuOffsetLeft: -35,
        menuOffsetTop: -50,
        saveImg: upload
    });

    $(".wPaint-menu").hide();

    function scale(image) {
        const canvas = document.createElement("canvas");
        canvas.width = 28;
        canvas.height = 28;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, 28, 28);
        const data = canvas.toDataURL("image/png");
        return data;
    }

    $("#predict").click(function() {
        if (!run) {
            run = true;
            const imageData = $("#wPaint").wPaint("image");
            const img = new Image();
            img.src = imageData;
            img.onload = function() {
                const data = scale(img);
                upload(data);
            };
        }
    });

    $("#clear").click(function() {
        $("#wPaint").wPaint("clear");
        $(".result").empty();
    });
});
