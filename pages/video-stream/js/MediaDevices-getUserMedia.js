(function() {
    var front = false,
		media,
		obj = {
			get constraints() {
				return {
					el: '#video',
					// audio: true,
					video: {
						// width: 1280,
						// height: 720 ,
						facingMode: (front ? "user" : "environment")
					}
				}
			},

			get front() {
				return front;
			},
			set front(val) {
				front =  val;

				media.stop();
				media.update(obj.constraints);
				media.play();
			}
		};

	media = new myGetUserMedia(obj.constraints);

	document.querySelector('#shift').addEventListener('click', function() {
		obj.front = !obj.front;
	});
	document.querySelector('#play').addEventListener('click', function() {
		media.play();
	});
	document.querySelector('#stop').addEventListener('click', function() {
		media.stop();
	});
} ())
