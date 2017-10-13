// ==============================================================================================
// component/maxlength
// ==============================================================================================
// -----------------------------------------------
// variable
// -----------------------------------------------
var trgName = 'data-maxlength';
// -----------------------------------------------
// function
// -----------------------------------------------
$('[' + trgName + ']').each(function() {
	var num = $('[' + trgName + ']').attr(trgName);
	if($(this).text().length > num) {
		$(this).text($(this).text().substr(0, num));
	}
});