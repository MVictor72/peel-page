var PAGEPEEL = {
	init: function() {
        PAGEPEEL.peel.init();
        PAGEPEEL.turnJS.init();
		PAGEPEEL.peelLogic.init();

	},
    peelLogic: {
        init: function() {
            var p = new Peel('#peel-path');
            p.setPeelPath(200, 200, -200, -200);
            p.handleDrag(function(evt, x, y) {
                var t = (x - p.width) / -p.width;
                this.setTimeAlongPath(t);
            });

            
            $('#magazine').turn({
            display: 'single',
                acceleration: true,
                gradients: !$.isTouch,
                elevation:50,
                when: {
                    turned: function(e, page) {
                        /*console.log('Current view: ', $(this).turn('view'));*/
                    }
                }
            });    
            
            
            
        $(window).bind('keydown', function(e){
            
            if (e.keyCode==37)
                $('#magazine').turn('previous');
            else if (e.keyCode==39)
                $('#magazine').turn('next');
                
        });
        }
    }
}

jQuery(document).ready(function() {
	PAGEPEEL.init();
});