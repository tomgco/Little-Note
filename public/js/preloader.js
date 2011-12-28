$(function() {
	$.ajax({
		url: "/pre-emptive-login",
		statusCode: {
			403: function() {

			}
		},
		success: function(data) {
			console.log('Auth done');
		}
	});
});