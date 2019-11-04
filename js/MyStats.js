var MyStats = (function() {
    function MyStats() {
        this.init();
    };

    MyStats.prototype = {
        init: function() {
            try{
                this.stats = new Stats();
            } catch(e) {
                throw new Error('Stats类实例化失败，请确保引用了stats.js');
            };

            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';

            document.body.appendChild(this.stats.domElement);
        },
        update: function() {
            this.stats.update();
        }
    };

    return MyStats;
}());
