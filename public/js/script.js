var library,
	filenameInEdit = false;
	siteLocation = "http://rockhopper.local:3000";

function init() {
	loadNotes();
	$('#btn_new').click(newNote);
	$('#btn_del').click(deleteNote);
	$('#btn_save').click(saveNote);
}

function loadNotes() {
	library = [];
	$.ajax({
		url: siteLocation + "/api/list/all",
		dataType: 'json',
		success: function(data) {
			var notes = "";

			for (var i = 0; i < data.length; ++i) {
				if (!data[i]['is_dir']) {
					path = data[i]['path'].substring(1);
					notes += makeNote(path);
					library[path] = data[i];
				}
			}

			$('#list ul').html(notes);
			$('#list ul li').live("click", loadNote);
		}
	});
}

function loadNote(e) {
	var elem = $(this);
	var path = elem.data('filename');
	filenameInEdit = path;
	$.ajax({
		url: siteLocation + "/api/get/" + path,
		statusCode: {
			403: function() {
				fail('Logged out: save before redirecting!!');
			}
		},
		success: function(data) {
			$('#list ul li').removeClass('selected');
			elem.addClass('selected');
			$('#note article #notehead').html(fileToTitle(path)).next('textarea').val(data);
		}
	});
}

function renameNote(path, to) {
	$.ajax({
		url: siteLocation + "/api/move/" + path,
		type: "POST",
		data: { to: to },
		statusCode: {
			403: function() {
				fail('Logged out: save before redirecting!!');
			}
		},
		success: function(data) {
			$('#list ul li.selected').data('filename', to);
			$('#list ul li.selected').text(fileToTitle(to));
			filenameInEdit = to;
		}
	});
}

/**
*
*	Will check is the title has been changed inline and if so rename and adjust to that.
*
*/

function checkForFileRename(path, newTitle) {
	return (path !== newTitle) ? true : false;
}

function saveNote() {
	// need to default path to "New_Note.txt"
	// and set the document on start.
	var path = $('#list ul li.selected').data('filename');
	$.ajax({
		url: siteLocation + "/api/put/" + path,
		type: "POST",
		data: { data: $('#note article #notehead').next('textarea').val() },
		statusCode: {
			403: function() {
				fail('Logged out: save before redirecting!!');
			}
		},
		success: function(data) {
			var to = titleToFile($('#note article #notehead').text());

			if (checkForFileRename(path, to)) {
				renameNote(path, to);
			}
		}
	});
}

// Instead of opening in a dialog possibly clear the form and have a hint.
function newNote() {
	$.box.show({content: $('<form id="frm_new_note"><label for="note_title">New Note Title:</label><input type="text" name="note_title" id="note_title" /><input type="submit" value="create"/></form>')});
	$('#frm_new_note').submit(function(e) {
		e.preventDefault();
		var file = titleToFile($('#note_title').val());
		$.ajax({
			url: siteLocation + "/api/put/" + file,
			type: "POST",
			data: { data: "" },
				statusCode: {
				403: function() {
					fail('Logged out: save before redirecting!!');
				}
			},
			success: function(data) {
				$('#list ul li').removeClass('selected');
				$('#list ul').append(makeNote(file));
				$(this).addClass('selected');
				$.box.close();
			}
		});
	});
}

function deleteNote() {
	var path = $('#list ul li.selected').data('filename');
	$.ajax({
		url: siteLocation + "/api/del/" + path,
		statusCode: {
			403: function() {
				fail('Logged out: save before redirecting!!');
			}
		},
		success: function(data) {
			$('#list ul li.selected').remove();
			$('#list ul li').removeClass('selected');
			$('#note article #notehead').html('').next('textarea').val('');
		}
	});
}

function fail(message) {
	alert('toms fault: ' + message);
	window.location = siteLocation + "/try-again";
}

function makeNote(path) {
	return '<li data-filename="' + path + '">' + fileToTitle(path) + "</li>";
}

function fileToTitle(file) {
	return file.replace(/_/g, " ").replace(".txt", "");
}

function titleToFile(title) {
	return title.replace(/ /g, "_") + ".txt";
}