function myGetUserMedia(obj) {
    this.init(obj);
};
myGetUserMedia.prototype = {
    init: function(obj) {
        this.update(obj);

        // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
    	if (navigator.mediaDevices === undefined) {
    		navigator.mediaDevices = {};
    	}

    	// 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia
    	// 因为这样可能会覆盖已有的属性。这里我们只会在没有getUserMedia属性的时候添加它。
    	if (navigator.mediaDevices.getUserMedia === undefined) {
    		navigator.mediaDevices.getUserMedia = function(constraints) {

    			// 首先，如果有getUserMedia的话，就获得它
    			var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    			// 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
    			if (!getUserMedia) {
    				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    			}

    			// 否则，为老的navigator.getUserMedia方法包裹一个Promise
    			return new Promise(function(resolve, reject) {
    				getUserMedia.call(navigator, constraints, resolve, reject);
    			});
    		}
    	};

        this.play();
    },
    play: function() {
        var that = this;

    	navigator.mediaDevices.getUserMedia(this.$settings)
    	.then(function(stream) {
    		that.setVideo(stream);
    	})
    	.catch(function(err) {
    		console.log(err.name + ": " + err.message);
    	});
    },
    setVideo: function(src) {
        this.$stream = src;
        var video = this.$el,
            that = this;
        // 旧的浏览器可能没有srcObject
        if ("srcObject" in video) {
            video.srcObject = src;
        } else {
            // 防止在新的浏览器里使用它，应为它已经不再支持了
            video.src = window.URL.createObjectURL(src);
        }
        video.onloadedmetadata = function(e) {
            that.scaleVideo();

            video.play();
        };
    },
    scaleVideo: function() {
        var video = this.$el;
        var vw = video.videoWidth,
            vh = video.videoHeight;

        if(vw > vh) {
            video.style.width = 'auto';
            video.style.height = '100%';
        } else {
            video.style.width = '100%';
            video.style.height = 'auto';
        };
    },
    stop: function() {
        if(this.$stream) {
            var tracks = this.$stream.getTracks();
            tracks.forEach(function(item) {
                item.stop();
            });
        };
    },
    update: function(obj) {
        this.$settings = obj;
        this.$el = document.querySelector(this.$settings.el);
    }
}
