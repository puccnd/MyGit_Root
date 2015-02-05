(function($){
	function showBtns(btnCls) {
		for(var i = 0; i < btnCls.length; i++) {
			var cls = btnCls[i];
			$(".jle-buttons").find(".jle-link").each(function(){
				if($(this).is("." + cls))
					$(this).addClass("tmp-selected-cls");
			});
		}
		$(".jle-link:not(.tmp-selected-cls)", ".jle-buttons").hide();
		$(".tmp-selected-cls", ".jle-buttons").removeClass("tmp-selected-cls").show();
	}
	function withMenu(seq, cmd){
		if(seq == 1) {
			switch(cmd){
				case "my":
					$(".jle-source-query").show();
					showBtns(["jle-source-query", "jle-source-share", "jle-source-delete"]);
					break;
				case "pub":
					$(".jle-source-query").show();
					showBtns(["jle-source-query", "jle-source-fav"]);
					break;
				case "up":
					$(".jle-source-query").hide();
					showBtns(["jle-source-upload", "jle-source-share", "jle-source-delete", "jle-source-newdir"]);
					break;
				case "assign":
					$(".jle-source-query").hide();
					showBtns(["jle-source-delete"]);
					break;
				case "share":
					$(".jle-source-query").hide();
					showBtns(["jle-source-delete"]);
					break;
				case "fav":
					$(".jle-source-query").hide();
					showBtns(["jle-source-delete-fav"]);
					break;
				default:break;
			}
		} else if(seq == 2){
			switch(cmd){
				case "design":
					break;
				case "item":
					break;
				case "lesson":
					break;
				case "topic":
					break;
				case "media":
					break;
				case "analy":
					break;
				case "other":
					break;
				case "query":
					break;
				default:break;
			}
		} else if(seq == 3) {
			alert(123);
		}
	}
	var JLE = function(me){
		function jleClick(object, fn){
			$(object).each(function(){
				$(this).unbind().bind("click touchend", function(evt){
					fn.call(null, this, evt);
				});
			});
		}
		var changings = {};
		return (me = {
			resizable : function(){
				window.onresize = function(){
					for(var prop in changings) {
						if(changings[prop])
							changings[prop].call(me);
					}
				};
				return me;
			},
			enableMenu : function(){
				var li1 = $(".jle-top").find("li");
				var li2 = $(".jle-nav").find("li");
				jleClick(li1, function(obj, evt){
					li1.removeClass("selected");
					li2.removeClass("selected");
					$(obj).addClass("selected");
					var cmd = $(obj).attr("cmd");
					withMenu(1, cmd);
				});
				jleClick(li2, function(obj, evt){
					if(!$(obj).is(".selected")){
						li2.removeClass("selected");
						$(obj).addClass("selected");
						var cmd = $(obj).attr("cmd");
						withMenu(2, cmd);
					}else{
						$(obj).removeClass("selected");
						var cmd = $(".selected",".jle-top").attr("cmd");
						withMenu(1, cmd);
					}
				});
				var btn1 = $(".jle-buttons").find(".jle-link");
				jleClick(btn1, function(obj, evt){
					var cmd = $(obj).attr("cmd");
					withMenu(3, cmd);
				});
				return me;
			},
			viewHeight : function(){
				var dw = document.documentElement.clientWidth;
				if(dw < 400) {
					$(".jle-narrow").show();
					$(".jle-wide").hide();
					$("#pageNum").addClass("jle-narrow-input");
					$("#totalPages").addClass("jle-narrow-span");
				} else {
					$(".jle-narrow").hide();
					$(".jle-wide").show();
					$("#pageNum").removeClass("jle-narrow-input");
					$("#totalPages").removeClass("jle-narrow-span");
				}
				var dh = document.documentElement.clientHeight;
				var height1 = 40;
				var height2 = 40;
				var height3 = 38 + 5;
				var height4 = 30 + (5 + 2 + 1 + 5);
				$(".jle-center").css({
					height: dh - height1 - height2 - height3//,
					// boxShadow : "inset 1px 0px silver,inset -1px 0px silver,inset 0px 1px silver,inset 0px -1px silver",
					// backgroundColor:"silver"
				});
				$(".jle-views").css({
					height: dh - height1 - height2 - height3 - height4//,
					//backgroundColor: "white"
				});
				changings["resize_view"] = function(){
					me.viewHeight();
				};
				return me;
			},
			modeChangable : function(){
				jleClick(".jle-grid-link", function(obj, evt){
					if($(".jle-tabs").is(".jle-mode1")){
						// do nothing
					} else {
						$(".jle-tabs").removeClass("jle-mode2").addClass("jle-mode1");
					}
				});
				jleClick(".jle-heap-link", function(obj, evt){
					if($(".jle-tabs").is(".jle-mode2")){
						// do nothing
					} else {
						$(".jle-tabs").removeClass("jle-mode1").addClass("jle-mode2");
					}
				});
				return me;
			}
		});
	}();
	$(function(){
		withMenu(1, "my");
		JLE.resizable().enableMenu().viewHeight().modeChangable();
	});
})(jQuery);